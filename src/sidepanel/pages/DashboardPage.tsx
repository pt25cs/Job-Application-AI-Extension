import { useState, useEffect } from 'react';
import { useDetectionStore } from '@/stores/detectionStore';
import { useAuthStore } from '@/stores/authStore';
import { JobDetectionBanner } from '../components/JobDetectionBanner';
import { AutoFillButton } from '../components/AutoFillButton';
import { AutoFillReview } from '../components/AutoFillReview';
import { OptimizationPanel } from '../components/OptimizationPanel';
import { OutreachPanel } from '../components/OutreachPanel';
import { fetchResumes, fetchProfile, fetchExperiences, fetchSkills } from '@/lib/profile';
import { upsertApplication } from '@/lib/optimization';
import type { FieldMapping } from '@/types/autofill';
import type { ProfileData, Experience, Skill, StructuredResume } from '@/types/profile';

/** Build a StructuredResume from raw profile data when no stored content exists. */
function buildResumeFromProfile(
  profile: ProfileData,
  experiences: Experience[],
  skills: Skill[],
): StructuredResume {
  return {
    personal: {
      full_name: profile.full_name ?? '',
      email: profile.email,
      phone: profile.phone ?? undefined,
      location: profile.location ?? undefined,
      linkedin_url: profile.linkedin_url ?? undefined,
      portfolio_url: profile.portfolio_url ?? undefined,
      github_url: profile.github_url ?? undefined,
    },
    summary: profile.summary ?? '',
    experience: experiences.filter((e) => e.type === 'work' || e.type === 'volunteer'),
    education: experiences.filter((e) => e.type === 'education'),
    projects: experiences.filter((e) => e.type === 'project'),
    skills,
  };
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { result: detection } = useDetectionStore();
  const [fillMappings, setFillMappings] = useState<FieldMapping[]>([]);
  const [baseResume, setBaseResume] = useState<StructuredResume | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [showOutreach, setShowOutreach] = useState(false);

  // Load primary resume — fall back to building from profile + experiences + skills
  useEffect(() => {
    if (!user) return;
    (async () => {
      // First try: resume with structured content
      const resumes = await fetchResumes(user.id);
      const primary = resumes.find((r) => r.is_primary && r.content);
      if (primary?.content) {
        setBaseResume(primary.content as StructuredResume);
        return;
      }
      // Fallback: build StructuredResume from profile data
      const [profile, experiences, skills] = await Promise.all([
        fetchProfile(user.id),
        fetchExperiences(user.id),
        fetchSkills(user.id),
      ]);
      if (profile) {
        setBaseResume(buildResumeFromProfile(profile, experiences, skills));
      }
    })();
  }, [user?.id]);

  // Upsert application when job detected
  useEffect(() => {
    if (!user || !detection || detection.platform === 'unknown') return;
    // Use tab URL as fallback if jobUrl is empty
    const jobUrl = detection.jobUrl || window.location.href;
    upsertApplication({
      userId: user.id,
      company: detection.company ?? 'Unknown Company',
      role: detection.jobTitle ?? 'Unknown Role',
      jobUrl,
      jobDescription: detection.jobDescription,
      platform: detection.platform,
    }).then((id) => { if (id) setApplicationId(id); });
  }, [user?.id, detection?.platform, detection?.jobTitle, detection?.company]);

  // On mount: ask background for current tab's detection result
  useEffect(() => {
    const store = useDetectionStore.getState();
    store.setDetecting(true);

    // Query current tab URL and run detection via background
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id) {
        // Ask content script for its last detection result
        chrome.tabs.sendMessage(tab.id, { type: 'GET_DETECTION', payload: null, timestamp: Date.now() })
          .then((response) => {
            if (response?.success && response.data) {
              store.setResult(response.data);
            }
          })
          .catch(() => {
            // Content script not injected — try URL-based detection
            if (tab.url) {
              chrome.runtime.sendMessage({
                type: 'DETECT_ATS_PLATFORM',
                payload: { platform: 'unknown', confidence: 0, jobTitle: null, company: null, location: null, jobDescription: null, jobUrl: tab.url, detectedAt: Date.now() },
                timestamp: Date.now(),
              }).catch(() => {});
            }
          });
      }
    });

    const listener = (message: { type: string; payload: unknown }) => {
      if (message.type === 'OPTIMIZATION_STATUS') {
        const payload = message.payload as { type: string; result?: unknown };
        if (payload.type === 'detection' && payload.result) {
          store.setResult(payload.result as Parameters<typeof store.setResult>[0]);
        }
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <JobDetectionBanner />

      {detection && detection.platform !== 'unknown' && (
        <>
          <AutoFillButton onComplete={setFillMappings} />
          {fillMappings.length > 0 && <AutoFillReview mappings={fillMappings} />}
          <OptimizationPanel baseResume={baseResume} applicationId={applicationId} />
          <button
            onClick={() => setShowOutreach((v) => !v)}
            className="flex items-center gap-2 self-start rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <span>✉️</span>
            <span>{showOutreach ? 'Hide Outreach' : 'Cold Outreach'}</span>
          </button>
          {showOutreach && applicationId && (
            <OutreachPanel applicationId={applicationId} />
          )}
        </>
      )}

      {(!detection || detection.platform === 'unknown') && (
        <div className="card p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Navigate to a job listing on Greenhouse, Lever, Workday, or another supported ATS to get started.
          </p>
        </div>
      )}
    </div>
  );
}

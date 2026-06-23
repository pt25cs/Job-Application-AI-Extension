import type { ExtensionMessage, ExtensionResponse } from '@/types/messages';
import type { JobDetectionResult } from '@/types/platform';
import { supabase } from '@/lib/supabase';
import { fetchProfile, fetchExperiences, fetchSkills, fetchResumes, getResumeDownloadUrl } from '@/lib/profile';

const TOKEN_REFRESH_ALARM = 'token-refresh';

// In-memory cache of latest detection per tab
const detectionCache = new Map<number, JobDetectionResult>();

// --- Token Refresh ---

function scheduleTokenRefresh(expiresAt: number) {
  const delayMs = (expiresAt * 1000) - Date.now() - 60_000;
  const delayMinutes = Math.max(delayMs / 60_000, 0.5);
  chrome.alarms.create(TOKEN_REFRESH_ALARM, { delayInMinutes: delayMinutes });
}

function clearTokenRefreshAlarm() {
  chrome.alarms.clear(TOKEN_REFRESH_ALARM);
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === TOKEN_REFRESH_ALARM) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) { clearTokenRefreshAlarm(); return; }
    scheduleTokenRefresh(data.session.expires_at!);
    return;
  }

  if (alarm.name.startsWith('followup:')) {
    const outreachId = alarm.name.slice('followup:'.length);
    try {
      await supabase
        .from('outreach')
        .update({ status: 'follow_up_scheduled', updated_at: new Date().toISOString() })
        .eq('id', outreachId)
        .eq('status', 'sent'); // only update if still in sent state
    } catch (err) {
      console.error('Follow-up alarm error:', err);
    }
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
    scheduleTokenRefresh(session.expires_at!);
  }
  if (event === 'SIGNED_OUT') clearTokenRefreshAlarm();
});

// --- Lifecycle ---

chrome.runtime.onInstalled.addListener(() => {
  console.log('AutoApply service worker installed');
  chrome.storage.local.set({ 'autoapply:initialized': true });
});

self.addEventListener('activate', () => {
  console.log('AutoApply service worker activated');
  (self as unknown as ServiceWorkerGlobalScope).clients.claim();
});

chrome.action?.onClicked.addListener((tab) => {
  if (tab.windowId != null) chrome.sidePanel.open({ windowId: tab.windowId });
});

// --- Message Router ---

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse): boolean => {
    handleMessage(message, sender).then(sendResponse);
    return true;
  },
);

async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
): Promise<ExtensionResponse> {
  switch (message.type) {
    case 'DETECT_ATS_PLATFORM': {
      const result = message.payload as JobDetectionResult;
      const tabId = sender.tab?.id;
      if (tabId) detectionCache.set(tabId, result);

      // Broadcast to side panel
      chrome.runtime.sendMessage({
        type: 'OPTIMIZATION_STATUS',
        payload: { type: 'detection', result },
        timestamp: Date.now(),
      }).catch(() => {/* side panel may not be open */});

      return { success: true, data: result };
    }

    case 'AUTOFILL_FORM': {
      const tabId = sender.tab?.id ?? (message as { tabId?: number }).tabId ?? message.tabId;
      if (!tabId) return { success: false, error: 'No tab ID — make sure you are on a job page' };

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { success: false, error: 'Not authenticated' };

      const userId = session.user.id;
      const [profileData, experiences, skills, resumes] = await Promise.all([
        fetchProfile(userId),
        fetchExperiences(userId),
        fetchSkills(userId),
        fetchResumes(userId),
      ]);

      // Fetch primary resume blob
      let resumeBlob: ArrayBuffer | null = null;
      const primaryResume = resumes.find((r) => r.is_primary && r.file_path);
      if (primaryResume?.file_path) {
        try {
          const url = getResumeDownloadUrl(primaryResume.file_path);
          const resp = await fetch(url);
          resumeBlob = await resp.arrayBuffer();
        } catch {
          // resume blob optional
        }
      }

      // Relay to content script
      const response = await chrome.tabs.sendMessage(tabId, {
        type: 'AUTOFILL_FORM',
        payload: { profileData: { ...profileData, experiences, skills }, resumeBlob },
        timestamp: Date.now(),
      });

      return response ?? { success: false, error: 'No response from content script' };
    }

    case 'OPEN_SIDE_PANEL': {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.windowId) await chrome.sidePanel.open({ windowId: tab.windowId });
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }

    case 'OUTREACH_STATUS': {
      const payload = message.payload as { action: string; outreachId?: string };
      if (payload.action === 'schedule_followup' && payload.outreachId) {
        // Schedule follow-up alarm 5 days from now
        const delayMinutes = 5 * 24 * 60;
        chrome.alarms.create(`followup:${payload.outreachId}`, { delayInMinutes: delayMinutes });
      }
      return { success: true };
    }

    default:
      return { success: false, error: `Unknown message type: ${message.type}` };
  }
}

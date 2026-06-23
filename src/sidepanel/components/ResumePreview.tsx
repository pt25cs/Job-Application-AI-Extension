import { useState } from 'react';
import { downloadResumePDF } from '@/lib/pdfGenerator';
import type { StructuredResume } from '@/types/profile';

interface ResumePreviewProps {
  resume: StructuredResume | null | undefined;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return date; }
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const [downloading, setDownloading] = useState(false);

  if (!resume) {
    return (
      <div className="rounded border border-dashed border-gray-200 p-4 text-xs text-gray-400 text-center">
        No resume to preview
      </div>
    );
  }

  async function handleDownload() {
    if (!resume) return;
    setDownloading(true);
    try {
      const name = resume.personal?.full_name?.replace(/\s+/g, '_') ?? 'resume';
      await downloadResumePDF(resume, `${name}_optimized.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  const { personal, summary, experience, education, skills, projects } = resume;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs space-y-3 max-h-80 overflow-y-auto">
        {/* Header */}
        <div>
          <p className="text-base font-bold text-gray-900">{personal?.full_name}</p>
          <p className="text-gray-500">
            {[personal?.email, personal?.phone, personal?.location].filter(Boolean).join(' · ')}
          </p>
          {personal?.linkedin_url && (
            <p className="text-blue-500 truncate">{personal.linkedin_url}</p>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <div>
            <p className="font-semibold text-gray-700 uppercase tracking-wide text-xs mb-1">Summary</p>
            <p className="text-gray-600 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience?.length > 0 && (
          <div>
            <p className="font-semibold text-gray-700 uppercase tracking-wide text-xs mb-1 border-b border-gray-200 pb-0.5">Experience</p>
            <div className="space-y-2">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">{exp.title}</span>
                    <span className="text-gray-400">
                      {formatDate(exp.start_date)} – {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                    </span>
                  </div>
                  <p className="text-gray-500">{exp.organization}</p>
                  <ul className="mt-1 space-y-0.5">
                    {(exp.bullets ?? []).map((b, j) => (
                      <li key={j} className="text-gray-600 pl-2 before:content-['•'] before:mr-1 before:text-gray-400">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education?.length > 0 && (
          <div>
            <p className="font-semibold text-gray-700 uppercase tracking-wide text-xs mb-1 border-b border-gray-200 pb-0.5">Education</p>
            {education.map((edu, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <span className="font-medium text-gray-800">{edu.title}</span>
                  <p className="text-gray-500">{edu.organization}</p>
                </div>
                <span className="text-gray-400">{formatDate(edu.end_date)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <div>
            <p className="font-semibold text-gray-700 uppercase tracking-wide text-xs mb-1 border-b border-gray-200 pb-0.5">Projects</p>
            {projects.map((proj, i) => (
              <div key={i} className="mb-1">
                <p className="font-medium text-gray-800">{proj.title}</p>
                <ul className="space-y-0.5">
                  {(proj.bullets ?? []).map((b, j) => (
                    <li key={j} className="text-gray-600 pl-2 before:content-['•'] before:mr-1 before:text-gray-400">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <div>
            <p className="font-semibold text-gray-700 uppercase tracking-wide text-xs mb-1 border-b border-gray-200 pb-0.5">Skills</p>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">{s.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {downloading ? 'Generating PDF...' : 'Download PDF'}
      </button>
    </div>
  );
}

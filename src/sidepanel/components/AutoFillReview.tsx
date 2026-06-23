import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FieldMapping } from '@/types/autofill';

interface AutoFillReviewProps {
  mappings: FieldMapping[];
}

// Fields that require profile data and where to fix them
const FIELD_FIX_MAP: Record<string, { label: string; path: string }> = {
  first_name:    { label: 'First name missing — check your full name in profile', path: '/profile' },
  last_name:     { label: 'Last name missing — check your full name in profile', path: '/profile' },
  email:         { label: 'Email missing in profile', path: '/profile' },
  phone:         { label: 'Phone number missing in profile', path: '/profile' },
  address_line1: { label: 'Street address missing — update Location in profile (format: Street, City, State, Country)', path: '/profile' },
  city:          { label: 'City missing — update Location in profile (format: Street, City, State, Country)', path: '/profile' },
  state:         { label: 'State missing — update Location in profile (format: Street, City, State, Country)', path: '/profile' },
  zip:           { label: 'Postal code not in profile — add it to Location', path: '/profile' },
  country:       { label: 'Country missing — update Location in profile', path: '/profile' },
  resume_file:   { label: 'No primary resume uploaded — upload one in profile', path: '/profile' },
};

/** Categories that are auto-answered and don't need user review. */
const AUTO_ANSWERED = new Set(['previous_employer', 'work_authorization', 'gender', 'ethnicity', 'veteran_status', 'disability_status']);

export function AutoFillReview({ mappings }: AutoFillReviewProps) {
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  if (mappings.length === 0) return null;

  // Separate auto-answered from user-visible filled fields
  const filled = mappings.filter((m) => m.status === 'filled' && !AUTO_ANSWERED.has(m.field.category));
  const autoAnswered = mappings.filter((m) => m.status === 'filled' && AUTO_ANSWERED.has(m.field.category));
  const skipped = mappings.filter((m) => m.status === 'skipped');
  const errors = mappings.filter((m) => m.status === 'error');

  // Collect actionable fix suggestions for skipped fields
  const fixes = skipped
    .map((m) => FIELD_FIX_MAP[m.field.category])
    .filter(Boolean)
    .filter((fix, i, arr) => arr.findIndex((f) => f.label === fix.label) === i); // dedupe

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Fill Review</h3>
        <span className="text-xs text-gray-500">
          {filled.length + autoAnswered.length} filled · {skipped.length} skipped
          {errors.length > 0 && ` · ${errors.length} errors`}
        </span>
      </div>

      {/* Actionable fix suggestions */}
      {fixes.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-2">
          <p className="text-xs font-semibold text-orange-800">Fields that couldn't be filled:</p>
          {fixes.map((fix, i) => (
            <div key={i} className="flex items-start justify-between gap-2">
              <p className="text-xs text-orange-700 flex-1">{fix.label}</p>
              <button
                onClick={() => navigate(fix.path)}
                className="text-xs text-orange-600 font-medium hover:underline shrink-0"
              >
                Fix →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filled fields */}
      {filled.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {filled.map((mapping, idx) => {
            const isLowConfidence = mapping.confidence < 0.79;
            const currentValue = editValues[idx] ?? String(mapping.value ?? '');
            return (
              <div
                key={idx}
                className={`rounded border px-2.5 py-2 text-xs ${
                  isLowConfidence ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700 capitalize">
                    {mapping.field.label ?? mapping.field.category.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    {mapping.attemptedFormats && (
                      <span
                        className="text-blue-500 text-[10px]"
                        title={`Tried ${mapping.attemptedFormats.length} formats: ${mapping.attemptedFormats.join(' → ')}`}
                      >
                        ↻{mapping.attemptedFormats.length}
                      </span>
                    )}
                    {isLowConfidence && <span className="text-yellow-600" title="Low confidence match">⚠</span>}
                    <span className="text-gray-400">{Math.round(mapping.confidence * 100)}%</span>
                  </div>
                </div>
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, [idx]: e.target.value }))}
                  className="w-full rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                {mapping.attemptedFormats && mapping.attemptedFormats.length > 1 && (
                  <p className="text-[10px] text-blue-500 mt-0.5">
                    Auto-formatted after {mapping.attemptedFormats.length - 1} attempt{mapping.attemptedFormats.length > 2 ? 's' : ''}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Auto-answered compliance/behavioural fields */}
      {autoAnswered.length > 0 && (
        <p className="text-xs text-gray-400">
          {autoAnswered.length} field{autoAnswered.length > 1 ? 's' : ''} auto-answered (EEO / yes-no questions)
        </p>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 space-y-1">
          <p className="text-xs font-semibold text-red-700">Errors:</p>
          {errors.map((m, i) => (
            <p key={i} className="text-xs text-red-600">
              {m.field.label ?? m.field.category}: {m.reason}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

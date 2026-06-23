import { useState } from 'react';
import { sendMessage } from '@/utils/messaging';
import { useDetectionStore } from '@/stores/detectionStore';
import type { FieldMapping } from '@/types/autofill';

interface AutoFillButtonProps {
  onComplete?: (mappings: FieldMapping[]) => void;
}

export function AutoFillButton({ onComplete }: AutoFillButtonProps) {
  const { result } = useDetectionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabled = !result || result.platform === 'unknown';

  async function handleAutoFill() {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      // Get the active tab ID so the service worker knows where to inject
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setError('Could not find active tab. Make sure you are on a job page.');
        return;
      }

      const response = await sendMessage<FieldMapping[]>({
        type: 'AUTOFILL_FORM',
        payload: {},
        tabId: tab.id,
      });

      if (!response.success) {
        setError(response.error ?? 'Auto-fill failed');
        return;
      }

      const mappings = response.data ?? [];
      const filled = mappings.filter((m) => m.status === 'filled').length;
      setSummary(`${filled} field${filled !== 1 ? 's' : ''} filled`);
      onComplete?.(mappings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAutoFill}
        disabled={disabled || isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Filling form…
          </>
        ) : (
          <>
            <span>⚡</span>
            Auto-Fill Application
          </>
        )}
      </button>

      {summary && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-700 text-center font-medium">{summary}</div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 text-center">{error}</div>
      )}
    </div>
  );
}

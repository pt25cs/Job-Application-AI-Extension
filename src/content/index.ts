import cssText from './content.css?inline';
import { sendMessage } from '@/utils/messaging';
import { detectPlatform } from './adapters/registry';
import { runAutoFill } from './autofill/autofillEngine';
import type { JobDetectionResult } from '@/types/platform';
import type { ExtensionMessage } from '@/types/messages';

const FAB_HOST_ID = 'autoapply-fab-host';
let lastDetection: JobDetectionResult | null = null;
let mutationObserver: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// ── FAB Injection ─────────────────────────────────────────────────────────────

function injectFAB() {
  if (document.getElementById(FAB_HOST_ID)) return;

  const host = document.createElement('div');
  host.id = FAB_HOST_ID;

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = cssText;
  shadow.appendChild(style);

  const fab = document.createElement('button');
  fab.className = 'autoapply-fab';
  fab.textContent = 'A';
  fab.setAttribute('aria-label', 'Open AutoApply');
  fab.addEventListener('click', () => {
    sendMessage({ type: 'OPEN_SIDE_PANEL', payload: null });
  });
  shadow.appendChild(fab);

  document.body.appendChild(host);
}

// ── Detection ─────────────────────────────────────────────────────────────────

async function runDetection() {
  const result = detectPlatform(window.location.href, document);
  lastDetection = result;

  try {
    await sendMessage<JobDetectionResult>({
      type: 'DETECT_ATS_PLATFORM',
      payload: result,
    });
  } catch {
    // service worker may not be ready yet
  }

  if (result.platform !== 'unknown' && result.confidence >= 0.7) {
    injectFAB();
  }
}

// ── SPA MutationObserver ──────────────────────────────────────────────────────

function startMutationObserver() {
  if (mutationObserver) return;

  mutationObserver = new MutationObserver((mutations) => {
    const addedNodes = mutations.reduce((sum, m) => sum + m.addedNodes.length, 0);
    if (addedNodes < 5) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runDetection();
    }, 500);
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

// ── Message Listener ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'AUTOFILL_FORM') {
      const { profileData, resumeBlob } = message.payload as {
        profileData: unknown;
        resumeBlob: ArrayBuffer | null;
      };
      runAutoFill(profileData, resumeBlob, lastDetection)
        .then((result) => sendResponse({ success: true, data: result }))
        .catch((err) => sendResponse({ success: false, error: String(err) }));
      return true; // async
    }
    // Return last detection result to side panel on demand
    if ((message as { type: string }).type === 'GET_DETECTION') {
      sendResponse({ success: true, data: lastDetection });
      return false;
    }
  },
);

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  await runDetection();
  // Start SPA observer for Workday and similar
  startMutationObserver();
}

init();

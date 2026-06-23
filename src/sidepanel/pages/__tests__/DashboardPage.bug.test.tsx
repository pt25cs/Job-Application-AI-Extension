/**
 * Bug Condition Exploration Test — Outreach Visibility
 * Property 1: Bug Condition — DashboardPage shows no outreach entry point when job is detected
 *
 * CRITICAL: Test 1d MUST FAIL on unfixed code.
 * Failure confirms the outreach visibility bug exists.
 *
 * Run: vitest --run src/sidepanel/pages/__tests__/DashboardPage.bug.test.tsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { useDetectionStore } from '@/stores/detectionStore';
import { useAuthStore } from '@/stores/authStore';
import type { JobDetectionResult } from '@/types/platform';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/profile', () => ({
  fetchResumes: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/optimization', () => ({
  upsertApplication: vi.fn().mockResolvedValue('app-123'),
}));

vi.mock('@/lib/outreach', () => ({
  fetchOutreach: vi.fn().mockResolvedValue([]),
  draftOutreach: vi.fn().mockResolvedValue(undefined),
  sendOutreach: vi.fn().mockResolvedValue({ resend_message_id: 'msg-1' }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/stores/contactsStore', () => ({
  useContactsStore: vi.fn().mockReturnValue({ contacts: [] }),
}));

vi.mock('@/stores/outreachStore', () => ({
  useOutreachStore: vi.fn().mockReturnValue({
    outreachItems: [],
    isDrafting: false,
    setItems: vi.fn(),
    updateItem: vi.fn(),
    addItem: vi.fn(),
    setDrafting: vi.fn(),
  }),
}));

// Extend chrome mock with tabs API
(globalThis as unknown as { chrome: Record<string, unknown> }).chrome = {
  ...(globalThis as unknown as { chrome: Record<string, unknown> }).chrome,
  tabs: {
    query: vi.fn().mockImplementation((_query, callback) => callback([])),
    sendMessage: vi.fn().mockResolvedValue({ success: true, data: null }),
  },
  runtime: {
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const detectedJob: JobDetectionResult = {
  platform: 'greenhouse',
  confidence: 0.95,
  jobTitle: 'Software Engineer',
  company: 'Acme Corp',
  location: 'Remote',
  jobDescription: 'A great job',
  jobUrl: 'https://boards.greenhouse.io/acme/jobs/123',
  detectedAt: Date.now(),
};

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Jane Doe',
  avatar_url: null,
  onboarding_completed: true,
};

function renderDashboardPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  useAuthStore.setState({
    isLoading: false,
    isAuthenticated: true,
    user: mockUser as Parameters<typeof useAuthStore.getState>[0] extends never ? never : ReturnType<typeof useAuthStore.getState>['user'],
    session: null,
  });
  useDetectionStore.setState({ result: null, isDetecting: false });
  vi.clearAllMocks();
});

describe('Property 1: Bug Condition — Outreach entry point visibility', () => {
  it('1d: DashboardPage renders an outreach entry point when a job is detected', async () => {
    useDetectionStore.setState({ result: detectedJob, isDetecting: false });

    renderDashboardPage();

    // EXPECTED TO FAIL on unfixed code — no outreach entry point exists in DashboardPage
    // After fix: should find a button or element with outreach-related text
    const outreachTrigger =
      screen.queryByRole('button', { name: /outreach/i }) ??
      screen.queryByText(/outreach/i);

    expect(outreachTrigger).not.toBeNull();
  });

  it('1d: DashboardPage does NOT render outreach entry point when platform is unknown', () => {
    useDetectionStore.setState({
      result: { ...detectedJob, platform: 'unknown' },
      isDetecting: false,
    });

    renderDashboardPage();

    // This should pass on both unfixed and fixed code — no outreach on non-job pages
    const outreachTrigger = screen.queryByRole('button', { name: /outreach/i });
    expect(outreachTrigger).toBeNull();
  });

  it('1d: DashboardPage does NOT render outreach entry point when no detection result', () => {
    useDetectionStore.setState({ result: null, isDetecting: false });

    renderDashboardPage();

    const outreachTrigger = screen.queryByRole('button', { name: /outreach/i });
    expect(outreachTrigger).toBeNull();
  });
});

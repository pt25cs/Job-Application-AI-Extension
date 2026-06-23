/**
 * Preservation Tests — DashboardPage Outreach Visibility
 * Property 2: Preservation — Non-job page shows no outreach entry point
 *
 * These tests MUST PASS on UNFIXED code.
 * They capture baseline behavior that must not regress after the fix.
 *
 * Run: vitest --run src/sidepanel/pages/__tests__/DashboardPage.preservation.test.tsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { useDetectionStore } from '@/stores/detectionStore';
import { useAuthStore } from '@/stores/authStore';

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

beforeEach(() => {
  useAuthStore.setState({
    isLoading: false,
    isAuthenticated: true,
    user: mockUser as ReturnType<typeof useAuthStore.getState>['user'],
    session: null,
  });
  useDetectionStore.setState({ result: null, isDetecting: false });
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Preservation: non-job page shows placeholder, no outreach entry point
// Requirements: 3.5
// ---------------------------------------------------------------------------
describe('Property 2: Preservation — Non-job page behavior unchanged', () => {
  it('shows placeholder state when no detection result', () => {
    useDetectionStore.setState({ result: null, isDetecting: false });
    renderDashboardPage();
    // Placeholder text should be present
    expect(screen.getByText(/navigate to a job listing/i)).toBeInTheDocument();
  });

  it('shows placeholder state when platform is unknown', () => {
    useDetectionStore.setState({
      result: {
        platform: 'unknown',
        confidence: 0,
        jobTitle: null,
        company: null,
        location: null,
        jobDescription: null,
        jobUrl: 'https://example.com',
        detectedAt: Date.now(),
      },
      isDetecting: false,
    });
    renderDashboardPage();
    expect(screen.getByText(/navigate to a job listing/i)).toBeInTheDocument();
  });

  it('does NOT show outreach entry point when platform is unknown', () => {
    useDetectionStore.setState({
      result: {
        platform: 'unknown',
        confidence: 0,
        jobTitle: null,
        company: null,
        location: null,
        jobDescription: null,
        jobUrl: 'https://example.com',
        detectedAt: Date.now(),
      },
      isDetecting: false,
    });
    renderDashboardPage();
    // No outreach button should appear on non-job pages
    expect(screen.queryByRole('button', { name: /outreach/i })).toBeNull();
  });

  it('does NOT show outreach entry point when result is null', () => {
    useDetectionStore.setState({ result: null, isDetecting: false });
    renderDashboardPage();
    expect(screen.queryByRole('button', { name: /outreach/i })).toBeNull();
  });
});

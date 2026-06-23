import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { AuthGuard } from '../AuthGuard';
import { useAuthStore } from '@/stores/authStore';

// Reset store before each test
beforeEach(() => {
  useAuthStore.setState({ isLoading: false, isAuthenticated: false, user: null, session: null });
});

describe('AuthGuard', () => {
  // Property 3: Rendering correctness for all boolean combinations
  it('renders exactly one of: loading, login, or children for any isLoading/isAuthenticated combo', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (isLoading, isAuthenticated) => {
          useAuthStore.setState({ isLoading, isAuthenticated });

          const { unmount } = render(
            <AuthGuard>
              <div data-testid="protected-content">Protected</div>
            </AuthGuard>,
          );

          const loading = screen.queryByText('Loading...');
          const loginBtn = screen.queryByRole('button', { name: /sign in/i });
          const content = screen.queryByTestId('protected-content');

          if (isLoading) {
            expect(loading).toBeInTheDocument();
            expect(loginBtn).not.toBeInTheDocument();
            expect(content).not.toBeInTheDocument();
          } else if (!isAuthenticated) {
            expect(loading).not.toBeInTheDocument();
            expect(loginBtn).toBeInTheDocument();
            expect(content).not.toBeInTheDocument();
          } else {
            expect(loading).not.toBeInTheDocument();
            expect(loginBtn).not.toBeInTheDocument();
            expect(content).toBeInTheDocument();
          }

          unmount();
        },
      ),
      { numRuns: 4 }, // Only 4 combinations of 2 booleans
    );
  });

  it('shows loading when isLoading is true', () => {
    useAuthStore.setState({ isLoading: true, isAuthenticated: false });
    render(<AuthGuard><div>Content</div></AuthGuard>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows login screen when not authenticated and not loading', () => {
    useAuthStore.setState({ isLoading: false, isAuthenticated: false });
    render(<AuthGuard><div>Content</div></AuthGuard>);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({ isLoading: false, isAuthenticated: true });
    render(<AuthGuard><div data-testid="child">Protected</div></AuthGuard>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

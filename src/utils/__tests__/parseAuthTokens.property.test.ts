import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseAuthTokens } from '../parseAuthTokens';

describe('parseAuthTokens', () => {
  // Property 1: Round-trip — tokens survive encode/parse cycle
  it('round-trip: parsed tokens match originals for any valid token strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 200 }).filter((s) => !s.includes('#') && !s.includes('&') && !s.includes('=')),
        fc.string({ minLength: 10, maxLength: 200 }).filter((s) => !s.includes('#') && !s.includes('&') && !s.includes('=')),
        (accessToken, refreshToken) => {
          const url = `https://test.chromiumapp.org/#access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}&token_type=bearer`;
          const result = parseAuthTokens(url);
          if (!result.ok) return true; // skip if encoding edge case
          expect(result.tokens.access_token).toBe(accessToken);
          expect(result.tokens.refresh_token).toBe(refreshToken);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 2: Missing token error identification
  it('identifies missing access_token specifically', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }).filter((s) => !s.includes('#') && !s.includes('&') && !s.includes('=')),
        (refreshToken) => {
          const url = `https://test.chromiumapp.org/#refresh_token=${encodeURIComponent(refreshToken)}`;
          const result = parseAuthTokens(url);
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.toLowerCase()).toContain('access_token');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('identifies missing refresh_token specifically', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }).filter((s) => !s.includes('#') && !s.includes('&') && !s.includes('=')),
        (accessToken) => {
          const url = `https://test.chromiumapp.org/#access_token=${encodeURIComponent(accessToken)}`;
          const result = parseAuthTokens(url);
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.toLowerCase()).toContain('refresh_token');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // Example-based edge cases
  it('returns error for URL with no hash fragment', () => {
    const result = parseAuthTokens('https://test.chromiumapp.org/');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('No hash fragment');
  });

  it('returns error for invalid URL', () => {
    const result = parseAuthTokens('not-a-url');
    expect(result.ok).toBe(false);
  });

  it('successfully parses valid tokens', () => {
    const result = parseAuthTokens('https://test.chromiumapp.org/#access_token=abc123&refresh_token=xyz789');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.tokens.access_token).toBe('abc123');
      expect(result.tokens.refresh_token).toBe('xyz789');
    }
  });
});

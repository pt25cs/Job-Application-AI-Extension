export interface ParsedTokens {
  access_token: string;
  refresh_token: string;
}

export type ParseResult =
  | { ok: true; tokens: ParsedTokens }
  | { ok: false; error: string };

export function parseAuthTokens(redirectUrl: string): ParseResult {
  try {
    const url = new URL(redirectUrl);
    const hash = url.hash.substring(1); // remove leading #

    if (!hash) {
      return { ok: false, error: 'No hash fragment found' };
    }

    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token && !refresh_token) {
      return { ok: false, error: 'Missing access_token and refresh_token' };
    }
    if (!access_token) {
      return { ok: false, error: 'Missing access_token' };
    }
    if (!refresh_token) {
      return { ok: false, error: 'Missing refresh_token' };
    }

    return { ok: true, tokens: { access_token, refresh_token } };
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }
}

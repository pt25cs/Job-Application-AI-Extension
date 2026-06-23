import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { parseAuthTokens } from '@/utils/parseAuthTokens';
import type { UserProfile } from '@/types/auth';

export async function signInWithGoogle(): Promise<{ error?: string }> {
  try {
    const redirectUrl = chrome.identity.getRedirectURL();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      return { error: error?.message ?? 'Failed to get OAuth URL' };
    }

    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: data.url,
      interactive: true,
    });

    if (!responseUrl) {
      return { error: 'OAuth flow was cancelled' };
    }

    const result = parseAuthTokens(responseUrl);
    if (!result.ok) {
      return { error: result.error };
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: result.tokens.access_token,
      refresh_token: result.tokens.refresh_token,
    });

    if (sessionError) {
      useAuthStore.getState().clearAuth();
      return { error: sessionError.message };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      useAuthStore.getState().setSession(sessionData.session);
      const profile = await fetchUserProfile(sessionData.session.user.id);
      if (profile) {
        useAuthStore.getState().setUser(profile);
      }
    }

    return {};
  } catch (err) {
    useAuthStore.getState().clearAuth();
    return { error: err instanceof Error ? err.message : 'Sign-in failed' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // Clear local state even if API call fails
  } finally {
    useAuthStore.getState().clearAuth();
  }
}

export async function restoreSession(): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      useAuthStore.getState().setSession(data.session);
      const profile = await fetchUserProfile(data.session.user.id);
      if (profile) {
        useAuthStore.getState().setUser(profile);
      }
    }
  } catch {
    // Session restoration failed silently
  } finally {
    useAuthStore.getState().setLoading(false);
  }
}

export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.session) {
      useAuthStore.getState().setSession(data.session);
      const profile = await fetchUserProfile(data.session.user.id);
      if (profile) useAuthStore.getState().setUser(profile);
    }
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Sign-in failed' };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Sign-up failed' };
  }
}

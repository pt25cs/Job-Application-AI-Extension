import { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';

export function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    if (mode === 'signin') {
      const result = await signInWithEmail(email, password);
      if (result.error) setError(result.error);
    } else {
      const result = await signUpWithEmail(email, password);
      if (result.error) { setError(result.error); }
      else { setMessage('Check your email to confirm your account, then sign in.'); setMode('signin'); }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 bg-gradient-to-br from-slate-50 to-indigo-50/50">
      <div className="w-full max-w-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Welcome to AutoApply</h1>
          <p className="text-sm text-slate-500">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)} required className="input" aria-label="Email address" />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input" aria-label="Password" />
          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null); }}
          className="block w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center" role="alert">{error}</div>}
        {message && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 text-center">{message}</div>}
      </div>
    </div>
  );
}

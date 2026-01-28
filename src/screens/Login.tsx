/**
 * Login - Secure authentication screen
 * Bank-grade login with password recovery options
 */

import { useState } from 'react';
import { COLORS, DEMO_CREDENTIALS } from '../constants';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

type LoginMode = 'signin' | 'forgot-password' | 'forgot-username';

export function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<LoginMode>('signin');
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(email, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock recovery logic
    setTimeout(() => {
      setSuccessMsg(
        mode === 'forgot-password'
          ? 'A reset link has been dispatched to your verified email.'
          : 'Your registered username has been sent to your primary contact email.'
      );
      setIsLoading(false);
      setTimeout(() => {
        setMode('signin');
        setSuccessMsg('');
      }, 3000);
    }, 1200);
  };

  const renderSignIn = () => (
    <form onSubmit={handleSubmit}>
      {error && (
        <p
          className="p-3 rounded-lg mb-4 text-center text-sm"
          style={{ backgroundColor: COLORS.error + '20', color: COLORS.error }}
        >
          {error}
        </p>
      )}
      <div className="mb-4">
        <label
          className="block mb-2 text-xs font-mono uppercase tracking-widest"
          style={{ color: COLORS.textMuted }}
          htmlFor="email"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg p-3 font-mono text-sm outline-none transition-all"
          style={{
            backgroundColor: COLORS.background,
            color: COLORS.textPrimary,
            border: `1px solid ${COLORS.border}`,
          }}
          placeholder="name@example.com"
          required
        />
      </div>
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <label
            className="block text-xs font-mono uppercase tracking-widest"
            style={{ color: COLORS.textMuted }}
            htmlFor="password"
          >
            Security Password
          </label>
          <button
            type="button"
            onClick={() => setMode('forgot-password')}
            className="text-[10px] font-mono uppercase tracking-wider transition-colors"
            style={{ color: COLORS.textMuted }}
          >
            Forgot Password?
          </button>
        </div>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg p-3 font-mono text-sm outline-none transition-all"
          style={{
            backgroundColor: COLORS.background,
            color: COLORS.textPrimary,
            border: `1px solid ${COLORS.border}`,
          }}
          placeholder="••••••••"
          required
        />
      </div>
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={() => setMode('forgot-username')}
          className="text-[10px] font-mono uppercase tracking-wider transition-colors"
          style={{ color: COLORS.textMuted }}
        >
          Forgot Username?
        </button>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-lg font-mono text-sm font-semibold transition-all"
        style={{
          backgroundColor: COLORS.accent,
          color: COLORS.background,
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? 'Authenticating...' : 'Secure Sign In'}
      </button>
    </form>
  );

  const renderRecovery = () => (
    <form onSubmit={handleRecovery}>
      <h2
        className="text-xl font-mono font-bold mb-2"
        style={{ color: COLORS.textPrimary }}
      >
        {mode === 'forgot-password' ? 'Reset Password' : 'Recover Username'}
      </h2>
      <p
        className="text-sm font-mono mb-6 leading-relaxed"
        style={{ color: COLORS.textMuted }}
      >
        {mode === 'forgot-password'
          ? 'Enter your registered email address to receive a secure password reset link.'
          : 'Enter your registered email address. We will send your username to that account.'}
      </p>

      {successMsg ? (
        <div
          className="p-4 rounded-lg mb-6 text-sm text-center"
          style={{
            backgroundColor: COLORS.success + '20',
            color: COLORS.success,
            border: `1px solid ${COLORS.success}50`,
          }}
        >
          {successMsg}
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label
              className="block mb-2 text-xs font-mono uppercase tracking-widest"
              style={{ color: COLORS.textMuted }}
              htmlFor="recovery-email"
            >
              Verification Email
            </label>
            <input
              type="email"
              id="recovery-email"
              className="w-full rounded-lg p-3 font-mono text-sm outline-none transition-all"
              style={{
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
              placeholder="name@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-mono text-sm font-semibold mb-4 transition-all"
            style={{
              backgroundColor: COLORS.accent,
              color: COLORS.background,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Verifying...' : 'Initiate Recovery'}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => setMode('signin')}
        className="w-full text-center text-xs font-mono transition-colors"
        style={{ color: COLORS.textMuted }}
      >
        Return to Sign In
      </button>
    </form>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: COLORS.background }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg border relative overflow-hidden"
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
        }}
      >
        {/* Decorative top bar */}
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{ backgroundColor: COLORS.accent + '40' }}
        />

        <div className="text-center mb-8 pt-4">
          <h1
            className="text-3xl font-light italic"
            style={{ color: COLORS.accent }}
          >
            Performance Equity
            <sup className="text-sm not-italic ml-1">TM</sup>
          </h1>
          <p
            className="mt-2 text-xs font-mono uppercase tracking-[0.2em]"
            style={{ color: COLORS.textMuted }}
          >
            Verified Human Performance
          </p>
        </div>

        {mode === 'signin' ? renderSignIn() : renderRecovery()}

        <div
          className="mt-8 pt-6 text-center border-t"
          style={{ borderColor: COLORS.border }}
        >
          <p
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: COLORS.textMuted }}
          >
            Protected by GAVL Guardian Infrastructure v2.1
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

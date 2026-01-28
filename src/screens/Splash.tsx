/**
 * Splash - Loading screen with Performance Equity branding
 * Displays for 2.5 seconds before transitioning to login/onboarding
 */

import { useEffect } from 'react';
import { COLORS } from '../constants';

interface SplashProps {
  onComplete: () => void;
}

export function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="text-center animate-pulse">
        <h1
          className="text-4xl font-light italic tracking-tight mb-2"
          style={{ color: COLORS.accent }}
        >
          Performance Equity
          <sup className="text-lg not-italic ml-1">TM</sup>
        </h1>
        <p
          className="text-sm font-mono uppercase tracking-widest"
          style={{ color: COLORS.textMuted }}
        >
          Universal Trusted Benchmark
        </p>
      </div>

      {/* Loading indicator */}
      <div className="mt-12">
        <div
          className="w-32 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: COLORS.border }}
        >
          <div
            className="h-full rounded-full animate-[loading_2.5s_ease-in-out]"
            style={{ backgroundColor: COLORS.accent }}
          />
        </div>
      </div>

      {/* Version */}
      <p
        className="absolute bottom-8 text-xs font-mono"
        style={{ color: COLORS.textMuted }}
      >
        GAVL Protocol v2.1
      </p>

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default Splash;

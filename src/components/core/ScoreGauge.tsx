/**
 * ScoreGauge - Institutional FICO-style PES score display
 * Features animated gauge, tier label, and delta indicator
 */

import { useEffect, useState } from 'react';
import type { PESScore, TrustTier } from '../../types';
import { COLORS, SCORE_TIERS } from '../../constants';

interface ScoreGaugeProps {
  score: PESScore;
  trustTier?: TrustTier;
  verificationRate?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreGauge({
  score,
  trustTier,
  verificationRate,
  showDetails = true,
  size = 'lg',
}: ScoreGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Animate the score on mount
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = score.value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * eased);
      setAnimatedValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score.value]);

  const tierConfig = SCORE_TIERS[score.tier];
  const tierColor = COLORS.score[score.tier];

  const sizeConfig = {
    sm: {
      container: 'py-4 px-6',
      score: 'text-4xl',
      tier: 'text-sm',
      details: 'text-xs',
    },
    md: {
      container: 'py-6 px-8',
      score: 'text-5xl',
      tier: 'text-base',
      details: 'text-sm',
    },
    lg: {
      container: 'py-8 px-10',
      score: 'text-6xl md:text-7xl',
      tier: 'text-lg',
      details: 'text-sm',
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`${config.container} rounded-lg border animate-score-glow`}
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
      }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <p
          className="text-xs font-mono uppercase tracking-[0.2em]"
          style={{ color: COLORS.textSecondary }}
        >
          PERFORMANCE EQUITY SCORE
        </p>
      </div>

      {/* Score Display */}
      <div className="text-center mb-4">
        <div
          className={`${config.score} font-mono font-bold tracking-tight`}
          style={{ color: COLORS.textPrimary }}
        >
          {animatedValue}
        </div>
        <div
          className="w-24 h-px mx-auto my-3"
          style={{ backgroundColor: tierColor }}
        />
        <div
          className={`${config.tier} font-mono font-semibold tracking-wider`}
          style={{ color: tierColor }}
        >
          {tierConfig.label}
        </div>
      </div>

      {/* Delta and Percentile */}
      {showDetails && (
        <div className="flex justify-center items-center gap-8 mt-6">
          {/* Delta */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span
                className={`${config.details} font-mono`}
                style={{ color: score.delta30d >= 0 ? COLORS.success : COLORS.error }}
              >
                {score.delta30d >= 0 ? '▲' : '▼'} {score.delta30d >= 0 ? '+' : ''}{score.delta30d} pts
              </span>
              <span
                className={`${config.details} font-mono`}
                style={{ color: COLORS.textMuted }}
              >
                (30d)
              </span>
            </div>
          </div>

          {/* Separator */}
          <div
            className="w-px h-8"
            style={{ backgroundColor: COLORS.border }}
          />

          {/* Percentile */}
          <div className="text-center">
            <span
              className={`${config.details} font-mono`}
              style={{ color: COLORS.textSecondary }}
            >
              Percentile: <span style={{ color: COLORS.accent }}>{score.percentile}th</span>
            </span>
          </div>
        </div>
      )}

      {/* Trust Tier and Verification */}
      {showDetails && (trustTier || verificationRate !== undefined) && (
        <div className="flex justify-center items-center gap-8 mt-4 pt-4 border-t" style={{ borderColor: COLORS.border }}>
          {trustTier && (
            <div className="text-center">
              <span
                className={`${config.details} font-mono`}
                style={{ color: COLORS.textSecondary }}
              >
                Trust Tier:{' '}
                <span
                  className="font-semibold"
                  style={{ color: COLORS.trust[trustTier] }}
                >
                  {trustTier.toUpperCase()}
                </span>
              </span>
            </div>
          )}

          {trustTier && verificationRate !== undefined && (
            <div
              className="w-px h-6"
              style={{ backgroundColor: COLORS.border }}
            />
          )}

          {verificationRate !== undefined && (
            <div className="text-center">
              <span
                className={`${config.details} font-mono`}
                style={{ color: COLORS.textSecondary }}
              >
                Verification:{' '}
                <span style={{ color: COLORS.success }}>
                  {verificationRate.toFixed(1)}%
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Score Range Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs font-mono mb-1" style={{ color: COLORS.textMuted }}>
          <span>0</span>
          <span>999</span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: COLORS.border }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(animatedValue / 999) * 100}%`,
              background: `linear-gradient(90deg, ${COLORS.score.establishing}, ${COLORS.score.building}, ${COLORS.score.good}, ${COLORS.score.excellent}, ${COLORS.score.exceptional})`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono mt-1" style={{ color: COLORS.textMuted }}>
          <span>EST</span>
          <span>BUILD</span>
          <span>GOOD</span>
          <span>EXCEL</span>
          <span>EXCEP</span>
        </div>
      </div>
    </div>
  );
}

export default ScoreGauge;

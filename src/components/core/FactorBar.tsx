/**
 * FactorBar - FICO-style score factor display
 * Shows weighted factor with progress bar and trend indicator
 */

import type { ScoreFactor } from '../../types';
import { COLORS } from '../../constants';

interface FactorBarProps {
  factor: ScoreFactor;
  showRecommendation?: boolean;
  compact?: boolean;
}

export function FactorBar({
  factor,
  showRecommendation = true,
  compact = false,
}: FactorBarProps) {
  const trendIcon = factor.trend === 'up' ? '▲' : factor.trend === 'down' ? '▼' : '─';
  const trendColor = factor.trend === 'up' ? COLORS.success :
                     factor.trend === 'down' ? COLORS.error :
                     COLORS.textMuted;

  const impactColor = factor.weight >= 30 ? COLORS.accent :
                      factor.weight >= 20 ? COLORS.textSecondary :
                      COLORS.textMuted;

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-mono font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            {factor.name}
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: COLORS.textSecondary }}
          >
            {factor.value}/100
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: COLORS.border }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${factor.value}%`,
              backgroundColor: factor.value >= 80 ? COLORS.success :
                               factor.value >= 60 ? COLORS.accent :
                               factor.value >= 40 ? COLORS.warning :
                               COLORS.error,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-sm font-mono font-semibold tracking-wide"
          style={{ color: COLORS.textPrimary }}
        >
          {factor.name}
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{
            backgroundColor: impactColor + '20',
            color: impactColor,
          }}
        >
          WEIGHT: {factor.weight}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: COLORS.border }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${factor.value}%`,
              backgroundColor: factor.value >= 80 ? COLORS.success :
                               factor.value >= 60 ? COLORS.accent :
                               factor.value >= 40 ? COLORS.warning :
                               COLORS.error,
            }}
          />
        </div>
        <span
          className="text-sm font-mono font-semibold min-w-[60px] text-right"
          style={{ color: COLORS.textPrimary }}
        >
          {factor.value}/100
        </span>
        <span
          className="text-sm font-mono min-w-[40px] text-right"
          style={{ color: trendColor }}
        >
          {trendIcon} {factor.delta !== 0 ? (factor.delta > 0 ? '+' : '') + factor.delta : ''}
        </span>
      </div>

      {/* Description */}
      <p
        className="text-xs font-mono mb-2"
        style={{ color: COLORS.textSecondary }}
      >
        {factor.description}
      </p>

      {/* Recommendation */}
      {showRecommendation && factor.recommendation && (
        <p
          className="text-xs font-mono italic"
          style={{ color: COLORS.textMuted }}
        >
          {factor.recommendation}
        </p>
      )}
    </div>
  );
}

/**
 * FactorList - Display all score factors
 */
interface FactorListProps {
  factors: ScoreFactor[];
  showRecommendations?: boolean;
  compact?: boolean;
}

export function FactorList({
  factors,
  showRecommendations = true,
  compact = false,
}: FactorListProps) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {factors.map((factor) => (
        <FactorBar
          key={factor.id}
          factor={factor}
          showRecommendation={showRecommendations}
          compact={compact}
        />
      ))}
    </div>
  );
}

export default FactorBar;

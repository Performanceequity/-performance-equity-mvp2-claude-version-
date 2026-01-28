/**
 * ScoreAnalysis - FICO-style score breakdown
 * Detailed PES analysis with factors, history, and percentile ranking
 */

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { PESScore, ScoreFactor, ScoreHistoryEntry, ViewType } from '../types';
import { COLORS, SCORE_TIERS } from '../constants';
import { ScoreGauge } from '../components/core/ScoreGauge';
import { FactorList } from '../components/core/FactorBar';

interface ScoreAnalysisProps {
  score: PESScore;
  factors: ScoreFactor[];
  history: ScoreHistoryEntry[];
  onNavigate: (view: ViewType) => void;
}

export function ScoreAnalysis({
  score,
  factors,
  history,
  onNavigate,
}: ScoreAnalysisProps) {
  const [showProjection, setShowProjection] = useState(false);

  // Format history for chart
  const chartData = useMemo(() => {
    return history.map((entry) => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pes: entry.pes,
      tier: entry.tier,
    }));
  }, [history]);

  // Find personal best
  const personalBest = useMemo(() => {
    return history.reduce((max, entry) =>
      entry.pes > max.pes ? entry : max
    , history[0]);
  }, [history]);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 border-b"
        style={{
          backgroundColor: COLORS.background,
          borderColor: COLORS.border,
        }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('overview')}
            className="text-sm font-mono"
            style={{ color: COLORS.textSecondary }}
          >
            ← Back
          </button>
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            SCORE ANALYSIS
          </span>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Score Gauge */}
        <section>
          <ScoreGauge score={score} showDetails={false} size="md" />
        </section>

        {/* Percentile Ranking */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h3
            className="text-xs font-mono font-semibold uppercase tracking-wider mb-3"
            style={{ color: COLORS.textSecondary }}
          >
            PERCENTILE RANKING
          </h3>
          <div className="mb-2">
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: COLORS.border }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${score.percentile}%`,
                  backgroundColor: COLORS.accent,
                }}
              />
            </div>
          </div>
          <p
            className="text-sm font-mono"
            style={{ color: COLORS.textSecondary }}
          >
            You outperform{' '}
            <span style={{ color: COLORS.accent }}>{score.percentile}%</span>{' '}
            of verified participants
          </p>
        </section>

        {/* Score Factor Decomposition */}
        <section>
          <h2
            className="text-xs font-mono font-semibold uppercase tracking-wider mb-3"
            style={{ color: COLORS.textSecondary }}
          >
            SCORE FACTOR DECOMPOSITION
          </h2>
          <FactorList factors={factors} showRecommendations={true} />
        </section>

        {/* Historical Performance */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h3
            className="text-xs font-mono font-semibold uppercase tracking-wider mb-4"
            style={{ color: COLORS.textSecondary }}
          >
            HISTORICAL PERFORMANCE
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['dataMin - 50', 'dataMax + 50']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace' }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.surfaceElevated,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: COLORS.textSecondary }}
                  itemStyle={{ color: COLORS.accent }}
                />
                <ReferenceLine
                  y={score.personalBest}
                  stroke={COLORS.accent}
                  strokeDasharray="3 3"
                  label={{
                    value: 'Personal Best',
                    position: 'right',
                    fill: COLORS.textMuted,
                    fontSize: 10,
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pes"
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: COLORS.accent }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: COLORS.border }}>
            <p
              className="text-sm font-mono"
              style={{ color: COLORS.textSecondary }}
            >
              ▲ Personal Best:{' '}
              <span style={{ color: COLORS.accent }}>{score.personalBest}</span>{' '}
              <span style={{ color: COLORS.textMuted }}>
                ({new Date(personalBest?.date || 0).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
              </span>
            </p>
            <p
              className="text-sm font-mono"
              style={{
                color: score.delta30d >= 0 ? COLORS.success : COLORS.error,
              }}
            >
              {score.delta30d >= 0 ? '+' : ''}{score.delta30d} pts (30d)
            </p>
          </div>
        </section>

        {/* Score Tier Breakdown */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h3
            className="text-xs font-mono font-semibold uppercase tracking-wider mb-4"
            style={{ color: COLORS.textSecondary }}
          >
            SCORE TIER BREAKDOWN
          </h3>
          <div className="space-y-2">
            {Object.entries(SCORE_TIERS).map(([tier, config]) => {
              const isCurrentTier = tier === score.tier;
              const tierColor = COLORS.score[tier as keyof typeof COLORS.score];

              return (
                <div
                  key={tier}
                  className="flex items-center gap-4 p-2 rounded"
                  style={{
                    backgroundColor: isCurrentTier ? tierColor + '20' : 'transparent',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tierColor }}
                  />
                  <span
                    className="text-sm font-mono font-semibold w-32"
                    style={{ color: isCurrentTier ? tierColor : COLORS.textSecondary }}
                  >
                    {config.label}
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: COLORS.textMuted }}
                  >
                    {config.min} - {config.max}
                  </span>
                  {isCurrentTier && (
                    <span
                      className="text-xs font-mono ml-auto"
                      style={{ color: tierColor }}
                    >
                      ← YOU ARE HERE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Score Projection */}
        <section>
          <button
            onClick={() => setShowProjection(true)}
            className="w-full p-4 rounded-lg border text-center transition-all hover:border-opacity-60"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.accent,
            }}
          >
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: COLORS.accent }}
            >
              SCORE PROJECTION MODEL →
            </span>
            <p
              className="text-xs font-mono mt-1"
              style={{ color: COLORS.textMuted }}
            >
              Simulate how actions impact your score
            </p>
          </button>
        </section>
      </main>

      {/* Score Projection Modal */}
      {showProjection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          <div
            className="w-full max-w-lg p-6 rounded-lg border max-h-[90vh] overflow-y-scroll overscroll-contain touch-pan-y"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-mono font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                SCORE PROJECTION MODEL
              </h3>
              <button
                onClick={() => setShowProjection(false)}
                className="text-lg"
                style={{ color: COLORS.textMuted }}
              >
                ✕
              </button>
            </div>

            <p
              className="text-xs font-mono mb-6"
              style={{ color: COLORS.textMuted }}
            >
              Simulate how different actions would impact your Performance Equity Score over the next 30 days.
            </p>

            {/* Current Score */}
            <div
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: COLORS.background }}
            >
              <p className="text-xs font-mono mb-1" style={{ color: COLORS.textMuted }}>
                CURRENT SCORE
              </p>
              <p className="text-3xl font-mono font-bold" style={{ color: COLORS.accent }}>
                {score.value}
              </p>
            </div>

            {/* Projection Scenarios */}
            <div className="space-y-3 mb-6">
              <h4
                className="text-xs font-mono font-semibold uppercase tracking-wider"
                style={{ color: COLORS.textSecondary }}
              >
                PROJECTED SCENARIOS
              </h4>

              <ProjectionScenario
                label="Maintain Current Pace"
                description="4 sessions/week, avg SCS 0.84"
                projectedScore={score.value + 15}
                projectedDelta={15}
                currentScore={score.value}
              />

              <ProjectionScenario
                label="Increase to 5 Sessions/Week"
                description="Higher frequency, same quality"
                projectedScore={score.value + 28}
                projectedDelta={28}
                currentScore={score.value}
              />

              <ProjectionScenario
                label="Use Closed Anchors Only"
                description="NFC/BLE verification, higher SCS"
                projectedScore={score.value + 35}
                projectedDelta={35}
                currentScore={score.value}
              />

              <ProjectionScenario
                label="Reduced Activity"
                description="2 sessions/week"
                projectedScore={score.value - 20}
                projectedDelta={-20}
                currentScore={score.value}
                isNegative
              />
            </div>

            {/* Factor Impact */}
            <div className="space-y-3 mb-6">
              <h4
                className="text-xs font-mono font-semibold uppercase tracking-wider"
                style={{ color: COLORS.textSecondary }}
              >
                HIGHEST IMPACT FACTORS
              </h4>
              <div className="space-y-2">
                {factors.slice(0, 3).map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-center justify-between text-xs font-mono p-2 rounded"
                    style={{ backgroundColor: COLORS.background }}
                  >
                    <span style={{ color: COLORS.textPrimary }}>{factor.name}</span>
                    <span style={{ color: COLORS.accent }}>
                      {factor.weight}% weight
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowProjection(false)}
              className="w-full py-3 rounded-lg font-mono text-sm font-semibold"
              style={{
                backgroundColor: COLORS.accent,
                color: COLORS.background,
              }}
            >
              CLOSE PROJECTION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ProjectionScenario - Single projection scenario display
 */
function ProjectionScenario({
  label,
  description,
  projectedScore,
  projectedDelta,
  currentScore,
  isNegative = false,
}: {
  label: string;
  description: string;
  projectedScore: number;
  projectedDelta: number;
  currentScore: number;
  isNegative?: boolean;
}) {
  const percentChange = ((projectedDelta / currentScore) * 100).toFixed(1);

  return (
    <div
      className="p-3 rounded-lg"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-mono font-semibold" style={{ color: COLORS.textPrimary }}>
            {label}
          </p>
          <p className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
            {description}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-bold" style={{ color: COLORS.textPrimary }}>
            {Math.max(0, Math.min(999, projectedScore))}
          </p>
          <p
            className="text-xs font-mono"
            style={{ color: isNegative ? COLORS.error : COLORS.success }}
          >
            {isNegative ? '' : '+'}{projectedDelta} ({isNegative ? '' : '+'}{percentChange}%)
          </p>
        </div>
      </div>
      {/* Progress indicator */}
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: COLORS.border }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${(Math.max(0, Math.min(999, projectedScore)) / 999) * 100}%`,
            backgroundColor: isNegative ? COLORS.error : COLORS.success,
          }}
        />
      </div>
    </div>
  );
}

export default ScoreAnalysis;

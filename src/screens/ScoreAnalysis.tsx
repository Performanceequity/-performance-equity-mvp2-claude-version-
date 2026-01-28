/**
 * ScoreAnalysis - FICO-style score breakdown
 * Detailed PES analysis with factors, history, and percentile ranking
 */

import { useMemo } from 'react';
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
            onClick={() => {/* TODO: Navigate to projection model */}}
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
    </div>
  );
}

export default ScoreAnalysis;

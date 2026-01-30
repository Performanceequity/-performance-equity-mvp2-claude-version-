/**
 * PerformanceMetrics - Clinical Garmin-style Performance Dashboard
 * Training status, recovery, calendar heatmap, and zone distribution
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type {
  TrainingStatus,
  WeeklyMetrics,
  ActivityDay,
  ViewType,
} from '../types';
import { COLORS, TRAINING_STATUS_CONFIG } from '../constants';

interface PerformanceMetricsProps {
  trainingStatus: TrainingStatus;
  weeklyMetrics: WeeklyMetrics;
  activityCalendar: ActivityDay[];
  weeklyTrends: { week: string; pesEarned: number; sessions: number }[];
  zoneDistribution: { zone: string; percentage: number; minutes: number; color: string }[];
  onNavigate: (view: ViewType) => void;
}

export function PerformanceMetrics({
  trainingStatus,
  weeklyMetrics,
  activityCalendar,
  weeklyTrends,
  zoneDistribution,
  onNavigate,
}: PerformanceMetricsProps) {
  const statusConfig = TRAINING_STATUS_CONFIG[trainingStatus.status];

  // Calculate streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    const sortedDays = [...activityCalendar].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    for (const day of sortedDays) {
      if (day.sessions > 0) streak++;
      else break;
    }
    return streak;
  }, [activityCalendar]);

  // Find longest streak
  const longestStreak = useMemo(() => {
    let max = 0;
    let current = 0;
    for (const day of activityCalendar) {
      if (day.sessions > 0) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    }
    return max;
  }, [activityCalendar]);

  // Group calendar by week
  const calendarWeeks = useMemo(() => {
    const weeks: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];

    activityCalendar.forEach((day, idx) => {
      currentWeek.push(day);
      if ((idx + 1) % 7 === 0 || idx === activityCalendar.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  }, [activityCalendar]);

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
            PERFORMANCE METRICS
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Training Status */}
        <section
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h3
            className="text-xs font-mono font-semibold uppercase tracking-wider mb-4"
            style={{ color: COLORS.textSecondary }}
          >
            TRAINING STATUS
          </h3>
          <div className="space-y-4">
            {/* Status Badge */}
            <div>
              <div
                className="h-3 rounded-full overflow-hidden mb-4"
                style={{ backgroundColor: COLORS.border }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${trainingStatus.load}%`,
                    backgroundColor: statusConfig.color,
                  }}
                />
              </div>
              <p
                className="text-2xl font-mono font-bold mb-1"
                style={{ color: statusConfig.color }}
              >
                {statusConfig.label}
              </p>
              <p
                className="text-sm font-mono"
                style={{ color: COLORS.textMuted }}
              >
                {statusConfig.description}
              </p>
            </div>

            {/* Stats - 4 columns on mobile for better spacing */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t" style={{ borderColor: COLORS.border }}>
              <div className="text-center">
                <p
                  className="text-xs font-mono mb-1"
                  style={{ color: COLORS.textMuted }}
                >
                  Load
                </p>
                <p
                  className="text-base font-mono font-bold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {trainingStatus.load}
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-xs font-mono mb-1"
                  style={{ color: COLORS.textMuted }}
                >
                  Recovery
                </p>
                <p
                  className="text-base font-mono font-bold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {trainingStatus.recoveryHours}h
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-xs font-mono mb-1"
                  style={{ color: COLORS.textMuted }}
                >
                  Trend
                </p>
                <p
                  className="text-sm font-mono font-semibold"
                  style={{
                    color: trainingStatus.trend === 'optimal' ? COLORS.success :
                           trainingStatus.trend === 'high' ? COLORS.warning :
                           COLORS.error,
                  }}
                >
                  {trainingStatus.trend.toUpperCase()}
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-xs font-mono mb-1"
                  style={{ color: COLORS.textMuted }}
                >
                  Readiness
                </p>
                <p
                  className="text-sm font-mono font-semibold"
                  style={{
                    color: trainingStatus.readiness === 'high' ? COLORS.success :
                           trainingStatus.readiness === 'moderate' ? COLORS.accent :
                           COLORS.error,
                  }}
                >
                  {trainingStatus.readiness.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Metrics */}
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
            WEEKLY METRICS
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <MetricRing
              label="VERIFIED PES"
              value={weeklyMetrics.pesEarned}
              goal={weeklyMetrics.pesGoal}
              color={COLORS.accent}
            />
            <MetricRing
              label="SESSIONS"
              value={weeklyMetrics.sessions}
              goal={weeklyMetrics.sessionsGoal}
              color={COLORS.accent}
            />
            <MetricRing
              label="AVG SCS"
              value={weeklyMetrics.avgScs}
              goal={weeklyMetrics.scsTarget}
              max={1.0}
              color={COLORS.accent}
              isDecimal
            />
          </div>
        </section>

        {/* Activity Calendar */}
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
            SESSION CALENDAR
          </h3>

          {/* Day headers */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="text-xs font-mono" style={{ color: COLORS.textMuted }} />
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <div
                key={idx}
                className="text-xs font-mono text-center"
                style={{ color: COLORS.textMuted }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-1">
            {calendarWeeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-8 gap-1">
                <div
                  className="text-xs font-mono flex items-center"
                  style={{ color: COLORS.textMuted }}
                >
                  w{weekIdx + 1}
                </div>
                {week.map((day, dayIdx) => {
                  const isFuture = new Date(day.date) > new Date();
                  return (
                    <div
                      key={dayIdx}
                      className="aspect-square rounded-sm flex items-center justify-center"
                      style={{
                        backgroundColor: isFuture
                          ? 'transparent'
                          : day.intensity === 0
                          ? COLORS.border
                          : day.intensity === 1
                          ? COLORS.zones.Z2 + 'A0'
                          : day.intensity === 2
                          ? COLORS.zones.Z3 + 'C0'
                          : COLORS.zones.Z5,
                        border: isFuture ? `1px dashed ${COLORS.border}` : 'none',
                      }}
                      title={`${day.date}: ${day.sessions} sessions, ${day.pesEarned} PES`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLORS.border }}
              />
              <span className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                No session
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLORS.zones.Z2 + 'A0' }}
              />
              <span className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                Z1-Z2
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLORS.zones.Z3 + 'C0' }}
              />
              <span className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                Z3
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLORS.zones.Z5 }}
              />
              <span className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                Z4-Z5
              </span>
            </div>
          </div>

          {/* Streak info */}
          <div className="mt-3 text-xs font-mono" style={{ color: COLORS.textSecondary }}>
            Current streak: <span style={{ color: COLORS.accent }}>{currentStreak} days</span>
            {' '}|{' '}
            Longest: <span style={{ color: COLORS.textPrimary }}>{longestStreak} days</span>
          </div>
        </section>

        {/* HR Zone Distribution */}
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
            HR ZONE DISTRIBUTION (30 DAY)
          </h3>
          <div className="space-y-2">
            {zoneDistribution.map((zone) => (
              <div key={zone.zone} className="flex items-center gap-3">
                <span
                  className="text-xs font-mono w-24"
                  style={{ color: COLORS.textSecondary }}
                >
                  {zone.zone} {zone.zone === 'Z1' ? 'Recovery' :
                              zone.zone === 'Z2' ? 'Aerobic' :
                              zone.zone === 'Z3' ? 'Tempo' :
                              zone.zone === 'Z4' ? 'Threshold' : 'VO2 Max'}
                </span>
                <div
                  className="flex-1 h-4 rounded-full overflow-hidden"
                  style={{ backgroundColor: COLORS.border }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${zone.percentage}%`,
                      backgroundColor: zone.color,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-mono w-12 text-right"
                  style={{ color: COLORS.textPrimary }}
                >
                  {zone.percentage}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Long-Term Trend */}
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
            PES/WEEK TREND
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends}>
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace' }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D0D0D',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: COLORS.textPrimary,
                  }}
                  labelStyle={{ color: COLORS.textPrimary }}
                  itemStyle={{ color: COLORS.accent }}
                  cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
                />
                <Bar dataKey="pesEarned" radius={[2, 2, 0, 0]}>
                  {weeklyTrends.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === weeklyTrends.length - 1 ? COLORS.accent : COLORS.accent + '60'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * MetricRing - Circular progress indicator for weekly goals
 */
function MetricRing({
  label,
  value,
  goal,
  max,
  color,
  isDecimal = false,
}: {
  label: string;
  value: number;
  goal: number;
  max?: number;
  color: string;
  isDecimal?: boolean;
}) {
  // Use max for ring percentage if provided, otherwise use goal
  const ringMax = max ?? goal;
  const percentage = Math.min((value / ringMax) * 100, 100);
  const displayValue = isDecimal ? value.toFixed(2) : value;
  const displayGoal = isDecimal ? goal.toFixed(2) : goal;

  // SVG circle parameters
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-2">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={COLORS.border}
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-lg font-mono font-bold"
            style={{ color: COLORS.textPrimary }}
          >
            {displayValue}
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: COLORS.textMuted }}
          >
            /{displayGoal}
          </span>
        </div>
      </div>
      <p
        className="text-[10px] font-mono uppercase tracking-wider"
        style={{ color: COLORS.textSecondary }}
      >
        {label}
      </p>
    </div>
  );
}

export default PerformanceMetrics;

/**
 * Overview - The Command Center
 * Primary dashboard showing PES balance, protocol status, and recent transactions
 */

import type { User, GAVLLayer, VerifiedTransaction, SystemHealth, ViewType } from '../types';
import { COLORS } from '../constants';
import { ScoreGauge } from '../components/core/ScoreGauge';
import { LayerStatusBar } from '../components/core/LayerStack';
import { TransactionRow } from '../components/core/TransactionRow';
import { StatusIndicator } from '../components/core/StatusIndicator';

interface OverviewProps {
  user: User;
  layers: GAVLLayer[];
  transactions: VerifiedTransaction[];
  systemHealth: SystemHealth;
  onNavigate: (view: ViewType) => void;
}

export function Overview({
  user,
  layers,
  transactions,
  systemHealth,
  onNavigate,
}: OverviewProps) {
  // Calculate verification rate
  const verificationRate = transactions.length > 0
    ? (transactions.filter(t => t.gate === 'auto' || t.gate === 'confirm').length / transactions.length) * 100
    : 100;

  // Get recent transactions (last 3)
  const recentTransactions = transactions.slice(0, 3);

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
          <div className="flex items-center gap-3">
            <span
              className="text-lg font-mono font-bold tracking-tight"
              style={{ color: COLORS.textPrimary }}
            >
              PERFORMANCE EQUITY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator
              status={systemHealth.overallStatus}
              size="sm"
              pulse
              label="SYSTEM ONLINE"
              showLabel
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Score Card */}
        <section>
          <ScoreGauge
            score={user.pes}
            trustTier={user.trust.tier}
            verificationRate={verificationRate}
            size="lg"
          />
        </section>

        {/* Protocol Status */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xs font-mono font-semibold uppercase tracking-wider"
              style={{ color: COLORS.textSecondary }}
            >
              VERIFICATION PROTOCOL STATUS
            </h2>
            <button
              onClick={() => onNavigate('protocol')}
              className="text-xs font-mono hover:underline"
              style={{ color: COLORS.accent }}
            >
              VIEW DETAILS →
            </button>
          </div>
          <LayerStatusBar layers={layers} />
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xs font-mono font-semibold uppercase tracking-wider"
              style={{ color: COLORS.textSecondary }}
            >
              RECENT VERIFIED TRANSACTIONS
            </h2>
            <button
              onClick={() => onNavigate('ledger')}
              className="text-xs font-mono hover:underline"
              style={{ color: COLORS.accent }}
            >
              VIEW FULL LEDGER →
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))
            ) : (
              <div
                className="p-8 rounded-lg border text-center"
                style={{
                  backgroundColor: COLORS.surface,
                  borderColor: COLORS.border,
                }}
              >
                <p
                  className="text-sm font-mono"
                  style={{ color: COLORS.textMuted }}
                >
                  No verified transactions yet
                </p>
                <p
                  className="text-xs font-mono mt-2"
                  style={{ color: COLORS.textMuted }}
                >
                  Initiate a session to start earning PES
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('session-init')}
            className="p-4 rounded-lg border transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: COLORS.accent,
              borderColor: COLORS.accent,
              color: COLORS.background,
            }}
          >
            <span className="text-sm font-mono font-semibold">
              INITIATE SESSION
            </span>
          </button>
          <button
            onClick={() => onNavigate('score')}
            className="p-4 rounded-lg border transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
              color: COLORS.textPrimary,
            }}
          >
            <span className="text-sm font-mono font-semibold">
              VIEW SCORE ANALYSIS
            </span>
          </button>
        </section>

        {/* Weekly Summary */}
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
            <MetricCard
              label="VERIFIED PES"
              value={user.weeklyMetrics.pesEarned}
              goal={user.weeklyMetrics.pesGoal}
              format="number"
            />
            <MetricCard
              label="SESSIONS"
              value={user.weeklyMetrics.sessions}
              goal={user.weeklyMetrics.sessionsGoal}
              format="number"
            />
            <MetricCard
              label="AVG SCS"
              value={user.weeklyMetrics.avgScs}
              goal={user.weeklyMetrics.scsTarget}
              format="decimal"
            />
          </div>
        </section>

        {/* Training Status */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="text-xs font-mono font-semibold uppercase tracking-wider mb-1"
                style={{ color: COLORS.textSecondary }}
              >
                TRAINING STATUS
              </h3>
              <p
                className="text-xl font-mono font-bold"
                style={{ color: COLORS.success }}
              >
                {user.trainingStatus.statusLabel}
              </p>
              <p
                className="text-xs font-mono"
                style={{ color: COLORS.textMuted }}
              >
                {user.trainingStatus.description}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-xs font-mono"
                style={{ color: COLORS.textSecondary }}
              >
                Load: <span style={{ color: COLORS.textPrimary }}>{user.trainingStatus.load}/100</span>
              </p>
              <p
                className="text-xs font-mono"
                style={{ color: COLORS.textSecondary }}
              >
                Recovery: <span style={{ color: COLORS.textPrimary }}>{user.trainingStatus.recoveryHours}h</span>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * MetricCard - Small metric display for weekly summary
 */
interface MetricCardProps {
  label: string;
  value: number;
  goal: number;
  format: 'number' | 'decimal';
}

function MetricCard({ label, value, goal, format }: MetricCardProps) {
  const percentage = Math.min((value / goal) * 100, 100);
  const formattedValue = format === 'decimal' ? value.toFixed(2) : value.toString();
  const formattedGoal = format === 'decimal' ? goal.toFixed(2) : goal.toString();

  return (
    <div className="text-center">
      <p
        className="text-2xl font-mono font-bold"
        style={{ color: COLORS.textPrimary }}
      >
        {formattedValue}
      </p>
      <p
        className="text-xs font-mono"
        style={{ color: COLORS.textMuted }}
      >
        / {formattedGoal} goal
      </p>
      <p
        className="text-[10px] font-mono uppercase tracking-wider mt-1"
        style={{ color: COLORS.textSecondary }}
      >
        {label}
      </p>
      {/* Progress bar */}
      <div
        className="h-1 mt-2 rounded-full overflow-hidden"
        style={{ backgroundColor: COLORS.border }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: percentage >= 100 ? COLORS.success : COLORS.accent,
          }}
        />
      </div>
    </div>
  );
}

export default Overview;

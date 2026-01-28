/**
 * EquityStatements - Performance Equity Statements
 * Monthly statements showing effort building equity over time
 * Like a bank statement for your verified effort
 */

import { useMemo } from 'react';
import type { EquityStatement, ViewType } from '../types';
import { COLORS } from '../constants';

interface EquityStatementsProps {
  statements: EquityStatement[];
  onNavigate: (view: ViewType) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function EquityStatements({ statements, onNavigate }: EquityStatementsProps) {
  // Calculate cumulative equity
  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return statements
      .slice()
      .reverse()
      .map((stmt) => {
        cumulative += stmt.totalPesGenerated;
        return { month: `${MONTH_NAMES[stmt.month - 1].slice(0, 3)} ${stmt.year}`, value: cumulative };
      });
  }, [statements]);

  // Calculate total stats
  const totalStats = useMemo(() => {
    const total = statements.reduce((acc, stmt) => ({
      pes: acc.pes + stmt.totalPesGenerated,
      sessions: acc.sessions + stmt.totalSessions,
    }), { pes: 0, sessions: 0 });

    const avgAppreciation = statements.length > 0
      ? statements.reduce((acc, s) => acc + s.assetAppreciation, 0) / statements.length
      : 0;

    return { ...total, avgAppreciation };
  }, [statements]);

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
            onClick={() => onNavigate('trust')}
            className="text-sm font-mono"
            style={{ color: COLORS.textSecondary }}
          >
            ← Back
          </button>
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            EQUITY STATEMENTS
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Title Section */}
        <section className="text-center">
          <h1
            className="text-2xl font-light italic mb-1"
            style={{ color: COLORS.accent }}
          >
            Performance Equity
            <sup className="text-xs not-italic ml-1">TM</sup>
          </h1>
          <p
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: COLORS.textMuted }}
          >
            Statements
          </p>
        </section>

        {/* Summary Card */}
        <section
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h3
            className="text-xs font-mono uppercase tracking-wider mb-4"
            style={{ color: COLORS.textMuted }}
          >
            CUMULATIVE EQUITY
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center mb-6">
            <div className="p-2">
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: COLORS.accent }}
              >
                {Math.round(totalStats.pes)}
              </p>
              <p
                className="text-[10px] font-mono"
                style={{ color: COLORS.textMuted }}
              >
                Total PES
              </p>
            </div>
            <div className="p-2">
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                {totalStats.sessions}
              </p>
              <p
                className="text-[10px] font-mono"
                style={{ color: COLORS.textMuted }}
              >
                Sessions
              </p>
            </div>
            <div className="p-2">
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: COLORS.success }}
              >
                +{Math.round(totalStats.avgAppreciation)}%
              </p>
              <p
                className="text-[10px] font-mono"
                style={{ color: COLORS.textMuted }}
              >
                Avg Growth
              </p>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="h-28 flex items-end gap-2">
            {cumulativeData.map((point, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    backgroundColor: COLORS.accent,
                    height: `${(point.value / (cumulativeData[cumulativeData.length - 1]?.value || 1)) * 70}%`,
                    minHeight: 8,
                  }}
                />
                <span
                  className="text-xs font-mono font-semibold mt-2"
                  style={{ color: COLORS.textSecondary }}
                >
                  {point.month.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Monthly Statements */}
        <section>
          <h3
            className="text-xs font-mono uppercase tracking-wider mb-4"
            style={{ color: COLORS.textMuted }}
          >
            MONTHLY STATEMENTS
          </h3>

          <div className="space-y-4">
            {statements.map((statement) => (
              <StatementCard key={statement.id} statement={statement} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div
          className="text-center pt-6 border-t"
          style={{ borderColor: COLORS.border }}
        >
          <p
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: COLORS.textMuted }}
          >
            Performance Equity v2.1 • GAVL Protocol Active
          </p>
        </div>
      </main>
    </div>
  );
}

function StatementCard({ statement }: { statement: EquityStatement }) {
  const monthName = MONTH_NAMES[statement.month - 1];

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4
          className="text-lg font-mono font-bold"
          style={{ color: COLORS.textPrimary }}
        >
          {monthName.toUpperCase()} {statement.year}
        </h4>
        <span
          className="text-xs font-mono px-2 py-1 rounded"
          style={{
            backgroundColor: statement.status === 'Audited'
              ? COLORS.success + '20'
              : COLORS.warning + '20',
            color: statement.status === 'Audited'
              ? COLORS.success
              : COLORS.warning,
          }}
        >
          {statement.status}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatRow
          label="Total PES Earned"
          value={`+${Math.round(statement.totalPesGenerated)}`}
          color={COLORS.accent}
        />
        <StatRow
          label="Sessions Verified"
          value={statement.totalSessions.toString()}
        />
        <StatRow
          label="Asset Appreciation"
          value={`${statement.assetAppreciation >= 0 ? '+' : ''}${Math.round(statement.assetAppreciation)}%`}
          color={statement.assetAppreciation >= 0 ? COLORS.success : COLORS.error}
        />
        <StatRow
          label="Consistency Score"
          value={`${statement.consistencyScore}%`}
        />
        <StatRow
          label="Volatility Index"
          value={statement.volatilityIndex}
          color={statement.volatilityIndex === 'Low'
            ? COLORS.success
            : statement.volatilityIndex === 'Medium'
              ? COLORS.warning
              : COLORS.error
          }
        />
        <StatRow
          label="Statement Date"
          value={new Date(statement.generatedAt).toLocaleDateString()}
        />
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      className="p-2 rounded"
      style={{ backgroundColor: COLORS.background }}
    >
      <p
        className="text-[10px] font-mono uppercase"
        style={{ color: COLORS.textMuted }}
      >
        {label}
      </p>
      <p
        className="text-sm font-mono font-semibold"
        style={{ color: color || COLORS.textPrimary }}
      >
        {value}
      </p>
    </div>
  );
}

export default EquityStatements;

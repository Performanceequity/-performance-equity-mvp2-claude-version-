/**
 * AICongruency - AI Congruency Engine Deep Dive
 * Multi-modal signal validation and attack detection visualization
 */

import type { CongruencyResult, PhysiologicalBaseline, VerifiedTransaction, ViewType } from '../types';
import { COLORS, SIGNAL_LABELS } from '../constants';
import { StatusIndicator } from '../components/core/StatusIndicator';

interface AICongruencyProps {
  congruency: CongruencyResult;
  baseline: PhysiologicalBaseline;
  recentSession?: VerifiedTransaction;
  onNavigate: (view: ViewType) => void;
}

export function AICongruency({
  congruency,
  baseline,
  recentSession,
  onNavigate,
}: AICongruencyProps) {
  const signals = congruency.signals;

  // Build correlation matrix display
  const matrixData = signals.map((s1) => ({
    signal: s1,
    correlations: signals.map((s2) => {
      if (s1 === s2) return null;
      const pair = congruency.correlationMatrix.find(
        (c) => (c.signal1 === s1 && c.signal2 === s2) ||
               (c.signal1 === s2 && c.signal2 === s1)
      );
      return pair?.correlation ?? null;
    }),
  }));

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
            onClick={() => onNavigate('protocol')}
            className="text-sm font-mono"
            style={{ color: COLORS.textSecondary }}
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: COLORS.textPrimary }}
            >
              AI CONGRUENCY ENGINE
            </span>
          </div>
          <StatusIndicator
            status="nominal"
            size="sm"
            pulse
            label="PROCESSING"
            showLabel
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Introduction */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h2
            className="text-sm font-mono font-semibold mb-2"
            style={{ color: COLORS.textPrimary }}
          >
            MULTI-MODAL SIGNAL VALIDATION
          </h2>
          <p
            className="text-xs font-mono"
            style={{ color: COLORS.textSecondary }}
          >
            The AI Congruency Engine cross-validates physiological signals to detect
            spoofing, replay attacks, and anomalies. Signals must correlate within
            expected thresholds to pass verification.
          </p>
        </section>

        {/* Signal Correlation Matrix */}
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
            SIGNAL CORRELATION MATRIX
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th
                    className="text-xs font-mono text-left p-2"
                    style={{ color: COLORS.textMuted }}
                  />
                  {signals.map((s) => (
                    <th
                      key={s}
                      className="text-xs font-mono text-center p-2"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row) => (
                  <tr key={row.signal}>
                    <td
                      className="text-xs font-mono p-2"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {row.signal}
                    </td>
                    {row.correlations.map((corr, idx) => (
                      <td
                        key={idx}
                        className="text-xs font-mono text-center p-2"
                      >
                        {corr === null ? (
                          <span style={{ color: COLORS.textMuted }}>─</span>
                        ) : (
                          <span
                            style={{
                              color: corr >= 0.8 ? COLORS.success :
                                     corr >= 0.7 ? COLORS.accent :
                                     COLORS.warning,
                            }}
                          >
                            {corr.toFixed(2)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: COLORS.border }}>
            <p className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
              Correlation threshold: <span style={{ color: COLORS.textPrimary }}>0.70</span>
              {' '}|{' '}
              All signals: <span style={{ color: COLORS.success }}>CONGRUENT</span>
            </p>
          </div>
        </section>

        {/* Attack Detection Status */}
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
            ATTACK DETECTION STATUS
          </h3>
          <div className="space-y-3">
            {congruency.attacks.map((attack) => (
              <div
                key={attack.type}
                className="flex items-center justify-between p-3 rounded"
                style={{ backgroundColor: COLORS.background }}
              >
                <div className="flex items-center gap-3">
                  <StatusIndicator
                    status={attack.status === 'clear' ? 'active' : 'error'}
                    size="sm"
                    pulse={attack.status !== 'clear'}
                  />
                  <span
                    className="text-sm font-mono"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {attack.name}
                  </span>
                </div>
                <span
                  className="text-xs font-mono font-semibold px-2 py-1 rounded"
                  style={{
                    backgroundColor: attack.status === 'clear'
                      ? COLORS.success + '20'
                      : COLORS.error + '20',
                    color: attack.status === 'clear' ? COLORS.success : COLORS.error,
                  }}
                >
                  {attack.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Signal Analysis */}
        {recentSession && (
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
              RECENT SIGNAL ANALYSIS
            </h3>
            <div
              className="p-4 rounded"
              style={{ backgroundColor: COLORS.background }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: COLORS.surfaceElevated,
                    color: COLORS.textSecondary,
                  }}
                >
                  SESSION #{recentSession.id}
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: COLORS.textMuted }}
                >
                  {new Date(recentSession.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <SignalStat label="HR avg" value="142 bpm" />
                <SignalStat label="HRV" value="34ms" />
                <SignalStat label="Cadence" value="82 rpm" />
                <SignalStat label="GPS drift" value="2.3m" />
                <SignalStat label="IMU variance" value="0.04g" />
                <SignalStat label="Congruency" value={congruency.score.toFixed(2)} highlight />
              </div>
              <div
                className="pt-3 border-t"
                style={{ borderColor: COLORS.border }}
              >
                <p
                  className="text-xs font-mono"
                  style={{ color: COLORS.textSecondary }}
                >
                  <span style={{ color: COLORS.textPrimary }}>Analysis:</span>{' '}
                  {congruency.analysis}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Physiological Baseline */}
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
            PHYSIOLOGICAL BASELINE (YOUR PROFILE)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <BaselineStat label="Resting HR" value={`${baseline.restingHR} bpm`} />
            <BaselineStat label="Max HR" value={`${baseline.maxHR} bpm`} />
            <BaselineStat label="HRV baseline" value={`${baseline.hrvBaseline}ms`} />
            <BaselineStat label="Recovery rate" value={`${baseline.recoveryRate} bpm/min`} />
            <BaselineStat
              label="Cadence range"
              value={`${baseline.cadenceRange[0]}-${baseline.cadenceRange[1]} rpm`}
            />
            <BaselineStat
              label="Sessions analyzed"
              value={baseline.sessionsAnalyzed.toString()}
            />
          </div>
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: COLORS.border }}
          >
            <p className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
              Profile confidence:{' '}
              <span style={{ color: COLORS.success }}>
                {(baseline.profileConfidence * 100).toFixed(0)}%
              </span>
            </p>
          </div>
        </section>

        {/* Signal Types Legend */}
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
            SIGNAL TYPES
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(SIGNAL_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center gap-2 text-xs font-mono"
              >
                <span style={{ color: COLORS.accent }}>{key}</span>
                <span style={{ color: COLORS.textMuted }}>{label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function SignalStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p
        className="text-xs font-mono"
        style={{ color: COLORS.textMuted }}
      >
        {label}
      </p>
      <p
        className="text-sm font-mono font-semibold"
        style={{ color: highlight ? COLORS.success : COLORS.textPrimary }}
      >
        {value}
      </p>
    </div>
  );
}

function BaselineStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-3 rounded"
      style={{ backgroundColor: COLORS.background }}
    >
      <p
        className="text-xs font-mono mb-1"
        style={{ color: COLORS.textMuted }}
      >
        {label}
      </p>
      <p
        className="text-sm font-mono font-semibold"
        style={{ color: COLORS.textPrimary }}
      >
        {value}
      </p>
    </div>
  );
}

export default AICongruency;

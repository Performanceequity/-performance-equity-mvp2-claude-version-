/**
 * VerificationProtocol - 5-Layer GAVL Stack Visualization
 * Shows the complete verification architecture in action
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { GAVLLayer, GateDistribution, ViewType } from '../types';
import { COLORS, ANCHOR_LABELS, ANCHOR_CONFIDENCE } from '../constants';
import { LayerStack } from '../components/core/LayerStack';
import { StatusIndicator } from '../components/core/StatusIndicator';

interface VerificationProtocolProps {
  layers: GAVLLayer[];
  gateDistribution: GateDistribution;
  onNavigate: (view: ViewType) => void;
}

export function VerificationProtocol({
  layers,
  gateDistribution,
  onNavigate,
}: VerificationProtocolProps) {
  // Prepare gate distribution data for pie chart
  const gateData = [
    { name: 'AUTO', value: gateDistribution.auto, color: COLORS.gates.auto },
    { name: 'CONFIRM', value: gateDistribution.confirm, color: COLORS.gates.confirm },
    { name: 'QUARANTINE', value: gateDistribution.quarantine, color: COLORS.gates.quarantine },
  ];

  // Signal ladder data
  const signalLadder = Object.entries(ANCHOR_CONFIDENCE).map(([type, confidence]) => ({
    type,
    label: ANCHOR_LABELS[type] || type.toUpperCase(),
    confidence,
    isOpen: type === 'geo',
  }));

  // Check if all layers are healthy
  const allLayersOk = layers.every(l =>
    l.status === 'active' || l.status === 'nominal' || l.status === 'ready'
  );

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
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: COLORS.textPrimary }}
            >
              VERIFICATION PROTOCOL
            </span>
          </div>
          <StatusIndicator
            status={allLayersOk ? 'online' : 'warning'}
            size="sm"
            pulse
            label={allLayersOk ? 'ALL LAYERS OK' : 'DEGRADED'}
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
            GAVL 5-LAYER ANTI-FRAUD ARCHITECTURE
          </h2>
          <p
            className="text-xs font-mono"
            style={{ color: COLORS.textSecondary }}
          >
            The Guardian Access Verification Layer provides bank-grade session authentication
            through a multi-layered verification stack. Each layer adds independent verification
            to ensure tamper-evident proof of human effort.
          </p>
        </section>

        {/* Layer Stack */}
        <section>
          <h3
            className="text-xs font-mono font-semibold uppercase tracking-wider mb-3"
            style={{ color: COLORS.textSecondary }}
          >
            LAYER STATUS
          </h3>
          <LayerStack layers={layers} showConnectors={true} />
        </section>

        {/* Signal Ladder (Layer 1 Detail) */}
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
            SIGNAL LADDER (LAYER 1)
          </h3>
          <p
            className="text-xs font-mono mb-4"
            style={{ color: COLORS.textMuted }}
          >
            Multiple anchor signals are validated in priority order. Higher rungs provide
            stronger verification confidence.
          </p>
          <div className="space-y-2">
            {signalLadder.map((signal) => (
              <div
                key={signal.type}
                className="flex items-center gap-3"
              >
                <div
                  className="h-2 flex-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: COLORS.border }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${signal.confidence * 100}%`,
                      backgroundColor: COLORS.layers[1],
                    }}
                  />
                </div>
                <span
                  className="text-xs font-mono w-24"
                  style={{ color: COLORS.textPrimary }}
                >
                  {signal.label}
                </span>
                <span
                  className="text-xs font-mono w-12 text-right"
                  style={{ color: COLORS.textSecondary }}
                >
                  {signal.confidence.toFixed(2)}
                </span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: signal.isOpen ? COLORS.info + '20' : COLORS.success + '20',
                    color: signal.isOpen ? COLORS.info : COLORS.success,
                  }}
                >
                  {signal.isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Gate Distribution */}
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
            GATE DISTRIBUTION (30 DAY)
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    dataKey="value"
                    stroke="none"
                  >
                    {gateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: COLORS.background,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 4,
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: COLORS.textPrimary }}
                    itemStyle={{ color: COLORS.textPrimary }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {gateData.map((gate) => (
                <div
                  key={gate.name}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: gate.color }}
                  />
                  <div
                    className="h-2 flex-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: COLORS.border }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${gate.value}%`,
                        backgroundColor: gate.color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono w-24"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {gate.name}
                  </span>
                  <span
                    className="text-xs font-mono w-12 text-right"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {gate.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SCS Formula */}
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
            SESSION CONFIDENCE SCORE (SCS) FORMULA
          </h3>
          <div
            className="p-4 rounded font-mono text-sm"
            style={{
              backgroundColor: COLORS.background,
              color: COLORS.accent,
            }}
          >
            SCS = (0.35 × Anchor) + (0.25 × Device) + (0.40 × Trust)
          </div>
          <div className="mt-4 space-y-2 text-xs font-mono" style={{ color: COLORS.textSecondary }}>
            <p>• <span style={{ color: COLORS.textPrimary }}>Anchor (35%)</span>: Verification anchor confidence (NFC/BLE/WiFi/GEO)</p>
            <p>• <span style={{ color: COLORS.textPrimary }}>Device (25%)</span>: Device attestation status (attested = 1.0)</p>
            <p>• <span style={{ color: COLORS.textPrimary }}>Trust (40%)</span>: Your Trust Index score (0-100 normalized)</p>
          </div>
          <div className="mt-4 pt-4 border-t space-y-1" style={{ borderColor: COLORS.border }}>
            <p className="text-xs font-mono" style={{ color: COLORS.textSecondary }}>
              <span style={{ color: COLORS.gates.auto }}>AUTO</span>: SCS ≥ 0.80 (Automatic verification)
            </p>
            <p className="text-xs font-mono" style={{ color: COLORS.textSecondary }}>
              <span style={{ color: COLORS.gates.confirm }}>CONFIRM</span>: 0.50 ≤ SCS {'<'} 0.80 (Biometric liveness required)
            </p>
            <p className="text-xs font-mono" style={{ color: COLORS.textSecondary }}>
              <span style={{ color: COLORS.gates.quarantine }}>QUARANTINE</span>: SCS {'<'} 0.50 (Manual review, 0 PES)
            </p>
          </div>
        </section>

        {/* Navigate to AI Congruency */}
        <section>
          <button
            onClick={() => onNavigate('congruency')}
            className="w-full p-4 rounded-lg border text-center transition-all hover:border-opacity-60"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.layers[2],
            }}
          >
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: COLORS.layers[2] }}
            >
              VIEW AI CONGRUENCY ENGINE →
            </span>
            <p
              className="text-xs font-mono mt-1"
              style={{ color: COLORS.textMuted }}
            >
              Multi-modal signal validation and attack detection
            </p>
          </button>
        </section>
      </main>
    </div>
  );
}

export default VerificationProtocol;

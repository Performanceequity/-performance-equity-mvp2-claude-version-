/**
 * ActiveSession - Real-Time Verification
 * Live signals, verification status, elapsed time
 */

import { useState, useEffect } from 'react';
import type { ViewType } from '../types';
import { COLORS } from '../constants';
import { StatusIndicator } from '../components/core/StatusIndicator';

interface ActiveSessionProps {
  onNavigate: (view: ViewType) => void;
  onEndSession: () => void;
}

export function ActiveSession({
  onNavigate,
  onEndSession,
}: ActiveSessionProps) {
  const [elapsed, setElapsed] = useState(0);
  const [heartRate, setHeartRate] = useState(142);
  const [zone, setZone] = useState<'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5'>('Z3');
  const [cadence, setCadence] = useState(84);
  const [congruency, setCongruency] = useState(0.96);
  const [estimatedPes, setEstimatedPes] = useState(0);
  const [gpsDrift, setGpsDrift] = useState(3.2);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate HR fluctuation
      setHeartRate((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(100, Math.min(180, prev + delta));
      });

      // Simulate cadence fluctuation
      setCadence((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(70, Math.min(100, prev + delta));
      });

      // Simulate congruency fluctuation
      setCongruency((prev) => {
        const delta = (Math.random() - 0.5) * 0.02;
        return Math.max(0.85, Math.min(0.99, prev + delta));
      });

      // Simulate GPS drift
      setGpsDrift((prev) => {
        const delta = (Math.random() - 0.5) * 0.5;
        return Math.max(1, Math.min(10, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update zone based on HR
  useEffect(() => {
    if (heartRate < 110) setZone('Z1');
    else if (heartRate < 130) setZone('Z2');
    else if (heartRate < 150) setZone('Z3');
    else if (heartRate < 170) setZone('Z4');
    else setZone('Z5');
  }, [heartRate]);

  // Calculate estimated PES based on elapsed time and zone
  useEffect(() => {
    const zoneMultipliers: Record<string, number> = {
      Z1: 0.5,
      Z2: 0.75,
      Z3: 1.0,
      Z4: 1.25,
      Z5: 1.5,
    };
    const minutes = elapsed / 60;
    const baseRate = 0.1; // PES per minute
    const pes = minutes * baseRate * zoneMultipliers[zone] * 0.9; // 0.9 trust multiplier
    setEstimatedPes(pes);
  }, [elapsed, zone]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getZoneColor = (z: string) => {
    return COLORS.zones[z as keyof typeof COLORS.zones] || COLORS.textPrimary;
  };

  const getZoneName = (z: string) => {
    const names: Record<string, string> = {
      Z1: 'RECOVERY',
      Z2: 'AEROBIC',
      Z3: 'TEMPO',
      Z4: 'THRESHOLD',
      Z5: 'VO2 MAX',
    };
    return names[z] || z;
  };

  const handleEndSession = () => {
    onEndSession();
    onNavigate('overview');
  };

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
          <div className="flex items-center gap-2">
            <StatusIndicator status="nominal" size="sm" pulse />
            <span className="text-xs font-mono" style={{ color: COLORS.success }}>
              RECORDING
            </span>
          </div>
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            SESSION ACTIVE
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Elapsed Time */}
        <section className="text-center py-8">
          <p
            className="text-xs font-mono uppercase tracking-wider mb-2"
            style={{ color: COLORS.textMuted }}
          >
            ELAPSED
          </p>
          <p
            className="text-5xl font-mono font-bold tracking-tight"
            style={{ color: COLORS.textPrimary }}
          >
            {formatTime(elapsed)}
          </p>
        </section>

        {/* Verification Status */}
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
            VERIFICATION STATUS
          </h3>
          <div className="space-y-3">
            <VerificationBar
              label="GAVL"
              value={100}
              status="Anchor: NFC locked"
              color={COLORS.layers[1]}
            />
            <VerificationBar
              label="AI ENGINE"
              value={congruency * 100}
              status={`Congruency: ${congruency.toFixed(2)}`}
              color={COLORS.layers[2]}
            />
            <VerificationBar
              label="DEVICE"
              value={100}
              status="Attestation: valid"
              color={COLORS.layers[3]}
            />
            <VerificationBar
              label="TRUST"
              value={88}
              status="Tier: Gold (88)"
              color={COLORS.layers[4]}
            />
          </div>
        </section>

        {/* Live Signals */}
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
            LIVE SIGNALS
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <SignalCard
              label="HEART RATE"
              value={heartRate.toString()}
              unit="bpm"
              status={heartRate > 160 ? 'elevated' : 'normal'}
            />
            <SignalCard
              label="ZONE"
              value={zone}
              unit={getZoneName(zone)}
              status="normal"
              color={getZoneColor(zone)}
            />
            <SignalCard
              label="CADENCE"
              value={cadence.toString()}
              unit="rpm"
              status="normal"
            />
          </div>
        </section>

        {/* Estimated Session Value */}
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
            ESTIMATED SESSION VALUE
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div
              className="p-3 rounded"
              style={{ backgroundColor: COLORS.background }}
            >
              <p className="text-xs font-mono mb-1" style={{ color: COLORS.textMuted }}>
                Current PES Accrual
              </p>
              <p
                className="text-xl font-mono font-bold"
                style={{ color: COLORS.success }}
              >
                ~{estimatedPes.toFixed(1)}
              </p>
            </div>
            <div
              className="p-3 rounded"
              style={{ backgroundColor: COLORS.background }}
            >
              <p className="text-xs font-mono mb-1" style={{ color: COLORS.textMuted }}>
                Projected Gate
              </p>
              <p
                className="text-sm font-mono font-bold"
                style={{ color: COLORS.gates.auto }}
              >
                AUTO
              </p>
            </div>
            <div
              className="p-3 rounded"
              style={{ backgroundColor: COLORS.background }}
            >
              <p className="text-xs font-mono mb-1" style={{ color: COLORS.textMuted }}>
                Trust Multiplier
              </p>
              <p
                className="text-sm font-mono font-bold"
                style={{ color: COLORS.accent }}
              >
                0.9x (Gold)
              </p>
            </div>
          </div>
        </section>

        {/* Anchor Status */}
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
            ANCHOR STATUS
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span style={{ color: COLORS.textMuted }}>NFC: Gold's Gym Venice</span>
              <span style={{ color: COLORS.success }}>Lock duration: {formatTime(elapsed)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: COLORS.textMuted }}>GPS: 33.9871, -118.4682</span>
              <span style={{ color: COLORS.textSecondary }}>Drift: {gpsDrift.toFixed(1)}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: COLORS.textMuted }}>WiFi: 2 BSSIDs matched</span>
              <span style={{ color: COLORS.success }}>Signal: stable</span>
            </div>
          </div>
        </section>

        {/* Chain of Custody */}
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
            CHAIN OF CUSTODY (LIVE)
          </h3>
          <div className="space-y-1 text-xs font-mono">
            <CustodyEvent
              time={formatTime(0)}
              event="Session initiated"
              type="anchor_verified"
            />
            <CustodyEvent
              time={formatTime(1)}
              event="Device attestation"
              type="challenge_passed"
            />
            <CustodyEvent
              time={formatTime(2)}
              event="AI congruency start"
              type="signals_acquired"
            />
            <CustodyEvent
              time={formatTime(elapsed)}
              event="Signals recording"
              type="active"
              active
            />
          </div>
        </section>

        {/* Terminate Session Button */}
        <button
          onClick={handleEndSession}
          className="w-full py-4 rounded-lg font-mono font-semibold text-center border transition-all"
          style={{
            backgroundColor: 'transparent',
            borderColor: COLORS.error,
            color: COLORS.error,
          }}
        >
          TERMINATE SESSION
        </button>
        <p
          className="text-center text-xs font-mono"
          style={{ color: COLORS.textMuted }}
        >
          Finalize and commit to ledger
        </p>
      </main>
    </div>
  );
}

function VerificationBar({
  label,
  value,
  status,
  color,
}: {
  label: string;
  value: number;
  status: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs font-mono w-20"
        style={{ color: COLORS.textSecondary }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: COLORS.border }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span
        className="text-xs font-mono text-right min-w-[140px]"
        style={{ color: COLORS.textMuted }}
      >
        {status}
      </span>
    </div>
  );
}

function SignalCard({
  label,
  value,
  unit,
  status,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'elevated' | 'warning';
  color?: string;
}) {
  const statusColor =
    status === 'elevated'
      ? COLORS.warning
      : status === 'warning'
      ? COLORS.error
      : COLORS.textPrimary;

  return (
    <div
      className="p-3 rounded text-center"
      style={{ backgroundColor: COLORS.background }}
    >
      <p className="text-xs font-mono mb-1" style={{ color: COLORS.textMuted }}>
        {label}
      </p>
      <p
        className="text-2xl font-mono font-bold"
        style={{ color: color || statusColor }}
      >
        {value}
      </p>
      <p className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
        {unit}
      </p>
    </div>
  );
}

function CustodyEvent({
  time,
  event,
  type,
  active = false,
}: {
  time: string;
  event: string;
  type: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: COLORS.textMuted }}>{time}</span>
      <span style={{ color: COLORS.border }}>|</span>
      <span style={{ color: active ? COLORS.success : COLORS.textPrimary }}>
        {event}
      </span>
      <span style={{ color: COLORS.border }}>|</span>
      <span style={{ color: active ? COLORS.success : COLORS.textSecondary }}>
        {type}
      </span>
      {active && (
        <span className="animate-pulse" style={{ color: COLORS.success }}>
          ...
        </span>
      )}
    </div>
  );
}

export default ActiveSession;

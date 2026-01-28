/**
 * TrustProfile - Trust Tier & Device Management
 * Trust progression, attested devices, verification statistics
 */

import { useMemo, useState } from 'react';
import type { TrustProfile as TrustProfileType, ViewType } from '../types';
import { COLORS, TRUST_TIERS } from '../constants';
import { StatusIndicator } from '../components/core/StatusIndicator';

interface TrustProfileProps {
  trust: TrustProfileType;
  onNavigate: (view: ViewType) => void;
}

interface AttestedDevice {
  id: string;
  name: string;
  type: 'watch' | 'phone' | 'band';
  attested: boolean;
  lastSeen: number;
  sessionsRecorded: number;
}

export function TrustProfile({
  trust,
  onNavigate,
}: TrustProfileProps) {
  const [showAddDevice, setShowAddDevice] = useState(false);
  const tierConfig = TRUST_TIERS[trust.tier];
  const nextTier = getNextTier(trust.tier);
  const progressToNext = nextTier
    ? ((trust.score - tierConfig.minScore) / (nextTier.minScore - tierConfig.minScore)) * 100
    : 100;

  // Mock devices
  const devices: AttestedDevice[] = useMemo(() => [
    {
      id: 'device-1',
      name: 'Apple Watch Series 11',
      type: 'watch',
      attested: true,
      lastSeen: Date.now() - 1000 * 60 * 5, // 5 min ago
      sessionsRecorded: 87,
    },
    {
      id: 'device-2',
      name: 'iPhone 17 Pro Max',
      type: 'phone',
      attested: true,
      lastSeen: Date.now() - 1000 * 60 * 2, // 2 min ago
      sessionsRecorded: 127,
    },
    {
      id: 'device-3',
      name: 'Garmin Forerunner 955',
      type: 'watch',
      attested: true,
      lastSeen: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
      sessionsRecorded: 42,
    },
  ], []);

  // Mock verification stats
  const stats = useMemo(() => ({
    totalSessions: 127,
    autoGateRate: 68,
    avgScs: 0.86,
    anomaliesDetected: 0,
    livenessChecks: 12,
    livenessPassRate: 100,
    consecutiveClean: 45,
    probationCount: 0,
  }), []);

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
            TRUST PROFILE
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Trust Score */}
        <section
          className="p-6 rounded-lg border text-center"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <p
            className="text-xs font-mono uppercase tracking-wider mb-2"
            style={{ color: COLORS.textMuted }}
          >
            TRUST INDEX
          </p>
          <p
            className="text-5xl font-mono font-bold mb-2"
            style={{ color: tierConfig.color }}
          >
            {trust.score}
          </p>
          <p
            className="text-xl font-mono font-semibold mb-4"
            style={{ color: tierConfig.color }}
          >
            {tierConfig.label} TIER
          </p>

          {/* Tier Ladder */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {Object.entries(TRUST_TIERS).map(([key, config]) => (
              <div
                key={key}
                className="flex flex-col items-center"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-1"
                  style={{
                    backgroundColor: key === trust.tier ? config.color : COLORS.border,
                    color: key === trust.tier ? COLORS.background : COLORS.textMuted,
                  }}
                >
                  {config.label.charAt(0)}
                </div>
                <span
                  className="text-[10px] font-mono"
                  style={{
                    color: key === trust.tier ? config.color : COLORS.textMuted,
                  }}
                >
                  {config.minScore}+
                </span>
              </div>
            ))}
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span style={{ color: COLORS.textMuted }}>
                  Progress to {nextTier.label}
                </span>
                <span style={{ color: COLORS.textSecondary }}>
                  {trust.score}/{nextTier.minScore}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: COLORS.border }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(progressToNext, 100)}%`,
                    backgroundColor: tierConfig.color,
                  }}
                />
              </div>
              <p
                className="text-xs font-mono mt-2"
                style={{ color: COLORS.textMuted }}
              >
                {nextTier.minScore - trust.score} points to next tier
              </p>
            </div>
          )}

          {/* Multiplier */}
          <div className="mt-6 pt-4 border-t" style={{ borderColor: COLORS.border }}>
            <p className="text-sm font-mono" style={{ color: COLORS.textSecondary }}>
              Current Multiplier:{' '}
              <span style={{ color: COLORS.accent }}>{trust.multiplier}x</span>
            </p>
          </div>
        </section>

        {/* Attested Devices */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-xs font-mono font-semibold uppercase tracking-wider"
              style={{ color: COLORS.textSecondary }}
            >
              ATTESTED DEVICES
            </h3>
            <span
              className="text-xs font-mono px-2 py-1 rounded"
              style={{
                backgroundColor: COLORS.success + '20',
                color: COLORS.success,
              }}
            >
              {devices.filter((d) => d.attested).length} VERIFIED
            </span>
          </div>

          <div className="space-y-3">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>

          <button
            onClick={() => setShowAddDevice(true)}
            className="w-full mt-4 py-2 rounded font-mono text-sm border transition-all hover:border-opacity-60"
            style={{
              borderColor: COLORS.accent,
              color: COLORS.accent,
              backgroundColor: COLORS.accent + '10',
            }}
          >
            + Add Device
          </button>
        </section>

        {/* Add Device Modal */}
        {showAddDevice && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          >
            <div
              className="w-full max-w-md p-6 rounded-lg border"
              style={{
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border,
              }}
            >
              <h3
                className="text-lg font-mono font-bold mb-4"
                style={{ color: COLORS.textPrimary }}
              >
                ADD NEW DEVICE
              </h3>
              <p
                className="text-xs font-mono mb-6"
                style={{ color: COLORS.textMuted }}
              >
                Connect a new wearable or device to your trusted network.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { name: 'Apple Watch', icon: '⌚' },
                  { name: 'Garmin Device', icon: '📱' },
                  { name: 'WHOOP Band', icon: '⏱' },
                  { name: 'Oura Ring', icon: '💍' },
                ].map((device) => (
                  <button
                    key={device.name}
                    className="w-full p-3 rounded border text-left flex items-center gap-3 transition-all hover:border-opacity-60"
                    style={{
                      backgroundColor: COLORS.background,
                      borderColor: COLORS.border,
                    }}
                    onClick={() => {
                      alert(`${device.name} connection initiated. Follow the pairing instructions on your device.`);
                      setShowAddDevice(false);
                    }}
                  >
                    <span className="text-2xl">{device.icon}</span>
                    <span
                      className="text-sm font-mono"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {device.name}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddDevice(false)}
                className="w-full py-2 rounded font-mono text-sm border"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.textSecondary,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Verification Statistics */}
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
            VERIFICATION STATISTICS
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="Total Sessions"
              value={stats.totalSessions.toString()}
            />
            <StatBox
              label="Auto-Gate Rate"
              value={`${stats.autoGateRate}%`}
              color={COLORS.success}
            />
            <StatBox
              label="Average SCS"
              value={stats.avgScs.toFixed(2)}
            />
            <StatBox
              label="Anomalies"
              value={stats.anomaliesDetected.toString()}
              color={stats.anomaliesDetected === 0 ? COLORS.success : COLORS.error}
            />
          </div>

          <div
            className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4"
            style={{ borderColor: COLORS.border }}
          >
            <StatBox
              label="Liveness Checks"
              value={stats.livenessChecks.toString()}
            />
            <StatBox
              label="Pass Rate"
              value={`${stats.livenessPassRate}%`}
              color={COLORS.success}
            />
            <StatBox
              label="Clean Streak"
              value={`${stats.consecutiveClean} sessions`}
            />
            <StatBox
              label="Probations"
              value={stats.probationCount.toString()}
              color={stats.probationCount === 0 ? COLORS.success : COLORS.warning}
            />
          </div>
        </section>

        {/* Trust History */}
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
            TRUST HISTORY
          </h3>

          <div className="space-y-2">
            {trust.history.slice(0, 5).map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs font-mono p-2 rounded"
                style={{ backgroundColor: COLORS.background }}
              >
                <span style={{ color: COLORS.textMuted }}>
                  {new Date(entry.date).toLocaleDateString()}
                </span>
                <span style={{ color: COLORS.textPrimary }}>
                  Score: {entry.score}
                </span>
                {entry.event && (
                  <span
                    className="px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: COLORS.surfaceElevated,
                      color: COLORS.textSecondary,
                    }}
                  >
                    {entry.event}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Trust Guidelines */}
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
            HOW TRUST INDEX WORKS
          </h3>
          <div className="space-y-2 text-xs font-mono" style={{ color: COLORS.textMuted }}>
            <p>
              <span style={{ color: COLORS.success }}>+</span> Consistent high-SCS sessions
            </p>
            <p>
              <span style={{ color: COLORS.success }}>+</span> Passing liveness checks promptly
            </p>
            <p>
              <span style={{ color: COLORS.success }}>+</span> Using closed anchors (NFC, BLE)
            </p>
            <p>
              <span style={{ color: COLORS.error }}>-</span> Sessions flagged for anomalies
            </p>
            <p>
              <span style={{ color: COLORS.error }}>-</span> Quarantined sessions
            </p>
            <p>
              <span style={{ color: COLORS.error }}>-</span> Failed liveness challenges
            </p>
          </div>
        </section>

        {/* Quick Links */}
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
            MANAGE
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('equity-statements')}
              className="w-full p-3 rounded text-left font-mono text-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
              }}
            >
              <span>Performance Equity Statements</span>
              <span style={{ color: COLORS.textMuted }}>→</span>
            </button>

            <button
              onClick={() => onNavigate('redeem')}
              className="w-full p-3 rounded text-left font-mono text-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
              }}
            >
              <span>Redeem Rewards</span>
              <span style={{ color: COLORS.textMuted }}>→</span>
            </button>

            <button
              onClick={() => onNavigate('connect-devices')}
              className="w-full p-3 rounded text-left font-mono text-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
              }}
            >
              <span>Trusted Hardware</span>
              <span style={{ color: COLORS.textMuted }}>→</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="w-full p-3 rounded text-left font-mono text-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
              }}
            >
              <span>Privacy & Settings</span>
              <span style={{ color: COLORS.textMuted }}>→</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function DeviceCard({ device }: { device: AttestedDevice }) {
  const formatLastSeen = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div
      className="flex items-center justify-between p-3 rounded"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="flex items-center gap-3">
        <StatusIndicator
          status={device.attested ? 'active' : 'error'}
          size="sm"
        />
        <div>
          <p
            className="text-sm font-mono font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            {device.name}
          </p>
          <p className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
            Last seen: {formatLastSeen(device.lastSeen)} | {device.sessionsRecorded} sessions
          </p>
        </div>
      </div>
      <span
        className="text-xs font-mono px-2 py-1 rounded"
        style={{
          backgroundColor: device.attested ? COLORS.success + '20' : COLORS.error + '20',
          color: device.attested ? COLORS.success : COLORS.error,
        }}
      >
        {device.attested ? 'ATTESTED' : 'UNVERIFIED'}
      </span>
    </div>
  );
}

function StatBox({
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
      className="p-3 rounded"
      style={{ backgroundColor: COLORS.background }}
    >
      <p className="text-xs font-mono mb-1" style={{ color: COLORS.textMuted }}>
        {label}
      </p>
      <p
        className="text-lg font-mono font-bold"
        style={{ color: color || COLORS.textPrimary }}
      >
        {value}
      </p>
    </div>
  );
}

function getNextTier(currentTier: string) {
  const tiers = Object.entries(TRUST_TIERS);
  const currentIdx = tiers.findIndex(([key]) => key === currentTier);
  if (currentIdx > 0) {
    const [, config] = tiers[currentIdx - 1];
    return config;
  }
  return null;
}

export default TrustProfile;

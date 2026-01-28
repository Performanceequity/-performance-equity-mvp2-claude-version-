/**
 * SessionInitiation - Verification Flow
 * Anchor detection, device attestation, session start
 */

import { useState, useEffect } from 'react';
import type { ViewType, AnchorType } from '../types';
import { COLORS, ANCHOR_LABELS } from '../constants';
import { StatusIndicator } from '../components/core/StatusIndicator';

interface SessionInitiationProps {
  onNavigate: (view: ViewType) => void;
  onStartSession: () => void;
}

interface DetectedAnchor {
  type: AnchorType;
  name: string;
  signal: 'strong' | 'medium' | 'weak';
  confidence: number;
  available: boolean;
}

interface DeviceStatus {
  name: string;
  attested: boolean;
  lastChallenge: number; // ms ago
  teeVerified: boolean;
}

export function SessionInitiation({
  onNavigate,
  onStartSession,
}: SessionInitiationProps) {
  const [scanning, setScanning] = useState(true);
  const [selectedAnchor, setSelectedAnchor] = useState<AnchorType | null>(null);
  const [deviceReady, setDeviceReady] = useState(false);

  // Simulated anchor detection
  const [anchors] = useState<DetectedAnchor[]>([
    {
      type: 'nfc',
      name: "Gold's Gym Venice",
      signal: 'strong',
      confidence: 1.0,
      available: true,
    },
    {
      type: 'ble',
      name: 'GYM-BEACON-042',
      signal: 'medium',
      confidence: 0.85,
      available: true,
    },
    {
      type: 'wifi',
      name: 'GoldsGym_5G',
      signal: 'medium',
      confidence: 0.70,
      available: true,
    },
    {
      type: 'geo',
      name: 'Current Location',
      signal: 'weak',
      confidence: 0.60,
      available: true,
    },
  ]);

  // Simulated device status
  const [device] = useState<DeviceStatus>({
    name: 'Apple Watch Series 9',
    attested: true,
    lastChallenge: 2300,
    teeVerified: true,
  });

  // Simulate scanning animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setScanning(false);
      setDeviceReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnchorSelect = (type: AnchorType) => {
    setSelectedAnchor(type);
  };

  const handleStartSession = () => {
    if (selectedAnchor && deviceReady) {
      onStartSession();
      onNavigate('session-active');
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'strong':
        return COLORS.success;
      case 'medium':
        return COLORS.accent;
      case 'weak':
        return COLORS.warning;
      default:
        return COLORS.textMuted;
    }
  };

  const getPredictedGate = (confidence: number) => {
    if (confidence >= 0.80) return { gate: 'AUTO', color: COLORS.gates.auto };
    if (confidence >= 0.50) return { gate: 'CONFIRM', color: COLORS.gates.confirm };
    return { gate: 'QUARANTINE', color: COLORS.gates.quarantine };
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
          <button
            onClick={() => onNavigate('overview')}
            className="text-sm font-mono"
            style={{ color: COLORS.textSecondary }}
          >
            ← Cancel
          </button>
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            INITIATE SESSION
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Anchor Detection */}
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
              ANCHOR DETECTION
            </h3>
            {scanning && (
              <div className="flex items-center gap-2">
                <StatusIndicator status="active" size="sm" pulse />
                <span className="text-xs font-mono" style={{ color: COLORS.accent }}>
                  SCANNING...
                </span>
              </div>
            )}
          </div>

          <p
            className="text-xs font-mono mb-4"
            style={{ color: COLORS.textMuted }}
          >
            Select a verification anchor to bind your session. Higher confidence
            anchors result in automatic verification.
          </p>

          <div className="space-y-3">
            {anchors.map((anchor) => (
              <AnchorCard
                key={anchor.type}
                anchor={anchor}
                selected={selectedAnchor === anchor.type}
                onSelect={() => handleAnchorSelect(anchor.type)}
                signalColor={getSignalColor(anchor.signal)}
                prediction={getPredictedGate(anchor.confidence)}
              />
            ))}
          </div>
        </section>

        {/* Device Attestation */}
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
            DEVICE ATTESTATION
          </h3>

          <div
            className="flex items-center justify-between p-3 rounded"
            style={{ backgroundColor: COLORS.background }}
          >
            <div className="flex items-center gap-3">
              <StatusIndicator
                status={device.attested ? 'active' : 'error'}
                size="sm"
                pulse={!device.attested}
              />
              <div>
                <p
                  className="text-sm font-mono font-semibold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {device.name}
                </p>
                <p className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                  Last challenge: {(device.lastChallenge / 1000).toFixed(1)}s ago
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className="text-xs font-mono font-semibold px-2 py-1 rounded"
                style={{
                  backgroundColor: device.attested
                    ? COLORS.success + '20'
                    : COLORS.error + '20',
                  color: device.attested ? COLORS.success : COLORS.error,
                }}
              >
                {device.attested ? 'ATTESTED' : 'UNVERIFIED'}
              </span>
              {device.teeVerified && (
                <p
                  className="text-xs font-mono mt-1"
                  style={{ color: COLORS.textMuted }}
                >
                  TEE: verified
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Predicted Session Quality */}
        {selectedAnchor && (
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
              PREDICTED SESSION QUALITY
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {anchors
                .filter((a) => a.type === selectedAnchor)
                .map((anchor) => {
                  const prediction = getPredictedGate(anchor.confidence);
                  return (
                    <div key={anchor.type}>
                      <div
                        className="p-3 rounded"
                        style={{ backgroundColor: COLORS.background }}
                      >
                        <p
                          className="text-xs font-mono mb-1"
                          style={{ color: COLORS.textMuted }}
                        >
                          With {ANCHOR_LABELS[anchor.type]} anchor:
                        </p>
                        <p className="text-sm font-mono">
                          <span style={{ color: COLORS.textSecondary }}>SCS ~</span>
                          <span style={{ color: COLORS.textPrimary }}>
                            {anchor.confidence.toFixed(2)}
                          </span>
                        </p>
                        <p className="text-sm font-mono">
                          <span style={{ color: COLORS.textSecondary }}>Gate: </span>
                          <span style={{ color: prediction.color }}>
                            {prediction.gate}
                          </span>
                          <span style={{ color: COLORS.textMuted }}> likely</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              <div>
                <div
                  className="p-3 rounded"
                  style={{ backgroundColor: COLORS.background }}
                >
                  <p
                    className="text-xs font-mono mb-1"
                    style={{ color: COLORS.textMuted }}
                  >
                    Trust Multiplier:
                  </p>
                  <p
                    className="text-sm font-mono font-semibold"
                    style={{ color: COLORS.accent }}
                  >
                    0.9x (Gold Tier)
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* GAVL Layers Status */}
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
            VERIFICATION LAYERS
          </h3>
          <div className="flex items-center gap-4">
            <LayerChip label="GAVL" status={selectedAnchor ? 'ready' : 'waiting'} />
            <LayerChip label="AI" status="standby" />
            <LayerChip label="DEVICE" status={deviceReady ? 'ready' : 'checking'} />
            <LayerChip label="TRUST" status="active" />
            <LayerChip label="AUDIT" status="standby" />
          </div>
        </section>

        {/* Start Session Button */}
        <button
          onClick={handleStartSession}
          disabled={!selectedAnchor || !deviceReady}
          className="w-full py-4 rounded-lg font-mono font-semibold text-center transition-all"
          style={{
            backgroundColor:
              selectedAnchor && deviceReady ? COLORS.accent : COLORS.surfaceElevated,
            color: selectedAnchor && deviceReady ? COLORS.background : COLORS.textMuted,
            opacity: selectedAnchor && deviceReady ? 1 : 0.6,
            cursor: selectedAnchor && deviceReady ? 'pointer' : 'not-allowed',
          }}
        >
          {!deviceReady ? (
            'VERIFYING DEVICE...'
          ) : !selectedAnchor ? (
            'SELECT AN ANCHOR TO BEGIN'
          ) : (
            <>BEGIN VERIFIED SESSION</>
          )}
        </button>

        <p
          className="text-center text-xs font-mono"
          style={{ color: COLORS.textMuted }}
        >
          All layers active | Recording enabled | Chain of custody initiated
        </p>
      </main>
    </div>
  );
}

function AnchorCard({
  anchor,
  selected,
  onSelect,
  signalColor,
  prediction,
}: {
  anchor: DetectedAnchor;
  selected: boolean;
  onSelect: () => void;
  signalColor: string;
  prediction: { gate: string; color: string };
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-4 rounded-lg border transition-all text-left"
      style={{
        backgroundColor: selected ? COLORS.surfaceElevated : COLORS.background,
        borderColor: selected ? COLORS.accent : COLORS.border,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: selected ? COLORS.accent : COLORS.border,
              border: selected ? 'none' : `2px solid ${COLORS.textMuted}`,
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: COLORS.surfaceElevated,
                  color: COLORS.textSecondary,
                }}
              >
                {anchor.type.toUpperCase()}
              </span>
              <span
                className="text-sm font-mono font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                {anchor.name}
              </span>
            </div>
            <p className="text-xs font-mono mt-1" style={{ color: COLORS.textMuted }}>
              Signal:{' '}
              <span style={{ color: signalColor }}>
                {anchor.signal.charAt(0).toUpperCase() + anchor.signal.slice(1)}
              </span>{' '}
              | Confidence: {anchor.confidence.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span
            className="text-xs font-mono px-2 py-1 rounded"
            style={{
              backgroundColor: prediction.color + '20',
              color: prediction.color,
            }}
          >
            {prediction.gate}
          </span>
        </div>
      </div>
    </button>
  );
}

function LayerChip({
  label,
  status,
}: {
  label: string;
  status: 'ready' | 'active' | 'standby' | 'waiting' | 'checking';
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return COLORS.success;
      case 'active':
        return COLORS.accent;
      case 'checking':
        return COLORS.warning;
      case 'waiting':
        return COLORS.textMuted;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: getStatusColor() }}
      />
      <span className="text-xs font-mono" style={{ color: getStatusColor() }}>
        {label}
      </span>
    </div>
  );
}

export default SessionInitiation;

/**
 * ConnectDevices - Trusted Hardware Management
 * Manage biometric sensors authorized to contribute to PES
 */

import { useState } from 'react';
import type { ViewType } from '../types';
import { COLORS } from '../constants';

interface ConnectDevicesProps {
  onNavigate: (view: ViewType) => void;
}

type ConnectionStatus = 'connected' | 'available' | 'syncing' | 'failed';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: ConnectionStatus;
  lastSync?: string;
  model?: string;
}

export function ConnectDevices({ onNavigate }: ConnectDevicesProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'apple-watch', name: 'Apple Watch', type: 'Wearable Sensor', status: 'connected', lastSync: 'Just now', model: 'Series 11' },
    { id: 'apple-health', name: 'Apple Health', type: 'Biometric Aggregator', status: 'connected', lastSync: '2 mins ago' },
    { id: 'iphone', name: 'iPhone 17 Pro Max', type: 'Primary Device', status: 'connected', lastSync: 'Just now' },
    { id: 'garmin', name: 'Garmin Connect', type: 'GPS/Biometrics', status: 'available' },
    { id: 'whoop', name: 'WHOOP 4.0', type: 'Recovery Tracker', status: 'available' },
    { id: 'oura', name: 'Oura Ring Gen 3', type: 'Sleep/Recovery', status: 'available' },
  ]);

  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleToggleConnection = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    if (integration.status === 'connected') {
      // Disconnect
      setIntegrations(prev => prev.map(i =>
        i.id === id ? { ...i, status: 'available' as ConnectionStatus, lastSync: undefined } : i
      ));
    } else {
      // Connect - simulate handshake
      setConnectingId(id);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIntegrations(prev => prev.map(i =>
        i.id === id ? { ...i, status: 'connected' as ConnectionStatus, lastSync: 'Just now' } : i
      ));
      setConnectingId(null);
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

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
            TRUSTED HARDWARE
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <section className="text-center mb-8">
          <h1
            className="text-2xl font-mono font-bold mb-2"
            style={{ color: COLORS.textPrimary }}
          >
            Trusted Hardware
          </h1>
          <p
            className="text-sm font-mono max-w-lg mx-auto"
            style={{ color: COLORS.textMuted }}
          >
            Manage the biometric sensors authorized to contribute to your Performance Equity Score.
            Only attested devices can generate Class A verified sessions.
          </p>
        </section>

        {/* Connection Status Summary */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs font-mono uppercase tracking-wider"
                style={{ color: COLORS.textMuted }}
              >
                DEVICES CONNECTED
              </p>
              <p
                className="text-2xl font-mono font-bold"
                style={{ color: COLORS.accent }}
              >
                {connectedCount}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: COLORS.success + '20' }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.success}
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
        </section>

        {/* Integrations List */}
        <section className="space-y-3">
          {integrations.map(integration => (
            <div
              key={integration.id}
              className="p-4 rounded-lg border transition-all"
              style={{
                backgroundColor: COLORS.surface,
                borderColor: integration.status === 'connected' ? COLORS.success + '40' : COLORS.border,
                opacity: integration.status === 'connected' ? 1 : 0.8,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-mono"
                    style={{
                      backgroundColor: integration.status === 'connected'
                        ? COLORS.accent + '20'
                        : COLORS.background,
                      color: integration.status === 'connected'
                        ? COLORS.accent
                        : COLORS.textMuted,
                      border: `1px solid ${integration.status === 'connected' ? COLORS.accent + '40' : COLORS.border}`,
                    }}
                  >
                    {integration.name.charAt(0)}
                  </div>
                  <div>
                    <h3
                      className="font-mono font-semibold"
                      style={{
                        color: integration.status === 'connected'
                          ? COLORS.textPrimary
                          : COLORS.textSecondary
                      }}
                    >
                      {integration.name}
                      {integration.model && (
                        <span
                          className="ml-2 text-xs"
                          style={{ color: COLORS.textMuted }}
                        >
                          {integration.model}
                        </span>
                      )}
                    </h3>
                    <p
                      className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: COLORS.textMuted }}
                    >
                      {integration.type}
                    </p>
                    {integration.status === 'connected' && (
                      <p
                        className="text-xs font-mono mt-1 flex items-center gap-1"
                        style={{ color: COLORS.success }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ backgroundColor: COLORS.success }}
                        />
                        Attested • Synced {integration.lastSync}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {integration.status === 'connected' && (
                    <div className="hidden sm:flex flex-col items-end mr-2">
                      <span
                        className="text-[10px] font-mono uppercase tracking-widest"
                        style={{ color: COLORS.textMuted }}
                      >
                        Trust Signal
                      </span>
                      <span
                        className="font-mono text-sm"
                        style={{ color: COLORS.accent }}
                      >
                        SECURE
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handleToggleConnection(integration.id)}
                    disabled={connectingId !== null}
                    className="min-w-[100px] py-2 px-4 rounded-lg font-mono text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: integration.status === 'connected'
                        ? 'transparent'
                        : COLORS.accent,
                      color: integration.status === 'connected'
                        ? COLORS.error
                        : COLORS.background,
                      border: integration.status === 'connected'
                        ? `1px solid ${COLORS.error}40`
                        : 'none',
                      opacity: connectingId !== null ? 0.5 : 1,
                    }}
                  >
                    {connectingId === integration.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                          style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }}
                        />
                        Verifying
                      </span>
                    ) : integration.status === 'connected' ? (
                      'Disconnect'
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
            GAVL Hardware Attestation Protocol v2.1
          </p>
        </div>
      </main>
    </div>
  );
}

export default ConnectDevices;

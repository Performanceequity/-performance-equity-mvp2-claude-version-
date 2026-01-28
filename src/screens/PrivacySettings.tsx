/**
 * PrivacySettings - Privacy & Notification Settings
 * Manage GAVL notifications and data sharing preferences
 */

import { useState } from 'react';
import type { ViewType } from '../types';
import { COLORS } from '../constants';

interface PrivacySettingsProps {
  onNavigate: (view: ViewType) => void;
  onSignOut?: () => void;
}

interface NotificationPreferences {
  proximity: boolean;
  opportunities: boolean;
  summaries: boolean;
  pesUpdates: boolean;
}

export function PrivacySettings({ onNavigate, onSignOut }: PrivacySettingsProps) {
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    proximity: true,
    opportunities: true,
    summaries: true,
    pesUpdates: true,
  });

  const [isOptedIn, setIsOptedIn] = useState(true);
  const [showProximityDemo, setShowProximityDemo] = useState(false);

  const handleToggleNotif = (key: keyof NotificationPreferences) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: COLORS.background }}>
      {/* Proximity Demo Modal */}
      {showProximityDemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          <div
            className="w-full max-w-md rounded-lg border overflow-hidden"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.accent,
              boxShadow: `0 0 50px ${COLORS.accent}30`,
            }}
          >
            {/* Modal Header */}
            <div
              className="py-2 px-4 flex justify-between items-center"
              style={{ backgroundColor: COLORS.accent }}
            >
              <span
                className="text-xs font-mono font-bold uppercase tracking-widest"
                style={{ color: COLORS.background }}
              >
                GAVL Proximity Anchor Detected
              </span>
              <span
                className="text-xs font-mono animate-pulse flex items-center gap-1"
                style={{ color: COLORS.background }}
              >
                <span className="w-2 h-2 rounded-full bg-green-600" />
                Live
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-8 text-center">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 border"
                style={{
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.accent + '50',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={COLORS.accent}
                  strokeWidth="1.5"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              <h3
                className="text-2xl font-bold italic mb-1"
                style={{ color: COLORS.textPrimary }}
              >
                GOLD'S GYM
              </h3>
              <p
                className="text-sm font-mono uppercase tracking-widest mb-6"
                style={{ color: COLORS.textMuted }}
              >
                Venice Beach, CA
              </p>

              <div
                className="p-4 rounded-lg mb-6 space-y-2"
                style={{ backgroundColor: COLORS.background }}
              >
                <div className="flex justify-between text-sm font-mono">
                  <span style={{ color: COLORS.textMuted }}>Anchor ID</span>
                  <span style={{ color: COLORS.accent }}>#8829-GAVL-X</span>
                </div>
                <div className="flex justify-between text-sm font-mono">
                  <span style={{ color: COLORS.textMuted }}>Trust Signal</span>
                  <span style={{ color: COLORS.success }}>STRONG (98%)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProximityDemo(false);
                  onNavigate('session-init');
                }}
                className="w-full py-3 rounded-lg font-mono text-sm font-semibold mb-3"
                style={{
                  backgroundColor: COLORS.accent,
                  color: COLORS.background,
                }}
              >
                Verify & Start Session
              </button>
              <button
                onClick={() => setShowProximityDemo(false)}
                className="text-xs font-mono underline"
                style={{ color: COLORS.textMuted }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

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
            SETTINGS
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Notifications Section */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h3
            className="text-lg font-mono font-bold mb-2"
            style={{ color: COLORS.textPrimary }}
          >
            Notifications & Alerts
          </h3>
          <p
            className="text-xs font-mono mb-6"
            style={{ color: COLORS.textMuted }}
          >
            Manage how the Guardian Verification Layer (GAVL) communicates with you.
          </p>

          <div className="space-y-6">
            {/* Proximity Anchors */}
            <ToggleRow
              label="Proximity Anchors"
              description="Push notification when near a verified partner (e.g., Gold's Gym, JFM Boxing) to instantly launch your Performance Equity Card."
              checked={notifications.proximity}
              onChange={() => handleToggleNotif('proximity')}
            />
            {notifications.proximity && (
              <div className="ml-6 -mt-2">
                <button
                  onClick={() => setShowProximityDemo(true)}
                  className="text-xs font-mono py-1 px-3 rounded transition-all"
                  style={{
                    backgroundColor: COLORS.background,
                    color: COLORS.accent,
                    border: `1px solid ${COLORS.accent}40`,
                  }}
                >
                  Simulate Proximity Event (Demo)
                </button>
              </div>
            )}

            {/* Verified Opportunities */}
            <ToggleRow
              label="Verified Opportunity Alerts"
              description="Receive alerts when your PES score unlocks new real-world rewards or insurance benefits."
              checked={notifications.opportunities}
              onChange={() => handleToggleNotif('opportunities')}
            />

            {/* Session Summaries */}
            <ToggleRow
              label="Session Summaries"
              description="Get an AI-generated breakdown of your effort and earnings after every session."
              checked={notifications.summaries}
              onChange={() => handleToggleNotif('summaries')}
            />

            {/* PES Changes */}
            <ToggleRow
              label="PES Changes"
              description="Alerts when your score tier changes (e.g., Silver to Gold)."
              checked={notifications.pesUpdates}
              onChange={() => handleToggleNotif('pesUpdates')}
            />
          </div>
        </section>

        {/* Data Privacy Section */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h3
            className="text-lg font-mono font-bold mb-2"
            style={{ color: COLORS.textPrimary }}
          >
            Data Sharing & Privacy
          </h3>
          <p
            className="text-xs font-mono mb-6"
            style={{ color: COLORS.textMuted }}
          >
            You have complete control over how your verified effort is used. This setting determines
            whether you can unlock real-world opportunities through our partners.
          </p>

          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: COLORS.background }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4
                  className="font-mono font-semibold"
                  style={{ color: COLORS.textPrimary }}
                >
                  Enable Real-World Opportunities
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-sm font-mono font-semibold"
                    style={{ color: isOptedIn ? COLORS.success : COLORS.error }}
                  >
                    {isOptedIn ? 'Active (Opted-In)' : 'Inactive (Opted-Out)'}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setIsOptedIn(!isOptedIn)}
                className="relative w-14 h-8 rounded-full transition-all"
                style={{
                  backgroundColor: isOptedIn ? COLORS.accent : COLORS.border,
                }}
              >
                <div
                  className="absolute top-1 w-6 h-6 rounded-full bg-white transition-all"
                  style={{
                    left: isOptedIn ? '30px' : '4px',
                  }}
                />
              </button>
            </div>

            <div
              className="pt-4 border-t"
              style={{ borderColor: COLORS.border }}
            >
              {isOptedIn ? (
                <div>
                  <h5
                    className="font-mono font-semibold"
                    style={{ color: COLORS.success }}
                  >
                    You are OPTED-IN.
                  </h5>
                  <p
                    className="text-xs font-mono mt-1"
                    style={{ color: COLORS.textSecondary }}
                  >
                    Your verified Performance Equity Score can be used to qualify you for real-world
                    opportunities from our partners.
                  </p>
                </div>
              ) : (
                <div>
                  <h5
                    className="font-mono font-semibold"
                    style={{ color: COLORS.error }}
                  >
                    You are OPTED-OUT.
                  </h5>
                  <p
                    className="text-xs font-mono mt-1"
                    style={{ color: COLORS.textSecondary }}
                  >
                    Your verified data is for your eyes only. You can continue to build your Performance
                    Equity Score in this private "Personal Sandbox".
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h3
            className="text-lg font-mono font-bold mb-4"
            style={{ color: COLORS.textPrimary }}
          >
            Account
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate('trust')}
              className="w-full p-3 rounded-lg text-left font-mono text-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: COLORS.background,
                color: COLORS.textSecondary,
              }}
            >
              <span>Trusted Hardware</span>
              <span style={{ color: COLORS.textMuted }}>→</span>
            </button>

            <button
              className="w-full p-3 rounded-lg text-left font-mono text-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: COLORS.background,
                color: COLORS.textSecondary,
              }}
            >
              <span>Export Data</span>
              <span style={{ color: COLORS.textMuted }}>→</span>
            </button>

            <button
              className="w-full p-3 rounded-lg text-left font-mono text-sm flex items-center justify-between transition-all"
              style={{
                backgroundColor: COLORS.background,
                color: COLORS.error,
              }}
            >
              <span>Delete Account</span>
              <span style={{ color: COLORS.textMuted }}>→</span>
            </button>
          </div>
        </section>

        {/* Sign Out */}
        <section>
          <button
            onClick={onSignOut}
            className="w-full p-4 rounded-lg border font-mono text-sm font-semibold transition-all"
            style={{
              backgroundColor: 'transparent',
              borderColor: COLORS.border,
              color: COLORS.textSecondary,
            }}
          >
            Sign Out
          </button>
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

/**
 * ToggleRow - Reusable toggle switch row component
 */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="mr-4 flex-1">
        <h4
          className="font-mono font-semibold"
          style={{ color: COLORS.textPrimary }}
        >
          {label}
        </h4>
        <p
          className="text-xs font-mono mt-1 leading-relaxed"
          style={{ color: COLORS.textMuted }}
        >
          {description}
        </p>
      </div>

      <button
        onClick={onChange}
        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0 mt-1"
        style={{
          backgroundColor: checked ? COLORS.accent : COLORS.border,
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
          style={{
            left: checked ? '22px' : '2px',
          }}
        />
      </button>
    </div>
  );
}

export default PrivacySettings;

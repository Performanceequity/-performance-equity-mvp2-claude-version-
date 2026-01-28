/**
 * Onboarding - Device registration flow
 * First-time setup for GAVL trusted device attestation
 */

import { useState } from 'react';
import { COLORS } from '../constants';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterDevice = async () => {
    setIsLoading(true);
    // Simulate device registration
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setStep(2);
  };

  const handleConnectWearable = async () => {
    setIsLoading(true);
    // Simulate wearable connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep(3);
  };

  const handleCompleteSetup = () => {
    onComplete();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: COLORS.background }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg border"
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
        }}
      >
        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="w-3 h-3 rounded-full transition-all"
              style={{
                backgroundColor: s <= step ? COLORS.accent : COLORS.border,
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="text-center">
            <h1
              className="text-2xl font-mono font-bold mb-2"
              style={{ color: COLORS.textPrimary }}
            >
              Welcome to
            </h1>
            <h2
              className="text-3xl font-light italic mb-4"
              style={{ color: COLORS.accent }}
            >
              Performance Equity
              <sup className="text-sm not-italic ml-1">TM</sup>
            </h2>

            <p
              className="text-sm font-mono mb-6"
              style={{ color: COLORS.textSecondary }}
            >
              To ensure the integrity of your effort, we need to register this
              device as a trusted source.
            </p>
            <p
              className="text-xs font-mono mb-8"
              style={{ color: COLORS.textMuted }}
            >
              This is a one-time step that creates a secure link between your
              account and this device, forming the foundation of your GAVL
              verification.
            </p>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-24">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }}
                />
                <p
                  className="mt-4 text-sm font-mono"
                  style={{ color: COLORS.textSecondary }}
                >
                  Registering device...
                </p>
              </div>
            ) : (
              <button
                onClick={handleRegisterDevice}
                className="w-full py-3 rounded-lg font-mono text-sm font-semibold transition-all"
                style={{
                  backgroundColor: COLORS.accent,
                  color: COLORS.background,
                }}
              >
                Register This Device
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: COLORS.success + '20' }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.success}
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <h2
              className="text-xl font-mono font-bold mb-2"
              style={{ color: COLORS.textPrimary }}
            >
              Device Registered
            </h2>
            <p
              className="text-sm font-mono mb-8"
              style={{ color: COLORS.textSecondary }}
            >
              Your device has been attested. Now let's connect your wearable for
              biometric verification.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { name: 'Apple Watch', detected: true },
                { name: 'Garmin Device', detected: false },
                { name: 'WHOOP Band', detected: false },
              ].map((device) => (
                <div
                  key={device.name}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: COLORS.background }}
                >
                  <span
                    className="text-sm font-mono"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {device.name}
                  </span>
                  {device.detected ? (
                    <span
                      className="text-xs font-mono px-2 py-1 rounded"
                      style={{
                        backgroundColor: COLORS.success + '20',
                        color: COLORS.success,
                      }}
                    >
                      DETECTED
                    </span>
                  ) : (
                    <span
                      className="text-xs font-mono"
                      style={{ color: COLORS.textMuted }}
                    >
                      Not found
                    </span>
                  )}
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-16">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }}
                />
                <p
                  className="mt-2 text-xs font-mono"
                  style={{ color: COLORS.textSecondary }}
                >
                  Connecting wearable...
                </p>
              </div>
            ) : (
              <button
                onClick={handleConnectWearable}
                className="w-full py-3 rounded-lg font-mono text-sm font-semibold transition-all"
                style={{
                  backgroundColor: COLORS.accent,
                  color: COLORS.background,
                }}
              >
                Connect Apple Watch
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: COLORS.accent + '20' }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.accent}
                strokeWidth="1.5"
              >
                <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>

            <h2
              className="text-xl font-mono font-bold mb-2"
              style={{ color: COLORS.textPrimary }}
            >
              Setup Complete
            </h2>
            <p
              className="text-sm font-mono mb-4"
              style={{ color: COLORS.textSecondary }}
            >
              Your trusted network is configured and ready.
            </p>

            {/* Status summary */}
            <div
              className="p-4 rounded-lg mb-6 text-left"
              style={{ backgroundColor: COLORS.background }}
            >
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span style={{ color: COLORS.textMuted }}>Phone Device</span>
                  <span style={{ color: COLORS.success }}>ATTESTED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: COLORS.textMuted }}>Apple Watch</span>
                  <span style={{ color: COLORS.success }}>CONNECTED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: COLORS.textMuted }}>GAVL Protocol</span>
                  <span style={{ color: COLORS.success }}>READY</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: COLORS.textMuted }}>Trust Index</span>
                  <span style={{ color: COLORS.accent }}>INITIALIZED</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteSetup}
              className="w-full py-3 rounded-lg font-mono text-sm font-semibold transition-all"
              style={{
                backgroundColor: COLORS.accent,
                color: COLORS.background,
              }}
            >
              Enter Performance Equity
            </button>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-8 pt-6 text-center border-t"
          style={{ borderColor: COLORS.border }}
        >
          <p
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: COLORS.textMuted }}
          >
            GAVL Hardware Attestation Protocol v2.1
          </p>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;

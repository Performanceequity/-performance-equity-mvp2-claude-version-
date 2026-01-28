/**
 * Redeem - Performance Equity Account
 * Shows PE balance (redeemable currency) and opportunities
 *
 * KEY DISTINCTION:
 * - PES (Performance Equity Score) = 0-999 rating, like FICO, NOT redeemable
 * - PE (Performance Equity) = Actual credits earned from sessions, IS redeemable
 */

import type { ViewType, TrustTier, PEBalance, PETransaction, PESScore } from '../types';
import { COLORS, TRUST_TIERS } from '../constants';

interface RedeemProps {
  peBalance: PEBalance;
  recentTransactions: PETransaction[];
  pesScore: PESScore;
  trustTier: TrustTier;
  onNavigate: (view: ViewType) => void;
}

interface Opportunity {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'coming-soon' | 'available' | 'locked';
}

export function Redeem({
  peBalance,
  recentTransactions,
  pesScore,
  trustTier,
  onNavigate,
}: RedeemProps) {
  const tierConfig = TRUST_TIERS[trustTier];

  const opportunities: Opportunity[] = [
    {
      id: 'insurance',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: 'INSURANCE PREMIUM DISCOUNT',
      description: 'Up to 15% off verified wellness policies',
      status: 'coming-soon',
    },
    {
      id: 'gym',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6.5 6.5h11" />
          <path d="M6.5 17.5h11" />
          <path d="M4 10v4" />
          <path d="M8 8v8" />
          <path d="M16 8v8" />
          <path d="M20 10v4" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
        </svg>
      ),
      title: 'GYM MEMBERSHIP CREDITS',
      description: 'Earn credits at partner facilities',
      status: 'coming-soon',
    },
    {
      id: 'wellness',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z" />
        </svg>
      ),
      title: 'WELLNESS REWARDS',
      description: 'HSA contributions and health incentives',
      status: 'coming-soon',
    },
    {
      id: 'employer',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      ),
      title: 'EMPLOYER INCENTIVES',
      description: 'Corporate wellness program benefits',
      status: 'coming-soon',
    },
  ];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            REDEEM
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* PE Balance Card */}
        <section
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <p
            className="text-xs font-mono uppercase tracking-wider mb-4"
            style={{ color: COLORS.textMuted }}
          >
            YOUR PERFORMANCE EQUITY ACCOUNT
          </p>

          {/* Balance Breakdown */}
          <div className="space-y-3">
            {/* Available */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS.success }}
                />
                <span className="text-sm font-mono" style={{ color: COLORS.textSecondary }}>
                  Available
                </span>
              </div>
              <span
                className="text-lg font-mono font-bold"
                style={{ color: COLORS.success }}
              >
                {peBalance.available} PE
              </span>
            </div>

            {/* Pending */}
            {peBalance.pending > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS.accent }}
                  />
                  <span className="text-sm font-mono" style={{ color: COLORS.textSecondary }}>
                    Pending Settlement
                    <span className="text-xs ml-1" style={{ color: COLORS.textMuted }}>
                      ({peBalance.pendingSessions} session{peBalance.pendingSessions !== 1 ? 's' : ''})
                    </span>
                  </span>
                </div>
                <span
                  className="text-lg font-mono font-semibold"
                  style={{ color: COLORS.accent }}
                >
                  +{peBalance.pending} PE
                </span>
              </div>
            )}

            {/* Under Review */}
            {peBalance.underReview > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS.warning }}
                  />
                  <span className="text-sm font-mono" style={{ color: COLORS.textSecondary }}>
                    Under Review
                    <span className="text-xs ml-1" style={{ color: COLORS.textMuted }}>
                      ({peBalance.reviewSessions} session{peBalance.reviewSessions !== 1 ? 's' : ''})
                    </span>
                  </span>
                </div>
                <span
                  className="text-lg font-mono font-semibold"
                  style={{ color: COLORS.warning }}
                >
                  +{peBalance.underReview} PE
                </span>
              </div>
            )}

            {/* Divider */}
            <div
              className="border-t my-3"
              style={{ borderColor: COLORS.border }}
            />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-semibold" style={{ color: COLORS.textPrimary }}>
                Total Balance
              </span>
              <span
                className="text-2xl font-mono font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                {peBalance.total} PE
              </span>
            </div>
          </div>

          {/* PES Score Indicator (not redeemable, just for context) */}
          <div
            className="mt-4 pt-4 border-t flex items-center justify-between"
            style={{ borderColor: COLORS.border }}
          >
            <div>
              <p className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                Your PES (Performance Equity Score)
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: COLORS.textMuted }}>
                Higher score = better earning multiplier
              </p>
            </div>
            <div className="text-right">
              <span
                className="text-lg font-mono font-bold"
                style={{ color: tierConfig.color }}
              >
                {pesScore.value}
              </span>
              <span
                className="text-xs font-mono ml-2 px-2 py-0.5 rounded"
                style={{
                  backgroundColor: tierConfig.color + '20',
                  color: tierConfig.color,
                }}
              >
                {tierConfig.label}
              </span>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
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
            RECENT ACTIVITY
          </h3>

          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
                style={{ borderColor: COLORS.border }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                    {formatDate(tx.date)}
                  </span>
                  <span className="text-sm font-mono" style={{ color: COLORS.textPrimary }}>
                    {tx.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-mono font-semibold"
                    style={{
                      color: tx.status === 'review'
                        ? COLORS.warning
                        : tx.status === 'settling'
                          ? COLORS.accent
                          : COLORS.success,
                    }}
                  >
                    +{tx.amount} PE
                  </span>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: tx.status === 'review'
                        ? COLORS.warning + '20'
                        : tx.status === 'settling'
                          ? COLORS.accent + '20'
                          : COLORS.success + '20',
                      color: tx.status === 'review'
                        ? COLORS.warning
                        : tx.status === 'settling'
                          ? COLORS.accent
                          : COLORS.success,
                    }}
                  >
                    {tx.status === 'review' ? 'REVIEW' : tx.status === 'settling' ? 'PENDING' : 'SETTLED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Available Opportunities */}
        <section>
          <h3
            className="text-xs font-mono font-semibold uppercase tracking-wider mb-4"
            style={{ color: COLORS.textSecondary }}
          >
            REDEMPTION OPPORTUNITIES
          </h3>

          <div className="space-y-3">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </section>

        {/* Footer Quote */}
        <section
          className="p-4 rounded-lg border text-center"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <p
            className="text-sm font-mono italic"
            style={{ color: COLORS.textMuted }}
          >
            "Your effort was verified with integrity and dignity—it's not just sweat, it's performance equity."
          </p>
        </section>

        {/* Info Section */}
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
            UNDERSTANDING YOUR BALANCE
          </h3>
          <div className="space-y-2 text-xs font-mono" style={{ color: COLORS.textMuted }}>
            <p>
              <span style={{ color: COLORS.success }}>Available</span> — Fully verified PE, ready to redeem
            </p>
            <p>
              <span style={{ color: COLORS.accent }}>Pending</span> — Recent sessions settling (24-48h)
            </p>
            <p>
              <span style={{ color: COLORS.warning }}>Under Review</span> — Quarantined sessions awaiting verification
            </p>
            <p className="pt-2 border-t" style={{ borderColor: COLORS.border }}>
              Your <span style={{ color: tierConfig.color }}>PES</span> is your credibility score (0-999). It determines your tier and earning rate, but is not redeemable.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const statusConfig = {
    'coming-soon': {
      label: 'COMING SOON',
      color: COLORS.accent,
      bgColor: COLORS.accent + '20',
    },
    available: {
      label: 'AVAILABLE',
      color: COLORS.success,
      bgColor: COLORS.success + '20',
    },
    locked: {
      label: 'LOCKED',
      color: COLORS.textMuted,
      bgColor: COLORS.surfaceElevated,
    },
  };

  const status = statusConfig[opportunity.status];

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: COLORS.accent + '15',
            color: COLORS.accent,
          }}
        >
          {opportunity.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4
              className="text-sm font-mono font-semibold"
              style={{ color: COLORS.textPrimary }}
            >
              {opportunity.title}
            </h4>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded flex-shrink-0"
              style={{
                backgroundColor: status.bgColor,
                color: status.color,
              }}
            >
              {status.label}
            </span>
          </div>
          <p
            className="text-xs font-mono"
            style={{ color: COLORS.textMuted }}
          >
            {opportunity.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Redeem;

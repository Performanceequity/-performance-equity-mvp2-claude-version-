/**
 * TransactionRow - Bank-style session/transaction display
 * Shows verified session with proof chain and audit trail
 */

import { useState } from 'react';
import type { VerifiedTransaction, SessionProof, CustodyEvent } from '../../types';
import { COLORS, HR_ZONE_LABELS, GATE_LABELS, ANCHOR_LABELS } from '../../constants';

interface TransactionRowProps {
  transaction: VerifiedTransaction;
  expanded?: boolean;
  onToggle?: () => void;
  showFullDetails?: boolean;
}

export function TransactionRow({
  transaction,
  expanded = false,
  onToggle,
  showFullDetails = false,
}: TransactionRowProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const gateColor = COLORS.gates[transaction.gate];
  const zoneInfo = HR_ZONE_LABELS[transaction.zone];

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  };

  return (
    <div
      className="rounded-lg border overflow-hidden transition-all"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
      }}
    >
      {/* Main Row */}
      <div
        className="p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
        onClick={handleToggle}
        style={{ backgroundColor: COLORS.surface }}
      >
        {/* Timestamp */}
        <div
          className="text-xs font-mono mb-2"
          style={{ color: COLORS.textMuted }}
        >
          {formatTimestamp(transaction.timestamp)}
        </div>

        {/* Main Content */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: Session Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{
                  backgroundColor: COLORS.surfaceElevated,
                  color: COLORS.textSecondary,
                }}
              >
                #{transaction.id}
              </span>
              <span
                className="text-sm font-mono font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                {transaction.type}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono" style={{ color: COLORS.textSecondary }}>
              <span>{transaction.duration} min</span>
              <span style={{ color: COLORS.zones[transaction.zone] }}>
                {transaction.zone} {zoneInfo.name}
              </span>
              <span>{transaction.location.name}</span>
            </div>
          </div>

          {/* Right: SCS, Gate, PES */}
          <div className="text-right">
            <div className="flex items-center gap-3 mb-1">
              <span
                className="text-xs font-mono"
                style={{ color: COLORS.textSecondary }}
              >
                SCS: <span style={{ color: COLORS.textPrimary }}>{transaction.scs.toFixed(2)}</span>
              </span>
              <span
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: gateColor + '20',
                  color: gateColor,
                }}
              >
                {GATE_LABELS[transaction.gate]}
              </span>
            </div>
            <div
              className="text-lg font-mono font-bold"
              style={{
                color: transaction.pesDelta > 0 ? COLORS.success : COLORS.textMuted,
              }}
            >
              {transaction.pesDelta > 0 ? '+' : ''}{transaction.pesDelta.toFixed(1)} PES
            </div>
          </div>
        </div>

        {/* Proof Chips */}
        <div className="flex items-center gap-2 mt-3">
          <span
            className="text-xs font-mono"
            style={{ color: COLORS.textMuted }}
          >
            Anchor: {ANCHOR_LABELS[transaction.location.anchor] || transaction.location.anchor}
          </span>
          <span style={{ color: COLORS.border }}>|</span>
          <span
            className="text-xs font-mono"
            style={{ color: COLORS.textMuted }}
          >
            Proofs:
          </span>
          {transaction.proofs.map((proof, idx) => (
            <ProofChip key={idx} proof={proof} />
          ))}
        </div>

        {/* Merkle Root Preview */}
        <div className="mt-2">
          <span
            className="text-xs font-mono"
            style={{ color: COLORS.textMuted }}
          >
            Merkle: <span style={{ color: COLORS.accent }}>{transaction.merkleRoot.slice(0, 12)}...</span>
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {(isExpanded || showFullDetails) && (
        <div
          className="border-t p-4"
          style={{ borderColor: COLORS.border }}
        >
          {/* Proof Chain */}
          <div className="mb-4">
            <h4
              className="text-xs font-mono font-semibold uppercase tracking-wider mb-2"
              style={{ color: COLORS.textSecondary }}
            >
              PROOF CHAIN
            </h4>
            <div className="space-y-1">
              {transaction.proofs.map((proof, idx) => (
                <ProofRow key={idx} proof={proof} />
              ))}
            </div>
          </div>

          {/* Chain of Custody */}
          <div className="mb-4">
            <h4
              className="text-xs font-mono font-semibold uppercase tracking-wider mb-2"
              style={{ color: COLORS.textSecondary }}
            >
              CHAIN OF CUSTODY
            </h4>
            <div className="space-y-1">
              {transaction.chainOfCustody.map((event, idx) => (
                <CustodyRow key={idx} event={event} />
              ))}
            </div>
          </div>

          {/* Full Merkle Root */}
          <div>
            <h4
              className="text-xs font-mono font-semibold uppercase tracking-wider mb-1"
              style={{ color: COLORS.textSecondary }}
            >
              MERKLE ROOT
            </h4>
            <code
              className="text-xs font-mono break-all"
              style={{ color: COLORS.accent }}
            >
              {transaction.merkleRoot}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ProofChip - Small inline proof status indicator
 */
function ProofChip({ proof }: { proof: SessionProof }) {
  const color = proof.status === 'verified' ? COLORS.success :
                proof.status === 'failed' ? COLORS.error :
                COLORS.warning;

  return (
    <span
      className="text-xs font-mono px-1.5 py-0.5 rounded"
      style={{
        backgroundColor: color + '20',
        color: color,
      }}
    >
      {proof.type.toUpperCase()} {proof.status === 'verified' ? '✓' : proof.status === 'failed' ? '✗' : '?'}
    </span>
  );
}

/**
 * ProofRow - Detailed proof line item
 */
function ProofRow({ proof }: { proof: SessionProof }) {
  const statusColor = proof.status === 'verified' ? COLORS.success :
                      proof.status === 'failed' ? COLORS.error :
                      COLORS.warning;

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span style={{ color: COLORS.textMuted }}>├─</span>
      <span style={{ color: COLORS.textSecondary }}>{proof.type.toUpperCase()}:</span>
      <span style={{ color: COLORS.textPrimary }}>{proof.details}</span>
      <span style={{ color: statusColor }}>
        ({proof.status})
      </span>
    </div>
  );
}

/**
 * CustodyRow - Chain of custody event line
 */
function CustodyRow({ event }: { event: CustodyEvent }) {
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toTimeString().slice(0, 8);
  };

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span style={{ color: COLORS.textMuted }}>{formatTime(event.timestamp)}</span>
      <span style={{ color: COLORS.border }}>│</span>
      <span style={{ color: COLORS.textPrimary }}>{event.event}</span>
      <span style={{ color: COLORS.border }}>│</span>
      <span style={{ color: COLORS.textSecondary }}>{event.type}</span>
    </div>
  );
}

/**
 * TransactionList - List of transactions with date grouping
 */
interface TransactionListProps {
  transactions: VerifiedTransaction[];
  showPeriodSummary?: boolean;
}

export function TransactionList({
  transactions,
  showPeriodSummary = true,
}: TransactionListProps) {
  // Group by date
  const grouped = transactions.reduce((acc, tx) => {
    const date = new Date(tx.timestamp).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, VerifiedTransaction[]>);

  const dates = Object.keys(grouped).sort().reverse();

  const totalPes = transactions.reduce((sum, tx) => sum + tx.pesDelta, 0);
  const avgScs = transactions.length > 0
    ? transactions.reduce((sum, tx) => sum + tx.scs, 0) / transactions.length
    : 0;

  return (
    <div>
      {/* Period Summary */}
      {showPeriodSummary && (
        <div
          className="flex items-center gap-6 mb-4 pb-4 border-b"
          style={{ borderColor: COLORS.border }}
        >
          <span className="text-sm font-mono" style={{ color: COLORS.textSecondary }}>
            SESSIONS: <span style={{ color: COLORS.textPrimary }}>{transactions.length}</span>
          </span>
          <span className="text-sm font-mono" style={{ color: COLORS.textSecondary }}>
            VERIFIED PES:{' '}
            <span style={{ color: COLORS.success }}>+{totalPes.toFixed(1)}</span>
          </span>
          <span className="text-sm font-mono" style={{ color: COLORS.textSecondary }}>
            AVG SCS: <span style={{ color: COLORS.textPrimary }}>{avgScs.toFixed(2)}</span>
          </span>
        </div>
      )}

      {/* Grouped Transactions */}
      <div className="space-y-6">
        {dates.map((date) => (
          <div key={date}>
            <div
              className="text-xs font-mono font-semibold uppercase tracking-wider mb-2"
              style={{ color: COLORS.textMuted }}
            >
              {formatDateLabel(date)}
            </div>
            <div className="space-y-3">
              {grouped[date].map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default TransactionRow;

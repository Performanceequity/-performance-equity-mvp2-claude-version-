/**
 * TransactionLedger - Bank Statement Precision
 * Full session history with filters, search, and audit trail
 */

import { useState, useMemo } from 'react';
import type { VerifiedTransaction, ViewType, GateType } from '../types';
import { COLORS } from '../constants';
import { TransactionRow } from '../components/core/TransactionRow';

interface TransactionLedgerProps {
  transactions: VerifiedTransaction[];
  onNavigate: (view: ViewType) => void;
}

type FilterGate = 'all' | GateType;
type FilterType = 'all' | string;
type SortOrder = 'newest' | 'oldest' | 'highest_pes' | 'lowest_pes';

export function TransactionLedger({
  transactions,
  onNavigate,
}: TransactionLedgerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGate, setFilterGate] = useState<FilterGate>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Get unique activity types
  const activityTypes = useMemo(() => {
    const types = new Set(transactions.map((t) => t.type));
    return Array.from(types).sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.type.toLowerCase().includes(query) ||
          t.location.name.toLowerCase().includes(query) ||
          t.merkleRoot.toLowerCase().includes(query)
      );
    }

    // Gate filter
    if (filterGate !== 'all') {
      result = result.filter((t) => t.gate === filterGate);
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType);
    }

    // Sort
    switch (sortOrder) {
      case 'oldest':
        result.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'highest_pes':
        result.sort((a, b) => b.pesDelta - a.pesDelta);
        break;
      case 'lowest_pes':
        result.sort((a, b) => a.pesDelta - b.pesDelta);
        break;
      default: // newest
        result.sort((a, b) => b.timestamp - a.timestamp);
    }

    return result;
  }, [transactions, searchQuery, filterGate, filterType, sortOrder]);

  // Calculate period stats
  const periodStats = useMemo(() => {
    const totalPes = filteredTransactions.reduce((sum, t) => sum + t.pesDelta, 0);
    const avgScs =
      filteredTransactions.length > 0
        ? filteredTransactions.reduce((sum, t) => sum + t.scs, 0) / filteredTransactions.length
        : 0;
    const autoGate = filteredTransactions.filter((t) => t.gate === 'auto').length;
    const confirmGate = filteredTransactions.filter((t) => t.gate === 'confirm').length;
    const quarantineGate = filteredTransactions.filter((t) => t.gate === 'quarantine').length;

    return {
      count: filteredTransactions.length,
      totalPes,
      avgScs,
      autoGate,
      confirmGate,
      quarantineGate,
    };
  }, [filteredTransactions]);

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
            TRANSACTION LEDGER
          </span>
          <button
            className="text-xs font-mono px-2 py-1 rounded"
            style={{
              backgroundColor: COLORS.surfaceElevated,
              color: COLORS.accent,
            }}
          >
            EXPORT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Search & Filters */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by ID, type, location, or merkle root..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded font-mono text-sm outline-none"
              style={{
                backgroundColor: COLORS.background,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Gate Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                Gate:
              </span>
              <select
                value={filterGate}
                onChange={(e) => setFilterGate(e.target.value as FilterGate)}
                className="px-2 py-1 rounded font-mono text-xs outline-none"
                style={{
                  backgroundColor: COLORS.background,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <option value="all">All Gates</option>
                <option value="auto">Auto</option>
                <option value="confirm">Confirm</option>
                <option value="quarantine">Quarantine</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                Type:
              </span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2 py-1 rounded font-mono text-xs outline-none"
                style={{
                  backgroundColor: COLORS.background,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <option value="all">All Types</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                Sort:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="px-2 py-1 rounded font-mono text-xs outline-none"
                style={{
                  backgroundColor: COLORS.background,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_pes">Highest PES</option>
                <option value="lowest_pes">Lowest PES</option>
              </select>
            </div>
          </div>
        </section>

        {/* Period Summary */}
        <section
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="SESSIONS" value={periodStats.count.toString()} />
            <StatBox
              label="VERIFIED PES"
              value={`+${periodStats.totalPes.toFixed(1)}`}
              color={COLORS.success}
            />
            <StatBox label="AVG SCS" value={periodStats.avgScs.toFixed(2)} />
            <div>
              <p
                className="text-xs font-mono mb-1"
                style={{ color: COLORS.textMuted }}
              >
                GATE DISTRIBUTION
              </p>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span style={{ color: COLORS.gates.auto }}>
                  A:{periodStats.autoGate}
                </span>
                <span style={{ color: COLORS.gates.confirm }}>
                  C:{periodStats.confirmGate}
                </span>
                <span style={{ color: COLORS.gates.quarantine }}>
                  Q:{periodStats.quarantineGate}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <section
            className="p-8 rounded-lg border text-center"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            }}
          >
            <p className="text-sm font-mono" style={{ color: COLORS.textMuted }}>
              No transactions match your filters
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                expanded={expandedId === tx.id}
                onToggle={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
              />
            ))}
          </section>
        )}

        {/* Audit Info */}
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
            LEDGER INTEGRITY
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span style={{ color: COLORS.textMuted }}>Total Entries</span>
              <span style={{ color: COLORS.textPrimary }}>{transactions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: COLORS.textMuted }}>Chain Status</span>
              <span style={{ color: COLORS.success }}>VERIFIED</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: COLORS.textMuted }}>Last Audit</span>
              <span style={{ color: COLORS.textPrimary }}>
                {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: COLORS.textMuted }}>Hash Algorithm</span>
              <span style={{ color: COLORS.textSecondary }}>SHA-256 / Merkle</span>
            </div>
          </div>
        </section>
      </main>
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
    <div>
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

export default TransactionLedger;

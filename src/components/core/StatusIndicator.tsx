/**
 * StatusIndicator - Real-time status dot with pulse animation
 * Used for system health, layer status, and verification status
 */

import type { LayerStatus } from '../../types';
import { COLORS } from '../../constants';

interface StatusIndicatorProps {
  status: LayerStatus | 'online' | 'degraded' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
  showLabel?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  active: COLORS.success,
  nominal: COLORS.success,
  ready: COLORS.info,
  online: COLORS.success,
  warning: COLORS.warning,
  degraded: COLORS.warning,
  error: COLORS.error,
  offline: COLORS.error,
};

const SIZE_CLASSES = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function StatusIndicator({
  status,
  size = 'md',
  pulse = true,
  label,
  showLabel = false,
}: StatusIndicatorProps) {
  const color = STATUS_COLORS[status] || COLORS.textMuted;
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`${sizeClass} rounded-full`}
          style={{ backgroundColor: color }}
        />
        {pulse && (status === 'active' || status === 'online' || status === 'nominal') && (
          <div
            className={`absolute inset-0 ${sizeClass} rounded-full animate-ping opacity-75`}
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      {showLabel && label && (
        <span
          className="text-xs font-mono uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export default StatusIndicator;

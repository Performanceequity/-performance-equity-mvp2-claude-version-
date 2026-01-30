/**
 * LayerStack - 5-Layer GAVL Verification Protocol Visualization
 * Shows real-time status of all verification layers
 */

import type { GAVLLayer } from '../../types';
import { COLORS } from '../../constants';
import { StatusIndicator } from './StatusIndicator';

interface LayerStackProps {
  layers: GAVLLayer[];
  compact?: boolean;
  showConnectors?: boolean;
}

export function LayerStack({
  layers,
  compact = false,
  showConnectors = true,
}: LayerStackProps) {
  // Sort layers from 5 to 1 (top to bottom in the stack)
  const sortedLayers = [...layers].sort((a, b) => b.layer - a.layer);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {sortedLayers.map((layer) => (
          <div
            key={layer.layer}
            className="flex flex-col items-center"
            title={`${layer.name}: ${layer.statusLabel}`}
          >
            <StatusIndicator status={layer.status} size="sm" pulse />
            <span
              className="text-[10px] font-mono mt-0.5"
              style={{ color: COLORS.textMuted }}
            >
              L{layer.layer}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedLayers.map((layer, index) => (
        <div key={layer.layer}>
          {/* Layer Card */}
          <div
            className="p-4 rounded-lg border transition-all hover:border-opacity-60"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.layers[layer.layer],
              borderLeftWidth: '3px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: COLORS.layers[layer.layer] + '20',
                    color: COLORS.layers[layer.layer],
                  }}
                >
                  LAYER {layer.layer}
                </span>
                <span
                  className="text-sm font-mono font-semibold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {layer.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Layer 1 (GAVL) uses gold dot, others use StatusIndicator */}
                {layer.layer === 1 ? (
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: layer.status === 'error' ? COLORS.error :
                                       layer.status === 'warning' ? COLORS.warning :
                                       COLORS.accent
                    }}
                  />
                ) : (
                  <StatusIndicator status={layer.status} size="sm" pulse />
                )}
                <span
                  className="text-xs font-mono font-semibold"
                  style={{
                    color: layer.status === 'error' ? COLORS.error :
                           layer.status === 'warning' ? COLORS.warning :
                           layer.layer === 1 ? COLORS.accent : COLORS.success
                  }}
                >
                  {layer.statusLabel}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(layer.details).map(([key, value]) => (
                <span
                  key={key}
                  className="text-xs font-mono"
                  style={{ color: COLORS.textSecondary }}
                >
                  {formatDetailKey(key)}:{' '}
                  <span style={{ color: COLORS.textPrimary }}>
                    {formatDetailValue(value)}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Connector */}
          {showConnectors && index < sortedLayers.length - 1 && (
            <div className="flex justify-center py-1">
              <div
                className="w-0.5 h-4"
                style={{ backgroundColor: COLORS.border }}
              />
              <div
                className="absolute mt-1"
                style={{ color: COLORS.textMuted }}
              >
                ▼
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Helper to format detail keys
function formatDetailKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ');
}

// Helper to format detail values
function formatDetailValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  return value;
}

/**
 * Compact horizontal layer status bar
 */
interface LayerStatusBarProps {
  layers: GAVLLayer[];
}

export function LayerStatusBar({ layers }: LayerStatusBarProps) {
  const sortedLayers = [...layers].sort((a, b) => a.layer - b.layer);

  // Get color for layer - GAVL (layer 1) is gold, others are green
  const getLayerColor = (layer: number, status: string) => {
    if (status === 'error') return COLORS.error;
    if (status === 'warning') return COLORS.warning;
    return layer === 1 ? COLORS.accent : COLORS.success; // GAVL = gold, others = green
  };

  return (
    <div
      className="grid grid-cols-5 rounded-lg overflow-hidden border"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
      }}
    >
      {sortedLayers.map((layer) => {
        const layerColor = getLayerColor(layer.layer, layer.status);
        return (
          <div
            key={layer.layer}
            className="p-3 text-center border-r last:border-r-0"
            style={{ borderColor: COLORS.border }}
          >
            <div className="flex justify-center mb-1">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: layerColor }}
              />
            </div>
            <div
              className="text-[10px] font-mono font-semibold tracking-wider"
              style={{ color: COLORS.textSecondary }}
            >
              {layer.shortName}
            </div>
            <div
              className="text-[10px] font-mono mt-0.5"
              style={{ color: layerColor }}
            >
              {layer.statusLabel}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LayerStack;

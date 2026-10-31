import type { ProbeData } from '@/lib/magneticFieldPhysics';
import type { MagnetParameters } from '@/lib/magneticFieldPhysics';

interface MFDataPanelProps {
  params: MagnetParameters;
  probeData: ProbeData | null;
}

function formatNum(value: number, precision = 2): string {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) > 9999) return value.toExponential(2);
  if (Math.abs(value) < 0.001 && value !== 0) return value.toExponential(2);
  return value.toFixed(precision);
}

export function MFDataPanel({ params, probeData }: MFDataPanelProps) {
  const fieldDir = probeData && probeData.magnitude > 1e-6
    ? `${formatNum(probeData.field.x, 1)}, ${formatNum(probeData.field.y, 1)}, ${formatNum(probeData.field.z, 1)}`
    : '—';

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Live Data</span>
        <span className="ml-auto font-mono text-xs text-accent-gold">PROBE</span>
      </div>
      <div className="sim-panel-body">
        <div className="sim-data-row">
          <span className="sim-data-label">Dipole Moment</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{formatNum(params.strength, 0)}</span>
            <span className="sim-data-unit">a.u.</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Magnet Orientation</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{formatNum(params.orientation, 0)}</span>
            <span className="sim-data-unit">°</span>
          </div>
        </div>

        <div className="h-px bg-surface-border" />

        <div className="sim-data-row">
          <span className="sim-data-label">Distance from Centre</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{probeData ? formatNum(probeData.distance, 1) : '—'}</span>
            <span className="sim-data-unit">sim units</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">|B| at Probe</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{probeData ? formatNum(probeData.magnitude, 3) : '—'}</span>
            <span className="sim-data-unit">a.u.</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Relative Strength</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{probeData ? formatNum(probeData.normalizedStrength, 3) : '—'}</span>
            <span className="sim-data-unit">B/B₀</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Field Vector (Bx, By, Bz)</span>
          <span className="sim-data-value text-xs">{fieldDir}</span>
        </div>
        <p className="font-body text-[0.65rem] leading-relaxed text-star-white/35">
          Normalized dipole model. Field values are relative, not measured in tesla.
        </p>
      </div>
    </div>
  );
}

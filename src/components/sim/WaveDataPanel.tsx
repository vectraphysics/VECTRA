import type { WaveDerivedData, WaveParameters } from '@/lib/wavePhysics';

interface WaveDataPanelProps {
  params: WaveParameters;
  derived: WaveDerivedData;
}

function formatNum(value: number, precision = 2): string {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) > 9999) return value.toExponential(2);
  if (Math.abs(value) < 0.01 && value !== 0) return value.toExponential(2);
  return value.toFixed(precision);
}

export function WaveDataPanel({ params, derived }: WaveDataPanelProps) {
  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Live Data</span>
        <span className="ml-auto font-mono text-xs text-accent-cyan">
          {params.direction === 1 ? '→ RIGHT' : '← LEFT'}
        </span>
      </div>
      <div className="sim-panel-body">
        <div className="sim-data-row">
          <span className="sim-data-label">Amplitude (A)</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{formatNum(params.amplitude, 0)}</span>
            <span className="sim-data-unit">px</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Wavelength (λ)</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{formatNum(params.wavelength, 0)}</span>
            <span className="sim-data-unit">px</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Frequency (f)</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{formatNum(params.frequency)}</span>
            <span className="sim-data-unit">Hz</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Wave Speed (v)</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{formatNum(derived.waveSpeed, 0)}</span>
            <span className="sim-data-unit">px/s</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Period (T = 1/f)</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{formatNum(derived.period)}</span>
            <span className="sim-data-unit">s</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Angular Freq. (ω)</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{formatNum(derived.angularFrequency)}</span>
            <span className="sim-data-unit">rad/s</span>
          </div>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Wave Number (k)</span>
          <div className="flex items-baseline gap-1">
            <span className="sim-data-value">{formatNum(derived.waveNumber, 4)}</span>
            <span className="sim-data-unit">rad/px</span>
          </div>
        </div>
        <p className="font-body text-[0.65rem] leading-relaxed text-star-white/35">
          Spatial values use canvas pixels. The displayed speed is in px/s, not a measured
          speed for a real material or medium.
        </p>
      </div>
    </div>
  );
}

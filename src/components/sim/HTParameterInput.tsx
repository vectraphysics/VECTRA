import { useId } from 'react';
import { clamp } from '@/lib/heatTransferPhysics';

/** Accessible numeric/range pair; shares VECTRA slider styles without altering other simulations. */
export function HTParameterInput({ label, value, min, max, step, unit, onChange, help }: {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; onChange: (value: number) => void; help?: string;
}) {
  const id = useId();
  const change = (s: string) => {
    const n = Number.parseFloat(s);
    if (Number.isFinite(n)) onChange(clamp(n, min, max));
  };
  return <div className="flex flex-col gap-1.5" title={help}>
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={`${id}-number`} className="font-mono text-xs text-star-white/55">{label}</label>
      <div className="flex items-baseline gap-1.5">
        <input id={`${id}-number`} aria-label={label} type="number" inputMode="decimal" value={Number(value.toFixed(4))} min={min} max={max} step={step} onChange={(e) => change(e.target.value)} className="sim-num-input" />
        <span className="sim-data-unit min-w-[28px]">{unit}</span>
      </div>
    </div>
    <input type="range" aria-label={`${label} slider`} value={value} min={min} max={max} step={step} onChange={(e) => change(e.target.value)} className="sim-slider my-1" />
  </div>;
}
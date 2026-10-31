interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  precision?: number;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  precision = 2,
}: SliderInputProps) {
  const clampedValue = Math.max(min, Math.min(max, value));
  const displayValue = value.toFixed(precision);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs text-star-white/45">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={Number.isFinite(value) ? displayValue : '0'}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v)) {
                onChange(Math.max(min, Math.min(max, v)));
              }
            }}
            className="sim-num-input"
          />
          {unit && <span className="sim-data-unit w-6">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        value={Number.isFinite(clampedValue) ? clampedValue : min}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="sim-slider"
      />
    </div>
  );
}

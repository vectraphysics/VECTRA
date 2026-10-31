import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { momentum } from '@/lib/momentumPhysics';

export function MomentumExplorer() {
  const [mass, setMass] = useState(4);
  const [speed, setSpeed] = useState(6);
  const [direction, setDirection] = useState<1 | -1>(1);
  const velocity = speed * direction;
  const p = momentum(mass, velocity);

  const preset = (nextMass: number, nextSpeed: number, nextDirection: 1 | -1) => {
    setMass(nextMass);
    setSpeed(nextSpeed);
    setDirection(nextDirection);
  };

  return (
    <article className="rounded-2xl border border-accent-cyan/15 bg-space-800/45 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Interactive model</p><h3 className="mt-2 font-display text-xl font-semibold">Momentum explorer</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-star-white/55">Adjust an object's mass, speed, and direction. The signed momentum updates from the selected values.</p></div><button type="button" onClick={() => preset(4, 6, 1)} className="btn-ghost min-h-10 px-3 py-2 text-xs"><RotateCcw className="h-3.5 w-3.5" />Reset</button></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          <Slider id="momentum-mass" label="Mass" value={mass} unit="kg" min={0.1} max={2000} step={0.1} onChange={setMass} />
          <Slider id="momentum-speed" label="Speed" value={speed} unit="m/s" min={0} max={30} step={0.1} onChange={setSpeed} />
          <div><p className="text-sm text-star-white/70">Direction</p><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" aria-pressed={direction === 1} onClick={() => setDirection(1)} className={directionButton(direction === 1)}>Right, positive</button><button type="button" aria-pressed={direction === -1} onClick={() => setDirection(-1)} className={directionButton(direction === -1)}>Left, negative</button></div></div>
          <div className="flex flex-wrap gap-2" aria-label="Preset momentum scenarios"><button type="button" onClick={() => preset(0.15, 20, 1)} className="rounded-full border border-surface-border px-3 py-2 text-xs text-star-white/55 hover:border-accent-cyan/30">Ball, 0.15 kg</button><button type="button" onClick={() => preset(1_500, 10, -1)} className="rounded-full border border-surface-border px-3 py-2 text-xs text-star-white/55 hover:border-accent-cyan/30">Car, moving left</button><button type="button" onClick={() => preset(80, 0, 1)} className="rounded-full border border-surface-border px-3 py-2 text-xs text-star-white/55 hover:border-accent-cyan/30">At rest</button></div>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-surface-border bg-space-900/45 p-5">
          <div className="relative flex h-32 items-center overflow-hidden rounded-lg border border-surface-border bg-[linear-gradient(90deg,transparent_49.8%,rgba(94,200,216,0.24)_50%,transparent_50.2%)]">
            <div className={`flex h-14 items-center justify-center rounded-lg border border-accent-cyan/35 bg-accent-cyan/10 text-center font-mono text-xs text-accent-ice transition-all duration-300 ${direction > 0 ? 'ml-4' : 'ml-auto mr-4'}`} style={{ width: `${Math.min(140, 44 + Math.sqrt(mass) * 9)}px` }}>
              {mass.toFixed(1)} kg
            </div>
            <span className={`absolute top-3 font-mono text-xs text-star-white/45 ${direction > 0 ? 'left-4' : 'right-4'}`} aria-hidden="true">{speed === 0 ? 'v = 0' : direction > 0 ? '→' : '←'}</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3"><Value label="Mass" value={`${mass.toFixed(1)} kg`} /><Value label="Velocity" value={`${velocity > 0 ? '+' : ''}${velocity.toFixed(1)} m/s`} /><Value label="Momentum" value={`${p > 0 ? '+' : ''}${p.toFixed(2)} kg m/s`} highlight /><Value label="Magnitude" value={`${Math.abs(p).toFixed(2)} kg m/s`} /></div>
          <p className="mt-4 text-xs leading-5 text-star-white/45">The sign gives direction in the chosen one-dimensional coordinate system. At zero speed, momentum is zero in either direction.</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-accent-cyan/15 bg-accent-cyan/[0.04] p-4 text-center font-mono text-lg text-accent-ice">p = mv = ({mass.toFixed(1)} kg)({velocity.toFixed(1)} m/s) = {p.toFixed(2)} kg m/s</div>
    </article>
  );
}

function Slider({ id, label, value, unit, min, max, step, onChange }: { id: string; label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (value: number) => void }) { return <label htmlFor={id} className="block text-sm text-star-white/70">{label}<span className="float-right font-mono text-xs text-accent-ice">{value.toFixed(1)} {unit}</span><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full accent-accent-cyan" /></label>; }
function Value({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) { return <div className="rounded-lg border border-surface-border bg-space-800/50 p-3"><p className="text-xs text-star-white/40">{label}</p><p className={`mt-1 font-mono text-sm ${highlight ? 'text-accent-ice' : 'text-star-white/70'}`}>{value}</p></div>; }
function directionButton(active: boolean) { return `min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors ${active ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-ice' : 'border-surface-border text-star-white/55 hover:border-surface-border-hover'}`; }

import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { averageNetForce, momentum } from '@/lib/momentumPhysics';

export function ImpulseLab() {
  const [mass, setMass] = useState(0.15);
  const [initialVelocity, setInitialVelocity] = useState(20);
  const [finalVelocity, setFinalVelocity] = useState(0);
  const [duration, setDuration] = useState(0.1);
  const initialMomentum = momentum(mass, initialVelocity);
  const finalMomentum = momentum(mass, finalVelocity);
  const change = finalMomentum - initialMomentum;
  const force = averageNetForce(change, duration) ?? 0;
  const comparison = useMemo(() => ({
    short: averageNetForce(change, 0.1) ?? 0,
    long: averageNetForce(change, 0.5) ?? 0,
  }), [change]);
  const peak = Math.max(1, Math.abs(force));
  const chartHeight = 130;
  const zeroY = 28 + chartHeight / 2;
  const signedHeight = (force / peak) * (chartHeight / 2);
  const rectY = force >= 0 ? zeroY - signedHeight : zeroY;

  const reset = () => {
    setMass(0.15);
    setInitialVelocity(20);
    setFinalVelocity(0);
    setDuration(0.1);
  };

  return (
    <article className="rounded-2xl border border-accent-cyan/15 bg-space-800/45 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Interactive model</p><h3 className="mt-2 font-display text-xl font-semibold">Impulse laboratory</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-star-white/55">Choose the initial and final velocities. For the constant average net force model, impulse equals the signed area under the force versus time graph.</p></div><button type="button" onClick={reset} className="btn-ghost min-h-10 px-3 py-2 text-xs"><RotateCcw className="h-3.5 w-3.5" />Reset</button></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <Slider id="impulse-mass" label="Object mass" value={mass} unit="kg" min={0.05} max={10} step={0.05} onChange={setMass} />
          <Slider id="impulse-vi" label="Initial velocity" value={initialVelocity} unit="m/s" min={-30} max={30} step={0.5} onChange={setInitialVelocity} />
          <Slider id="impulse-vf" label="Final velocity" value={finalVelocity} unit="m/s" min={-30} max={30} step={0.5} onChange={setFinalVelocity} />
          <Slider id="impulse-time" label="Contact time" value={duration} unit="s" min={0.02} max={1} step={0.01} onChange={setDuration} />
          <div className="rounded-xl border border-surface-border bg-space-900/40 p-4"><p className="font-mono text-[0.65rem] uppercase tracking-widest text-star-white/40">Same momentum change, different contact times</p><div className="mt-3 grid grid-cols-2 gap-3"><Metric label="0.10 s" value={`${comparison.short.toFixed(1)} N`} /><Metric label="0.50 s" value={`${comparison.long.toFixed(1)} N`} /></div><p className="mt-3 text-xs leading-5 text-star-white/45">The longer interaction time reduces average net force to one fifth for this same momentum change.</p></div>
        </div>
        <div className="rounded-xl border border-surface-border bg-space-900/45 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Metric label="Initial momentum" value={`${initialMomentum.toFixed(2)} kg m/s`} /><Metric label="Final momentum" value={`${finalMomentum.toFixed(2)} kg m/s`} /><Metric label="Change in momentum" value={`${change > 0 ? '+' : ''}${change.toFixed(2)} kg m/s`} /><Metric label="Impulse" value={`${change > 0 ? '+' : ''}${change.toFixed(2)} N s`} highlight /><Metric label="Average net force" value={`${force > 0 ? '+' : ''}${force.toFixed(2)} N`} /><Metric label="Contact time" value={`${duration.toFixed(2)} s`} /></div>
          <div className="mt-5 rounded-xl border border-surface-border bg-space-800/50 p-3">
            <svg viewBox="0 0 360 210" role="img" aria-labelledby="force-graph-title force-graph-desc" className="h-auto w-full">
              <title id="force-graph-title">Constant average force versus time</title><desc id="force-graph-desc">A rectangle spans zero to {duration.toFixed(2)} seconds and has signed force {force.toFixed(2)} newtons. Its signed area is impulse {change.toFixed(2)} newton seconds.</desc>
              <line x1="46" y1="28" x2="46" y2="160" stroke="rgba(232,237,245,.38)"/><line x1="46" y1={zeroY} x2="337" y2={zeroY} stroke="rgba(232,237,245,.38)"/><line x1="46" y1="160" x2="337" y2="160" stroke="rgba(232,237,245,.38)"/>
              <text x="14" y="36" fill="rgba(232,237,245,.58)" fontSize="11">F (N)</text><text x="314" y="181" fill="rgba(232,237,245,.58)" fontSize="11">t (s)</text>
              <rect x="47" y={rectY} width="232" height={Math.abs(signedHeight)} fill="rgba(94,200,216,.28)" stroke="#5ec8d8" strokeWidth="2" />
              <text x="51" y={force >= 0 ? Math.max(42, rectY + 16) : rectY + Math.abs(signedHeight) - 7} fill="#a8d5e8" fontSize="12">Signed area = J = {change.toFixed(2)} N s</text>
              <text x="43" y="177" fill="rgba(232,237,245,.58)" fontSize="10">0</text><text x="263" y="177" fill="rgba(232,237,245,.58)" fontSize="10">{duration.toFixed(2)}</text><text x="12" y={zeroY + 4} fill="rgba(232,237,245,.58)" fontSize="10">0</text><text x="8" y="68" fill="rgba(232,237,245,.58)" fontSize="10">+{peak.toFixed(0)}</text><text x="14" y="153" fill="rgba(232,237,245,.58)" fontSize="10">−{peak.toFixed(0)}</text>
            </svg>
          </div>
          <p className="mt-3 text-xs leading-5 text-star-white/45">Impulse and change in momentum match: J = Δp = {change.toFixed(2)} N s. A negative sign indicates impulse opposite the chosen positive direction.</p>
        </div>
      </div>
    </article>
  );
}

function Slider({ id, label, value, unit, min, max, step, onChange }: { id: string; label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (value: number) => void }) { return <label htmlFor={id} className="block text-sm text-star-white/70">{label}<span className="float-right font-mono text-xs text-accent-ice">{value.toFixed(2)} {unit}</span><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full accent-accent-cyan" /></label>; }
function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) { return <div className="rounded-lg border border-surface-border bg-space-800/50 p-3"><p className="text-xs text-star-white/40">{label}</p><p aria-live="polite" className={`mt-1 font-mono text-sm ${highlight ? 'text-accent-ice' : 'text-star-white/70'}`}>{value}</p></div>; }

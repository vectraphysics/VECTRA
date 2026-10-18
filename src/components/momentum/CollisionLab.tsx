import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { isKineticEnergyConserved, solveCollision, type CollisionMode } from '@/lib/momentumPhysics';

export function CollisionLab() {
  const [massA, setMassA] = useState(2);
  const [massB, setMassB] = useState(1);
  const [velocityA, setVelocityA] = useState(6);
  const [velocityB, setVelocityB] = useState(0);
  const [mode, setMode] = useState<CollisionMode>('stick');
  const [explosionImpulse, setExplosionImpulse] = useState(10);
  const result = useMemo(() => {
    try { return { data: solveCollision(massA, massB, velocityA, velocityB, mode, explosionImpulse), error: '' }; }
    catch (error) { return { data: null, error: error instanceof Error ? error.message : 'Check the collision inputs.' }; }
  }, [massA, massB, velocityA, velocityB, mode, explosionImpulse]);
  const data = result.data;
  const conserved = data ? isKineticEnergyConserved(data) : false;
  const reset = () => { setMassA(2); setMassB(1); setVelocityA(6); setVelocityB(0); setExplosionImpulse(10); setMode('stick'); };

  const chooseMode = (value: CollisionMode) => {
    setMode(value);
    if (value === 'elastic') { setVelocityA(6); setVelocityB(0); }
    if (value === 'explosion') { setVelocityA(0); setVelocityB(0); }
  };

  return (
    <article className="rounded-2xl border border-accent-cyan/15 bg-space-800/45 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Interactive model</p><h3 className="mt-2 font-display text-xl font-semibold">One-dimensional collision lab</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-star-white/55">Choose an isolated system model. The results update from signed velocities and conserve total momentum.</p></div><button type="button" onClick={reset} className="btn-ghost min-h-10 px-3 py-2 text-xs"><RotateCcw className="h-3.5 w-3.5" />Reset</button></div>
      <div className="mt-5 flex flex-wrap gap-2">{([['stick','Stick together'],['elastic','Perfectly elastic'],['explosion','Push apart from rest']] as const).map(([id,label])=><button type="button" key={id} aria-pressed={mode===id} onClick={()=>chooseMode(id)} className={`min-h-11 rounded-full border px-4 py-2 text-sm transition-colors ${mode===id?'border-accent-cyan/40 bg-accent-cyan/10 text-accent-ice':'border-surface-border text-star-white/50 hover:border-surface-border-hover'}`}>{label}</button>)}</div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <Slider id="collision-mass-a" label="Object A mass" value={massA} unit="kg" min={0.1} max={20} step={0.1} onChange={setMassA} />
          <Slider id="collision-mass-b" label="Object B mass" value={massB} unit="kg" min={0.1} max={20} step={0.1} onChange={setMassB} />
          {mode !== 'explosion' ? <><Slider id="collision-velocity-a" label="A initial velocity" value={velocityA} unit="m/s" min={-20} max={20} step={0.5} onChange={setVelocityA} /><Slider id="collision-velocity-b" label="B initial velocity" value={velocityB} unit="m/s" min={-20} max={20} step={0.5} onChange={setVelocityB} /></> : <><p className="rounded-lg border border-surface-border bg-space-900/45 p-3 text-xs leading-5 text-star-white/55">Explosion starts at rest. An internal impulse acts on the objects with equal and opposite magnitude. No external impulse is included.</p><Slider id="explosion-impulse" label="Internal impulse magnitude" value={explosionImpulse} unit="N s" min={0} max={100} step={1} onChange={setExplosionImpulse} /></>}
          {result.error && <p role="alert" className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">{result.error}</p>}
        </div>
        <div className="rounded-xl border border-surface-border bg-space-900/45 p-4 sm:p-5">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-star-white/40">Objects before and after</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center"><div className="rounded-lg border border-surface-border bg-space-800/45 p-3"><p className="font-mono text-xs text-accent-cyan">Before</p><p className="mt-2 text-xs text-star-white/50">A: {mode==='explosion'?'0.00':velocityA.toFixed(2)} m/s</p><p className="mt-1 text-xs text-star-white/50">B: {mode==='explosion'?'0.00':velocityB.toFixed(2)} m/s</p></div><div className="rounded-lg border border-surface-border bg-space-800/45 p-3"><p className="font-mono text-xs text-accent-cyan">After</p><p className="mt-2 text-xs text-star-white/50">A: {data ? `${data.finalVelocityAMps.toFixed(2)} m/s` : 'Not calculated'}</p><p className="mt-1 text-xs text-star-white/50">B: {data ? `${data.finalVelocityBMps.toFixed(2)} m/s` : 'Not calculated'}</p></div></div>
          {data && <div className="mt-4 space-y-3"><MotionObject label="Object A" velocity={mode==='explosion'?0:velocityA} finalVelocity={data.finalVelocityAMps} mass={massA} /><MotionObject label="Object B" velocity={mode==='explosion'?0:velocityB} finalVelocity={data.finalVelocityBMps} mass={massB} /></div>}
          {data && <div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Total initial momentum" value={`${data.initialMomentumKgMps.toFixed(3)} kg m/s`} /><Metric label="Total final momentum" value={`${data.finalMomentumKgMps.toFixed(3)} kg m/s`} /><Metric label="Momentum difference" value={`${data.momentumDifferenceKgMps.toExponential(2)} kg m/s`} /><Metric label="Initial kinetic energy" value={`${data.initialKineticEnergyJ.toFixed(2)} J`} /><Metric label="Final kinetic energy" value={`${data.finalKineticEnergyJ.toFixed(2)} J`} /><Metric label="Kinetic energy" value={conserved?'Conserved':'Not conserved'} highlight={conserved} /></div>}
          {data && <p className="mt-4 text-xs leading-5 text-star-white/45">{mode==='elastic'?'The elastic model conserves momentum and kinetic energy.':mode==='stick'?'The objects share a final velocity. Momentum is conserved, while kinetic energy is generally transferred to deformation, heat, and sound.':'Assumption: an internal impulse gives A momentum −J and B momentum +J, starting from zero total momentum.'}</p>}
        </div>
      </div>
    </article>
  );
}

function Slider({ id, label, value, unit, min, max, step, onChange }: { id: string; label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (value: number) => void }) { return <label htmlFor={id} className="block text-sm text-star-white/70">{label}<span className="float-right font-mono text-xs text-accent-ice">{value.toFixed(1)} {unit}</span><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full accent-accent-cyan" /></label>; }
function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) { return <div className="rounded-lg border border-surface-border bg-space-800/50 p-3"><p className="text-xs text-star-white/40">{label}</p><p className={`mt-1 break-words font-mono text-xs ${highlight?'text-accent-ice':'text-star-white/70'}`}>{value}</p></div>; }
function MotionObject({ label, velocity, finalVelocity, mass }: { label: string; velocity: number; finalVelocity: number; mass: number }) { const offset = (v: number) => `${Math.max(3, Math.min(80, 50 + v * 1.5))}%`; return <div className="rounded-lg border border-surface-border bg-space-800/45 p-3"><p className="font-mono text-[0.65rem] text-star-white/45">{label}, {mass.toFixed(1)} kg</p><div className="relative mt-2 h-9 rounded border border-surface-border bg-space-900/60"><span className="absolute left-1/2 top-0 h-full border-l border-accent-cyan/35"/><span className="absolute top-1 h-6 w-6 -translate-x-1/2 rounded-md border border-accent-cyan/50 bg-accent-cyan/20 transition-all" style={{left:offset(velocity)}} title={`Before velocity ${velocity.toFixed(2)} metres per second`}/></div><div className="mt-1 flex justify-between text-[0.65rem] text-star-white/40"><span>before {velocity.toFixed(1)} m/s</span><span>after {finalVelocity.toFixed(1)} m/s</span></div></div>; }

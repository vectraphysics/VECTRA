import { useState } from 'react';
import { Activity, ArrowRightLeft, Gauge, Scale, Zap } from 'lucide-react';
import { averagePower, efficiencyPercent, gravitationalPotentialEnergy, kineticEnergy, STANDARD_GRAVITY } from '@/lib/energyPhysics';

const panel = 'rounded-2xl border border-surface-border bg-space-800/45 p-5 sm:p-6';
const rangeClass = 'mt-2 w-full accent-[color:var(--tw-color-accent-cyan,#5ec8d8)]';

export function EnergyActivities() {
  const [mass, setMass] = useState(2);
  const [speed, setSpeed] = useState(3);
  const [heightMass, setHeightMass] = useState(2);
  const [height, setHeight] = useState(5);
  const [dropHeight, setDropHeight] = useState(12);
  const [fallProgress, setFallProgress] = useState(40);
  const [work, setWork] = useState(600);
  const [seconds, setSeconds] = useState(20);
  const [inputEnergy, setInputEnergy] = useState(500);
  const [efficiency, setEfficiency] = useState(70);
  const [equation, setEquation] = useState('');
  const [errorChoice, setErrorChoice] = useState('');

  const kinetic = kineticEnergy(mass, speed);
  const potential = gravitationalPotentialEnergy(heightMass, height);
  const initialMechanical = gravitationalPotentialEnergy(1, dropHeight);
  const dropFraction = fallProgress / 100;
  const currentPotential = initialMechanical * (1 - dropFraction);
  const currentKinetic = initialMechanical * dropFraction;
  const power = averagePower(work, seconds);
  const usefulEnergy = inputEnergy * efficiency / 100;
  const matchingCorrect = equation === 'kinetic';
  const errorCorrect = errorChoice === 'zero';

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <article className={panel}>
          <div className="flex items-center gap-3"><span className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-2.5 text-accent-cyan"><Gauge className="h-5 w-5" /></span><div><p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Explore 01</p><h3 className="font-display text-base font-semibold">Kinetic energy</h3></div></div>
          <p className="mt-3 text-sm leading-6 text-star-white/55">Change mass and speed. Notice that speed has a squared effect.</p>
          <Slider controlId="kinetic-mass" label="Mass" value={mass} unit="kg" min={0} max={10} step={0.5} onChange={setMass} />
          <Slider controlId="kinetic-speed" label="Speed" value={speed} unit="m/s" min={0} max={20} step={0.5} onChange={setSpeed} />
          <Result label="Kinetic energy" value={`${kinetic.toFixed(1)} J`} formula="Ek = ½mv²" />
        </article>

        <article className={panel}>
          <div className="flex items-center gap-3"><span className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-2.5 text-accent-cyan"><Scale className="h-5 w-5" /></span><div><p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Explore 02</p><h3 className="font-display text-base font-semibold">Gravitational potential energy</h3></div></div>
          <p className="mt-3 text-sm leading-6 text-star-white/55">Set mass and height above the selected reference level.</p>
          <Slider controlId="potential-mass" label="Mass" value={heightMass} unit="kg" min={0} max={10} step={0.5} onChange={setHeightMass} />
          <Slider controlId="potential-height" label="Height" value={height} unit="m" min={0} max={30} step={0.5} onChange={setHeight} />
          <Result label="Gravitational potential energy" value={`${potential.toFixed(1)} J`} formula="Ep = mgh, g = 9.8 m/s²" />
        </article>

        <article className={panel}>
          <div className="flex items-center gap-3"><span className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-2.5 text-accent-cyan"><ArrowRightLeft className="h-5 w-5" /></span><div><p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Explore 03</p><h3 className="font-display text-base font-semibold">Energy during free fall</h3></div></div>
          <p className="mt-3 text-sm leading-6 text-star-white/55">A 1 kg object falls from rest. Air resistance is neglected, so total mechanical energy stays constant.</p>
          <Slider controlId="drop-height" label="Starting height" value={dropHeight} unit="m" min={0} max={20} step={0.5} onChange={setDropHeight} />
          <Slider controlId="fall-progress" label="Fraction of fall completed" value={fallProgress} unit="%" min={0} max={100} step={5} onChange={setFallProgress} />
          <div className="mt-4 space-y-3 rounded-xl border border-surface-border bg-space-900/45 p-4">
            <EnergyBar label="Gravitational potential" value={currentPotential} total={initialMechanical} />
            <EnergyBar label="Kinetic" value={currentKinetic} total={initialMechanical} />
            <p className="font-mono text-xs text-accent-ice">Total mechanical energy: {initialMechanical.toFixed(1)} J</p>
          </div>
        </article>

        <article className={panel}>
          <div className="flex items-center gap-3"><span className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-2.5 text-accent-cyan"><Zap className="h-5 w-5" /></span><div><p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Explore 04</p><h3 className="font-display text-base font-semibold">Power and efficiency</h3></div></div>
          <p className="mt-3 text-sm leading-6 text-star-white/55">Compare the same work over different times, then see how efficiency changes useful output.</p>
          <Slider controlId="work" label="Work transferred" value={work} unit="J" min={0} max={2000} step={50} onChange={setWork} />
          <Slider controlId="time" label="Time taken" value={seconds} unit="s" min={0} max={120} step={1} onChange={setSeconds} />
          <Result label="Average power" value={power === null ? 'Undefined at 0 s' : `${power.toFixed(1)} W`} formula="Pavg = W / Δt" />
          <div className="mt-4 border-t border-surface-border pt-4">
            <Slider controlId="input-energy" label="Total input energy" value={inputEnergy} unit="J" min={0} max={2000} step={50} onChange={setInputEnergy} />
            <Slider controlId="efficiency" label="Efficiency" value={efficiency} unit="%" min={0} max={100} step={1} onChange={setEfficiency} />
            <Result label="Useful energy output" value={`${usefulEnergy.toFixed(1)} J`} formula="Euseful = η Ein" />
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className={panel}>
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Equation match</p>
          <h3 className="mt-2 font-display text-base font-semibold">Choose the equation for the scenario</h3>
          <p className="mt-2 text-sm leading-6 text-star-white/55">A moving trolley’s mass and speed are known. Which equation gives its kinetic energy?</p>
          <div className="mt-4 flex flex-wrap gap-2">{[['kinetic', 'Ek = ½mv²'], ['potential', 'Ep = mgh'], ['power', 'P = W/Δt']].map(([id, label]) => <button type="button" key={id} onClick={() => setEquation(id)} aria-pressed={equation === id} className={`min-h-11 rounded-lg border px-3 py-2 font-mono text-sm transition-colors ${equation === id ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-ice' : 'border-surface-border text-star-white/60 hover:border-surface-border-hover'}`}>{label}</button>)}</div>
          {equation && <p role="status" className={`mt-3 text-sm ${matchingCorrect ? 'text-emerald-200' : 'text-amber-100'}`}>{matchingCorrect ? 'Correct. Kinetic energy depends on mass and speed.' : 'Not this one. Look for the equation containing mass and speed.'}</p>}
        </article>
        <article className={panel}>
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Spot the error</p>
          <h3 className="mt-2 font-display text-base font-semibold">Holding a bag still</h3>
          <p className="mt-2 text-sm leading-6 text-star-white/55">A learner says, “I hold a bag stationary, so my upward force does work on the bag.” What should be corrected?</p>
          <div className="mt-4 grid gap-2">{[['zero', 'The force on the bag does zero work because its displacement is zero.'], ['positive', 'The force does positive work because the bag has weight.'], ['power', 'Work equals the holding time in seconds.']].map(([id, label]) => <button type="button" key={id} onClick={() => setErrorChoice(id)} aria-pressed={errorChoice === id} className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm leading-5 transition-colors ${errorChoice === id ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-ice' : 'border-surface-border text-star-white/60 hover:border-surface-border-hover'}`}>{label}</button>)}</div>
          {errorChoice && <p role="status" className={`mt-3 text-sm ${errorCorrect ? 'text-emerald-200' : 'text-amber-100'}`}>{errorCorrect ? 'Exactly. The person still uses chemical energy in their muscles, but the stationary bag has zero displacement.' : 'Check the displacement. Mechanical work on the bag requires displacement along the force.'}</p>}
        </article>
      </div>
    </div>
  );
}

function Slider({ label, value, unit, min, max, step, onChange }: { label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (value: number) => void }) {
  const id = `energy-${label.toLowerCase().replaceAll(' ', '-')}`;
  return <label htmlFor={id} className="mt-4 block text-sm text-star-white/70">{label}<span className="float-right font-mono text-xs text-accent-ice">{value} {unit}</span><input id={id} className={rangeClass} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function Result({ label, value, formula }: { label: string; value: string; formula: string }) {
  return <div className="mt-4 flex items-end justify-between gap-3 rounded-xl border border-accent-cyan/15 bg-accent-cyan/[0.04] p-4"><div><p className="text-xs text-star-white/45">{label}</p><p aria-live="polite" className="mt-1 font-display text-xl font-semibold text-accent-ice">{value}</p></div><p className="font-mono text-xs text-star-white/40">{formula}</p></div>;
}

function EnergyBar({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? Math.min(100, Math.max(0, value / total * 100)) : 0;
  return <div><div className="mb-1 flex justify-between gap-3 text-xs"><span className="text-star-white/60">{label}</span><span className="font-mono text-accent-ice">{value.toFixed(1)} J</span></div><div className="h-2 overflow-hidden rounded-full bg-space-600"><div className="h-full rounded-full bg-accent-cyan transition-[width] duration-300" style={{ width: `${percent}%` }} /></div></div>;
}

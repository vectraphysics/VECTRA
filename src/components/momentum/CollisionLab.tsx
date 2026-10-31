import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { isKineticEnergyConserved, solveCollision, type CollisionMode } from '@/lib/momentumPhysics';

const VIEW_WIDTH = 720;
const TRACK_CENTER = VIEW_WIDTH / 2;

export function CollisionLab() {
  const [massA, setMassA] = useState(2);
  const [massB, setMassB] = useState(1);
  const [velocityA, setVelocityA] = useState(6);
  const [velocityB, setVelocityB] = useState(0);
  const [mode, setMode] = useState<CollisionMode>('stick');
  const [explosionImpulse, setExplosionImpulse] = useState(10);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progressRef = useRef(0);

  const result = useMemo(() => {
    try {
      return {
        data: solveCollision(massA, massB, mode === 'explosion' ? 0 : velocityA, mode === 'explosion' ? 0 : velocityB, mode, explosionImpulse),
        error: '',
      };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Check the collision inputs.' };
    }
  }, [massA, massB, velocityA, velocityB, mode, explosionImpulse]);

  const data = result.data;
  const conserved = data ? isKineticEnergyConserved(data) : false;
  const relativeVelocity = velocityA - velocityB;
  const approaching = Math.abs(relativeVelocity) > 1e-8;
  const maxVelocity = data
    ? Math.max(1, Math.abs(velocityA), Math.abs(velocityB), Math.abs(data.finalVelocityAMps), Math.abs(data.finalVelocityBMps))
    : 1;
  const displacementScale = 92 / maxVelocity;

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progressRef.current = 1;
      setProgress(1);
      setPlaying(false);
      return;
    }

    let frame = 0;
    let previousTime = 0;
    const tick = (timestamp: number) => {
      if (previousTime === 0) previousTime = timestamp;
      const elapsed = Math.min((timestamp - previousTime) / 1000, 0.05);
      previousTime = timestamp;
      const next = Math.min(1, progressRef.current + elapsed / 4.2);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1) {
        setPlaying(false);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing]);

  const updateProgress = (value: number) => {
    const next = Math.max(0, Math.min(1, value));
    progressRef.current = next;
    setProgress(next);
    setPlaying(false);
  };

  const reset = () => {
    setPlaying(false);
    progressRef.current = 0;
    setProgress(0);
  };

  const togglePlayback = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (progress >= 1) updateProgress(0);
    setPlaying(true);
  };

  const chooseMode = (value: CollisionMode) => {
    setMode(value);
    setPlaying(false);
    updateProgress(0);
    if (value === 'elastic') {
      setVelocityA(6);
      setVelocityB(0);
    }
    if (value === 'explosion') {
      setVelocityA(0);
      setVelocityB(0);
    }
  };

  const resetAll = () => {
    setMassA(2);
    setMassB(1);
    setVelocityA(6);
    setVelocityB(0);
    setExplosionImpulse(10);
    setMode('stick');
    reset();
  };

  const finalVelocityA = data?.finalVelocityAMps ?? 0;
  const finalVelocityB = data?.finalVelocityBMps ?? 0;
  const hasCollision = mode === 'explosion' || approaching;
  const phase = progress < 0.5 ? 'Before impact' : 'After impact';
  const contactSeparation = (widthA + widthB) / 4;
  const aStartsLeft = relativeVelocity > 0;
  const contactA = TRACK_CENTER + (aStartsLeft ? -contactSeparation : contactSeparation);
  const contactB = TRACK_CENTER + (aStartsLeft ? contactSeparation : -contactSeparation);
  let xA = 220;
  let xB = 500;

  if (mode === 'explosion' && data) {
    xA = TRACK_CENTER - contactSeparation + finalVelocityA * displacementScale * progress;
    xB = TRACK_CENTER + contactSeparation + finalVelocityB * displacementScale * progress;
  } else if (!approaching) {
    xA = 220;
    xB = 500;
  } else if (progress < 0.5) {
    const approachProgress = progress * 2;
    const startA = aStartsLeft ? 220 : 500;
    const startB = aStartsLeft ? 500 : 220;
    xA = startA + (contactA - startA) * approachProgress;
    xB = startB + (contactB - startB) * approachProgress;
  } else if (mode === 'stick' && data) {
    const travel = finalVelocityA * displacementScale * ((progress - 0.5) * 2);
    xA = TRACK_CENTER - contactSeparation + travel;
    xB = TRACK_CENTER + contactSeparation + travel;
  } else if (data) {
    const afterProgress = (progress - 0.5) * 2;
    xA = contactA + finalVelocityA * displacementScale * afterProgress;
    xB = contactB + finalVelocityB * displacementScale * afterProgress;
  }

  const displayedVelocityA = mode === 'explosion' ? finalVelocityA : progress < 0.5 ? velocityA : finalVelocityA;
  const displayedVelocityB = mode === 'explosion' ? finalVelocityB : progress < 0.5 ? velocityB : finalVelocityB;
  const widthA = objectWidth(massA);
  const widthB = objectWidth(massB);
  const status = mode === 'explosion'
    ? 'An internal impulse sends the two objects in opposite directions. Total momentum remains zero.'
    : !approaching
      ? 'No relative approach: the objects have equal velocities, so this setup does not produce a collision.'
      : progress < 0.5
        ? 'Approach phase. The objects move towards the interaction point.'
        : mode === 'stick'
          ? 'Impact complete. The objects remain joined and move with one shared final velocity.'
          : 'Impact complete. The objects separate with their calculated final velocities.';

  return (
    <article className="overflow-hidden rounded-2xl border border-accent-cyan/15 bg-space-800/45 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Interactive simulation</p>
          <h3 className="mt-2 font-display text-xl font-semibold">One-dimensional collision lab</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-star-white/55">Set the system, run the interaction, and compare momentum with kinetic energy before and after impact. The animation is a one-dimensional model, not a scale drawing of real carts.</p>
        </div>
        <button type="button" onClick={resetAll} className="btn-ghost min-h-10 px-3 py-2 text-xs">
          <RotateCcw className="h-3.5 w-3.5" />Reset experiment
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Collision type">
        {([['stick', 'Stick together'], ['elastic', 'Perfectly elastic'], ['explosion', 'Push apart from rest']] as const).map(([id, label]) => (
          <button type="button" key={id} aria-pressed={mode === id} onClick={() => chooseMode(id)} className={'min-h-11 rounded-full border px-4 py-2 text-sm transition-colors ' + (mode === id ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-ice' : 'border-surface-border text-star-white/50 hover:border-surface-border-hover')}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-5">
          <Slider id="collision-mass-a" label="Object A mass" value={massA} unit="kg" min={0.1} max={20} step={0.1} onChange={setMassA} />
          <Slider id="collision-mass-b" label="Object B mass" value={massB} unit="kg" min={0.1} max={20} step={0.1} onChange={setMassB} />
          {mode !== 'explosion' ? (
            <>
              <Slider id="collision-velocity-a" label="A initial velocity" value={velocityA} unit="m/s" min={-20} max={20} step={0.5} onChange={setVelocityA} />
              <Slider id="collision-velocity-b" label="B initial velocity" value={velocityB} unit="m/s" min={-20} max={20} step={0.5} onChange={setVelocityB} />
              <p className="rounded-lg border border-surface-border bg-space-900/45 p-3 text-xs leading-5 text-star-white/50">Positive velocity points right. Negative velocity points left. The objects are placed on the track according to which one is catching up.</p>
            </>
          ) : (
            <>
              <p className="rounded-lg border border-surface-border bg-space-900/45 p-3 text-xs leading-5 text-star-white/55">The system begins at rest. An internal impulse gives A and B equal and opposite momentum changes. No external impulse is included.</p>
              <Slider id="explosion-impulse" label="Internal impulse magnitude" value={explosionImpulse} unit="N s" min={0} max={100} step={1} onChange={setExplosionImpulse} />
            </>
          )}

          {result.error && <p role="alert" className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">{result.error}</p>}
        </div>

        <div className="min-w-0 rounded-xl border border-surface-border bg-space-900/45 p-3 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-star-white/40">Live motion view</p>
            <span className="rounded-full border border-accent-cyan/20 px-2.5 py-1 font-mono text-[0.62rem] text-accent-ice">{mode === 'explosion' ? 'Internal impulse' : phase}</span>
          </div>

          <svg viewBox="0 0 720 250" role="img" aria-labelledby="collision-track-title collision-track-desc" className="mt-3 h-auto w-full overflow-visible">
            <title id="collision-track-title">Animated one-dimensional momentum experiment</title>
            <desc id="collision-track-desc">Object A has mass {massA.toFixed(1)} kilograms and velocity {displayedVelocityA.toFixed(2)} metres per second. Object B has mass {massB.toFixed(1)} kilograms and velocity {displayedVelocityB.toFixed(2)} metres per second. The objects are shown before and after the selected interaction.</desc>
            <defs>
              <linearGradient id="momentum-track" x1="0" x2="1">
                <stop offset="0%" stopColor="#5ec8d8" stopOpacity="0.08" />
                <stop offset="50%" stopColor="#5ec8d8" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#5ec8d8" stopOpacity="0.08" />
              </linearGradient>
              <marker id="momentum-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                <path d="M0 0 L6 3 L0 6" fill="none" stroke="#a8d5e8" strokeWidth="1.2" />
              </marker>
            </defs>
            <line x1="42" y1="177" x2="678" y2="177" stroke="url(#momentum-track)" strokeWidth="8" strokeLinecap="round" />
            <line x1="42" y1="190" x2="678" y2="190" stroke="rgba(232,237,245,.14)" strokeWidth="1" />
            <line x1={TRACK_CENTER} y1="35" x2={TRACK_CENTER} y2="205" stroke="rgba(94,200,216,.18)" strokeDasharray="4 7" />
            <text x={TRACK_CENTER} y="24" textAnchor="middle" fill="rgba(168,213,232,.58)" fontSize="11">INTERACTION ZONE</text>
            {velocityArrow(xA, 104, displayedVelocityA)}
            {velocityArrow(xB, 104, displayedVelocityB)}
            <g>
              <rect x={xA - widthA / 2} y="126" width={widthA} height="46" rx="9" fill="#173f53" stroke="#5ec8d8" strokeWidth="2" />
              <rect x={xA - widthA / 2 + 5} y="131" width={widthA - 10} height="36" rx="6" fill="#5ec8d8" fillOpacity=".12" />
              <text x={xA} y="154" textAnchor="middle" fill="#c8f4fa" fontSize="14" fontWeight="600">A</text>
              <text x={xA} y="218" textAnchor="middle" fill="rgba(200,244,250,.78)" fontSize="12">{massA.toFixed(1)} kg</text>
            </g>
            <g>
              <rect x={xB - widthB / 2} y="126" width={widthB} height="46" rx="9" fill="#493b26" stroke="#e5b86b" strokeWidth="2" />
              <rect x={xB - widthB / 2 + 5} y="131" width={widthB - 10} height="36" rx="6" fill="#e5b86b" fillOpacity=".12" />
              <text x={xB} y="154" textAnchor="middle" fill="#ffe6b8" fontSize="14" fontWeight="600">B</text>
              <text x={xB} y="218" textAnchor="middle" fill="rgba(255,230,184,.78)" fontSize="12">{massB.toFixed(1)} kg</text>
            </g>
            <text x="44" y="240" fill="rgba(232,237,245,.38)" fontSize="10">LEFT</text>
            <text x="676" y="240" textAnchor="end" fill="rgba(232,237,245,.38)" fontSize="10">RIGHT</text>
          </svg>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={togglePlayback} disabled={!hasCollision || Boolean(result.error)} className="btn-primary min-h-10 px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40">
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? 'Pause' : progress >= 1 ? 'Replay' : 'Play'}
            </button>
            <button type="button" onClick={() => updateProgress(progress + 0.08)} disabled={!hasCollision || progress >= 1} className="btn-ghost min-h-10 px-3 py-2 text-xs disabled:opacity-35">
              <SkipForward className="h-3.5 w-3.5" />Step
            </button>
            <button type="button" onClick={reset} className="btn-ghost min-h-10 px-3 py-2 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />Reset
            </button>
            <span className="ml-auto font-mono text-[0.65rem] tabular-nums text-star-white/40">{Math.round(progress * 100)}%</span>
          </div>
          <label htmlFor="collision-timeline" className="mt-4 block text-xs text-star-white/50">Experiment timeline
            <input id="collision-timeline" type="range" min="0" max="1" step="0.01" value={progress} onChange={(event) => updateProgress(Number(event.target.value))} className="mt-2 w-full accent-accent-cyan" />
          </label>
          <p className="mt-3 min-h-10 text-xs leading-5 text-star-white/50" aria-live="polite">{status}</p>

          {data && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Metric label="Initial total momentum" value={data.initialMomentumKgMps.toFixed(3) + ' kg m/s'} />
              <Metric label="Final total momentum" value={data.finalMomentumKgMps.toFixed(3) + ' kg m/s'} />
              <Metric label="Momentum difference" value={data.momentumDifferenceKgMps.toExponential(2) + ' kg m/s'} />
              <Metric label="Initial kinetic energy" value={data.initialKineticEnergyJ.toFixed(2) + ' J'} />
              <Metric label="Final kinetic energy" value={data.finalKineticEnergyJ.toFixed(2) + ' J'} />
              <Metric label="Kinetic energy" value={conserved ? 'Conserved' : 'Not conserved'} highlight={conserved} />
            </div>
          )}
          {data && (
            <p className="mt-4 border-t border-surface-border pt-3 text-xs leading-5 text-star-white/45">
              {mode === 'elastic'
                ? 'The ideal elastic model conserves total momentum and total kinetic energy.'
                : mode === 'stick'
                  ? 'The objects share a final velocity. Momentum is conserved, while kinetic energy is generally transferred to other forms.'
                  : 'The equal and opposite internal impulses create equal and opposite momentum changes. The total remains zero.'}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function velocityArrow(x: number, y: number, velocity: number) {
  const length = Math.min(88, Math.abs(velocity) * 6);
  if (length < 2) return null;
  const endX = x + Math.sign(velocity) * length;
  return (
    <g>
      <line x1={x} y1={y} x2={endX} y2={y} stroke="#a8d5e8" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#momentum-arrow)" />
      <text x={x} y={y - 9} textAnchor="middle" fill="rgba(200,244,250,.78)" fontSize="10">{velocity > 0 ? '+' : ''}{velocity.toFixed(1)} m/s</text>
    </g>
  );
}

function objectWidth(mass: number) {
  return Math.max(34, Math.min(62, 30 + Math.sqrt(mass) * 5));
}

function Slider({ id, label, value, unit, min, max, step, onChange }: { id: string; label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label htmlFor={id} className="block text-sm text-star-white/70">
      {label}<span className="float-right font-mono text-xs text-accent-ice">{value.toFixed(1)} {unit}</span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full accent-accent-cyan" />
    </label>
  );
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0 rounded-lg border border-surface-border bg-space-800/50 p-3">
      <p className="text-xs text-star-white/40">{label}</p>
      <p className={'mt-1 break-words font-mono text-xs ' + (highlight ? 'text-accent-ice' : 'text-star-white/70')}>{value}</p>
    </div>
  );
}

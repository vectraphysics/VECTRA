import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw, Waypoints } from 'lucide-react';

type GraphMode = 'position' | 'velocity' | 'acceleration';
const duration = 8;
const format = (value: number, digits = 2) => Number(value.toFixed(digits)).toString();

export function MotionLab() {
  const [initialVelocity, setInitialVelocity] = useState(3);
  const [acceleration, setAcceleration] = useState(0.8);
  const [elapsed, setElapsed] = useState(4);
  const [graphMode, setGraphMode] = useState<GraphMode>('position');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      const nextTime = Math.min(duration, elapsed + 0.05);
      setElapsed(nextTime);
      if (nextTime >= duration) setRunning(false);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [elapsed, running]);

  const position = initialVelocity * elapsed + 0.5 * acceleration * elapsed ** 2;
  const velocity = initialVelocity + acceleration * elapsed;
  const graphValues = useMemo(() => Array.from({ length: 41 }, (_, index) => {
    const time = (duration * index) / 40;
    return {
      time,
      position: initialVelocity * time + 0.5 * acceleration * time ** 2,
      velocity: initialVelocity + acceleration * time,
      acceleration,
    };
  }), [initialVelocity, acceleration]);
  const turningTime = acceleration === 0 ? -1 : -initialVelocity / acceleration;
  const extremeTimes = [0, duration, ...(turningTime > 0 && turningTime < duration ? [turningTime] : [])];
  const domain = Math.max(20, ...extremeTimes.map((time) => Math.abs(initialVelocity * time + 0.5 * acceleration * time ** 2))) + 5;
  const markerX = 52 + ((position + domain) / (2 * domain)) * 536;

  const play = () => {
    if (elapsed >= duration) {
      setElapsed(0);
      setRunning(true);
      return;
    }
    setRunning((value) => !value);
  };

  return (
    <section id="motion-lab" className="scroll-mt-24 py-14 sm:py-18">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 text-accent-cyan"><Waypoints className="h-5 w-5" /></span>
        <div><p className="eyebrow">Explore · constant acceleration</p><h2 className="mt-2 font-display text-section text-star-white">Motion, connected</h2></div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="glass-panel p-5 sm:p-6">
          <p className="text-sm leading-6 text-star-white/55">Set the initial velocity and constant acceleration. Position is measured from x = 0 at t = 0; the object and all three graphs follow the same kinematics equations.</p>
          <div className="mt-6 space-y-5">
            <RangeControl label="Initial velocity, vᵢ" value={initialVelocity} min={-8} max={8} step={0.5} unit="m/s" onChange={setInitialVelocity} />
            <RangeControl label="Acceleration, a" value={acceleration} min={-3} max={3} step={0.1} unit="m/s²" onChange={setAcceleration} />
            <RangeControl label="Elapsed time, t" value={elapsed} min={0} max={duration} step={0.1} unit="s" onChange={(value) => { setRunning(false); setElapsed(value); }} />
          </div>
          <div className="mt-6 rounded-xl border border-surface-border bg-space-900/50 p-4">
            <div className="flex items-center justify-between gap-3"><h3 className="font-display text-sm font-semibold text-star-white">One-dimensional track</h3><span className="font-mono text-xs text-star-white/40">t = {format(elapsed, 1)} s</span></div>
            <svg className="mt-3 w-full" viewBox="0 0 640 82" role="img" aria-label={`Object at position ${format(position)} metres on a one-dimensional track`}>
              <line x1="52" y1="42" x2="588" y2="42" stroke="rgba(168,213,232,0.25)" strokeWidth="2" />
              <line x1={markerX} y1="31" x2={markerX} y2="53" stroke="#5ec8d8" strokeOpacity="0.55" />
              <line x1="320" y1="34" x2="320" y2="50" stroke="rgba(232,237,245,0.45)" />
              <circle cx={markerX} cy="42" r="9" fill="#5ec8d8" />
              <circle cx={markerX} cy="42" r="15" fill="#5ec8d8" fillOpacity="0.13" />
              <text x="52" y="72" fill="rgba(232,237,245,0.4)" fontSize="11">−{format(domain)} m</text>
              <text x="320" y="72" fill="rgba(232,237,245,0.4)" fontSize="11" textAnchor="middle">0 m</text>
              <text x="588" y="72" fill="rgba(232,237,245,0.4)" fontSize="11" textAnchor="end">+{format(domain)} m</text>
            </svg>
            <div className="grid grid-cols-3 gap-2 border-t border-surface-border pt-3 text-center">
              <Metric label="Position x" value={`${format(position)} m`} />
              <Metric label="Velocity v" value={`${format(velocity)} m/s`} />
              <Metric label="Acceleration a" value={`${format(acceleration)} m/s²`} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={play} className="btn-primary min-h-11 px-4" aria-label={running ? 'Pause motion' : 'Run motion'}>{running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{running ? 'Pause' : 'Run motion'}</button>
            <button type="button" onClick={() => { setRunning(false); setElapsed(0); }} className="btn-ghost min-h-11 px-4"><RotateCcw className="h-4 w-4" />Reset time</button>
          </div>
          <p className="mt-3 text-xs leading-5 text-star-white/35">Positive values point right; negative values point left. This ideal model assumes acceleration stays constant.</p>
        </div>
        <div className="glass-panel p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="font-mono text-[0.65rem] uppercase tracking-widest text-star-white/35">Graph laboratory</p><h3 className="mt-2 font-display text-lg font-semibold text-star-white">Read the shape, read the motion</h3></div>
            <div className="flex flex-wrap gap-1 rounded-xl border border-surface-border bg-space-900/50 p-1" role="group" aria-label="Choose motion graph">
              {(['position', 'velocity', 'acceleration'] as GraphMode[]).map((mode) => <button key={mode} type="button" aria-pressed={graphMode === mode} onClick={() => setGraphMode(mode)} className={`rounded-lg px-3 py-2 text-xs capitalize transition-colors ${graphMode === mode ? 'bg-accent-cyan/15 text-accent-ice' : 'text-star-white/45 hover:text-star-white'}`}>{mode}</button>)}
            </div>
          </div>
          <GraphSvg data={graphValues} mode={graphMode} elapsed={elapsed} />
          <p className="mt-3 rounded-lg border border-surface-border bg-space-900/35 px-3 py-2 text-xs leading-5 text-star-white/45">
            {graphMode === 'position' ? 'The curve is x(t) = vᵢt + ½at². Its tangent gradient at the marker’s time is velocity.' : graphMode === 'velocity' ? 'The line is v(t) = vᵢ + at. Its gradient is acceleration; signed area from 0 to t is displacement.' : 'With constant acceleration, a(t) is horizontal. Its signed area from 0 to t is the change in velocity.'}
          </p>
        </div>
      </div>
    </section>
  );
}

function RangeControl({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  return <label className="block"><span className="mb-2 flex items-center justify-between gap-2 text-sm text-star-white/75"><span>{label}</span><span className="font-mono text-xs text-accent-ice">{format(value, 1)} {unit}</span></span><input className="w-full accent-[#5ec8d8]" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><span className="mt-1 flex justify-between font-mono text-[0.65rem] text-star-white/30"><span>{min} {unit}</span><span>{max} {unit}</span></span></label>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="font-mono text-[0.6rem] uppercase tracking-widest text-star-white/35">{label}</p><p className="mt-1 font-mono text-xs text-accent-ice sm:text-sm">{value}</p></div>;
}

function GraphSvg({ data, mode, elapsed }: { data: { time: number; position: number; velocity: number; acceleration: number }[]; mode: GraphMode; elapsed: number }) {
  const values = data.map((point) => point[mode]);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = Math.max(1, maxValue - minValue);
  const low = minValue - range * 0.12;
  const high = maxValue + range * 0.12;
  const x = (time: number) => 58 + (time / duration) * 548;
  const y = (value: number) => 180 - ((value - low) / (high - low)) * 145;
  const path = data.map((point, index) => `${index ? 'L' : 'M'} ${x(point.time).toFixed(1)} ${y(point[mode]).toFixed(1)}`).join(' ');
  const zeroY = y(0);
  const axisLabel = mode === 'position' ? 'Position x (m)' : mode === 'velocity' ? 'Velocity v (m/s)' : 'Acceleration a (m/s²)';
  const marker = data[Math.max(0, Math.min(data.length - 1, Math.round((elapsed / duration) * (data.length - 1))))];
  return <svg className="mt-5 w-full" viewBox="0 0 640 224" role="img" aria-label={`${axisLabel} against time graph`}>
    {[0, 0.25, 0.5, 0.75, 1].map((fraction) => { const yy = 35 + fraction * 145; return <g key={fraction}><line x1="58" y1={yy} x2="606" y2={yy} stroke="rgba(168,213,232,0.09)" /><text x="50" y={yy + 4} textAnchor="end" fill="rgba(232,237,245,0.4)" fontSize="10">{format(high - fraction * (high - low), 1)}</text></g>; })}
    <line x1="58" y1="35" x2="58" y2="180" stroke="rgba(168,213,232,0.3)" /><line x1="58" y1={zeroY} x2="606" y2={zeroY} stroke="rgba(232,237,245,0.35)" />
    {[0, 2, 4, 6, 8].map((tick) => <g key={tick}><line x1={x(tick)} y1={zeroY - 3} x2={x(tick)} y2={zeroY + 3} stroke="rgba(168,213,232,0.4)" /><text x={x(tick)} y={Math.min(202, zeroY + 17)} textAnchor="middle" fill="rgba(232,237,245,0.4)" fontSize="10">{tick}</text></g>)}
    <path d={path} fill="none" stroke="#5ec8d8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={x(marker.time)} cy={y(marker[mode])} r="5" fill="#e8c87a" stroke="#04060d" strokeWidth="2" />
    <text x="60" y="18" fill="rgba(232,237,245,0.58)" fontSize="11">{axisLabel}</text><text x="606" y="218" textAnchor="end" fill="rgba(232,237,245,0.58)" fontSize="11">Time t (s)</text>
  </svg>;
}

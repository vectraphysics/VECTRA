import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'

function RangeControl({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  return <label className="block space-y-2 text-sm text-star-white/70"><span className="flex justify-between gap-3"><span>{label}</span><output className="font-mono text-accent-ice">{value.toFixed(step < 1 ? 1 : 0)} {unit}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-11 w-full cursor-pointer accent-[var(--accent-cyan)]" /></label>
}

export function InertiaLab() {
  const [mass, setMass] = useState(4)
  const [push, setPush] = useState(20)
  const [friction, setFriction] = useState(0)
  const [x, setX] = useState(70)
  const [velocity, setVelocity] = useState(0)
  const vRef = useRef(0)
  const [prediction, setPrediction] = useState('')
  const [result, setResult] = useState('')
  const applyPush = () => {
    const next = vRef.current + push * 0.3 / mass
    vRef.current = next
    setVelocity(next)
    setResult(`A ${push} N push acting for 0.30 s changes speed by ${((push * 0.3) / mass).toFixed(2)} m/s in this simplified model.`)
  }
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Math.abs(vRef.current) < 0.001) return
      const drag = friction / mass * 0.04
      vRef.current = Math.sign(vRef.current) * Math.max(0, Math.abs(vRef.current) - drag)
      setVelocity(vRef.current)
      setX((value) => Math.min(250, Math.max(28, value + vRef.current * 1.3)))
    }, 40)
    return () => window.clearInterval(timer)
  }, [friction, mass])
  const reset = () => { vRef.current = 0; setVelocity(0); setX(70); setResult('Experiment reset. The object is at rest.') }
  return <section id="inertia-lab" className="rounded-2xl border border-accent-cyan/20 bg-space-800/45 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">Interactive experiment · first law</p><h3 className="mt-2 font-display text-xl font-semibold">Inertia: push, then release</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-star-white/50">A short push changes velocity. Once it ends, only the optional opposing friction can change velocity.</p></div><button type="button" onClick={reset} className="btn-ghost min-h-11 px-4 py-2 text-xs"><RotateCcw className="h-4 w-4"/>Reset</button></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-4 rounded-xl border border-surface-border bg-space-900/45 p-4">
        <RangeControl label="Object mass" value={mass} min={1} max={12} step={1} unit="kg" onChange={setMass}/>
        <RangeControl label="Brief push strength" value={push} min={0} max={40} step={1} unit="N" onChange={setPush}/>
        <RangeControl label="Opposing friction after push" value={friction} min={0} max={8} step={0.5} unit="N" onChange={setFriction}/>
        <p className="text-xs leading-5 text-star-white/40">Model: the push lasts 0.30 s. Friction is constant and opposes motion; no other horizontal forces act.</p>
      </div>
      <div className="rounded-xl border border-surface-border bg-space-900/45 p-4">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-star-white/40">Predict before the run</p>
        <div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => setPrediction('same')} className={`min-h-10 rounded-lg border px-3 text-xs ${prediction === 'same' ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-ice' : 'border-surface-border text-star-white/55'}`}>Same push: same speed change</button><button type="button" onClick={() => setPrediction('light')} className={`min-h-10 rounded-lg border px-3 text-xs ${prediction === 'light' ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-ice' : 'border-surface-border text-star-white/55'}`}>Lighter mass: greater change</button></div>
        {prediction && <p className="mt-2 text-xs text-emerald-200/75" role="status">Correct: for the same force and push duration, Δv = FΔt/m, so less mass means a larger change in velocity.</p>}
        <svg viewBox="0 0 300 100" role="img" aria-label={`Object moving at ${velocity.toFixed(2)} metres per second`} className="mt-4 h-28 w-full rounded-lg bg-[#09131f]"><line x1="18" y1="76" x2="282" y2="76" stroke="#365066" strokeWidth="2"/><rect x={x} y="45" width="34" height="30" rx="7" fill="#1c5262" stroke="#5ec8d8"/><text x="18" y="25" fill="#a8d5e8" fontSize="12" fontFamily="monospace">v = {velocity.toFixed(2)} m/s</text></svg>
        <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" onClick={applyPush} disabled={push === 0} className="btn-primary min-h-11 disabled:opacity-45"><Play className="h-4 w-4"/>Apply brief push</button><p role="status" className="min-h-5 text-xs text-star-white/55">{result || 'Ideal case: at zero friction, motion continues at constant velocity.'}</p></div>
      </div>
    </div>
  </section>
}

export function SecondLawLab() {
  const [mass, setMass] = useState(5)
  const [applied, setApplied] = useState(30)
  const [opposing, setOpposing] = useState(5)
  const [running, setRunning] = useState(false)
  const [position, setPosition] = useState(10)
  const [velocity, setVelocity] = useState(0)
  const state = useRef({ position: 10, velocity: 0 })
  const net = applied - opposing
  const acceleration = net / mass
  useEffect(() => {
    if (!running) return
    let previous = performance.now()
    let frame = 0
    const step = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.05)
      previous = now
      const nextVelocity = state.current.velocity + acceleration * dt
      const nextPosition = state.current.position + nextVelocity * dt * 13
      if (nextPosition >= 270) {
        state.current = { position: 270, velocity: 0 }
        setPosition(270); setVelocity(0); setRunning(false); return
      }
      state.current = { position: Math.max(12, nextPosition), velocity: nextVelocity }
      setPosition(state.current.position); setVelocity(nextVelocity)
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [running, acceleration])
  const reset = () => { state.current = { position: 10, velocity: 0 }; setPosition(10); setVelocity(0); setRunning(false) }
  const forceLine = Array.from({ length: 9 }, (_, i) => `${30 + i * 30},${120 - (i * 30 / mass) * 2}`).join(' ')
  const massLine = Array.from({ length: 9 }, (_, i) => `${30 + i * 30},${35 + 90 / (1 + i * 0.45)}`).join(' ')
  return <section id="second-law-lab" className="rounded-2xl border border-accent-cyan/20 bg-space-800/45 p-4 sm:p-6">
    <div><p className="eyebrow">Interactive laboratory · second law</p><h3 className="mt-2 font-display text-xl font-semibold">Change the net force. Watch the motion.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-star-white/50">The object integrates a = F<sub>net</sub>/m each animation frame. Set the resultant to zero and it coasts at its existing velocity.</p></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
      <div className="space-y-4 rounded-xl border border-surface-border bg-space-900/45 p-4"><RangeControl label="Mass" value={mass} min={1} max={20} step={1} unit="kg" onChange={setMass}/><RangeControl label="Applied force (right)" value={applied} min={0} max={100} step={1} unit="N" onChange={setApplied}/><RangeControl label="Opposing force (left)" value={opposing} min={0} max={50} step={1} unit="N" onChange={setOpposing}/><div className="grid grid-cols-2 gap-2 text-xs"><Metric label="Fnet = Fapplied − Fopposing" value={`${net.toFixed(0)} N ${net < 0 ? 'left' : 'right'}`}/><Metric label="a = Fnet / m" value={`${Math.abs(acceleration).toFixed(2)} m/s² ${acceleration < 0 ? 'left' : acceleration > 0 ? 'right' : 'zero'}`}/><Metric label="Velocity" value={`${velocity.toFixed(2)} m/s`}/><Metric label="Model" value="1D · constant mass"/></div></div>
      <div className="space-y-3 rounded-xl border border-surface-border bg-space-900/45 p-4"><svg viewBox="0 0 300 125" role="img" aria-label={`Simulation object at ${position} percent track position, velocity ${velocity.toFixed(2)} metres per second`} className="h-32 w-full rounded-lg bg-[#09131f]"><line x1="12" y1="88" x2="288" y2="88" stroke="#365066" strokeWidth="2"/><rect x={position} y="56" width="30" height="30" rx="6" fill="#1c5262" stroke="#5ec8d8"/><text x="14" y="24" fill="#a8d5e8" fontSize="11" fontFamily="monospace">v = {velocity.toFixed(2)} m/s</text></svg><div className="flex gap-2"><button type="button" onClick={() => setRunning((value) => !value)} className="btn-primary min-h-11"><>{running ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}{running ? 'Pause' : 'Start'}</></button><button type="button" onClick={reset} className="btn-ghost min-h-11 px-4"><RotateCcw className="h-4 w-4"/>Reset</button></div>
        <div className="grid gap-3 sm:grid-cols-2"><MiniGraph title="a vs net force · mass fixed" subtitle={`m = ${mass} kg`} points={forceLine}/><MiniGraph title="a vs mass · net force fixed" subtitle="Fnet = +30 N" points={massLine}/></div><p className="text-[0.68rem] leading-5 text-star-white/40">Graph axes are schematic, not the live slider values. Left: acceleration rises linearly with net force when mass is fixed. Right: acceleration decreases as mass increases when net force is fixed.</p>
      </div>
    </div>
  </section>
}

export function ThirdLawLab() {
  const [massA, setMassA] = useState(2)
  const [massB, setMassB] = useState(6)
  const [force, setForce] = useState(12)
  const [answer, setAnswer] = useState('')
  const accelA = force / massA
  const accelB = force / massB
  return <section id="third-law-lab" className="rounded-2xl border border-accent-cyan/20 bg-space-800/45 p-4 sm:p-6"><p className="eyebrow">Interactive experiment · third law</p><h3 className="mt-2 font-display text-xl font-semibold">Same interaction, different response</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-star-white/50">Two skaters push off. The interaction forces are equal and opposite; each object's acceleration depends on its own mass.</p>
    <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><div className="space-y-4 rounded-xl border border-surface-border bg-space-900/45 p-4"><RangeControl label="Skater A mass" value={massA} min={1} max={10} step={1} unit="kg" onChange={setMassA}/><RangeControl label="Skater B mass" value={massB} min={1} max={10} step={1} unit="kg" onChange={setMassB}/><RangeControl label="Interaction force magnitude" value={force} min={2} max={30} step={1} unit="N" onChange={setForce}/></div>
      <div className="rounded-xl border border-surface-border bg-space-900/45 p-4"><p className="font-mono text-[0.65rem] uppercase tracking-widest text-star-white/40">Predict: compare force and acceleration</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => setAnswer('force')} className="min-h-10 rounded-lg border border-surface-border px-3 text-xs text-star-white/60">B has greater force</button><button type="button" onClick={() => setAnswer('a')} className="min-h-10 rounded-lg border border-surface-border px-3 text-xs text-star-white/60">Equal forces; A accelerates more</button><button type="button" onClick={() => setAnswer('equal')} className="min-h-10 rounded-lg border border-surface-border px-3 text-xs text-star-white/60">Equal forces and accelerations</button></div>{answer && <p role="status" className="mt-2 text-xs leading-5 text-emerald-200/75">Equal and opposite forces act on different skaters. Here, A has {massA < massB ? 'less mass, so its acceleration is greater' : massA > massB ? 'more mass, so its acceleration is smaller' : 'the same mass, so the acceleration magnitudes are equal'}.</p>}
        <svg viewBox="0 0 360 125" role="img" aria-label={`Equal opposite ${force} newton forces on skaters A and B`} className="mt-4 h-32 w-full rounded-lg bg-[#09131f]"><rect x="75" y="52" width="55" height="40" rx="14" fill="#1c5262" stroke="#5ec8d8"/><rect x="230" y="52" width="55" height="40" rx="14" fill="#392f58" stroke="#c7a8ef"/><line x1="75" y1="43" x2="26" y2="43" stroke="#5ec8d8" strokeWidth="3" markerEnd="url(#left-arr)"/><line x1="285" y1="43" x2="334" y2="43" stroke="#c7a8ef" strokeWidth="3" markerEnd="url(#right-arr)"/><defs><marker id="left-arr" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto"><path d="M7 0 L0 3 L7 6" fill="none" stroke="#5ec8d8" strokeWidth="1.5"/></marker><marker id="right-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L7 3 L0 6" fill="none" stroke="#c7a8ef" strokeWidth="1.5"/></marker></defs><text x="103" y="77" textAnchor="middle" fill="#dce9f4" fontSize="12">A</text><text x="257" y="77" textAnchor="middle" fill="#dce9f4" fontSize="12">B</text><text x="50" y="29" textAnchor="middle" fill="#5ec8d8" fontSize="11">F B→A = {force} N</text><text x="310" y="29" textAnchor="middle" fill="#c7a8ef" fontSize="11">F A→B = {force} N</text></svg>
        <div className="mt-3 grid grid-cols-2 gap-2"><Metric label="A acceleration" value={`${accelA.toFixed(2)} m/s² left`}/><Metric label="B acceleration" value={`${accelB.toFixed(2)} m/s² right`}/></div><p className="mt-2 text-[0.68rem] leading-5 text-star-white/40">Ideal model: no other horizontal forces. The acceleration magnitudes need not match because the masses can differ.</p>
      </div></div>
  </section>
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-surface-border p-3"><p className="text-[0.65rem] leading-4 text-star-white/40">{label}</p><p className="mt-1 font-mono text-xs text-accent-ice">{value}</p></div> }
function MiniGraph({ title, subtitle, points }: { title: string; subtitle: string; points: string }) { return <figure className="rounded-lg border border-surface-border p-2"><figcaption className="text-[0.62rem] text-star-white/65">{title}</figcaption><p className="text-[0.58rem] text-star-white/35">{subtitle}</p><svg viewBox="0 0 300 140" aria-label={`${title}; ${subtitle}`} role="img" className="mt-1 w-full"><line x1="30" y1="10" x2="30" y2="120" stroke="#52697c"/><line x1="30" y1="120" x2="290" y2="120" stroke="#52697c"/><polyline points={points} fill="none" stroke="#5ec8d8" strokeWidth="3"/><text x="5" y="18" fill="#8296a8" fontSize="9">a</text><text x="270" y="135" fill="#8296a8" fontSize="9">input</text></svg></figure> }

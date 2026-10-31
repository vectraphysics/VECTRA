import { useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Circle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnergyActivities } from '@/components/energy/EnergyActivities';
import { EnergyPractice } from '@/components/energy/EnergyPractice';

const sections = [
  ['A', 'Energy'], ['B', 'Work'], ['C', 'Kinetic energy'], ['D', 'Gravitational potential energy'],
  ['E', 'Mechanical energy'], ['F', 'Power'], ['G', 'Efficiency'], ['H', 'Problem solving'],
];
const progressKey = 'vectra-energy-work-power-completed';

type CompletedSections = Record<string, boolean>;

export function EnergyWorkPowerPage() {
  const [completed, setCompleted] = useState<CompletedSections>(() => {
    try {
      const saved = window.localStorage.getItem(progressKey);
      return saved ? JSON.parse(saved) as CompletedSections : {};
    } catch {
      return {};
    }
  });
  const completedCount = Object.values(completed).filter(Boolean).length;

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = 'Energy, Work and Power | VECTRA Physics';
    if (description) description.content = 'Study work, kinetic and gravitational potential energy, mechanical energy, power, and efficiency with interactive activities and Grade 11 practice.';
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  const toggleComplete = (id: string) => {
    setCompleted((previous) => {
      const next = { ...previous, [id]: !previous[id] };
      window.localStorage.setItem(progressKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-space-900 text-star-white">
      <header className="sticky top-0 z-40 border-b border-surface-border bg-space-900/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link to="/lessons/mechanics/newtons-laws" className="group inline-flex min-h-10 items-center gap-2 text-sm text-star-white/55 hover:text-star-white"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /><span className="hidden sm:inline">Newton’s Laws</span><span className="sm:hidden">Back</span></Link>
          <span className="font-display text-sm font-semibold tracking-[0.18em]">VECTRA</span>
          <a href="#practice" className="min-h-10 rounded-full border border-surface-border px-3 py-2 text-xs text-star-white/65 transition hover:border-accent-cyan/30">Practice</a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-surface-border">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_16%,rgba(94,200,216,0.13),transparent_40%),radial-gradient(ellipse_at_12%_90%,rgba(45,74,122,0.2),transparent_42%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20 lg:py-24">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-star-white/40 hover:text-accent-ice"><ArrowLeft className="h-3.5 w-3.5" />Mechanics / Learning path</Link>
            <p className="eyebrow">Mechanics · Chapter 03 · Grade 11 and beyond</p>
            <h1 className="mt-5 max-w-5xl font-display text-[clamp(2.65rem,7vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.04em]">Energy, Work <span className="text-accent-cyan">&amp; Power.</span></h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-star-white/60 sm:text-lg">Track how forces transfer energy, how motion stores it, and how quickly useful work gets done. Build a reliable model, test it with interactive controls, and practise the kinds of problems that connect the whole chapter.</p>
            <div className="mt-7 flex flex-wrap gap-3"><a href="#section-A" className="btn-primary min-h-11">Start the chapter <ArrowDown className="h-4 w-4" /></a><a href="#activities" className="btn-ghost min-h-11">Explore the energy lab <ArrowRight className="h-4 w-4" /></a></div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-star-white/45"><span className="rounded-full border border-surface-border px-3 py-1.5">8 connected sections</span><span className="rounded-full border border-surface-border px-3 py-1.5">50 practice questions</span><span className="rounded-full border border-surface-border px-3 py-1.5">30 recall cards</span></div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <nav aria-label="Chapter contents" className="-mx-4 flex gap-2 overflow-x-auto border-b border-surface-border px-4 py-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">{sections.map(([id, label]) => <a key={id} href={`#section-${id}`} className="shrink-0 rounded-full border border-surface-border px-3 py-2 font-mono text-[0.65rem] text-star-white/45 transition hover:border-surface-border-hover hover:text-accent-ice">{id} · {label}</a>)}<a href="#activities" className="shrink-0 rounded-full border border-accent-cyan/20 px-3 py-2 font-mono text-[0.65rem] text-accent-ice">Interactive lab</a><a href="#practice" className="shrink-0 rounded-full border border-surface-border px-3 py-2 font-mono text-[0.65rem] text-star-white/45">Practice</a></nav>

          <section aria-label="Chapter progress" className="my-6 rounded-xl border border-surface-border bg-space-800/35 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div><p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Your chapter progress</p><p className="mt-1 text-sm text-star-white/60">{completedCount} of 8 sections marked complete. Your progress is saved on this device.</p></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-space-600 sm:mt-0 sm:w-56"><div className="h-full rounded-full bg-accent-cyan transition-[width] duration-300" style={{ width: `${completedCount / 8 * 100}%` }} /></div>
          </section>

          <section id="section-A" className="scroll-mt-24 border-b border-surface-border py-12 sm:py-16">
            <ChapterHeading number="A" title="Introduction to energy" subtitle="A useful accounting idea for change" />
            <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4 text-sm leading-7 text-star-white/60">
                <p>Energy is a scalar physical quantity that describes a system’s capacity to transfer energy or do work. It is not a force and it does not have a direction. The SI unit is the joule (J), named after physicist James Joule. One joule is one newton metre.</p>
                <p>Systems can store energy in different ways. Kinetic energy is associated with motion. Potential energy is associated with a configuration or position, such as an object raised in a gravitational field. Other forms include chemical, electrical, thermal, sound, light, and nuclear energy.</p>
                <p>Energy may be transferred between objects or transformed from one form to another. A moving cyclist transfers chemical energy from food into kinetic energy, thermal energy, and sound. In an isolated system, the total energy is conserved. Energy does not disappear, although useful energy can spread into less useful forms.</p>
              </div>
              <aside className="rounded-xl border border-accent-cyan/15 bg-accent-cyan/[0.04] p-5"><h3 className="font-display text-base font-semibold">A question to test your model</h3><p className="mt-3 text-sm leading-6 text-star-white/55">A phone battery runs down while a screen glows and warms. Has energy been destroyed?</p><p className="mt-3 border-t border-surface-border pt-3 text-sm leading-6 text-accent-ice">No. Chemical energy was transferred into light, sound, radio waves, and thermal energy in the phone and surroundings.</p></aside>
            </div>
            <Callout title="Energy is not force">A force can transfer energy when it causes displacement. Energy and force are different physical quantities with different units: joules and newtons.</Callout>
            <CompleteButton completed={Boolean(completed.A)} onClick={() => toggleComplete('A')} />
          </section>

          <section id="section-B" className="scroll-mt-24 border-b border-surface-border py-12 sm:py-16">
            <ChapterHeading number="B" title="Work done by a force" subtitle="Energy transfer through force and displacement" />
            <p className="mt-5 max-w-4xl text-sm leading-7 text-star-white/60">In physics, a force does work on an object when the force transfers energy through a displacement. For a constant force parallel to displacement, W = Fd. For a constant force at an angle θ to displacement, W = Fd cos θ. Here W is work in joules (J), F is force in newtons (N), d is displacement in metres (m), and θ is the angle between the force and displacement vectors.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3"><Principle title="Positive work" text="A force component points along displacement. The force transfers energy to the object. Example: a forward push on a moving trolley."/><Principle title="Negative work" text="A force component points opposite displacement. The force transfers energy away from the object’s motion. Example: kinetic friction on a sliding box."/><Principle title="Zero work" text="Displacement is zero, or the force is perpendicular to it. A force can act without doing work on that object."/></div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2"><Worked title="Push and friction" given="A 10 N horizontal force pushes a box 4.0 m in the same direction. Friction is 3.0 N opposite the motion." calculate="Work done by the push and the net work on the box." principle="Work is the dot product of force and displacement. Net work is the sum of work by all forces." equations={['Wpush = Fd cos θ', 'Wnet = Wpush + Wfriction']} steps={['For the push, θ = 0°, so Wpush = (10 N)(4.0 m)cos 0° = 40 J.', 'For friction, θ = 180°, so Wfriction = (3.0 N)(4.0 m)cos 180° = −12 J.', 'Wnet = 40 J − 12 J = 28 J.']} result="The push does 40 J of work. The net work is +28 J, so the box gains 28 J of kinetic energy."/><div className="rounded-xl border border-surface-border bg-space-800/35 p-5 sm:p-6"><h3 className="font-display text-base font-semibold">Holding still is not work on the held object</h3><p className="mt-3 text-sm leading-7 text-star-white/55">If you hold a bag stationary, your upward force may balance its weight, but the bag’s displacement is zero. Therefore the mechanical work done by your supporting force on the bag is W = Fd cos θ = 0. Your body still uses chemical energy to maintain muscle tension. That internal energy use is not mechanical work done on the stationary bag.</p><p className="mt-4 rounded-lg border border-accent-cyan/15 bg-accent-cyan/[0.04] p-3 text-sm leading-6 text-accent-ice">A force alone is not enough. Work on an object requires displacement with a force component along it.</p></div></div>
            <Callout title="Work-energy theorem">The net work done on an object equals its change in kinetic energy: Wnet = ΔEk = Ek,f − Ek,i. A positive net work increases kinetic energy; negative net work decreases it.</Callout>
            <CompleteButton completed={Boolean(completed.B)} onClick={() => toggleComplete('B')} />
          </section>

          <section id="section-C" className="scroll-mt-24 border-b border-surface-border py-12 sm:py-16">
            <ChapterHeading number="C" title="Kinetic energy" subtitle="Motion carries energy" />
            <div className="mt-5 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]"><FormulaCard formula="Ek = ½mv²" detail="m is mass in kilograms (kg). v is speed in metres per second (m/s). Ek is kinetic energy in joules (J)."/><div className="space-y-3 text-sm leading-7 text-star-white/60"><p>For the same speed, a more massive object has more kinetic energy. For the same mass, doubling speed multiplies kinetic energy by four because speed is squared. This matters in road safety: a small increase in a vehicle’s speed can produce a much larger increase in the energy that brakes must remove.</p><p>Kinetic energy uses speed, the magnitude of velocity. Reversing direction at the same speed does not change Ek. Its dimensions are kg·m²/s², equivalent to N·m and therefore J.</p></div></div>
            <Worked title="Compare two speeds" given="A 1 000 kg car travels first at 10 m/s, then at 20 m/s." calculate="The kinetic energy at each speed and the ratio." principle="Kinetic energy is proportional to the square of speed for fixed mass." equations={['Ek = ½mv²', 'Ek,2 / Ek,1 = (v₂ / v₁)²']} steps={['At 10 m/s: Ek,1 = ½(1 000 kg)(10 m/s)² = 50 000 J = 50 kJ.', 'At 20 m/s: Ek,2 = ½(1 000 kg)(20 m/s)² = 200 000 J = 200 kJ.', 'Ratio = 200 kJ / 50 kJ = 4.']} result="Doubling speed makes the kinetic energy four times larger, from 50 kJ to 200 kJ." />
            <CompleteButton completed={Boolean(completed.C)} onClick={() => toggleComplete('C')} />
          </section>

          <section id="section-D" className="scroll-mt-24 border-b border-surface-border py-12 sm:py-16">
            <ChapterHeading number="D" title="Gravitational potential energy" subtitle="Position relative to a chosen level" />
            <div className="mt-5 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]"><FormulaCard formula="Ep = mgh" detail="Near Earth’s surface, m is mass (kg), g is gravitational acceleration (about 9.8 m/s²), and h is vertical height (m) above a chosen reference. Ep is measured in J."/><div className="space-y-3 text-sm leading-7 text-star-white/60"><p>Potential energy depends on the reference level. You may choose the floor, a table, or another convenient height as zero. The change is ΔEp = mgΔh, so raising an object increases its gravitational potential energy and lowering it decreases that energy.</p><p>Near Earth’s surface, the constant-g approximation works when the height change is small compared with Earth’s radius. For a slow lift with no change in kinetic energy, the lifting force does work against gravity equal to the increase in gravitational potential energy. During a fall, that energy can become kinetic energy.</p></div></div>
            <Worked title="Lift a toolbox" given="A 2.0 kg toolbox is raised vertically by 5.0 m. Use g = 9.8 m/s²." calculate="The change in gravitational potential energy." principle="The change depends on vertical height change, not the path taken." equations={['ΔEp = mgΔh']} steps={['Given: m = 2.0 kg, g = 9.8 m/s², Δh = +5.0 m.', 'Substitute: ΔEp = (2.0 kg)(9.8 m/s²)(5.0 m).', 'Calculate: ΔEp = +98 J.']} result="The toolbox gains 98 J of gravitational potential energy. A slow lift transfers approximately 98 J of work against gravity." />
            <CompleteButton completed={Boolean(completed.D)} onClick={() => toggleComplete('D')} />
          </section>

          <section id="section-E" className="scroll-mt-24 border-b border-surface-border py-12 sm:py-16">
            <ChapterHeading number="E" title="Mechanical energy" subtitle="Follow energy as motion and height change" />
            <p className="mt-5 max-w-4xl text-sm leading-7 text-star-white/60">Mechanical energy is the sum of kinetic and potential energy included in a chosen model: Em = Ek + Ep. If only conservative forces do work, or non-conservative effects such as friction are negligible, mechanical energy is conserved. During an ideal fall, gravitational potential energy decreases as kinetic energy increases.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3"><Principle title="Ideal free fall" text="With air resistance neglected, mgh lost becomes ½mv² gained. Total mechanical energy stays constant."/><Principle title="With friction" text="Mechanical energy is transferred into thermal energy and sound. The mechanical total can decrease."/><Principle title="Total energy" text="Energy is conserved overall in an isolated system, even when mechanical energy changes form."/></div>
            <Worked title="Speed after falling" given="A 1.0 kg object is released from rest 5.0 m above the ground. Ignore air resistance. Use g = 9.8 m/s²." calculate="Its speed just before reaching the ground." principle="Conservation of mechanical energy: initial gravitational potential energy becomes final kinetic energy." equations={['mgh = ½mv²', 'v = √(2gh)']} steps={['Initial: Ek,i = 0 and Ep,i = mgh. Final at ground: Ep,f = 0 and Ek,f = ½mv².', 'Set initial and final mechanical energies equal: mgh = ½mv². Cancel m because it appears on both sides.', 'Rearrange: v = √(2gh) = √(2 × 9.8 m/s² × 5.0 m).', 'v = √98 m²/s² ≈ 9.9 m/s.']} result="The object reaches about 9.9 m/s downward. This result assumes negligible air resistance and constant g." />
            <CompleteButton completed={Boolean(completed.E)} onClick={() => toggleComplete('E')} />
          </section>

          <section id="section-F" className="scroll-mt-24 border-b border-surface-border py-12 sm:py-16">
            <ChapterHeading number="F" title="Power" subtitle="How quickly energy is transferred" />
            <div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="space-y-3 text-sm leading-7 text-star-white/60"><p>Power is the rate at which work is done or energy is transferred. Average power is Pavg = W/Δt or Pavg = ΔE/Δt. The SI unit is the watt (W), where 1 W = 1 J/s.</p><p>Two systems can do the same work but have different power if one takes less time. Instantaneous power describes the rate at a particular moment. For a force parallel to velocity, P = Fv. More generally, instantaneous power is P = F⃗ · v⃗ = Fv cos θ.</p></div><FormulaCard formula="Pavg = W/Δt = ΔE/Δt" detail="W is work in joules, ΔE is energy transfer in joules, and Δt is elapsed time in seconds. P is in watts."/></div>
            <Worked title="Lift with a motor" given="A motor transfers 600 J of useful work in 20 s." calculate="Its average useful power." principle="Average power is work divided by elapsed time." equations={['Pavg = W / Δt']} steps={['Given: W = 600 J and Δt = 20 s.', 'Substitute: Pavg = 600 J / 20 s.', 'Calculate: Pavg = 30 J/s = 30 W.']} result="The average useful power is 30 W. Doing the same work in half the time would require twice the average power." />
            <Callout title="Keep the units consistent">Convert minutes to seconds before using watts. For example, 2 min = 120 s, so a 500 W device transfers 500 × 120 = 60 000 J in 2 minutes.</Callout>
            <CompleteButton completed={Boolean(completed.F)} onClick={() => toggleComplete('F')} />
          </section>

          <section id="section-G" className="scroll-mt-24 border-b border-surface-border py-12 sm:py-16">
            <ChapterHeading number="G" title="Efficiency" subtitle="How much input becomes useful output" />
            <div className="mt-5 grid gap-4 lg:grid-cols-2"><FormulaCard formula="η = (useful energy out / total energy in) × 100%" detail="Use this ratio when the problem gives energy quantities."/><FormulaCard formula="η = (useful power out / total power in) × 100%" detail="Use this ratio when the problem gives power quantities."/></div>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-star-white/60">Efficiency, η, is the fraction of total input that becomes useful output, expressed as a percentage. The energy ratio or power ratio gives the same efficiency when input and output refer to the same system and time interval. Practical machines transfer some energy into unwanted forms such as thermal energy and sound, so their efficiency is usually less than 100%.</p>
            <Worked title="A motor’s useful output" given="A motor receives 500 J of electrical energy and transfers 350 J as useful mechanical energy." calculate="Efficiency and energy transferred to other forms." principle="Efficiency is useful output divided by total input. Energy accounting includes useful and unwanted transfers." equations={['η = (Euseful / Ein) × 100%', 'Eother = Ein − Euseful']} steps={['η = (350 J / 500 J) × 100% = 70%.', 'Eother = 500 J − 350 J = 150 J.', 'The 150 J may become thermal energy, sound, or other non-useful transfers.']} result="Efficiency is 70%. The remaining 150 J is not destroyed; it is transferred into other forms." />
            <CompleteButton completed={Boolean(completed.G)} onClick={() => toggleComplete('G')} />
          </section>

          <section id="section-H" className="scroll-mt-24 border-b border-surface-border py-12 sm:py-16">
            <ChapterHeading number="H" title="Integrated problem solving" subtitle="Choose a model, then show the reasoning" />
            <p className="mt-5 max-w-4xl text-sm leading-7 text-star-white/60">For each problem, list known quantities with SI units, state what is required, choose a physical principle, write the equation before substitution, rearrange, substitute with units, and interpret the sign and result. Check whether the assumptions match the situation.</p>
            <div className="mt-5 grid gap-4">
              <Worked title="Trolley, work and power" given="A 4.0 kg trolley starts from rest. A 12 N resultant force moves it 5.0 m along a level track in 4.0 s." calculate="Its final speed and average power from the net work." principle="Use the work-energy theorem to find final kinetic energy, then average power from work and time." equations={['Wnet = Fnet d = ΔEk', '½mv² = Wnet', 'Pavg = Wnet / Δt']} steps={['Given: m = 4.0 kg, Fnet = 12 N, d = 5.0 m, Δt = 4.0 s; initial speed is zero.', 'Wnet = (12 N)(5.0 m) = 60 J. By the theorem, ΔEk = 60 J.', 'Rearrange ½mv² = 60 J: v = √(2Wnet/m) = √(120/4.0) = √30 ≈ 5.5 m/s.', 'Pavg = 60 J / 4.0 s = 15 W.']} result="The final speed is about 5.5 m/s and average net power is 15 W. The calculation assumes the stated resultant force acts along the displacement." />
              <Worked title="A lift with losses" given="A 50 kg load rises 8.0 m in 10 s. The motor’s input power is 500 W. Use g = 9.8 m/s²." calculate="Useful output power and efficiency." principle="The useful energy gain is gravitational potential energy. Divide by time for useful average power, then compare output power with input." equations={['Euseful = mgh', 'Puseful = Euseful / Δt', 'η = (Puseful / Pin) × 100%']} steps={['Euseful = (50 kg)(9.8 m/s²)(8.0 m) = 3 920 J.', 'Puseful = 3 920 J / 10 s = 392 W.', 'η = (392 W / 500 W) × 100% = 78.4%.']} result="The useful output power is 392 W and the efficiency is 78.4%. The difference is transferred into other forms such as heating and sound." />
            </div>
            <CompleteButton completed={Boolean(completed.H)} onClick={() => toggleComplete('H')} />
          </section>

          <section id="activities" className="scroll-mt-24 py-12 sm:py-16"><ChapterHeading number="Lab" title="Explore the energy system" subtitle="Move a control and predict the result before reading it"/><div className="mt-6"><EnergyActivities /></div></section>
          <section id="practice" className="scroll-mt-24 border-t border-surface-border py-12 sm:py-16"><EnergyPractice /></section>

          <section className="mb-12 flex flex-col gap-5 rounded-2xl border border-surface-border bg-space-800/35 p-6 sm:mb-16 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><p className="eyebrow">Continue · Mechanics</p><h2 className="mt-3 font-display text-xl font-semibold sm:text-2xl">Next, explore momentum</h2><p className="mt-2 text-sm leading-6 text-star-white/50">Connect motion and forces to momentum, impulse, and collisions.</p></div><Link to="/lessons/mechanics/momentum-impulse" className="btn-primary min-h-12 shrink-0 justify-center">Open Momentum &amp; Impulse <ArrowUpRight className="h-4 w-4" /></Link></section>
        </div>
      </main>
    </div>
  );
}

function ChapterHeading({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return <div><p className="eyebrow">{number} · Energy, Work and Power</p><h2 className="mt-3 font-display text-section">{title}</h2><p className="mt-2 text-sm text-star-white/45">{subtitle}</p></div>;
}

function FormulaCard({ formula, detail }: { formula: string; detail: string }) {
  return <div className="flex flex-col justify-center rounded-xl border border-accent-cyan/15 bg-space-800/35 p-5 sm:p-6"><p className="font-mono text-[0.65rem] uppercase tracking-widest text-star-white/40">Key relationship</p><p className="mt-3 break-words font-mono text-lg leading-8 text-accent-ice sm:text-xl">{formula}</p><p className="mt-3 text-sm leading-6 text-star-white/50">{detail}</p></div>;
}

function Worked({ title, given, calculate, principle, equations, steps, result }: { title: string; given: string; calculate: string; principle: string; equations: string[]; steps: string[]; result: string }) {
  return <article className="mt-5 rounded-2xl border border-surface-border bg-space-800/35 p-5 sm:p-6"><h3 className="font-display text-base font-semibold">{title}</h3><div className="mt-4 grid gap-4 lg:grid-cols-2"><div className="space-y-3 text-sm leading-6 text-star-white/55"><p><b className="text-star-white/75">Given:</b> {given}</p><p><b className="text-star-white/75">Find:</b> {calculate}</p><p><b className="text-star-white/75">Principle:</b> {principle}</p></div><div className="rounded-xl border border-surface-border bg-space-900/40 p-4"><p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan">Equation</p>{equations.map((equation) => <p key={equation} className="mt-2 break-words font-mono text-sm text-accent-ice">{equation}</p>)}</div></div><ol className="mt-4 space-y-2 border-t border-surface-border pt-4">{steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-star-white/60"><span className="font-mono text-xs text-accent-cyan">{index + 1}.</span><span>{step}</span></li>)}</ol><p className="mt-4 rounded-lg border border-accent-cyan/15 bg-accent-cyan/[0.04] p-4 text-sm leading-6 text-accent-ice"><b>Answer and interpretation:</b> {result}</p></article>;
}

function Principle({ title, text }: { title: string; text: string }) {
  return <article className="rounded-xl border border-surface-border bg-space-800/35 p-4"><h3 className="font-display text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-star-white/50">{text}</p></article>;
}

function Callout({ title, children }: { title: string; children: ReactNode }) {
  return <aside className="mt-5 rounded-xl border border-accent-cyan/15 bg-accent-cyan/[0.04] p-4 sm:p-5"><h3 className="font-display text-sm font-semibold text-accent-ice">{title}</h3><p className="mt-2 text-sm leading-6 text-star-white/60">{children}</p></aside>;
}

function CompleteButton({ completed, onClick }: { completed: boolean; onClick: () => void }) {
  return <button type="button" aria-pressed={completed} onClick={onClick} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-xs text-star-white/55 transition hover:border-accent-cyan/30 hover:text-accent-ice focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60">{completed ? <Check className="h-4 w-4 text-emerald-300" /> : <Circle className="h-4 w-4" />}{completed ? 'Section complete' : 'Mark section complete'}<RotateCcw className="ml-1 h-3.5 w-3.5" /></button>;
}

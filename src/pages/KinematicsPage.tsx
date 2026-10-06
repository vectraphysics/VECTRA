import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Compass, Gauge, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionLab } from '@/components/kinematics/MotionLab';
import { KinematicsConcepts } from '@/components/kinematics/KinematicsConcepts';
import { KinematicsCheckpoint } from '@/components/kinematics/KinematicsCheckpoint';

const concepts = ['Position', 'Distance & displacement', 'Speed & velocity', 'Averages', 'Acceleration', 'Motion types', 'Position–time', 'Velocity–time', 'Acceleration–time', 'Equations', 'Free fall', 'Direction & signs', 'Multi-step', 'Applications'];
const mistakes = [
  ['Distance ≠ displacement', 'Distance counts the path; displacement is final position minus initial position. A round trip can have non-zero distance and zero displacement.'],
  ['Speed ≠ velocity', 'Speed has magnitude only. Velocity includes direction, shown by a vector arrow or a sign relative to an axis.'],
  ['Velocity ≠ acceleration', 'Velocity is the rate of position change (m/s); acceleration is the rate of velocity change (m/s²).'],
  ['Constant-a formulas are not universal', 'The four equations of motion require acceleration to stay constant throughout the interval. Split changing motion into valid stages or use graph/variable-acceleration methods.'],
  ['Do not drop direction signs', 'Define positive once, then carry signed velocity, acceleration and displacement through every step. Negative does not mean “slower.”'],
  ['Graph axes and areas matter', 'Slope is rise over run. For v–t, signed area is displacement; for a–t, signed area is change in velocity.'],
  ['Keep units consistent', 'Convert to SI before substituting: kilometres per hour to metres per second, minutes to seconds, and so on. Never add quantities with unlike units.'],
];

export function KinematicsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = 'Kinematics | VECTRA Physics';
    if (description) description.content = 'Learn kinematics with worked examples, interactive motion graphs, free fall, and a guided physics checkpoint.';
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  return (
    <div className="min-h-screen bg-space-900 text-star-white">
      <header className="sticky top-0 z-40 border-b border-surface-border bg-space-900/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link to="/" className="group inline-flex min-h-10 items-center gap-2 text-sm text-star-white/55 transition-colors hover:text-star-white"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> <span className="hidden sm:inline">Back to VECTRA</span><span className="sm:hidden">Back</span></Link>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-cyan" /><span className="font-display text-sm font-semibold tracking-[0.18em]">VECTRA</span></div>
          <a href="#checkpoint" className="min-h-10 rounded-full border border-surface-border px-3 py-2 text-xs text-star-white/65 transition hover:border-surface-border-hover hover:text-star-white">Jump to quiz</a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-surface-border">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_16%,rgba(94,200,216,0.12),transparent_40%),radial-gradient(ellipse_at_12%_90%,rgba(45,74,122,0.18),transparent_42%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:py-24">
            <div>
              <Link to="/" className="mb-8 inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-star-white/40 hover:text-accent-ice"><ArrowLeft className="h-3.5 w-3.5" /> Mechanics / Learning path</Link>
              <p className="eyebrow">Mechanics · Guided lesson · 25–35 min</p>
              <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.8rem,7vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-star-white">Kinematics<span className="text-accent-cyan">.</span></h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-star-white/60 sm:text-lg">Describe how things move—before asking what makes them move. Build a useful model from position and direction, then connect equations to real, changing motion.</p>
              <div className="mt-7 flex flex-wrap gap-3"><a href="#motion-lab" className="btn-primary min-h-11">Explore the motion lab <ArrowDown className="h-4 w-4" /></a><a href="#concepts" className="btn-ghost min-h-11">Start the lesson <ArrowRight className="h-4 w-4" /></a></div>
            </div>
            <div className="glass-panel grid grid-cols-2 gap-3 p-4 sm:p-5">
              <HeroStat icon={<Compass className="h-4 w-4" />} label="You will learn" value="14 core ideas" />
              <HeroStat icon={<LineChart className="h-4 w-4" />} label="Explore" value="3 live graphs" />
              <HeroStat icon={<Gauge className="h-4 w-4" />} label="Key condition" value="Check assumptions" />
              <HeroStat icon={<BookOpen className="h-4 w-4" />} label="Practice" value="Worked examples" />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <nav aria-label="Lesson contents" className="-mx-4 flex gap-2 overflow-x-auto border-b border-surface-border px-4 py-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {concepts.map((concept, index) => <a key={concept} href={`#concept-${index + 1}`} className="shrink-0 rounded-full border border-surface-border px-3 py-2 font-mono text-[0.65rem] text-star-white/45 transition hover:border-surface-border-hover hover:text-accent-ice">{String(index + 1).padStart(2, '0')} · {concept}</a>)}
          </nav>
          <section className="mt-7 grid gap-4 md:grid-cols-3" aria-label="Lesson foundations">
            <Foundation title="1 · Choose a frame" text="Pick an origin and positive direction. Position and every later sign depend on this reference." />
            <Foundation title="2 · Track the change" text="Compare initial and final states: displacement, velocity change and elapsed time." />
            <Foundation title="3 · Test the model" text="Name your assumptions. Constant-acceleration equations only work when acceleration stays constant." />
          </section>

          <MotionLab />

          <section id="graph-reading" className="scroll-mt-24 border-y border-surface-border py-14 sm:py-18">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div><p className="eyebrow">Graph reading · the physical meaning</p><h2 className="mt-3 font-display text-section text-star-white">A graph is a motion story</h2><p className="mt-4 text-sm leading-7 text-star-white/55">Read the axes first, then use slope or signed area. The same geometric idea means a different physical quantity on each graph.</p></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <GraphMeaning title="Gradient of position–time" equation="slope = Δx / Δt = v" meaning="The slope is velocity. A steeper slope means greater speed; a negative slope means motion in the negative direction. Curvature signals changing velocity." />
                <GraphMeaning title="Gradient of velocity–time" equation="slope = Δv / Δt = a" meaning="The slope is acceleration. A horizontal v–t line has zero acceleration, even if the object is already moving quickly." />
                <GraphMeaning title="Area under velocity–time" equation="signed area = Δx" meaning="Area above the time axis contributes positive displacement; area below contributes negative displacement. Add magnitudes by segments to find total distance." />
                <GraphMeaning title="Area under acceleration–time" equation="signed area = Δv" meaning="The area is the change in velocity. Add it to the initial velocity to find final velocity; it is not displacement." />
              </div>
            </div>
          </section>

          <KinematicsConcepts />

          <section id="common-mistakes" className="scroll-mt-24 py-12 sm:py-16">
            <div className="mb-7"><p className="eyebrow">Debug your thinking</p><h2 className="mt-3 font-display text-section text-star-white">Common mistakes</h2></div>
            <div className="grid gap-3 md:grid-cols-2">{mistakes.map(([title, detail], index) => <article key={title} className="rounded-xl border border-surface-border bg-space-800/35 p-4 sm:p-5"><h3 className="font-display text-sm font-semibold text-star-white"><span className="mr-2 font-mono text-xs text-accent-gold">0{index + 1}</span>{title}</h3><p className="mt-2 text-sm leading-6 text-star-white/50">{detail}</p></article>)}</div>
          </section>

          <section id="recap" className="scroll-mt-24 border-t border-surface-border py-14 sm:py-18">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div><p className="eyebrow">Keep these in your toolkit</p><h2 className="mt-3 font-display text-section text-star-white">The short version</h2><ul className="mt-5 space-y-3">{['Position needs an origin and axis; displacement is final minus initial position.', 'Distance is path length; average speed uses distance, while average velocity uses displacement.', 'Acceleration describes how velocity changes, including its direction.', 'Graph gradients and signed areas reveal motion quantities—check the axes.', 'Use the four kinematics equations only for constant acceleration.'].map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-star-white/55"><span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-cyan" />{item}</li>)}</ul></div>
              <div className="rounded-2xl border border-accent-cyan/15 bg-gradient-to-br from-accent-cyan/[0.07] to-space-800/35 p-5 sm:p-7"><p className="font-mono text-xs uppercase tracking-widest text-accent-cyan">Challenge · two stages</p><h3 className="mt-3 font-display text-lg font-semibold text-star-white">A launch cart</h3><p className="mt-3 text-sm leading-6 text-star-white/60">A cart starts at x = 0 with velocity +4.0 m/s. It accelerates at +2.0 m/s² for 5.0 s, then coasts at constant velocity for another 3.0 s. Find its velocity after the launch, total displacement, and average velocity over the full 8.0 s.</p><details className="group mt-5 border-t border-surface-border pt-4"><summary className="cursor-pointer text-sm font-medium text-accent-ice">Show the worked solution</summary><ol className="mt-3 space-y-2 text-sm leading-6 text-star-white/55"><li>1. Launch: v₁ = 4 + 2(5) = +14 m/s.</li><li>2. Launch displacement: Δx₁ = 4(5) + ½(2)(5²) = 45 m.</li><li>3. Coast: Δx₂ = 14(3) = 42 m; total Δx = 45 + 42 = 87 m.</li><li>4. Average velocity = 87 m / 8 s = +10.875 m/s (about +10.9 m/s).</li></ol></details></div>
            </div>
          </section>

          <KinematicsCheckpoint />

          <section className="mb-12 flex flex-col gap-5 rounded-2xl border border-surface-border bg-space-800/35 p-6 sm:mb-16 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div><p className="eyebrow">Next · Mechanics</p><h2 className="mt-3 font-display text-xl font-semibold text-star-white sm:text-2xl">You can describe the motion. Now ask what causes it.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-star-white/50">Continue to Newton’s Laws to connect acceleration with force and mass.</p></div>
            <Link to="/#learn" className="btn-primary min-h-12 shrink-0 justify-center">Continue to Newton’s Laws <ArrowUpRight className="h-4 w-4" /></Link>
          </section>
        </div>
      </main>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-xl border border-surface-border bg-space-900/45 p-4"><span className="text-accent-cyan">{icon}</span><p className="mt-3 font-mono text-[0.62rem] uppercase tracking-widest text-star-white/35">{label}</p><p className="mt-1 font-display text-sm font-medium text-star-white/80">{value}</p></div>; }
function Foundation({ title, text }: { title: string; text: string }) { return <article className="rounded-xl border border-surface-border bg-space-800/35 p-4"><h2 className="font-mono text-xs text-accent-ice">{title}</h2><p className="mt-2 text-sm leading-6 text-star-white/50">{text}</p></article>; }
function GraphMeaning({ title, equation, meaning }: { title: string; equation: string; meaning: string }) { return <article className="rounded-xl border border-surface-border bg-space-800/35 p-4"><h3 className="font-display text-sm font-semibold text-star-white">{title}</h3><p className="mt-2 font-mono text-sm text-accent-ice">{equation}</p><p className="mt-2 text-sm leading-6 text-star-white/50">{meaning}</p></article>; }

import { BookOpenCheck, CircleHelp, MoveUpRight } from 'lucide-react';
import { kinematicsConcepts } from '@/data/kinematicsConcepts';

export function KinematicsConcepts() {
  return (
    <section id="concepts" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mb-9 max-w-3xl">
        <p className="eyebrow">The lesson · 14 ideas</p>
        <h2 className="mt-4 font-display text-section text-star-white">Build the model before solving</h2>
        <p className="mt-3 text-sm leading-7 text-star-white/55 sm:text-base">
          Work from coordinates and vectors to graphs, equations and applications. Each worked example shows the reasoning, not just the answer.
        </p>
      </div>
      <div className="space-y-4">
        {kinematicsConcepts.map((concept, index) => (
          <article key={concept.title} id={`concept-${index + 1}`} className="glass-panel scroll-mt-24 overflow-hidden p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.72fr)] lg:gap-10">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="font-mono text-xs tracking-widest text-accent-cyan">{String(index + 1).padStart(2, '0')}</span>
                  <span className="h-px w-7 bg-surface-border-hover" />
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-star-white/35">Core idea</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-star-white sm:text-2xl">{concept.title}</h3>
                <p className="mt-4 text-sm font-medium leading-6 text-star-white/85">{concept.definition}</p>
                <p className="mt-2 text-sm leading-7 text-star-white/55">{concept.meaning}</p>
                <div className="mt-5 rounded-xl border border-accent-cyan/15 bg-space-900/65 p-4">
                  <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-widest text-accent-cyan/75">Equation</p>
                  <p className="whitespace-pre-line font-mono text-sm leading-7 text-accent-ice sm:text-base">{concept.equation}</p>
                </div>
                <dl className="mt-4 space-y-3 text-sm leading-6">
                  <div><dt className="inline font-semibold text-star-white/75">Symbols. </dt><dd className="inline text-star-white/50">{concept.symbols}</dd></div>
                  <div><dt className="inline font-semibold text-star-white/75">SI units. </dt><dd className="inline text-star-white/50">{concept.units}</dd></div>
                  <div><dt className="inline font-semibold text-star-white/75">When to use it. </dt><dd className="inline text-star-white/50">{concept.use}</dd></div>
                </dl>
              </div>
              <aside className="flex flex-col gap-4">
                <div className="rounded-xl border border-surface-border bg-space-900/35 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-accent-gold"><BookOpenCheck className="h-4 w-4" /><h4 className="font-display text-sm font-semibold">Worked example</h4></div>
                  <p className="mt-3 text-sm font-medium leading-6 text-star-white/80">{concept.example}</p>
                  <ol className="mt-3 space-y-2.5">
                    {concept.steps.map((step, stepIndex) => (
                      <li key={step} className="flex gap-3 text-sm leading-6 text-star-white/55">
                        <span className="mt-0.5 font-mono text-xs text-accent-cyan/80">{stepIndex + 1}.</span><span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <details className="group rounded-xl border border-surface-border bg-space-900/25 p-4 open:border-accent-cyan/20">
                  <summary className="flex cursor-pointer list-none items-start gap-2 text-sm font-medium leading-6 text-star-white/75 outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-accent-cyan/60">
                    <CircleHelp className="mt-1 h-4 w-4 flex-none text-accent-cyan" />
                    <span>{concept.check}</span>
                    <MoveUpRight className="ml-auto mt-1 h-3.5 w-3.5 flex-none text-star-white/30 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="ml-6 mt-3 border-l border-accent-cyan/30 pl-3 text-sm leading-6 text-star-white/55">{concept.answer}</p>
                </details>
              </aside>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

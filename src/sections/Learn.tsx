import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpotlightCard from '@/components/SpotlightCard';
import { SectionHeading } from '@/components/SectionHeading';
import { lessonModules } from '@/data/simulations';
import { useReveal } from '@/hooks/useReveal';

const lessonLinks: Record<string, string> = {
  kinematics: '/lessons/kinematics',
  'newtons-laws': '/lessons/mechanics/newtons-laws',
  'energy-work-power': '/lessons/mechanics/energy-work-power',
};

export function Learn() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="learn" className="relative isolate vectra-section-flow py-16 sm:py-24 lg:py-32">
      <div className="container-vectra">
        <div ref={ref} className={`reveal reveal-up ${isVisible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Guided learning"
            sectionIndex="03 / 04"
            title="Build understanding, one idea at a time"
            description="Follow structured learning modules that connect core equations with physical intuition and practice."
          />
        </div>

        <div className="mt-9 grid gap-3.5 sm:mt-14 sm:gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {lessonModules.map((lesson, index) => {
            const href = lessonLinks[lesson.id];
            const card = (
              <SpotlightCard
                className="lesson-card group flex h-full min-h-[260px] min-w-0 flex-col gap-4 p-5 sm:min-h-[292px] sm:gap-5 sm:p-6"
                spotlightColor="rgba(48, 68, 136, 0.72)"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-star-white/35">
                    Module {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="rounded-full border border-white/[0.09] bg-white/[0.025] px-2.5 py-1 font-mono text-[0.62rem] text-star-white/50">
                    {lesson.duration}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.07] text-accent-cyan transition-colors duration-300 group-hover:border-accent-cyan/40 group-hover:text-accent-ice">
                    <BookOpen className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-accent-cyan/75">
                      {lesson.discipline} / {lesson.level}
                    </span>
                    <h3 className="mt-1.5 font-display text-lg font-medium leading-snug text-star-white transition-colors duration-300 group-hover:text-accent-ice">
                      {lesson.title}
                    </h3>
                  </div>
                </div>

                <p className="font-body text-sm leading-relaxed text-star-white/55">
                  {lesson.description}
                </p>

                <div className="mt-auto rounded-lg border border-white/[0.07] bg-space-950/35 px-3.5 py-3">
                  <span className="block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-star-white/35">
                    Core relation
                  </span>
                  <span className="mt-1 block break-words font-mono text-sm text-accent-ice/85">
                    {lesson.equation}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.07] pt-3">
                  <span className="font-mono text-[0.64rem] uppercase tracking-[0.15em] text-star-white/45">
                    {href ? 'Open lesson' : 'Coming later'}
                  </span>
                  {href ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-cyan/20 text-accent-cyan transition-all duration-300 group-hover:border-accent-cyan/40 group-hover:bg-accent-cyan/10">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-star-white/20" aria-hidden="true" />
                  )}
                </div>
              </SpotlightCard>
            );

            return (
              <div
                key={lesson.id}
                className="reveal reveal-up min-w-0"
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                {href ? (
                  <Link
                    to={href}
                    aria-label={`Open the ${lesson.title} lesson`}
                    className="group block h-full min-w-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-space-900"
                  >
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

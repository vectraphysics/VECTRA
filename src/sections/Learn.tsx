import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    <section id="learn" className="relative isolate vectra-section-flow py-20 sm:py-28 lg:py-32">
      <div className="container-vectra">
        <div ref={ref} className={`reveal reveal-up ${isVisible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Guided learning"
            title="Build understanding, one idea at a time"
            description="Follow structured learning modules that connect core equations with physical intuition and practice."
          />
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lessonModules.map((lesson, index) => {
            const href = lessonLinks[lesson.id];
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-surface-border bg-space-700/50 text-accent-cyan">
                    <BookOpen className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-xs text-star-white/35">{lesson.duration}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[0.7rem] uppercase tracking-widest text-accent-cyan/80">{lesson.discipline} · {lesson.level}</span>
                  <h3 className="font-display text-lg font-medium text-star-white">{lesson.title}</h3>
                  <p className="font-body text-sm leading-relaxed text-star-white/50">{lesson.description}</p>
                  <p className="font-mono text-sm text-accent-ice">{lesson.equation}</p>
                </div>
                {href && <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm text-accent-cyan">Start lesson <ArrowRight className="h-4 w-4" /></span>}
              </>
            );
            return (
              <div key={lesson.id} className="reveal reveal-up" style={{ transitionDelay: `${index * 90}ms` }}>
                {href ? (
                  <Link to={href} className="glass-panel glass-panel-hover card-glow glare-card group relative flex h-full min-w-0 flex-col gap-5 p-6 sm:p-7">{content}</Link>
                ) : (
                  <article className="glass-panel flex h-full min-w-0 flex-col gap-5 p-6">{content}</article>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

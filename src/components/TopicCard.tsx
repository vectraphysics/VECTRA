import { Target, Eye, Compass } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useReveal } from '@/hooks/useReveal';

const values = [
  {
    icon: Eye,
    title: 'See the unseen',
    description:
      'Physics describes invisible forces and fields. We make them visible through simulation and visualization.',
  },
  {
    icon: Compass,
    title: 'Guided, not gated',
    description:
      'No prerequisites required. Each concept builds from intuition to rigor, meeting learners where they are.',
  },
  {
    icon: Target,
    title: 'Built for curiosity',
    description:
      'Not a textbook replacement — a complement. A place to explore, experiment, and develop genuine understanding.',
  },
];

export function About() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="about" className="relative py-20 sm:py-28 lg:py-32">
      <div className="container-vectra">
        <div
          ref={ref}
          className={`reveal reveal-up ${isVisible ? 'is-visible' : ''}`}
        >
          <SectionHeading
            eyebrow="About VECTRA"
            title="Making physics more intuitive"
            description="VECTRA is an educational project focused on making physics accessible through interaction and visualization. We believe the best way to understand the universe is to play with the ideas themselves."
          />
        </div>

        <div className="mt-12 grid gap-5 sm:mt-14 lg:grid-cols-3">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <div
                key={i}
                className={`glass-panel glass-panel-hover flex flex-col gap-4 p-7 reveal reveal-up parallax-panel ${isVisible ? 'is-visible' : ''}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-surface-border bg-space-700/50 text-accent-cyan">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg font-medium text-star-white">
                  {value.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-star-white/50">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="glass-panel relative overflow-hidden p-8 sm:p-12 reveal reveal-up parallax-panel" style={{ transitionDelay: '180ms' }}>
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(ellipse at 80% 50%, rgba(94,200,216,0.1) 0%, transparent 60%)',
              }}
            />
            <div className="relative max-w-2xl">
              <p className="font-display text-section text-star-white/90 leading-snug">
                "The universe is under no obligation to make sense to you."
              </p>
              <p className="mt-3 font-mono text-sm text-star-white/35">— Neil deGrasse Tyson</p>
              <p className="mt-6 font-body text-base leading-relaxed text-star-white/55">
                VECTRA exists to bridge that gap — to take the elegant laws that govern
                everything from atoms to galaxies and make them not just understandable,
                but genuinely intuitive. This is just the beginning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

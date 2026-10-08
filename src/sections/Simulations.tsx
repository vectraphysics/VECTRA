import { Play, ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { SimulationCard } from '@/components/SimulationCard';
import { simulations } from '@/data/simulations';
import { useReveal } from '@/hooks/useReveal';

export function Simulations() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="simulations" className="relative py-20 sm:py-28 lg:py-32">
      {/* Subtle background differentiation */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-0 h-[300px] w-full max-w-[600px] -translate-x-1/2 rounded-full opacity-10 blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, #2d4a7a 0%, transparent 70%)' }}
        />
      </div>

      <div className="container-vectra relative">
        <div
          ref={ref}
          className={`section-fade ${isVisible ? 'is-visible' : ''}`}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Simulations"
              title="Learn by doing"
              description="Interactive physics simulations that let you manipulate variables and see cause and effect in real time. More simulations are on the way."
            />
            <a
              href="#explore"
              className="group hidden items-center gap-2 font-display text-sm text-accent-cyan transition-colors hover:text-accent-ice sm:inline-flex"
            >
              Browse all topics
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {simulations.map((sim, index) => (
            <SimulationCard key={sim.id} simulation={sim} index={index} />
          ))}
        </div>

        {/* Preview callout */}
        <div className="mt-10 flex items-center gap-3 rounded-xl border border-surface-border bg-space-800/30 px-5 py-4">
          <Play className="h-4 w-4 text-accent-cyan" strokeWidth={2} />
          <p className="font-body text-sm text-star-white/50">
            Simulations are in active development. The first interactive modules will
            focus on orbital mechanics and wave interference.
          </p>
        </div>
      </div>
    </section>
  );
}

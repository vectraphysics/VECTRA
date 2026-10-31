import { ArrowUpRight, Orbit, Waves, SlidersHorizontal, Magnet, Star, Thermometer } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpotlightCard from '@/components/SpotlightCard';
import { SectionHeading } from '@/components/SectionHeading';
import { useReveal } from '@/hooks/useReveal';

const simulationItems = [
  { id: 'orbital-mechanics', title: 'Orbital Mechanics', description: 'Explore gravity, orbital paths, and how changing velocity reshapes an orbit.', label: 'Mechanics', icon: Orbit, href: '/simulations/orbital-mechanics' },
  { id: 'waves', title: 'Wave Interference', description: 'Observe wave motion, superposition, and interference patterns.', label: 'Waves', icon: Waves, href: '/simulations/waves' },
  { id: 'double-slit', title: 'Double-Slit Experiment', description: 'Investigate how wave behaviour produces an interference pattern.', label: 'Modern Physics', icon: SlidersHorizontal, href: '/simulations/double-slit' },
  { id: 'magnetic-fields', title: 'Magnetic Fields', description: 'Visualize magnetic field patterns and explore their behaviour.', label: 'Electromagnetism', icon: Magnet, href: '/simulations/magnetic-fields' },
  { id: 'stellar-life-cycle', title: 'Stellar Life Cycle', description: 'Follow the stages of stellar evolution from formation to final state.', label: 'Astrophysics', icon: Star, href: '/simulations/stellar-life-cycle' },
  { id: 'heat-transfer', title: 'Heat Transfer', description: 'Explore how thermal energy moves through different materials.', label: 'Thermodynamics', icon: Thermometer, href: '/simulations/heat-transfer' },
];

export function Simulations() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="simulations" className="relative isolate vectra-section-flow py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[300px] w-full max-w-[600px] -translate-x-1/2 rounded-full opacity-10 blur-[120px] pulse-glow-soft" style={{ background: 'radial-gradient(ellipse, #2d4a7a 0%, transparent 70%)' }} />
      </div>
      <div className="container-vectra relative">
        <div ref={ref} className={`reveal reveal-up ${isVisible ? 'is-visible' : ''}`}>
          <SectionHeading
            eyebrow="Simulations"
            title="Learn by doing"
            description="Explore interactive physics experiences and see how changing a system's conditions changes what happens."
          />
        </div>

        <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {simulationItems.map((sim, index) => {
            const Icon = sim.icon;

            return (
              <Link
                key={sim.id}
                to={sim.href}
                aria-label={`Open the ${sim.title} simulation`}
                className="group block min-w-0 rounded-2xl reveal reveal-up focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-space-900"
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <SpotlightCard
                  className="simulation-card flex h-full min-h-[248px] min-w-0 flex-col gap-5 p-5 sm:p-6"
                  spotlightColor="rgba(48, 68, 136, 0.72)"
                  intensity={0.12}
                  spotlightSize={230}
                  borderGlow={0.34}
                  proximity={90}
                  smoothing={0.24}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-star-white/35">
                      Model {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="rounded-full border border-accent-cyan/20 bg-accent-cyan/[0.06] px-2.5 py-1 font-mono text-[0.62rem] tracking-wide text-accent-ice/80">
                      {sim.label}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.07] text-accent-cyan transition-colors duration-300 group-hover:border-accent-cyan/40 group-hover:bg-accent-cyan/[0.11] group-hover:text-accent-ice">
                      <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.55} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="font-display text-lg font-medium leading-snug text-star-white transition-colors duration-300 group-hover:text-accent-ice sm:text-xl">
                        {sim.title}
                      </h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-star-white/55">
                        {sim.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-4">
                    <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-star-white/40 transition-colors duration-300 group-hover:text-star-white/70">
                      Open simulation
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.09] text-star-white/55 transition-all duration-300 group-hover:border-accent-cyan/35 group-hover:bg-accent-cyan/10 group-hover:text-accent-cyan">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

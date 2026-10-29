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
        <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {simulationItems.map((sim, index) => {
            const Icon = sim.icon;
            return (
              <Link key={sim.id} to={sim.href} className="group relative block min-w-0 reveal reveal-up focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-space-900" style={{ transitionDelay: `${index * 90}ms` }}>
                <SpotlightCard
                  className="glass-panel glass-panel-hover relative flex h-full min-w-0 flex-col gap-5 p-6 sm:p-7"
                  spotlightColor="rgba(48, 68, 136, 0.92)"
                  intensity={0.14}
                  spotlightSize={250}
                  borderGlow={0.42}
                  proximity={90}
                  smoothing={0.24}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-surface-border bg-space-700/50 text-accent-cyan">
                      <Icon className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-star-white/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-cyan" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="font-display text-xl font-medium text-star-white">{sim.title}</h3>
                    <p className="font-body text-sm leading-relaxed text-star-white/50">{sim.description}</p>
                  </div>
                  <span className="mt-auto self-start rounded-md border border-accent-cyan/25 bg-accent-cyan/5 px-2.5 py-1 font-mono text-[0.7rem] text-accent-ice">{sim.label}</span>
                </SpotlightCard>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

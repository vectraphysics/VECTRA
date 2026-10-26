import { Play, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Simulation } from '@/data/simulations';
import { useReveal } from '@/hooks/useReveal';

interface SimulationCardProps {
  simulation: Simulation;
  index: number;
}

export function SimulationCard({ simulation, index }: SimulationCardProps) {
  const { ref, isVisible } = useReveal();
  const Icon = simulation.icon;
  const isPreview = simulation.status === 'preview';

  const content = (
    <article
      ref={ref}
      className={`glass-panel glass-panel-hover group relative flex flex-col overflow-hidden reveal reveal-up parallax-panel ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-surface-border bg-space-800/40">
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 40%, rgba(94,200,216,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(168,213,232,0.1) 0%, transparent 50%)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex h-20 w-20 items-center justify-center" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border border-accent-cyan/20 group-hover:border-accent-cyan/40 transition-colors duration-500" />
          <div
            className="absolute inset-0 rounded-full border border-star-white/10"
            style={{ transform: 'scale(1.3) rotate(30deg)' }}
          />
          <div
            className="absolute h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(94,200,216,0.6)]"
            style={{
              animation: 'orbit 6s linear infinite',
              ['--orbit-r' as string]: '36px',
            }}
          />
          <Icon className="h-7 w-7 text-accent-cyan/60 transition-colors duration-500 group-hover:text-accent-cyan" strokeWidth={1.2} />
        </div>

        <span
          className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-widest-2 ${
            isPreview
              ? 'border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan'
              : 'border border-surface-border bg-space-800/60 text-star-white/35'
          }`}
        >
          {isPreview ? <Play className="h-2.5 w-2.5" strokeWidth={2} /> : <Lock className="h-2.5 w-2.5" strokeWidth={2} />}
          {isPreview ? 'Preview' : 'Soon'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.7rem] uppercase tracking-widest-2 text-star-white/35">
            {simulation.category}
          </span>
        </div>
        <h3 className="font-display text-lg font-medium text-star-white">{simulation.title}</h3>
        <p className="font-body text-sm leading-relaxed text-star-white/50">
          {simulation.description}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {simulation.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-surface-border bg-space-800/40 px-2 py-0.5 font-mono text-[0.65rem] text-star-white/35"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );

  if (simulation.route) {
    return <Link to={simulation.route}>{content}</Link>;
  }
  return content;
}

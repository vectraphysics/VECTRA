import { ArrowRight, Sparkles } from 'lucide-react';
import { Starfield } from '@/components/Starfield';
import { OrbitalSystem } from '@/components/OrbitalSystem';

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden pt-16 sm:pt-20"
    >
      {/* Background starfield */}
      <Starfield density={1.2} />

      {/* Nebula glow overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #2d4a7a 0%, transparent 70%)' }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-[350px] w-[350px] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #1a4a55 0%, transparent 70%)' }}
        />
      </div>

      <div className="container-vectra relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
          {/* Left: content */}
          <div className="flex min-w-0 flex-col gap-6 animate-fade-up">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-accent-cyan" strokeWidth={1.5} />
              <span className="eyebrow min-w-0">Interactive Physics & Space Science</span>
            </div>

            <h1 className="font-display text-hero text-star-white">
              <span className="text-gradient">VECTRA</span>
            </h1>

            <p className="max-w-xl font-body text-lg leading-relaxed text-star-white/60 sm:text-xl">
              Explore the laws of the universe through interactive simulations,
              visual explanations, and guided learning. Physics, made intuitive.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#explore" className="btn-primary group">
                Explore Physics
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </a>
              <a href="#simulations" className="btn-ghost">
                View Simulations
              </a>
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-surface-border pt-6 sm:justify-start sm:gap-8">
              <Stat value="7" label="Disciplines" />
              <Stat value="6+" label="Simulations" />
              <Stat value="∞" label="Curiosity" />
            </div>
          </div>

          {/* Right: orbital system visual */}
          <div className="flex min-w-0 items-center justify-center animate-fade-in">
            <OrbitalSystem />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="font-mono text-[0.65rem] uppercase tracking-widest-2 text-star-white/30">
          Scroll
        </span>
        <div className="h-10 w-px bg-gradient-to-b from-star-white/20 to-transparent" />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-display text-2xl font-semibold text-star-white">{value}</span>
      <span className="font-mono text-[0.7rem] uppercase tracking-widest-2 text-star-white/35">
        {label}
      </span>
    </div>
  );
}

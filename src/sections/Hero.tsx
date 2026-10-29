import { ArrowRight, Sparkles } from 'lucide-react';
import Iridescence from '@/components/Iridescence';

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden pt-20 pb-24 sm:pt-24"
    >
      {/* The sole animated hero visual: React Bits Iridescence */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <Iridescence
          color="#8099cc"
          speed={0.3}
          amplitude={0.06}
          scale={1.15}
          detail={5}
          brightness={1.32}
          saturation={1.25}
          contrast={1.08}
          mouseReact={false}
          stir={0.18}
          sheen={0.18}
          clickSwirl={false}
          grain={0}
          fade={0}
          opacity={0.7}
          resolution={0.65}
          style={{
            width: '100%',
            height: '100%',
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 88%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 88%, transparent 100%)',
          }}
        />
      </div>

      <div className="container-vectra relative z-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-7 text-center sm:gap-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-accent-cyan" strokeWidth={1.5} />
            <span className="eyebrow">Interactive Physics &amp; Space Science</span>
          </div>

          <h1 className="font-display text-hero text-star-white vectra-title-focus">
            <span className="text-gradient">VECTRA</span>
          </h1>

          <p className="mx-auto max-w-2xl font-body text-lg leading-relaxed text-star-white/75 sm:text-xl">
            Explore the laws of the universe through interactive simulations,
            visual explanations, and guided learning. Physics, made intuitive.
          </p>

          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a href="#explore" className="btn-primary group justify-center">
              Explore Physics
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </a>
            <a href="#simulations" className="btn-ghost justify-center">
              View Simulations
            </a>
          </div>

          <div className="mt-5 flex w-full max-w-xl flex-wrap justify-center gap-x-10 gap-y-5 border-t border-surface-border/80 pt-6 sm:mt-8 sm:gap-x-16">
            <Stat value="7" label="Disciplines" />
            <Stat value="6+" label="Simulations" />
            <Stat value="∞" label="Curiosity" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="font-mono text-[0.65rem] uppercase tracking-widest-2 text-star-white/45">
          Scroll to explore
        </span>
        <div className="h-10 w-px bg-gradient-to-b from-star-white/30 to-transparent" />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[5rem] flex-col items-center gap-0.5">
      <span className="font-display text-2xl font-semibold text-star-white">{value}</span>
      <span className="font-mono text-[0.7rem] uppercase tracking-widest-2 text-star-white/45">
        {label}
      </span>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useHeatTransferSimulation } from '@/hooks/useHeatTransferSimulation';
import { useHeatTransferCanvas } from '@/hooks/useHeatTransferCanvas';
import { HTModeSelector } from '@/components/sim/HTModeSelector';
import { HTPlayback } from '@/components/sim/HTPlayback';
import { HTDataPanel } from '@/components/sim/HTDataPanel';
import { HTControlPanel } from '@/components/sim/HTControlPanel';
import { HTEducationalPanel } from '@/components/sim/HTEducationalPanel';

const EXPERIMENTS = {
  conduction: { number: '01', name: 'CONDUCTION', medium: 'SOLID', description: 'A solid rod carries thermal energy from a hot reservoir to a cold one.' },
  convection: { number: '02', name: 'CONVECTION', medium: 'FLUID', description: 'A heated base sets a fluid into circulation, carrying thermal energy.' },
  radiation: { number: '03', name: 'THERMAL RADIATION', medium: 'VACUUM', description: 'A hot sphere exchanges radiation with a cold enclosing wall across a vacuum.' },
};

export function HeatTransferPage() {
  const controls = useHeatTransferSimulation();
  const canvasRef = useHeatTransferCanvas(controls);
  const experiment = EXPERIMENTS[controls.mode];
  return (
    <div className="min-h-screen bg-space-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-surface-border bg-space-900/85 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2 font-display text-sm text-star-white/55 transition-colors hover:text-star-white">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.5} />
            <span className="hidden sm:inline">Back to Simulations</span><span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="3" fill="#5ec8d8" />
              <ellipse cx="14" cy="14" rx="11" ry="4.5" stroke="#a8d5e8" strokeOpacity="0.35" strokeWidth="1" transform="rotate(-20 14 14)" />
              <circle cx="24" cy="9" r="1.2" fill="#a8d5e8" />
            </svg>
            <span className="font-display text-sm font-semibold tracking-wider text-star-white">VECTRA</span>
          </div>
        </div>
      </header>
      <main className="pt-14">
        <div className="flex flex-col lg:h-[calc(100vh-3.5rem)] lg:min-h-[580px] lg:flex-row">
          <div className="simulation-viewport relative h-[560px] min-w-0 overflow-hidden sm:h-[600px] lg:h-full lg:flex-1">
            <div className="pointer-events-none absolute left-5 right-5 top-5 z-10 sm:left-6 sm:top-6">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-cyan/65">Thermodynamics / Thermal laboratory</p>
              <h1 className="font-display text-2xl font-semibold tracking-wide text-star-white sm:text-3xl">HEAT TRANSFER</h1>
              <div className="mt-3 flex items-center gap-3">
                <span className="rounded border border-surface-border bg-space-800/60 px-2 py-1 font-mono text-[10px] tracking-wider text-accent-ice">{experiment.number} / {experiment.name}</span>
                <span className="font-mono text-[9px] tracking-widest text-star-white/35">{experiment.medium}</span>
              </div>
              <span className="absolute right-0 top-1 hidden items-center gap-2 font-mono text-[10px] tracking-widest text-star-white/40 sm:flex"><span className={`h-1.5 w-1.5 rounded-full ${controls.isPlaying ? 'bg-accent-cyan' : 'bg-accent-gold'}`} />{controls.isPlaying ? 'LIVE' : 'PAUSED'}</span>
            </div>
            <div className="absolute inset-0 h-full w-full">
              <canvas ref={canvasRef} aria-label={experiment.description} className="absolute inset-0 block h-full w-full" style={{ touchAction: controls.mode === 'conduction' ? 'none' : 'pan-y' }}>{experiment.description}</canvas>
            </div>
          </div>
          <aside aria-label="Heat-transfer instrument panel" className="flex w-full flex-col gap-3 border-t border-surface-border bg-space-800/30 p-3 sm:p-4 lg:h-full lg:w-[360px] lg:flex-none lg:overflow-y-auto lg:border-l lg:border-t-0">
            <HTModeSelector controls={controls} />
            <HTPlayback controls={controls} />
            <HTDataPanel controls={controls} />
            <HTControlPanel controls={controls} />
            <HTEducationalPanel controls={controls} />
          </aside>
        </div>
      </main>
    </div>
  );
}
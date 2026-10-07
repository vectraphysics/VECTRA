import { ArrowRightLeft, Wind, Sun } from 'lucide-react';
import type { HeatTransferControls } from '@/hooks/useHeatTransferSimulation';
import type { HeatMode } from '@/lib/heatTransferPhysics';

const MODES = [
  { id: 'conduction' as HeatMode, label: 'Conduction', icon: ArrowRightLeft },
  { id: 'convection' as HeatMode, label: 'Convection', icon: Wind },
  { id: 'radiation' as HeatMode, label: 'Radiation', icon: Sun },
];

export function HTModeSelector({ controls: c }: { controls: HeatTransferControls }) {
  return (
    <section className="sim-panel" aria-label="Heat-transfer mechanism">
      <div className="sim-panel-header"><span className="sim-panel-title">Mechanism</span><span className="ml-auto font-mono text-[10px] text-star-white/30">01 — 03</span></div>
      <div className="grid grid-cols-3 gap-1.5 p-3">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button key={id} aria-pressed={c.mode === id} onClick={() => c.setMode(id)} className={`flex flex-col items-center gap-2 rounded-lg border py-3 font-display text-xs transition-colors focus-visible:outline focus-visible:outline-accent-cyan ${c.mode === id ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan' : 'border-surface-border bg-space-700/30 text-star-white/50 hover:text-star-white'}`}>
            <Icon className="h-4 w-4" strokeWidth={1.5} />{label}
          </button>
        ))}
      </div>
    </section>
  );
}
import { Play, Pause, RotateCcw, ScanLine } from 'lucide-react';
import type { HeatTransferControls } from '@/hooks/useHeatTransferSimulation';

export function HTPlayback({ controls: c }: { controls: HeatTransferControls }) {
  return (
    <div className="sim-panel p-3">
      <div className="flex gap-2">
        <button onClick={c.togglePlay} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 py-2.5 font-display text-sm text-accent-cyan hover:bg-accent-cyan/20">
          {c.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{c.isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={c.reset} className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2.5 font-display text-sm text-star-white/60 hover:text-star-white" title="Reset the active experiment">
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} />Reset
        </button>
        <button onClick={c.toggleAnnotations} aria-label="Show annotations" aria-pressed={c.showAnnotations} title="Toggle diagram annotations" className={`rounded-lg border px-3 ${c.showAnnotations ? 'border-accent-cyan/30 text-accent-cyan' : 'border-surface-border text-star-white/40'}`}>
          <ScanLine className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
      <p className="mt-2 font-mono text-[10px] text-star-white/30">Playback controls the illustration, not the equations.</p>
    </div>
  );
}
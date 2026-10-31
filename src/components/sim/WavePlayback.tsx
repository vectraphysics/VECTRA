import { Play, Pause, RotateCcw } from 'lucide-react';
import type { WaveSimulationControls } from '@/hooks/useWaveSimulation';

const SPEEDS = [0.25, 0.5, 1, 2, 5];

interface WavePlaybackProps {
  controls: WaveSimulationControls;
}

export function WavePlayback({ controls }: WavePlaybackProps) {
  const { isPlaying, speed, togglePlay, reset, setSpeed } = controls;

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Simulation</span>
      </div>
      <div className="sim-panel-body">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={togglePlay}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2.5 font-display text-sm font-medium text-accent-cyan transition-all hover:bg-accent-cyan/20"
            >
              <Pause className="h-4 w-4" strokeWidth={2} />
              Pause
            </button>
          ) : (
            <button
              onClick={togglePlay}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2.5 font-display text-sm font-medium text-accent-cyan transition-all hover:bg-accent-cyan/20"
            >
              <Play className="h-4 w-4" strokeWidth={2} />
              Play
            </button>
          )}
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-space-700/30 px-4 py-2.5 font-display text-sm font-medium text-star-white/60 transition-all hover:border-surface-border-hover hover:text-star-white"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            Reset
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.7rem] uppercase tracking-widest-2 text-star-white/30">
            Animation rate
          </span>
          <div className="flex items-center gap-0.5 rounded-lg border border-surface-border bg-space-900/40 p-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                aria-pressed={speed === s}
                className={`sim-speed-btn flex-1 ${speed === s ? 'active' : ''}`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

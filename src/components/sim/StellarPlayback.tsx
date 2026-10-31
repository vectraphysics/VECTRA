import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import type { StellarControls } from '@/hooks/useStellarSimulation';

const SPEEDS = [0.25, 0.5, 1, 2, 5];

interface StellarPlaybackProps {
  controls: StellarControls;
}

export function StellarPlayback({ controls }: StellarPlaybackProps) {
  const { isPlaying, speed, togglePlay, reset, setSpeed, nextStage, prevStage, resetCamera, currentStageIndex, stages } = controls;

  const atStart = currentStageIndex === 0;
  const atEnd = currentStageIndex >= stages.length - 1;

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
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2.5 font-display text-sm font-medium text-accent-cyan transition-all hover:bg-accent-cyan/20"
            >
              <Pause className="h-4 w-4" strokeWidth={2} />
              Pause
            </button>
          ) : (
            <button
              onClick={togglePlay}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2.5 font-display text-sm font-medium text-accent-cyan transition-all hover:bg-accent-cyan/20"
            >
              <Play className="h-4 w-4" strokeWidth={2} />
              {atEnd ? 'Replay' : 'Play Evolution'}
            </button>
          )}
          <button
            onClick={reset}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-surface-border bg-space-700/30 px-4 py-2.5 font-display text-sm font-medium text-star-white/60 transition-all hover:border-surface-border-hover hover:text-star-white"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            Reset
          </button>
        </div>

        {/* Stage navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevStage}
            disabled={atStart}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-surface-border bg-space-700/30 px-3 py-2 font-mono text-xs text-star-white/50 transition-all hover:text-star-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Prev
          </button>
          <button
            onClick={nextStage}
            disabled={atEnd}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-surface-border bg-space-700/30 px-3 py-2 font-mono text-xs text-star-white/50 transition-all hover:text-star-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <button
          onClick={resetCamera}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-surface-border bg-space-700/30 px-4 py-2.5 font-display text-sm font-medium text-star-white/60 transition-all hover:border-surface-border-hover hover:text-star-white"
        >
          <Camera className="h-4 w-4" strokeWidth={1.5} />
          Reset Camera
        </button>

        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.7rem] uppercase tracking-widest-2 text-star-white/30">
            Speed
          </span>
          <div className="flex items-center gap-0.5 rounded-lg border border-surface-border bg-space-900/40 p-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`sim-speed-btn min-h-11 flex-1 ${speed === s ? 'active' : ''}`}
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

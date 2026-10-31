import { Camera, RotateCcw } from 'lucide-react';
import type { MagneticFieldControls } from '@/hooks/useMagneticFieldSimulation';

interface MFPlaybackProps {
  controls: MagneticFieldControls;
}

export function MFPlayback({ controls }: MFPlaybackProps) {
  const { reset, resetCamera } = controls;

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Scene Controls</span>
      </div>
      <div className="sim-panel-body">
        <button
          onClick={reset}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2.5 font-display text-sm font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/15"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
          Reset Simulation
        </button>

        <button
          onClick={resetCamera}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-surface-border bg-space-700/30 px-4 py-2.5 font-display text-sm font-medium text-star-white/65 transition-colors hover:border-surface-border-hover hover:text-star-white"
        >
          <Camera className="h-4 w-4" strokeWidth={1.5} />
          Reset Camera
        </button>
      </div>
    </div>
  );
}

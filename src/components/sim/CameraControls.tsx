import { Camera } from 'lucide-react';
import type { SimulationControls } from '@/hooks/useOrbitalSimulation';

interface CameraControlsProps {
  controls: SimulationControls;
}

export function CameraControls({ controls }: CameraControlsProps) {
  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Camera</span>
      </div>
      <div className="sim-panel-body">
        <button
          onClick={controls.resetCamera}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-surface-border bg-space-700/30 px-4 py-2.5 font-display text-sm font-medium text-star-white/60 transition-all hover:border-surface-border-hover hover:text-star-white"
        >
          <Camera className="h-4 w-4" strokeWidth={1.5} />
          Reset Camera
        </button>
        <p className="font-mono text-[0.7rem] leading-relaxed text-star-white/30">
          Drag to rotate · Shift+drag or right-click to pan · Scroll or pinch to zoom
        </p>
      </div>
    </div>
  );
}

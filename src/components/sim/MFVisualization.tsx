import { Spline, ArrowRight, Layers } from 'lucide-react';
import type { MagneticFieldControls } from '@/hooks/useMagneticFieldSimulation';
import type { VizMode } from '@/lib/MagneticFieldEngine';

interface MFVisualizationProps {
  controls: MagneticFieldControls;
}

const MODES: { id: VizMode; label: string; icon: typeof Spline }[] = [
  { id: 'lines', label: 'Field Lines', icon: Spline },
  { id: 'vectors', label: 'Field Vectors', icon: ArrowRight },
  { id: 'map', label: 'Field Map', icon: Layers },
];

export function MFVisualization({ controls }: MFVisualizationProps) {
  const { vizMode, setVizMode, showFieldDirection, showFieldStrength, toggleFieldDirection, toggleFieldStrength } = controls;

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Visualization</span>
      </div>
      <div className="sim-panel-body">
        {/* Mode selector */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.7rem] uppercase tracking-widest-2 text-star-white/30">
            Display Mode
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setVizMode(mode.id)}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 font-mono text-[0.7rem] transition-all ${
                    vizMode === mode.id
                      ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan'
                      : 'border-surface-border bg-space-700/30 text-star-white/40 hover:text-star-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="text-center leading-tight">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-surface-border" />

        {/* Toggles */}
        <button onClick={toggleFieldDirection} className={`sim-toggle-btn ${showFieldDirection ? 'active' : ''}`}>
          <span>Direction Arrows</span>
          <span className={`h-3.5 w-6 rounded-full p-0.5 transition-colors ${showFieldDirection ? 'bg-accent-cyan/30' : 'bg-space-500'}`}>
            <span className={`block h-2.5 w-2.5 rounded-full bg-star-white transition-transform ${showFieldDirection ? 'translate-x-2.5' : ''}`} />
          </span>
        </button>

        <button onClick={toggleFieldStrength} className={`sim-toggle-btn ${showFieldStrength ? 'active' : ''}`}>
          <span>Field Strength (Intensity)</span>
          <span className={`h-3.5 w-6 rounded-full p-0.5 transition-colors ${showFieldStrength ? 'bg-accent-cyan/30' : 'bg-space-500'}`}>
            <span className={`block h-2.5 w-2.5 rounded-full bg-star-white transition-transform ${showFieldStrength ? 'translate-x-2.5' : ''}`} />
          </span>
        </button>
      </div>
    </div>
  );
}

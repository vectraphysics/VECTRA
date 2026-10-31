import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { WaveSimulationControls } from '@/hooks/useWaveSimulation';
import { SliderInput } from './SliderInput';

interface WaveControlPanelProps {
  controls: WaveSimulationControls;
}

export function WaveControlPanel({ controls }: WaveControlPanelProps) {
  const { params, setAmplitude, setWavelength, setFrequency, setDirection } = controls;

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Wave Controls</span>
      </div>
      <div className="sim-panel-body">
        <SliderInput
          label="Amplitude"
          value={params.amplitude}
          min={5}
          max={120}
          step={1}
          unit="px"
          onChange={setAmplitude}
          precision={0}
        />
        <SliderInput
          label="Wavelength"
          value={params.wavelength}
          min={40}
          max={600}
          step={5}
          unit="px"
          onChange={setWavelength}
          precision={0}
        />
        <SliderInput
          label="Frequency"
          value={params.frequency}
          min={0.1}
          max={5}
          step={0.05}
          unit="Hz"
          onChange={setFrequency}
          precision={2}
        />

        <div className="h-px bg-surface-border" />

        {/* Direction control */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs text-star-white/45">Direction</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDirection(-1)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs transition-all ${
                params.direction === -1
                  ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan'
                  : 'border-surface-border bg-space-700/30 text-star-white/40 hover:text-star-white'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              Left
            </button>
            <button
              onClick={() => setDirection(1)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs transition-all ${
                params.direction === 1
                  ? 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan'
                  : 'border-surface-border bg-space-700/30 text-star-white/40 hover:text-star-white'
              }`}
            >
              Right
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Wave speed note */}
        <div className="rounded-lg border border-surface-border bg-space-900/40 p-3">
          <p className="font-mono text-[0.7rem] leading-relaxed text-star-white/35">
            The model calculates <span className="text-accent-ice">v = fλ</span>. Frequency
            and wavelength can be varied independently here. In a real fixed medium, wave
            speed is set by the medium, so changing frequency also changes wavelength.
          </p>
        </div>
      </div>
    </div>
  );
}

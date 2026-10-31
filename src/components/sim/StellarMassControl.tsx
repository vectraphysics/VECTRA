import type { StellarControls } from '@/hooks/useStellarSimulation';
import { SliderInput } from './SliderInput';

interface StellarMassControlProps {
  controls: StellarControls;
}

export function StellarMassControl({ controls }: StellarMassControlProps) {
  const { mass, setMass, path, remnantType } = controls;

  const pathLabel = path === 'high-mass' ? 'HIGH MASS' : 'LOW / SUN-LIKE';
  const remnantLabel = remnantType === 'black-hole'
    ? 'Black Hole'
    : remnantType === 'neutron-star'
      ? 'Neutron Star'
      : remnantType === 'uncertain-compact-remnant'
        ? 'Uncertain: ONe white dwarf / neutron star'
        : 'White Dwarf';

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Initial Mass</span>
        <span className={`ml-auto font-mono text-xs ${path === 'high-mass' ? 'text-rose-400' : 'text-accent-cyan'}`}>
          {pathLabel}
        </span>
      </div>
      <div className="sim-panel-body">
        <SliderInput
          label="Stellar Mass"
          value={mass}
          min={0.1}
          max={50}
          step={0.1}
          unit="M☉"
          onChange={setMass}
          precision={1}
        />

        {/* Path description */}
        <div className="rounded-lg border border-surface-border bg-space-900/40 p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.7rem] text-star-white/35">Evolution Path</span>
          </div>
          <p className="mt-1 font-body text-xs leading-relaxed text-star-white/50">
            {path === 'high-mass'
              ? mass < 10
                ? 'Around 8–10 solar masses, super-AGB evolution can leave an oxygen-neon white dwarf or lead to an electron-capture supernova. The outcome is model-dependent.'
                : 'A massive star burns fast and dies young. Core collapse can leave a neutron star or black hole; the outcome depends on the evolved core and mass loss.'
              : 'A lower-mass star burns slowly, expands into a giant, and sheds its outer layers. Its exposed core becomes a white dwarf.'}
          </p>
          <div className="mt-2 flex items-center gap-2 border-t border-surface-border pt-2">
            <span className="font-mono text-[0.7rem] text-star-white/35">Remnant:</span>
            <span className="font-mono text-xs text-accent-gold">{remnantLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

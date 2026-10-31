import type { StellarControls } from '@/hooks/useStellarSimulation';
import { SliderInput } from './SliderInput';

interface StellarMassControlProps {
  controls: StellarControls;
}

export function StellarMassControl({ controls }: StellarMassControlProps) {
  const { mass, setMass, path, remnantType } = controls;

  const isVeryLowMass = mass < 0.5;
  const isLongLived = mass < 0.8;
  const pathLabel = path === 'high-mass'
    ? 'MASSIVE STAR'
    : isLongLived
      ? (isVeryLowMass ? 'LONG-LIVED RED DWARF' : 'LONG-LIVED STAR')
      : 'LOW / INTERMEDIATE';
  const remnantLabel = remnantType === 'black-hole'
    ? 'Black Hole'
    : remnantType === 'neutron-star'
      ? 'Neutron Star'
      : isLongLived
        ? 'White Dwarf (far future)'
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
            {isLongLived
              ? isVeryLowMass
                ? 'This red dwarf burns hydrogen extremely slowly. Its main-sequence lifetime is longer than the current age of the Universe, so the simulation stops before its far-future evolution.'
                : 'This low-mass star has a main-sequence lifetime comparable to or longer than the age of the Universe. The simulation stops at its current hydrogen-burning phase.'
              : path === 'high-mass'
                ? 'This simplified massive-star pathway proceeds to core collapse. The selected initial mass is used as a heuristic for choosing a neutron-star or black-hole example, not as a universal prediction.'
                : 'This representative low- or intermediate-mass star expands into a red giant, burns helium, enters the asymptotic giant branch, and sheds its outer layers to expose a white dwarf.'}
          </p>
          <div className="mt-2 flex items-center gap-2 border-t border-surface-border pt-2">
            <span className="font-mono text-[0.7rem] text-star-white/35">Illustrative remnant:</span>
            <span className="font-mono text-xs text-accent-gold">{remnantLabel}</span>
          </div>
        </div>
        <p className="font-body text-[0.68rem] leading-relaxed text-star-white/35">
          The 8 and 25 M☉ boundaries are teaching heuristics, not exact universal cut-offs. Metallicity, rotation, mass loss, binary interaction and the final core mass can change a star's fate.
        </p>
      </div>
    </div>
  );
}

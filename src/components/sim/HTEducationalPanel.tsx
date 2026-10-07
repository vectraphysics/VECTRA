import { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import type { HeatTransferControls } from '@/hooks/useHeatTransferSimulation';

const LESSONS = {
  conduction: {
    title: 'Microscopic interactions',
    text: 'Thermal energy moves through a material because of microscopic interactions between particles. The solid stays in place; temperature itself does not flow.',
    tryIt: 'Switch copper to wood. Same ΔT, area and length — a much smaller heat-transfer rate.',
  },
  convection: {
    title: 'Energy carried by a fluid',
    text: 'Thermal energy is transported by the bulk movement of a fluid. Warm fluid expands and rises; cooler, denser fluid sinks, forming a circulation loop.',
    tryIt: 'Lower the heater temperature to match the surroundings. No temperature difference means no buoyancy-driven circulation.',
  },
  radiation: {
    title: 'Energy across empty space',
    text: 'Thermal energy can travel through electromagnetic radiation, including across a vacuum. Neither physical contact nor a fluid is required.',
    tryIt: 'Raise the hot temperature. The fourth-power dependence makes radiation increase rapidly. A polished surface emits far less than a black one.',
  },
};

export function HTEducationalPanel({ controls: c }: { controls: HeatTransferControls }) {
  const [expanded, setExpanded] = useState(false);
  const lesson = LESSONS[c.mode];
  return <section className="sim-panel" aria-label="Understanding heat transfer">
    <div className="sim-panel-header"><BookOpen className="mr-2 h-3.5 w-3.5 text-accent-cyan" strokeWidth={1.5} /><span className="sim-panel-title">Understanding heat</span></div>
    <div className="space-y-3 p-4">
      <h2 className="font-display text-sm font-medium text-star-white">{lesson.title}</h2>
      <p className="font-body text-xs leading-relaxed text-star-white/55">{lesson.text}</p>
      <p className="border-l-2 border-accent-gold/30 pl-3 font-body text-xs leading-relaxed text-star-white/45"><span className="text-accent-gold/80">Try it. </span>{lesson.tryIt}</p>
      <button aria-expanded={expanded} onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between font-mono text-[11px] text-accent-ice/70 hover:text-accent-ice">Model & assumptions<ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
      {expanded && <div className="space-y-3 border-t border-surface-border pt-3 font-body text-xs leading-relaxed text-star-white/45">
        {c.mode === 'conduction' && <>
          <p>Steady, one-dimensional conduction through a uniform rod with insulated sides and fixed end temperatures. T(x) = Tₕ − ΔT·x/L. The profile is already at steady state; it is not a heating transient.</p>
          <p>k is a constant approximate room-temperature value. Alloy, grain direction and temperature change real conductivities. Steel means carbon steel; wood represents dry pine. Coloured dots indicate energy transfer, not atoms moving along the rod. Geometry and motion are schematic.</p>
          <a className="block text-accent-ice/70 underline underline-offset-2" href="https://www.engineeringtoolbox.com/thermal-conductivity-d_429.html" target="_blank" rel="noreferrer">Reference: thermal conductivities</a>
        </>}
        {c.mode === 'convection' && <>
          <p>Q̇ ≈ hAΔT estimates transfer from the heated horizontal plate. Lc = A/perimeter; Ra = gβΔT·Lc³/(να); h = Nu·k/Lc. For 10⁴ ≤ Ra &lt; 10⁷: Nu = 0.54 Ra¹/⁴. For 10⁷ ≤ Ra ≤ 10¹¹: Nu = 0.15 Ra¹/³.</p>
          <p>Below that range the estimate is extrapolated with Nu ≥ 1; it is not a quantitative convection prediction. Fluid properties are frozen near 20 °C, except β = 1/Tfilm for air. Cooled walls and a temperature-controlled heater sustain circulation. The chamber's field and rolls are illustrative — not a Navier–Stokes or CFD solution.</p>
          <a className="block text-accent-ice/70 underline underline-offset-2" href="https://www.sfu.ca/~mbahrami/ENSC%20388/Notes/Natural%20Convection.pdf" target="_blank" rel="noreferrer">Reference: natural-convection correlations</a>
        </>}
        {c.mode === 'radiation' && <>
          <p>A grey sphere radiates inside a large, black, isothermal cold enclosure, with vacuum between them. The sphere's view factor to the wall is 1, so P = εσA(Tₕ⁴ − T꜀⁴) applies. σ = 5.670374419 × 10⁻⁸ W·m⁻²·K⁻⁴. Temperatures are maintained externally.</p>
          <p>The cold wall also emits. Absorbed power is εσAT꜀⁴. Equal temperatures still radiate in both directions, but net transfer is zero. Two small separated objects would require a view factor and a more general exchange equation.</p>
          <p>The spectrum follows Planck's law; λmax = b/T (Wien's law). Most emission here is infrared. Rays are symbolic and vastly slowed down; visible glow only appears above roughly 800 K. ε is held constant rather than varying with wavelength or temperature.</p>
          <a className="block text-accent-ice/70 underline underline-offset-2" href="https://en.wikipedia.org/wiki/Stefan%E2%80%93Boltzmann_law" target="_blank" rel="noreferrer">Reference: Stefan–Boltzmann law</a>
        </>}
        <p><span className="text-star-white/65">Units matter:</span> temperature is °C or K; Q is thermal energy in joules (J); Q̇ = dQ/dt is a rate in watts (W = J/s). ΔT has the same numerical value in K and °C. ε is dimensionless.</p>
      </div>}
    </div>
  </section>;
}
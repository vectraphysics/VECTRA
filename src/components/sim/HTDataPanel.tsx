import type { HeatTransferControls } from '@/hooks/useHeatTransferSimulation';
import { fmt, formatPower, formatPowerText, formatWavelength } from '@/lib/heatTransfer/format';

function Reading({ label, value, unit, help }: { label: string; value: string; unit?: string; help?: string }) {
  return <div className="sim-data-row" title={help}>
    <span className="sim-data-label">{label}</span>
    <span className="flex items-baseline gap-1.5"><span className="sim-data-value">{value}</span>{unit && <span className="sim-data-unit">{unit}</span>}</span>
  </div>;
}

export function HTDataPanel({ controls: c }: { controls: HeatTransferControls }) {
  const cd = c.conductionData, vd = c.convectionData, rd = c.radiationData;
  const rate = c.mode === 'conduction' ? cd.heatRate : c.mode === 'convection' ? vd.heatRate : rd.netPower;
  const power = formatPower(rate);
  const formula = c.mode === 'conduction' ? 'Q̇ = kAΔT / L' : c.mode === 'convection' ? 'Q̇ ≈ hAΔT' : 'P = εσA(T⁴hot − T⁴cold)';
  return (
    <section className="sim-panel" aria-label="Live thermal measurements">
      <div className="sim-panel-header"><span className="sim-panel-title">Live data</span><span className="ml-auto font-mono text-[10px] text-accent-gold">{rate > 0 ? 'HOT → COLD' : 'EQUILIBRIUM'}</span></div>
      <div className="px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-star-white/40">{c.mode === 'conduction' ? 'Steady heat-transfer rate' : c.mode === 'convection' ? 'Estimated heater transfer rate' : 'Net radiative power'}</p>
        <div className="mt-1 flex items-baseline gap-2" data-testid="heat-rate"><span className="font-display text-3xl font-medium text-accent-gold">{power.v}</span><span className="font-mono text-sm text-accent-gold/70">{power.unit}</span></div>
        <code className="mt-2 block rounded-md border border-surface-border bg-space-900/40 px-2.5 py-2 font-mono text-xs text-accent-ice">{formula}</code>
        <p className="mt-2 font-mono text-[10px] text-star-white/35">Q: energy (J) · Q̇: rate (W = J/s)</p>
        <div className="mt-2 divide-y divide-surface-border">
          {c.mode === 'conduction' && <>
            <Reading label="Temperature difference ΔT" value={fmt(cd.deltaT)} unit="K" help="Temperature differences have the same numerical value in K and °C." />
            <Reading label="Conductivity k" value={fmt(cd.k)} unit="W/(m·K)" help="A material's ability to conduct thermal energy. Constant reference value in this model." />
            <Reading label="Length L" value={fmt(cd.length)} unit="m" />
            <Reading label="Area A (SI)" value={fmt(cd.area)} unit="m²" />
          </>}
          {c.mode === 'convection' && <>
            <Reading label="Temperature difference ΔT" value={fmt(vd.deltaT)} unit="K" />
            <Reading label="Heat-transfer coefficient h" value={fmt(vd.h)} unit="W/(m²·K)" help="Estimated from a heated horizontal plate correlation, not a CFD simulation." />
            <Reading label="Heated area A" value={fmt(vd.heaterArea)} unit="m²" />
            <Reading label="Rayleigh number Ra" value={fmt(vd.rayleigh)} help="Dimensionless measure of buoyancy relative to viscosity and thermal diffusion." />
            <Reading label="Correlation regime" value={vd.regime === 'none' ? 'No driving ΔT' : vd.regime === 'weak' ? 'Below valid range' : vd.regime} />
          </>}
          {c.mode === 'radiation' && <>
            <Reading label="Hot / cold absolute T" value={`${rd.hotK} / ${rd.coldK}`} unit="K" />
            <Reading label="Emissivity ε" value={rd.emissivity.toFixed(2)} help="Dimensionless efficiency relative to an ideal black body (ε = 1)." />
            <Reading label="Sphere area A = 4πr²" value={fmt(rd.area, 4)} unit="m²" />
            <Reading label="Emitted / absorbed" value={`${formatPowerText(rd.emittedPower)} / ${formatPowerText(rd.absorbedPower)}`} />
            <Reading label="Hot emission peak λmax" value={formatWavelength(rd.peakHot)} help="Wien's law: λmax = b/T. This system radiates mainly in the infrared." />
          </>}
        </div>
      </div>
    </section>
  );
}
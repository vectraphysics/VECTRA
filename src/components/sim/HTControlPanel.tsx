import type { HeatTransferControls } from '@/hooks/useHeatTransferSimulation';
import { MATERIALS, FLUIDS, SURFACES, CONDUCTION_LIMITS, RADIATION_LIMITS } from '@/lib/heatTransferPhysics';
import { HTParameterInput as Parameter } from './HTParameterInput';

const selectClass = 'w-full rounded-lg border border-surface-border bg-space-900 px-3 py-2.5 font-mono text-xs text-star-white outline-none focus:border-accent-cyan/50';

export function HTControlPanel({ controls: c }: { controls: HeatTransferControls }) {
  const p = c.conduction, f = c.convection, r = c.radiation;
  const material = c.conductionData.material, fluid = c.convectionData.fluid;
  const L = CONDUCTION_LIMITS, R = RADIATION_LIMITS;
  const surface = SURFACES.find((s) => Math.abs(s.emissivity - r.emissivity) < 1e-6);
  return <section className="sim-panel" aria-label="Experiment controls">
    <div className="sim-panel-header"><span className="sim-panel-title">Parameters</span></div>
    <div className="sim-panel-body">
      {c.mode === 'conduction' && <>
        <label className="flex flex-col gap-2 font-mono text-xs text-star-white/55">Material
          <select aria-label="Material" value={p.materialId} onChange={(e) => c.updateConduction({ materialId: e.target.value })} className={selectClass}>
            {MATERIALS.map((m) => <option key={m.id} value={m.id}>{m.name} · k = {m.k} W/(m·K)</option>)}
          </select>
        </label>
        <Parameter label="Hot-side temperature" value={p.hotC} min={p.coldC} max={material.maxC} step={1} unit="°C" onChange={(hotC) => c.updateConduction({ hotC })} />
        <Parameter label="Cold-side temperature" value={p.coldC} min={L.coldMinC} max={Math.min(p.hotC, L.coldMaxC, material.maxC)} step={1} unit="°C" onChange={(coldC) => c.updateConduction({ coldC })} />
        <Parameter label="Rod length L" value={p.length} min={L.lengthMin} max={L.lengthMax} step={0.01} unit="m" onChange={(length) => c.updateConduction({ length })} />
        <Parameter label="Cross-sectional area A" value={p.areaCm2} min={L.areaMinCm2} max={L.areaMaxCm2} step={0.1} unit="cm²" onChange={(areaCm2) => c.updateConduction({ areaCm2 })} help="1 cm² = 10⁻⁴ m². The equation always uses m²." />
        <div className="h-px bg-surface-border" />
        <Parameter label="Probe position x/L" value={c.probe} min={0} max={1} step={0.01} unit="" onChange={c.setProbe} help="Also draggable directly on the rod. Shows the steady temperature at this position." />
        <p className="font-mono text-[10px] leading-relaxed text-star-white/35">Hot side limited to {material.maxC} °C: {material.limitReason}. Area converted to m² internally.</p>
      </>}
      {c.mode === 'convection' && <>
        <label className="flex flex-col gap-2 font-mono text-xs text-star-white/55">Fluid
          <select aria-label="Fluid" value={f.fluidId} onChange={(e) => c.updateConvection({ fluidId: e.target.value })} className={selectClass}>
            {FLUIDS.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </label>
        <Parameter label="Heater temperature" value={f.heaterC} min={f.ambientC} max={fluid.heaterMaxC} step={1} unit="°C" onChange={(heaterC) => c.updateConvection({ heaterC })} />
        <Parameter label="Surrounding temperature" value={f.ambientC} min={fluid.ambientMinC} max={Math.min(f.heaterC, fluid.ambientMaxC)} step={1} unit="°C" onChange={(ambientC) => c.updateConvection({ ambientC })} />
        <Parameter label="Heating intensity" value={f.intensity * 100} min={20} max={100} step={1} unit="%" onChange={(intensity) => c.updateConvection({ intensity: intensity / 100 })} help="Intensity changes active heater area (20–100% of the base), with the heater held at its set temperature." />
        <p className="rounded-lg border border-surface-border bg-space-900/40 p-3 font-mono text-[10px] leading-relaxed text-star-white/40">Intensity = active heater coverage. More area at the same temperature transfers more energy. Vessel: 0.30 × 0.20 × 0.10 m.</p>
        <p className="font-mono text-[10px] leading-relaxed text-star-white/35">{fluid.limitReason}. Water stays above 10 °C to avoid its anomalous density behaviour near freezing.</p>
      </>}
      {c.mode === 'radiation' && <>
        <Parameter label="Hot-object temperature" value={r.hotK} min={Math.max(R.hotMinK, r.coldK)} max={R.hotMaxK} step={10} unit="K" onChange={(hotK) => c.updateRadiation({ hotK })} />
        <Parameter label="Cold-wall temperature" value={r.coldK} min={R.coldMinK} max={Math.min(R.coldMaxK, r.hotK)} step={1} unit="K" onChange={(coldK) => c.updateRadiation({ coldK })} />
        <label className="flex flex-col gap-2 font-mono text-xs text-star-white/55">Reference surface
          <select aria-label="Reference surface" value={surface?.id ?? 'custom'} onChange={(e) => { const s = SURFACES.find((v) => v.id === e.target.value); if (s) c.updateRadiation({ emissivity: s.emissivity }); }} className={selectClass}>
            <option value="custom">Custom grey surface</option>
            {SURFACES.map((s) => <option key={s.id} value={s.id}>{s.name} · ε = {s.emissivity}</option>)}
          </select>
        </label>
        <Parameter label="Emissivity ε" value={r.emissivity} min={R.emissivityMin} max={R.emissivityMax} step={0.01} unit="" onChange={(emissivity) => c.updateRadiation({ emissivity })} help="Fraction of blackbody emission. Unitless, between 0 and 1. In this grey-body model it is constant at every wavelength." />
        <p className="rounded-lg border border-accent-cyan/15 bg-accent-cyan/5 p-3 font-mono text-[10px] leading-relaxed text-star-white/50">Always use absolute temperatures in T⁴. Kelvin = °C + 273.15. Hot: {c.radiationData.hotC.toFixed(2)} °C · cold: {c.radiationData.coldC.toFixed(2)} °C.</p>
        <p className="font-mono text-[10px] leading-relaxed text-star-white/35">Radius fixed at 0.10 m. Surface finishes are reference ε values, not a model of melting or temperature-dependent emissivity.</p>
      </>}
    </div>
  </section>;
}
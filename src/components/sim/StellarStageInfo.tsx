import type { StellarStage } from '@/lib/stellarEvolution';

interface StellarStageInfoProps {
  stage: StellarStage | null;
}

export function StellarStageInfo({ stage }: StellarStageInfoProps) {
  if (!stage) return null;

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Stage Information</span>
      </div>
      <div className="sim-panel-body">
        {/* Stage name + description */}
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-base font-semibold text-star-white">
            {stage.name}
          </h3>
          <p className="font-body text-xs leading-relaxed text-star-white/45">
            {stage.description}
          </p>
          {stage.visualNote && (
            <div className="rounded-lg border border-accent-cyan/15 bg-accent-cyan/5 p-3">
              <span className="font-mono text-[0.62rem] uppercase tracking-widest text-accent-cyan/70">
                Scale and model note
              </span>
              <p className="mt-1 font-body text-xs leading-relaxed text-star-white/55">
                {stage.visualNote}
              </p>
            </div>
          )}
        </div>

        <div className="h-px bg-surface-border" />

        {/* Data rows */}
        <div className="sim-data-row">
          <span className="sim-data-label">Duration</span>
          <span className="sim-data-value text-xs">{stage.duration}</span>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Temperature</span>
          <span className="sim-data-value text-xs">{stage.temperature}</span>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Mass</span>
          <span className="sim-data-value text-xs">{stage.mass}</span>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Core Process</span>
          <span className="sim-data-value text-xs">{stage.coreProcess}</span>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Fusion</span>
          <span className="sim-data-value text-xs">{stage.fusionProcess}</span>
        </div>
        <div className="sim-data-row">
          <span className="sim-data-label">Outcome</span>
          <span className="sim-data-value text-xs text-accent-ice">{stage.finalOutcome}</span>
        </div>
      </div>
    </div>
  );
}

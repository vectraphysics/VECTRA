import type { StellarControls } from '@/hooks/useStellarSimulation';

interface StellarTimelineProps {
  controls: StellarControls;
}

export function StellarTimeline({ controls }: StellarTimelineProps) {
  const { stages, currentStageIndex, goToStage } = controls;

  return (
    <div className="sim-panel">
      <div className="sim-panel-header">
        <span className="sim-panel-title">Timeline</span>
        <span className="ml-auto font-mono text-xs text-star-white/30">
          {currentStageIndex + 1} / {stages.length}
        </span>
      </div>
      <div className="sim-panel-body">
        <div className="flex flex-col gap-1">
          {stages.map((stage, idx) => {
            const isActive = idx === currentStageIndex;
            const isPast = idx < currentStageIndex;
            return (
              <button
                key={stage.id}
                onClick={() => goToStage(idx)}
                className={`group flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all ${
                  isActive
                    ? 'border-accent-cyan/40 bg-accent-cyan/10'
                    : isPast
                    ? 'border-surface-border bg-space-700/20'
                    : 'border-surface-border bg-space-700/30 hover:border-surface-border-hover'
                }`}
              >
                {/* Stage indicator dot */}
                <span
                  className={`flex h-6 w-6 flex-none items-center justify-center rounded-full font-mono text-[0.7rem] ${
                    isActive
                      ? 'bg-accent-cyan/20 text-accent-cyan'
                      : isPast
                      ? 'bg-space-600 text-star-white/40'
                      : 'bg-space-600 text-star-white/30'
                  }`}
                >
                  {idx + 1}
                </span>
                {/* Stage name and duration */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={`truncate font-display text-xs font-medium ${
                      isActive ? 'text-accent-cyan' : 'text-star-white/55'
                    }`}
                  >
                    {stage.name}
                  </span>
                  <span className="truncate font-mono text-[0.65rem] text-star-white/30">
                    {stage.duration}
                  </span>
                </div>
                {/* Path indicator line */}
                {idx < stages.length - 1 && (
                  <span className="absolute" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

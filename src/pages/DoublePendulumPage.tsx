import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Pause, Play, RotateCcw, Waves } from 'lucide-react';
import {
  DEFAULT_DOUBLE_PENDULUM_PARAMETERS,
  calculateDoublePendulumEnergy,
  createDoublePendulumState,
  type DoublePendulumParameters,
} from '@/lib/doublePendulumPhysics';
import {
  useDoublePendulumCanvas,
  type DoublePendulumInitialAngles,
  type DoublePendulumMetrics,
} from '@/hooks/useDoublePendulumCanvas';
import './DoublePendulumPage.css';

const PRESETS: Array<{
  id: string;
  label: string;
  description: string;
  angles: DoublePendulumInitialAngles;
}> = [
  {
    id: 'regular',
    label: 'Gentle swing',
    description: 'A lower-energy starting position.',
    angles: { theta1: 24, theta2: 38 },
  },
  {
    id: 'chaotic',
    label: 'Chaotic release',
    description: 'A high-energy release with strongly coupled motion.',
    angles: { theta1: 120, theta2: -10 },
  },
  {
    id: 'inverted',
    label: 'Near inversion',
    description: 'Both arms begin close to the upright position.',
    angles: { theta1: 165, theta2: 150 },
  },
];

const INITIAL_ANGLES = PRESETS[1].angles;
const SPEEDS = [0.5, 1, 1.5] as const;

const initialState = createDoublePendulumState(
  INITIAL_ANGLES.theta1,
  INITIAL_ANGLES.theta2
);
const initialEnergy = calculateDoublePendulumEnergy(
  initialState,
  DEFAULT_DOUBLE_PENDULUM_PARAMETERS
);

const INITIAL_METRICS: DoublePendulumMetrics = {
  simulationTime: 0,
  kineticEnergy: initialEnergy.kinetic,
  potentialEnergy: initialEnergy.potential,
  totalEnergy: initialEnergy.total,
  energyDrift: 0,
  theta1Degrees: INITIAL_ANGLES.theta1,
  theta2Degrees: INITIAL_ANGLES.theta2,
};

interface RangeControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  digits?: number;
}

function RangeControl({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  digits = 2,
}: RangeControlProps) {
  return (
    <label className="dp-range-control" htmlFor={id}>
      <span className="dp-range-control__top">
        <span>{label}</span>
        <span className="dp-range-control__value">
          {value.toFixed(digits)} <span>{unit}</span>
        </span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="dp-range"
      />
      <span className="dp-range-control__limits" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </span>
    </label>
  );
}

function formatEnergy(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) > 0 && Math.abs(value) < 0.001) return value.toExponential(2);
  return value.toFixed(4);
}

function formatDrift(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0.0000';
  return value.toExponential(2);
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="dp-metric">
      <span>{label}</span>
      <strong>{value}<small>{unit}</small></strong>
    </div>
  );
}

export function DoublePendulumPage() {
  const [parameters, setParameters] = useState<DoublePendulumParameters>({
    ...DEFAULT_DOUBLE_PENDULUM_PARAMETERS,
  });
  const [initialAngles, setInitialAngles] = useState<DoublePendulumInitialAngles>({
    ...INITIAL_ANGLES,
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showTrail, setShowTrail] = useState(true);
  const [resetToken, setResetToken] = useState(0);
  const [metrics, setMetrics] = useState<DoublePendulumMetrics>(INITIAL_METRICS);

  const handleMetrics = useCallback((nextMetrics: DoublePendulumMetrics) => {
    setMetrics(nextMetrics);
  }, []);

  const canvasRef = useDoublePendulumCanvas({
    parameters,
    initialAngles,
    isPlaying,
    speedMultiplier,
    showTrail,
    resetToken,
    onMetrics: handleMetrics,
  });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsPlaying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setResetToken((token) => token + 1);
  }, []);

  const updateParameter = useCallback(
    <K extends keyof DoublePendulumParameters,>(key: K, value: number) => {
      setParameters((current) => ({ ...current, [key]: value }));
      setResetToken((token) => token + 1);
    },
    []
  );

  const updateAngle = useCallback((key: keyof DoublePendulumInitialAngles, value: number) => {
    setInitialAngles((current) => ({ ...current, [key]: value }));
    setResetToken((token) => token + 1);
  }, []);

  const applyPreset = useCallback((angles: DoublePendulumInitialAngles) => {
    setInitialAngles({ ...angles });
    setResetToken((token) => token + 1);
  }, []);

  const selectedPreset = PRESETS.find(
    (preset) => preset.angles.theta1 === initialAngles.theta1
      && preset.angles.theta2 === initialAngles.theta2
  );

  return (
    <div className="double-pendulum-page min-h-screen bg-space-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-surface-border bg-space-900/85 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="group flex items-center gap-2 font-display text-sm text-star-white/55 transition-colors hover:text-star-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              strokeWidth={1.5}
            />
            <span className="hidden sm:inline">Back to Simulations</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="3" fill="#5ec8d8" />
              <ellipse cx="14" cy="14" rx="11" ry="4.5" stroke="#a8d5e8" strokeOpacity="0.35" strokeWidth="1" transform="rotate(-20 14 14)" />
              <circle cx="24" cy="9" r="1.2" fill="#a8d5e8" />
            </svg>
            <span className="font-display text-sm font-semibold tracking-wider text-star-white">
              VECTRA
            </span>
          </div>
        </div>
      </header>

      <main className="pt-14">
        <div className="double-pendulum-layout">
          <section className="dp-visual-column" aria-label="Double-pendulum visualisation">
            <div className="dp-visual-header">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-cyan/65">
                  Classical mechanics / Nonlinear dynamics
                </p>
                <h1 className="mt-2 font-display text-2xl font-semibold tracking-wide text-star-white sm:text-3xl">
                  DOUBLE PENDULUM
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-star-white/45">
                  Two coupled pendulums. One deterministic system. Motion that can become difficult to predict.
                </p>
              </div>
              <span className={'dp-live-state ' + (isPlaying ? 'is-running' : '')}>
                <span aria-hidden="true" />
                {isPlaying ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>

            <div className="dp-canvas-frame">
              <canvas
                ref={canvasRef}
                className="dp-canvas"
                aria-label="Animated double pendulum. A first rod pivots from a fixed support and a second rod is attached to its moving end."
              >
                A double pendulum consists of two masses connected by two rigid rods, with the first rod attached to a fixed pivot.
              </canvas>
              <div className="dp-canvas-readout">
                <span><i className="dp-dot dp-dot--cyan" /> M₁ / first mass</span>
                <span><i className="dp-dot dp-dot--violet" /> M₂ / second mass</span>
              </div>
              <div className="dp-canvas-footnote">
                Planar model · massless rods · frictionless pivots
              </div>
            </div>

            <div className="dp-energy-strip" aria-label="Live system measurements">
              <Metric label="Simulation time" value={metrics.simulationTime.toFixed(2)} unit="s" />
              <Metric label="Kinetic energy" value={formatEnergy(metrics.kineticEnergy)} unit="J" />
              <Metric label="Potential energy" value={formatEnergy(metrics.potentialEnergy)} unit="J" />
              <Metric label="Total energy" value={formatEnergy(metrics.totalEnergy)} unit="J" />
              <Metric label="Energy drift" value={formatDrift(metrics.energyDrift)} unit="J" />
            </div>
            <p className="dp-energy-note">
              Energy drift is measured against the total mechanical energy at the current starting configuration. In this ideal lossless model, total energy should remain constant; small numerical drift is expected from finite-step integration.
            </p>
          </section>

          <aside className="dp-sidebar" aria-label="Double-pendulum controls and information">
            <section className="dp-panel">
              <div className="dp-panel-heading">
                <span>01 / Playback</span>
                <Activity className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="dp-panel-body">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((playing) => !playing)}
                    className="dp-primary-button"
                    aria-pressed={isPlaying}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Pause motion' : 'Resume motion'}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="dp-icon-button"
                    aria-label="Reset simulation to starting configuration"
                    title="Reset"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <span className="dp-control-label">Simulation speed</span>
                  <div className="dp-segmented-control">
                    {SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setSpeedMultiplier(speed)}
                        className={speedMultiplier === speed ? 'is-active' : ''}
                        aria-pressed={speedMultiplier === speed}
                      >
                        {speed.toFixed(1)}×
                      </button>
                    ))}
                  </div>
                </div>

                <label className="dp-checkbox-row mt-4">
                  <input
                    type="checkbox"
                    checked={showTrail}
                    onChange={(event) => setShowTrail(event.currentTarget.checked)}
                  />
                  <span>Show second-mass trajectory</span>
                </label>
              </div>
            </section>

            <section className="dp-panel">
              <div className="dp-panel-heading">
                <span>02 / Initial conditions</span>
                <Waves className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="dp-panel-body">
                <div className="dp-preset-grid">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.angles)}
                      className={selectedPreset?.id === preset.id ? 'is-active' : ''}
                      aria-pressed={selectedPreset?.id === preset.id}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {selectedPreset && (
                  <p className="dp-preset-description">{selectedPreset.description}</p>
                )}

                <div className="mt-5 space-y-4">
                  <RangeControl
                    id="dp-angle-one"
                    label="First angle (θ₁)"
                    value={initialAngles.theta1}
                    min={-180}
                    max={180}
                    step={1}
                    unit="°"
                    digits={0}
                    onChange={(value) => updateAngle('theta1', value)}
                  />
                  <RangeControl
                    id="dp-angle-two"
                    label="Second angle (θ₂)"
                    value={initialAngles.theta2}
                    min={-180}
                    max={180}
                    step={1}
                    unit="°"
                    digits={0}
                    onChange={(value) => updateAngle('theta2', value)}
                  />
                </div>
                <p className="dp-control-hint">
                  Both angles are measured from the downward vertical. The system is released from rest.
                </p>
              </div>
            </section>

            <section className="dp-panel">
              <div className="dp-panel-heading">
                <span>03 / System parameters</span>
                <span className="dp-unit-label">SI UNITS</span>
              </div>
              <div className="dp-panel-body space-y-5">
                <RangeControl
                  id="dp-mass-one"
                  label="First mass (m₁)"
                  value={parameters.mass1}
                  min={0.25}
                  max={3}
                  step={0.05}
                  unit="kg"
                  onChange={(value) => updateParameter('mass1', value)}
                />
                <RangeControl
                  id="dp-mass-two"
                  label="Second mass (m₂)"
                  value={parameters.mass2}
                  min={0.25}
                  max={3}
                  step={0.05}
                  unit="kg"
                  onChange={(value) => updateParameter('mass2', value)}
                />
                <RangeControl
                  id="dp-length-one"
                  label="First rod length (l₁)"
                  value={parameters.length1}
                  min={0.4}
                  max={1.8}
                  step={0.05}
                  unit="m"
                  onChange={(value) => updateParameter('length1', value)}
                />
                <RangeControl
                  id="dp-length-two"
                  label="Second rod length (l₂)"
                  value={parameters.length2}
                  min={0.4}
                  max={1.8}
                  step={0.05}
                  unit="m"
                  onChange={(value) => updateParameter('length2', value)}
                />
                <RangeControl
                  id="dp-gravity"
                  label="Gravitational field (g)"
                  value={parameters.gravity}
                  min={1}
                  max={20}
                  step={0.1}
                  unit="m/s²"
                  onChange={(value) => updateParameter('gravity', value)}
                />
              </div>
            </section>

            <details className="dp-panel dp-physics-details">
              <summary className="dp-panel-heading">
                <span>04 / Physics model</span>
                <span className="dp-details-indicator" aria-hidden="true">+</span>
              </summary>
              <div className="dp-panel-body space-y-3">
                <p className="dp-explanation">
                  The solver uses the Euler–Lagrange equations for two point masses connected by rigid, massless rods. The angles and angular velocities form a four-variable state.
                </p>
                <div className="dp-equation">
                  <span>Kinetic energy</span>
                  <code>
                    T = ½(m₁+m₂)l₁²ω₁² + ½m₂l₂²ω₂² + m₂l₁l₂ω₁ω₂cos(θ₁−θ₂)
                  </code>
                </div>
                <div className="dp-equation">
                  <span>Potential energy</span>
                  <code>
                    V = −(m₁+m₂)gl₁cosθ₁ − m₂gl₂cosθ₂
                  </code>
                </div>
                <div className="dp-equation">
                  <span>Mechanical energy</span>
                  <code>E = T + V</code>
                </div>
                <p className="dp-explanation">
                  A classical fourth-order Runge–Kutta method advances the equations in fixed 1/480-second steps. The drawing is interpolated between physics steps so motion stays smooth at different screen refresh rates.
                </p>
                <p className="dp-model-warning">
                  This is an idealised model. It does not include rod mass, bearing friction, air resistance, or energy loss.
                </p>
              </div>
            </details>
          </aside>
        </div>
      </main>
    </div>
  );
}

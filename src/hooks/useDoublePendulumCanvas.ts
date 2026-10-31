import { useEffect, useRef } from 'react';
import {
  calculateDoublePendulumEnergy,
  createDoublePendulumState,
  DOUBLE_PENDULUM_TIMESTEP,
  rk4DoublePendulumStep,
  type DoublePendulumParameters,
  type DoublePendulumState,
} from '@/lib/doublePendulumPhysics';

export interface DoublePendulumInitialAngles {
  theta1: number;
  theta2: number;
}

export interface DoublePendulumMetrics {
  simulationTime: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
  energyDrift: number;
  theta1Degrees: number;
  theta2Degrees: number;
}

interface CanvasConfiguration {
  parameters: DoublePendulumParameters;
  initialAngles: DoublePendulumInitialAngles;
  isPlaying: boolean;
  speedMultiplier: number;
  showTrail: boolean;
  resetToken: number;
  onMetrics: (metrics: DoublePendulumMetrics) => void;
}

const MAX_FRAME_SECONDS = 0.05;
const MAX_SUBSTEPS_PER_FRAME = 36;
const TRAIL_CAPACITY = 720;
const TRAIL_SAMPLE_EVERY = 4;
const TAU = Math.PI * 2;

function copyState(state: DoublePendulumState): DoublePendulumState {
  return {
    theta1: state.theta1,
    theta2: state.theta2,
    omega1: state.omega1,
    omega2: state.omega2,
  };
}

function interpolateState(
  previous: DoublePendulumState,
  current: DoublePendulumState,
  alpha: number
): DoublePendulumState {
  return {
    theta1: previous.theta1 + (current.theta1 - previous.theta1) * alpha,
    theta2: previous.theta2 + (current.theta2 - previous.theta2) * alpha,
    omega1: previous.omega1 + (current.omega1 - previous.omega1) * alpha,
    omega2: previous.omega2 + (current.omega2 - previous.omega2) * alpha,
  };
}

/**
 * Lightweight 2D renderer for the planar model. Physics runs at a fixed
 * timestep and is interpolated for drawing, so screen refresh rate does
 * not alter the simulated equations of motion.
 */
export function useDoublePendulumCanvas(configuration: CanvasConfiguration) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configurationRef = useRef(configuration);
  configurationRef.current = configuration;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext('2d', { alpha: false });

    if (!canvas || !container || !context) return;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let background: CanvasGradient | null = null;
    let animationId = 0;
    let lastTimestamp = 0;
    let accumulator = 0;
    let simulationTime = 0;
    let frameCounter = 0;
    let trailCursor = 0;
    let trailCount = 0;
    let trailSampleCounter = 0;
    let lastMetricsTimestamp = 0;
    let lastResetToken = configurationRef.current.resetToken;

    let state = createDoublePendulumState(
      configurationRef.current.initialAngles.theta1,
      configurationRef.current.initialAngles.theta2
    );
    let previousState = copyState(state);
    let initialEnergy = calculateDoublePendulumEnergy(
      state,
      configurationRef.current.parameters
    ).total;

    const trailX = new Float32Array(TRAIL_CAPACITY);
    const trailY = new Float32Array(TRAIL_CAPACITY);

    function modelToCanvas(
      theta1: number,
      theta2: number,
      parameters: DoublePendulumParameters
    ) {
      const firstX = parameters.length1 * Math.sin(theta1);
      const firstY = parameters.length1 * Math.cos(theta1);
      const secondX = firstX + parameters.length2 * Math.sin(theta2);
      const secondY = firstY + parameters.length2 * Math.cos(theta2);

      return { firstX, firstY, secondX, secondY };
    }

    function recordTrail(current: DoublePendulumState) {
      const parameters = configurationRef.current.parameters;
      const point = modelToCanvas(current.theta1, current.theta2, parameters);

      trailX[trailCursor] = point.secondX;
      trailY[trailCursor] = point.secondY;
      trailCursor = (trailCursor + 1) % TRAIL_CAPACITY;
      trailCount = Math.min(trailCount + 1, TRAIL_CAPACITY);
    }

    function emitMetrics() {
      const config = configurationRef.current;
      const energy = calculateDoublePendulumEnergy(state, config.parameters);

      config.onMetrics({
        simulationTime,
        kineticEnergy: energy.kinetic,
        potentialEnergy: energy.potential,
        totalEnergy: energy.total,
        energyDrift: energy.total - initialEnergy,
        theta1Degrees: (state.theta1 * 180) / Math.PI,
        theta2Degrees: (state.theta2 * 180) / Math.PI,
      });
    }

    function resetSimulation() {
      const config = configurationRef.current;
      state = createDoublePendulumState(
        config.initialAngles.theta1,
        config.initialAngles.theta2
      );
      previousState = copyState(state);
      simulationTime = 0;
      accumulator = 0;
      trailCursor = 0;
      trailCount = 0;
      trailSampleCounter = 0;
      initialEnergy = calculateDoublePendulumEnergy(state, config.parameters).total;
      recordTrail(state);
      emitMetrics();
    }

    function resize() {
      const bounds = container.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, '#07101f');
      background.addColorStop(0.55, '#080d1b');
      background.addColorStop(1, '#050914');
      draw(interpolateState(previousState, state, 1));
    }

    function drawTrail(
      pivotX: number,
      pivotY: number,
      scale: number,
      showTrail: boolean
    ) {
      if (!showTrail || trailCount < 2) return;

      const parameters = configurationRef.current.parameters;
      const start = trailCount === TRAIL_CAPACITY ? trailCursor : 0;

      context.beginPath();
      for (let i = 0; i < trailCount; i += 1) {
        const index = (start + i) % TRAIL_CAPACITY;
        const x = pivotX + trailX[index] * scale;
        const y = pivotY + trailY[index] * scale;

        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.strokeStyle = 'rgba(116, 224, 239, 0.14)';
      context.lineWidth = Math.max(1, Math.min(2, parameters.mass2));
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.stroke();
    }

    function draw(current: DoublePendulumState) {
      const config = configurationRef.current;
      const parameters = config.parameters;
      const totalLength = parameters.length1 + parameters.length2;
      if (width <= 1 || height <= 1 || totalLength <= 0) return;

      context.clearRect(0, 0, width, height);
      context.fillStyle = background ?? '#080d1b';
      context.fillRect(0, 0, width, height);

      // Low-contrast instrument grid.
      context.strokeStyle = 'rgba(145, 174, 218, 0.045)';
      context.lineWidth = 1;
      context.beginPath();
      const gridSpacing = 44;
      for (let x = gridSpacing; x < width; x += gridSpacing) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
      }
      for (let y = gridSpacing; y < height; y += gridSpacing) {
        context.moveTo(0, y);
        context.lineTo(width, y);
      }
      context.stroke();

      const pivotX = width * 0.5;
      const pivotY = height * 0.17;
      const scale = Math.min(
        (width * 0.42) / totalLength,
        ((height - pivotY - 30) * 0.82) / totalLength
      );

      // Downward reference axis.
      context.save();
      context.setLineDash([4, 8]);
      context.strokeStyle = 'rgba(168, 213, 232, 0.12)';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(pivotX, pivotY);
      context.lineTo(pivotX, height - 16);
      context.stroke();
      context.restore();

      const points = modelToCanvas(current.theta1, current.theta2, parameters);
      const jointX = pivotX + points.firstX * scale;
      const jointY = pivotY + points.firstY * scale;
      const bobX = pivotX + points.secondX * scale;
      const bobY = pivotY + points.secondY * scale;

      drawTrail(pivotX, pivotY, scale, config.showTrail);

      // Rods: a soft light edge and a crisp inner stroke.
      context.lineCap = 'round';
      context.shadowBlur = 15;
      context.shadowColor = 'rgba(94, 200, 216, 0.26)';
      context.strokeStyle = 'rgba(172, 222, 238, 0.58)';
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(pivotX, pivotY);
      context.lineTo(jointX, jointY);
      context.lineTo(bobX, bobY);
      context.stroke();

      context.shadowBlur = 0;
      context.strokeStyle = 'rgba(233, 246, 255, 0.82)';
      context.lineWidth = 1.35;
      context.beginPath();
      context.moveTo(pivotX, pivotY);
      context.lineTo(jointX, jointY);
      context.lineTo(bobX, bobY);
      context.stroke();

      // Joint and masses.
      const radius1 = Math.max(6, Math.min(12, 5 + parameters.mass1 * 2.1));
      const radius2 = Math.max(7, Math.min(14, 5 + parameters.mass2 * 2.4));

      context.shadowColor = '#62d6e7';
      context.shadowBlur = 18;
      context.fillStyle = '#70dbe9';
      context.beginPath();
      context.arc(jointX, jointY, radius1, 0, TAU);
      context.fill();

      context.shadowColor = '#a99cff';
      context.shadowBlur = 21;
      context.fillStyle = '#b8aaff';
      context.beginPath();
      context.arc(bobX, bobY, radius2, 0, TAU);
      context.fill();
      context.shadowBlur = 0;

      context.fillStyle = 'rgba(255,255,255,0.75)';
      context.beginPath();
      context.arc(jointX - radius1 * 0.28, jointY - radius1 * 0.28, radius1 * 0.24, 0, TAU);
      context.fill();
      context.beginPath();
      context.arc(bobX - radius2 * 0.28, bobY - radius2 * 0.28, radius2 * 0.24, 0, TAU);
      context.fill();

      context.strokeStyle = 'rgba(226, 240, 255, 0.7)';
      context.lineWidth = 1;
      context.beginPath();
      context.arc(pivotX, pivotY, 8, 0, TAU);
      context.stroke();
      context.fillStyle = '#d8f3fa';
      context.beginPath();
      context.arc(pivotX, pivotY, 3, 0, TAU);
      context.fill();
    }

    function frame(timestamp: number) {
      if (document.hidden) {
        animationId = 0;
        lastTimestamp = 0;
        return;
      }

      const config = configurationRef.current;
      if (config.resetToken !== lastResetToken) {
        lastResetToken = config.resetToken;
        resetSimulation();
      }

      if (lastTimestamp > 0 && config.isPlaying) {
        const elapsedFrame = Math.min(
          Math.max((timestamp - lastTimestamp) / 1000, 0),
          MAX_FRAME_SECONDS
        );
        accumulator += elapsedFrame * config.speedMultiplier;

        let steps = 0;
        while (
          accumulator >= DOUBLE_PENDULUM_TIMESTEP
          && steps < MAX_SUBSTEPS_PER_FRAME
        ) {
          previousState = copyState(state);
          state = rk4DoublePendulumStep(
            state,
            config.parameters,
            DOUBLE_PENDULUM_TIMESTEP
          );
          accumulator -= DOUBLE_PENDULUM_TIMESTEP;
          simulationTime += DOUBLE_PENDULUM_TIMESTEP;
          steps += 1;

          trailSampleCounter += 1;
          if (config.showTrail && trailSampleCounter >= TRAIL_SAMPLE_EVERY) {
            recordTrail(state);
            trailSampleCounter = 0;
          }
        }

        // Discard excess backlog rather than allowing a slow device to spiral.
        if (steps === MAX_SUBSTEPS_PER_FRAME && accumulator >= DOUBLE_PENDULUM_TIMESTEP) {
          accumulator %= DOUBLE_PENDULUM_TIMESTEP;
        }
      }

      if (!config.isPlaying) {
        accumulator = 0;
        previousState = copyState(state);
      }

      const alpha = Math.max(
        0,
        Math.min(1, accumulator / DOUBLE_PENDULUM_TIMESTEP)
      );
      draw(interpolateState(previousState, state, alpha));

      frameCounter += 1;
      if (timestamp - lastMetricsTimestamp >= 140) {
        emitMetrics();
        lastMetricsTimestamp = timestamp;
      }

      lastTimestamp = timestamp;
      animationId = requestAnimationFrame(frame);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        if (animationId) cancelAnimationFrame(animationId);
        animationId = 0;
        lastTimestamp = 0;
      } else if (!animationId) {
        lastTimestamp = 0;
        animationId = requestAnimationFrame(frame);
      }
    }

    resize();
    emitMetrics();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationId = requestAnimationFrame(frame);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return canvasRef;
}

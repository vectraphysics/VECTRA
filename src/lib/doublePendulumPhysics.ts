/**
 * Ideal planar double-pendulum dynamics.
 *
 * Model assumptions:
 * - Two point masses joined by massless, rigid rods.
 * - Frictionless pivots and no air resistance.
 * - Angles are measured from the downward vertical, positive to the right.
 * - SI units: kg, m, s and m/s².
 *
 * The closed-form angular accelerations are derived from the Euler–Lagrange
 * equations. They are algebraically equivalent to solving the coupled 2×2
 * mass-matrix system and are adapted from PhysicsHub's MIT-licensed model.
 */

export interface DoublePendulumParameters {
  mass1: number;
  mass2: number;
  length1: number;
  length2: number;
  gravity: number;
}

export interface DoublePendulumState {
  theta1: number;
  theta2: number;
  omega1: number;
  omega2: number;
}

export interface DoublePendulumEnergy {
  kinetic: number;
  potential: number;
  total: number;
}

type StateVector = readonly [number, number, number, number];

export const DEFAULT_DOUBLE_PENDULUM_PARAMETERS: DoublePendulumParameters = {
  mass1: 1,
  mass2: 1,
  length1: 1,
  length2: 1,
  gravity: 9.81,
};

export const DOUBLE_PENDULUM_TIMESTEP = 1 / 480;

function validateParameters(parameters: DoublePendulumParameters): void {
  const { mass1, mass2, length1, length2, gravity } = parameters;
  const values = [mass1, mass2, length1, length2, gravity];

  if (!values.every(Number.isFinite)) {
    throw new RangeError('Double-pendulum parameters must all be finite numbers.');
  }

  if (mass1 <= 0 || mass2 <= 0 || length1 <= 0 || length2 <= 0 || gravity < 0) {
    throw new RangeError(
      'Masses and rod lengths must be positive, and gravitational field strength cannot be negative.'
    );
  }
}

function validateState(state: DoublePendulumState): void {
  if (![state.theta1, state.theta2, state.omega1, state.omega2].every(Number.isFinite)) {
    throw new RangeError('Double-pendulum angles and angular velocities must be finite.');
  }
}

export function createDoublePendulumState(
  theta1Degrees: number,
  theta2Degrees: number
): DoublePendulumState {
  if (!Number.isFinite(theta1Degrees) || !Number.isFinite(theta2Degrees)) {
    throw new RangeError('Initial angles must be finite numbers.');
  }

  const degreesToRadians = Math.PI / 180;

  return {
    theta1: theta1Degrees * degreesToRadians,
    theta2: theta2Degrees * degreesToRadians,
    omega1: 0,
    omega2: 0,
  };
}

/**
 * Closed-form Euler–Lagrange accelerations, adapted from PhysicsHub's
 * DoublePendulum.jsx (MIT licensed). The source includes optional damping;
 * this implementation uses its conservative case (damping = 0).
 *
 * Source: https://github.com/physicshub/physicshub.github.io/blob/bf7637238edf40e7b34021c43dc2abf45248f4db/simulations/DoublePendulum.jsx
 */
function acceleration(
  theta1: number,
  theta2: number,
  omega1: number,
  omega2: number,
  parameters: DoublePendulumParameters
): readonly [number, number] {
  const { mass1: m1, mass2: m2, length1: l1, length2: l2, gravity: g } = parameters;
  const delta = theta1 - theta2;
  const sinDelta = Math.sin(delta);
  const cosDelta = Math.cos(delta);
  const denominator = 2 * m1 + m2 - m2 * Math.cos(2 * delta);

  // The positive input constraints guarantee denominator >= 2m1 > 0.
  const alpha1 = (
    -g * (2 * m1 + m2) * Math.sin(theta1)
    - m2 * g * Math.sin(theta1 - 2 * theta2)
    - 2 * sinDelta * m2 * (
      omega2 * omega2 * l2 + omega1 * omega1 * l1 * cosDelta
    )
  ) / (l1 * denominator);

  const alpha2 = (
    2 * sinDelta * (
      omega1 * omega1 * l1 * (m1 + m2)
      + g * (m1 + m2) * Math.cos(theta1)
      + omega2 * omega2 * l2 * m2 * cosDelta
    )
  ) / (l2 * denominator);

  return [alpha1, alpha2];
}

function derivative(
  state: StateVector,
  parameters: DoublePendulumParameters
): StateVector {
  const [theta1, theta2, omega1, omega2] = state;
  const [alpha1, alpha2] = acceleration(theta1, theta2, omega1, omega2, parameters);

  return [omega1, omega2, alpha1, alpha2];
}

function addScaled(
  state: StateVector,
  slope: StateVector,
  scale: number
): StateVector {
  return [
    state[0] + slope[0] * scale,
    state[1] + slope[1] * scale,
    state[2] + slope[2] * scale,
    state[3] + slope[3] * scale,
  ];
}

/**
 * Advance one classical fourth-order Runge–Kutta step.
 * The caller supplies a fixed timestep; the animation frame rate must not.
 */
export function rk4DoublePendulumStep(
  state: DoublePendulumState,
  parameters: DoublePendulumParameters,
  dt = DOUBLE_PENDULUM_TIMESTEP
): DoublePendulumState {
  validateParameters(parameters);
  validateState(state);

  if (!(dt > 0) || !Number.isFinite(dt)) {
    throw new RangeError('The integration timestep must be finite and positive.');
  }

  // Classical RK4 stage sequence, adapted to a fixed-size typed state vector.
  // PhysicsHub reference: app/(core)/engine/integrators.js (MIT licensed).
  // https://github.com/physicshub/physicshub.github.io/blob/bf7637238edf40e7b34021c43dc2abf45248f4db/app/(core)/engine/integrators.js
  const current: StateVector = [state.theta1, state.theta2, state.omega1, state.omega2];
  const halfStep = dt * 0.5;

  const k1 = derivative(current, parameters);
  const k2 = derivative(addScaled(current, k1, halfStep), parameters);
  const k3 = derivative(addScaled(current, k2, halfStep), parameters);
  const k4 = derivative(addScaled(current, k3, dt), parameters);

  const next: StateVector = [
    current[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    current[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    current[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    current[3] + (dt / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]),
  ];

  if (!next.every(Number.isFinite)) {
    throw new Error('The double-pendulum integrator produced a non-finite state.');
  }

  return {
    theta1: next[0],
    theta2: next[1],
    omega1: next[2],
    omega2: next[3],
  };
}

/** Mechanical energy for the ideal, undamped system. */
export function calculateDoublePendulumEnergy(
  state: DoublePendulumState,
  parameters: DoublePendulumParameters
): DoublePendulumEnergy {
  validateParameters(parameters);
  validateState(state);

  const { theta1, theta2, omega1, omega2 } = state;
  const { mass1: m1, mass2: m2, length1: l1, length2: l2, gravity: g } = parameters;
  const delta = theta1 - theta2;

  const kinetic =
    0.5 * (m1 + m2) * l1 * l1 * omega1 * omega1
    + 0.5 * m2 * l2 * l2 * omega2 * omega2
    + m2 * l1 * l2 * omega1 * omega2 * Math.cos(delta);

  const potential =
    -(m1 + m2) * g * l1 * Math.cos(theta1)
    - m2 * g * l2 * Math.cos(theta2);

  return {
    kinetic,
    potential,
    total: kinetic + potential,
  };
}

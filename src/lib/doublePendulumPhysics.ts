/**
 * Ideal planar double-pendulum dynamics.
 *
 * Model assumptions:
 * - Two point masses joined by massless, rigid rods.
 * - Frictionless pivots and no air resistance.
 * - Angles are measured from the downward vertical, positive to the right.
 * - SI units: kg, m, s and m/s².
 *
 * The equations are obtained from the Euler–Lagrange equations. The coupled
 * angular accelerations are found by solving the 2×2 mass-matrix system.
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

  // M(q) · [alpha1, alpha2]ᵀ = force(q, q̇)
  const matrix11 = (m1 + m2) * l1 * l1;
  const matrix12 = m2 * l1 * l2 * cosDelta;
  const matrix22 = m2 * l2 * l2;

  const force1 =
    -m2 * l1 * l2 * sinDelta * omega2 * omega2
    - (m1 + m2) * g * l1 * Math.sin(theta1);

  const force2 =
    m2 * l1 * l2 * sinDelta * omega1 * omega1
    - m2 * g * l2 * Math.sin(theta2);

  const determinant = matrix11 * matrix22 - matrix12 * matrix12;

  // Positive masses and lengths make this matrix positive definite.
  if (!(determinant > 0) || !Number.isFinite(determinant)) {
    throw new RangeError('Double-pendulum parameters must be finite and strictly positive.');
  }

  const alpha1 = (force1 * matrix22 - matrix12 * force2) / determinant;
  const alpha2 = (matrix11 * force2 - matrix12 * force1) / determinant;

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

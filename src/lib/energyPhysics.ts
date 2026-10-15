export const STANDARD_GRAVITY = 9.8;

export function kineticEnergy(massKg: number, speedMps: number): number {
  return 0.5 * massKg * speedMps ** 2;
}

export function gravitationalPotentialEnergy(massKg: number, heightM: number, gravity = STANDARD_GRAVITY): number {
  return massKg * gravity * heightM;
}

export function workByConstantForce(forceN: number, displacementM: number, angleDegrees = 0): number {
  return forceN * displacementM * Math.cos((angleDegrees * Math.PI) / 180);
}

export function averagePower(energyJ: number, timeS: number): number | null {
  return timeS > 0 ? energyJ / timeS : null;
}

export function efficiencyPercent(usefulOutput: number, totalInput: number): number | null {
  return totalInput > 0 ? (usefulOutput / totalInput) * 100 : null;
}

export function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

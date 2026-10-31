export interface MomentumState {
  massKg: number;
  velocityMps: number;
}

export interface CollisionResult {
  finalVelocityAMps: number;
  finalVelocityBMps: number;
  initialMomentumKgMps: number;
  finalMomentumKgMps: number;
  momentumDifferenceKgMps: number;
  initialKineticEnergyJ: number;
  finalKineticEnergyJ: number;
}

export type CollisionMode = 'stick' | 'elastic' | 'explosion';

export function momentum(massKg: number, velocityMps: number): number {
  return massKg * velocityMps;
}

export function impulse(changeInMomentumKgMps: number): number {
  return changeInMomentumKgMps;
}

export function averageNetForce(impulseNs: number, timeS: number): number | null {
  return timeS > 0 ? impulseNs / timeS : null;
}

export function kineticEnergyFromMomentum(massKg: number, velocityMps: number): number {
  return 0.5 * massKg * velocityMps ** 2;
}

export function solveCollision(
  massAKg: number,
  massBKg: number,
  initialVelocityAMps: number,
  initialVelocityBMps: number,
  mode: CollisionMode,
  explosionImpulseNs = 10,
): CollisionResult {
  if (![massAKg, massBKg].every((mass) => Number.isFinite(mass) && mass > 0)) {
    throw new RangeError('Both object masses must be greater than zero.');
  }
  if (![initialVelocityAMps, initialVelocityBMps, explosionImpulseNs].every(Number.isFinite)) {
    throw new RangeError('Inputs must be finite numbers.');
  }

  let finalVelocityAMps: number;
  let finalVelocityBMps: number;
  const totalMass = massAKg + massBKg;

  if (mode === 'explosion') {
    finalVelocityAMps = -explosionImpulseNs / massAKg;
    finalVelocityBMps = explosionImpulseNs / massBKg;
  } else if (mode === 'stick') {
    const commonVelocity = momentum(massAKg, initialVelocityAMps) + momentum(massBKg, initialVelocityBMps);
    finalVelocityAMps = commonVelocity / totalMass;
    finalVelocityBMps = finalVelocityAMps;
  } else {
    finalVelocityAMps = ((massAKg - massBKg) * initialVelocityAMps + 2 * massBKg * initialVelocityBMps) / totalMass;
    finalVelocityBMps = (2 * massAKg * initialVelocityAMps + (massBKg - massAKg) * initialVelocityBMps) / totalMass;
  }

  const initialMomentumKgMps = mode === 'explosion' ? 0 : momentum(massAKg, initialVelocityAMps) + momentum(massBKg, initialVelocityBMps);
  const finalMomentumKgMps = momentum(massAKg, finalVelocityAMps) + momentum(massBKg, finalVelocityBMps);
  const initialKineticEnergyJ = mode === 'explosion' ? 0 : kineticEnergyFromMomentum(massAKg, initialVelocityAMps) + kineticEnergyFromMomentum(massBKg, initialVelocityBMps);
  const finalKineticEnergyJ = kineticEnergyFromMomentum(massAKg, finalVelocityAMps) + kineticEnergyFromMomentum(massBKg, finalVelocityBMps);

  return {
    finalVelocityAMps,
    finalVelocityBMps,
    initialMomentumKgMps,
    finalMomentumKgMps,
    momentumDifferenceKgMps: finalMomentumKgMps - initialMomentumKgMps,
    initialKineticEnergyJ,
    finalKineticEnergyJ,
  };
}

export function isKineticEnergyConserved(result: CollisionResult, tolerance = 1e-8): boolean {
  return Math.abs(result.finalKineticEnergyJ - result.initialKineticEnergyJ) <= tolerance * Math.max(1, Math.abs(result.initialKineticEnergyJ));
}

export function formatSigned(value: number, decimals = 2): string {
  if (Math.abs(value) < 0.5 * 10 ** -decimals) return (0).toFixed(decimals);
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}`;
}

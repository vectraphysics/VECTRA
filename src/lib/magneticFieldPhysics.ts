import * as THREE from 'three';

/**
 * Magnetic dipole field physics.
 *
 * For a magnetic dipole with moment m oriented along a direction û, the field
 * at position r (relative to the dipole center) is:
 *
 *   B(r) = (μ₀ / 4π) · [3(m·r̂)r̂ - m] / r³
 *
 * We work in normalized units where (μ₀/4π) = 1 and m = strength · û.
 *
 * Displayed paths are traced by integrating along B̂ from seed points near
 * the north pole. This view shows the exterior dipole paths, not the return
 * path through the inside of the magnet.
 */

export interface MagnetParameters {
  strength: number;    // dipole moment magnitude (normalized)
  orientation: number; // rotation about Y axis in degrees
  lineDensity: number; // number of displayed field lines per ring
  vizScale: number;    // visual scale multiplier
}

export const DEFAULT_MAGNET_PARAMS: MagnetParameters = {
  strength: 100,
  orientation: 0,
  lineDensity: 12,
  vizScale: 1,
};

export interface ProbeData {
  position: THREE.Vector3;
  field: THREE.Vector3;
  magnitude: number;
  normalizedStrength: number;
  distance: number;
}

/**
 * Compute the magnetic dipole field at a given position.
 * The dipole is at the origin, oriented along the Z axis by default.
 * The orientation parameter rotates the dipole about the Y axis.
 *
 * @param pos - position relative to dipole center
 * @param strength - dipole moment magnitude
 * @param orientationDeg - rotation about Y axis in degrees
 */
export function dipoleField(
  pos: THREE.Vector3,
  strength: number,
  orientationDeg: number
): THREE.Vector3 {
  // Transform position into the dipole's local frame (rotate by -orientation)
  const angle = -THREE.MathUtils.degToRad(orientationDeg);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const lx = pos.x * cos + pos.z * sin;
  const lz = -pos.x * sin + pos.z * cos;
  const ly = pos.y;

  const r2 = lx * lx + ly * ly + lz * lz;
  if (r2 < 0.01) return new THREE.Vector3(0, 0, 0);

  const r = Math.sqrt(r2);
  const r3 = r2 * r;

  // Dipole moment along Z in local frame: m = (0, 0, strength)
  // m·r̂ = strength * lz / r
  const mDotR = strength * lz / r;

  // B = [3(m·r̂)r̂ - m] / r³
  // r̂ = (lx, ly, lz) / r
  const bx = 3 * mDotR * lx / r / r3;
  const by = 3 * mDotR * ly / r / r3;
  const bz = (3 * mDotR * lz / r - strength) / r3;

  // Rotate back to world frame
  const wx = bx * cos - bz * sin;
  const wz = bx * sin + bz * cos;
  return new THREE.Vector3(wx, by, wz);
}

/**
 * Trace a single field line starting from a seed position.
 * Steps along the field direction using RK4 integration.
 * Returns an array of points forming the line.
 */
export function traceFieldLine(
  seed: THREE.Vector3,
  strength: number,
  orientationDeg: number,
  maxSteps = 600,
  stepSize = 0.4
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  let pos = seed.clone();
  const magnetRadius = 2.5;

  // Trace forward (from N pole outward)
  for (let i = 0; i < maxSteps; i++) {
    points.push(pos.clone());

    // RK4 step along B
    const k1 = dipoleField(pos, strength, orientationDeg).normalize();
    const p2 = pos.clone().addScaledVector(k1, stepSize * 0.5);
    const k2 = dipoleField(p2, strength, orientationDeg).normalize();
    const p3 = pos.clone().addScaledVector(k2, stepSize * 0.5);
    const k3 = dipoleField(p3, strength, orientationDeg).normalize();
    const p4 = pos.clone().addScaledVector(k3, stepSize);
    const k4 = dipoleField(p4, strength, orientationDeg).normalize();

    const dir = new THREE.Vector3()
      .addScaledVector(k1, 1 / 6)
      .addScaledVector(k2, 1 / 3)
      .addScaledVector(k3, 1 / 3)
      .addScaledVector(k4, 1 / 6)
      .normalize();

    pos = pos.addScaledVector(dir, stepSize);

    // Stop if we re-enter the magnet
    if (pos.length() < magnetRadius) {
      points.push(pos.clone());
      break;
    }

    // Stop if too far away
    if (pos.length() > 200) break;
  }

  return points;
}

/**
 * Generate seed points around the north pole for field-line tracing.
 * Seeds are distributed on rings around the pole at different angles.
 */
export function generateSeedPoints(
  density: number,
  orientationDeg: number
): THREE.Vector3[] {
  const seeds: THREE.Vector3[] = [];
  const magnetHalfLength = 2.0;
  const poleRadius = 1.0;

  // North pole position in local frame (along Z)
  const angle = THREE.MathUtils.degToRad(orientationDeg);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Rings at different distances from the pole
  const rings = [0.2, 0.5, 0.8];

  for (const ring of rings) {
    const ringRadius = poleRadius * ring;
    const count = Math.max(4, Math.floor(density * ring));

    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      // Seed just outside the north pole surface
      const lx = ringRadius * Math.cos(theta);
      const ly = ringRadius * Math.sin(theta);
      const lz = magnetHalfLength + 0.15;

      // Rotate to world frame
      const wx = lx * cos + lz * sin;
      const wz = -lx * sin + lz * cos;
      seeds.push(new THREE.Vector3(wx, ly, wz));
    }
  }

  return seeds;
}

/**
 * Compute probe data at a given position.
 */
export function computeProbeData(
  pos: THREE.Vector3,
  strength: number,
  orientationDeg: number
): ProbeData {
  const field = dipoleField(pos, strength, orientationDeg);
  const magnitude = field.length();
  const distance = pos.length();
  // Normalize relative to a reference field at distance 5
  const refField = dipoleField(new THREE.Vector3(5, 0, 0), strength, 0).length();
  const normalizedStrength = refField > 0 ? magnitude / refField : 0;

  return {
    position: pos.clone(),
    field,
    magnitude,
    normalizedStrength,
    distance,
  };
}

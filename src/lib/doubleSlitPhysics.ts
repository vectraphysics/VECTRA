/**
 * Double-slit experiment physics.
 *
 * The probability distribution for detecting a particle at position y on the
 * screen is governed by the double-slit interference formula modulated by a
 * single-slit diffraction envelope:
 *
 *   I(y) ∝ [sin(β)/β]² · cos²(α)
 *
 * where:
 *   β = (π · a · sinθ) / λ      (single-slit diffraction term)
 *   α = (π · d · sinθ) / λ      (double-slit interference term)
 *   θ ≈ y / L                    (small-angle approximation)
 *   a = slit width
 *   d = slit separation
 *   L = screen distance
 *   λ = wavelength
 *
 * For single-slit mode, only the diffraction envelope [sin(β)/β]² applies.
 */

export type SlitMode = 'double' | 'single';
export type ParticleType = 'photon' | 'electron';

export interface DoubleSlitParameters {
  wavelength: number;    // λ — arbitrary units, 1–100
  slitSeparation: number; // d — arbitrary units, 10–200
  slitWidth: number;      // a — arbitrary units, 2–60
  screenDistance: number; // L — arbitrary units, 50–500
  emissionRate: number;   // particles per second, 1–200
}

export interface DoubleSlitDerivedData {
  fringeSpacing: number; // Δy = λL / d — screen units
  firstMinimum: number;  // y₁ = λL / a — first diffraction minimum
  maxAngle: number;       // maximum detection angle (rad)
}

export const DEFAULT_DS_PARAMS: DoubleSlitParameters = {
  wavelength: 30,
  slitSeparation: 80,
  slitWidth: 15,
  screenDistance: 300,
  emissionRate: 50,
};

export function deriveDSData(p: DoubleSlitParameters): DoubleSlitDerivedData {
  const fringeSpacing = p.slitSeparation > 0 ? (p.wavelength * p.screenDistance) / p.slitSeparation : 0;
  const firstMinimum = p.slitWidth > 0 ? (p.wavelength * p.screenDistance) / p.slitWidth : 0;
  const maxAngle = Math.atan(200 / p.screenDistance);
  return { fringeSpacing, firstMinimum, maxAngle };
}

/**
 * Compute the probability density at a given screen position y.
 * Uses small-angle: sinθ ≈ tanθ ≈ y/L.
 *
 * Double-slit: I ∝ [sinc(β)]² · cos²(α)
 * Single-slit: I ∝ [sinc(β)]²
 *
 * where sinc(x) = sin(x)/x, with sinc(0) = 1.
 */
export function probabilityAtY(
  y: number,
  p: DoubleSlitParameters,
  mode: SlitMode
): number {
  const sinTheta = y / p.screenDistance;
  const beta = (Math.PI * p.slitWidth * sinTheta) / p.wavelength;
  const alpha = (Math.PI * p.slitSeparation * sinTheta) / p.wavelength;

  // sinc²(β) — diffraction envelope
  const sinc = Math.abs(beta) < 1e-10 ? 1 : Math.sin(beta) / beta;
  const envelope = sinc * sinc;

  if (mode === 'single') {
    return envelope;
  }

  // cos²(α) — interference term
  const interference = Math.cos(alpha) ** 2;

  return envelope * interference;
}

/**
 * Sample a detection position from the probability distribution using
 * rejection sampling. This ensures the pattern emerges statistically
 * from individual random events, not from a predetermined curve.
 *
 * Returns a y position in screen units (relative to center).
 */
export function sampleDetectionPosition(
  p: DoubleSlitParameters,
  mode: SlitMode,
  maxScreenY: number
): number {
  // Try up to 100 rejection samples
  for (let i = 0; i < 100; i++) {
    const y = (Math.random() * 2 - 1) * maxScreenY;
    const prob = probabilityAtY(y, p, mode);
    if (Math.random() < prob) {
      return y;
    }
  }
  // Fallback: return a small random position
  return (Math.random() * 2 - 1) * maxScreenY * 0.3;
}

/**
 * Compute the theoretical distribution as an array of {y, prob} points
 * for overlaying on the detector.
 */
export function theoreticalDistribution(
  p: DoubleSlitParameters,
  mode: SlitMode,
  maxScreenY: number,
  samples = 400
): { y: number; prob: number }[] {
  const result: { y: number; prob: number }[] = [];
  let maxProb = 0;

  for (let i = 0; i <= samples; i++) {
    const y = (i / samples) * 2 * maxScreenY - maxScreenY;
    const prob = probabilityAtY(y, p, mode);
    result.push({ y, prob });
    if (prob > maxProb) maxProb = prob;
  }

  // Normalize
  if (maxProb > 0) {
    for (const point of result) {
      point.prob /= maxProb;
    }
  }

  return result;
}

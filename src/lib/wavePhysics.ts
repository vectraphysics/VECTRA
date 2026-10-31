/**
 * Wave physics — travelling sinusoidal wave.
 *
 * y(x, t) = A · sin(k·x − ω·t + φ)
 *
 * where:
 *   k = 2π / λ   (wave number)
 *   ω = 2π · f   (angular frequency)
 *   v = f · λ    (wave speed, derived — NOT independent of f and λ)
 *
 * The "wave speed" control adjusts a visual propagation multiplier so the user
 * can observe the wave moving faster or slower without changing the physical
 * relationship v = fλ. The displayed wave speed always reflects v = fλ.
 */

export interface WaveParameters {
  amplitude: number;   // A — pixels
  wavelength: number;  // λ — pixels
  frequency: number;   // f — Hz
  phase: number;       // φ — radians
  direction: 1 | -1;   // propagation direction
}

export interface WaveDerivedData {
  period: number;           // T = 1/f — seconds
  angularFrequency: number; // ω = 2πf — rad/s
  waveNumber: number;       // k = 2π/λ — rad/px
  waveSpeed: number;        // v = fλ — px/s
}

export const DEFAULT_WAVE_PARAMS: WaveParameters = {
  amplitude: 60,
  wavelength: 220,
  frequency: 0.5,
  phase: 0,
  direction: 1,
};

export function deriveWaveData(p: WaveParameters): WaveDerivedData {
  const period = p.frequency > 0 ? 1 / p.frequency : 0;
  const angularFrequency = 2 * Math.PI * p.frequency;
  const waveNumber = p.wavelength > 0 ? (2 * Math.PI) / p.wavelength : 0;
  const waveSpeed = p.frequency * p.wavelength;
  return { period, angularFrequency, waveNumber, waveSpeed };
}

/**
 * Evaluate the wave at position x and time t.
 * Direction flips the sign of the phase term: kx − ωt for +1, kx + ωt for −1.
 */
export function waveValue(x: number, t: number, p: WaveParameters, derived: WaveDerivedData): number {
  const sign = p.direction === 1 ? -1 : 1;
  return p.amplitude * Math.sin(derived.waveNumber * x + sign * derived.angularFrequency * t + p.phase);
}

/**
 * Return the x-coordinate of the first crest in [0, wavelength).
 * This uses the same phase convention as waveValue, so the measurement
 * remains aligned for either propagation direction and every phase/time.
 */
export function firstCrestPosition(
  t: number,
  p: WaveParameters,
  derived: WaveDerivedData
): number {
  const { wavelength, phase, direction } = p;
  if (wavelength <= 0 || derived.waveNumber <= 0) return 0;

  const timeSign = direction === 1 ? -1 : 1;
  const phaseAtOrigin = timeSign * derived.angularFrequency * t + phase;
  const rawPosition = (Math.PI / 2 - phaseAtOrigin) / derived.waveNumber;
  return ((rawPosition % wavelength) + wavelength) % wavelength;
}

export interface WavePreset {
  id: string;
  label: string;
  description: string;
  params: WaveParameters;
}

export const wavePresets: WavePreset[] = [
  {
    id: 'default',
    label: 'Default Wave',
    description: 'A balanced travelling wave with moderate amplitude and wavelength.',
    params: { ...DEFAULT_WAVE_PARAMS },
  },
  {
    id: 'long-wavelength',
    label: 'Long Wavelength',
    description: 'Long, gentle swells — low frequency, large wavelength.',
    params: { amplitude: 70, wavelength: 400, frequency: 0.3, phase: 0, direction: 1 },
  },
  {
    id: 'high-frequency',
    label: 'High Frequency',
    description: 'Rapid oscillations — short wavelength, high frequency.',
    params: { amplitude: 45, wavelength: 120, frequency: 1.5, phase: 0, direction: 1 },
  },
  {
    id: 'large-amplitude',
    label: 'Large Amplitude',
    description: 'A powerful wave with high amplitude and moderate frequency.',
    params: { amplitude: 100, wavelength: 260, frequency: 0.6, phase: 0, direction: 1 },
  },
  {
    id: 'reverse',
    label: 'Reverse Propagation',
    description: 'The same wave, travelling in the opposite direction.',
    params: { amplitude: 60, wavelength: 220, frequency: 0.5, phase: 0, direction: -1 },
  },
];

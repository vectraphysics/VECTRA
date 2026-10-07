/**
 * Heat transfer physics — conduction, natural convection, thermal radiation.
 *
 * All calculations use SI units internally:
 *   temperature difference ΔT  — K (a 1 °C difference equals a 1 K difference)
 *   absolute temperature T     — K (required for radiation)
 *   length L                    — m
 *   area A                      — m²
 *   heat-transfer rate Q̇        — W  (J/s)
 *   heat (thermal energy) Q     — J
 *
 * This module is pure maths: no rendering, no React.
 */

export type HeatMode = 'conduction' | 'convection' | 'radiation';

export const STEFAN_BOLTZMANN = 5.670374419e-8; // σ — W·m⁻²·K⁻⁴
export const WIEN_B = 2.897771955e-3; // b — m·K
export const GRAVITY = 9.80665; // g — m/s²
export const KELVIN_OFFSET = 273.15;

export const celsiusToKelvin = (c: number): number => c + KELVIN_OFFSET;
export const kelvinToCelsius = (k: number): number => k - KELVIN_OFFSET;

/** Clamp that also rejects NaN / ±Infinity (falls back to the lower bound). */
export function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.min(hi, Math.max(lo, v));
}

function safe(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

/* ================================================================== */
/* CONDUCTION — Fourier's law  Q̇ = kAΔT / L                            */
/* ================================================================== */

export interface Material {
  id: string;
  name: string;
  /** Thermal conductivity k — W/(m·K), ~room temperature */
  k: number;
  /** Density ρ — kg/m³ */
  density: number;
  /** Specific heat capacity c — J/(kg·K) */
  specificHeat: number;
  /** Maximum sensible hot-side temperature — °C */
  maxC: number;
  /** Why the limit exists */
  limitReason: string;
  /** Visual tint of the bare material (hex) */
  tint: string;
}

export const MATERIALS: Material[] = [
  { id: 'copper', name: 'Copper', k: 401, density: 8960, specificHeat: 385, maxC: 1000, limitReason: 'melts at 1085 °C', tint: '#c98a5e' },
  { id: 'aluminium', name: 'Aluminium', k: 237, density: 2700, specificHeat: 897, maxC: 600, limitReason: 'melts at 660 °C', tint: '#b8c2cc' },
  { id: 'steel', name: 'Steel', k: 50, density: 7850, specificHeat: 490, maxC: 1000, limitReason: 'carbon steel, softens above ~1000 °C', tint: '#8a929c' },
  { id: 'glass', name: 'Glass', k: 1.0, density: 2500, specificHeat: 840, maxC: 500, limitReason: 'soda-lime glass softens above ~550 °C', tint: '#9fc4cf' },
  { id: 'wood', name: 'Wood', k: 0.12, density: 500, specificHeat: 1700, maxC: 200, limitReason: 'pine chars / ignites above ~250 °C', tint: '#8a6a48' },
];

export const CONDUCTION_LIMITS = {
  coldMinC: -50,
  coldMaxC: 500,
  hotMinC: -50,
  lengthMin: 0.05, // m
  lengthMax: 1.0, // m
  areaMinCm2: 0.5,
  areaMaxCm2: 20,
};

export interface ConductionParams {
  hotC: number;
  coldC: number;
  materialId: string;
  length: number; // m
  areaCm2: number; // cm²
}

export const DEFAULT_CONDUCTION: ConductionParams = {
  hotC: 200,
  coldC: 20,
  materialId: 'copper',
  length: 0.5,
  areaCm2: 4,
};

export function getMaterial(id: string): Material {
  return MATERIALS.find((m) => m.id === id) ?? MATERIALS[0];
}

/** Enforce limits and hot ≥ cold. Always returns a physically valid state. */
export function sanitizeConduction(p: ConductionParams): ConductionParams {
  const m = getMaterial(p.materialId);
  const L = CONDUCTION_LIMITS;
  const coldC = clamp(p.coldC, L.coldMinC, Math.min(L.coldMaxC, m.maxC));
  const hotC = clamp(p.hotC, coldC, m.maxC);
  return {
    materialId: m.id,
    hotC,
    coldC,
    length: clamp(p.length, L.lengthMin, L.lengthMax),
    areaCm2: clamp(p.areaCm2, L.areaMinCm2, L.areaMaxCm2),
  };
}

export interface ConductionDerived {
  material: Material;
  deltaT: number; // K
  k: number; // W/(m·K)
  area: number; // m²
  length: number; // m
  heatRate: number; // Q̇ — W
  heatFlux: number; // q = Q̇/A — W/m²
  gradient: number; // ΔT/L — K/m
  resistance: number; // R = L/(kA) — K/W
  diffusivity: number; // α = k/(ρc) — m²/s
  timeConstant: number; // L²/α — s (diffusion time scale)
}

export function deriveConduction(p: ConductionParams): ConductionDerived {
  const material = getMaterial(p.materialId);
  const deltaT = Math.max(0, p.hotC - p.coldC);
  const area = p.areaCm2 * 1e-4;
  const length = p.length;
  const k = material.k;
  const heatRate = safe((k * area * deltaT) / length);
  const diffusivity = k / (material.density * material.specificHeat);
  return {
    material,
    deltaT,
    k,
    area,
    length,
    heatRate,
    heatFlux: safe(heatRate / area),
    gradient: safe(deltaT / length),
    resistance: safe(length / (k * area)),
    diffusivity,
    timeConstant: safe((length * length) / diffusivity),
  };
}

/* ---- 1D transient conduction solver (dimensionless) --------------- */
/*
 * ∂T/∂t = α ∂²T/∂x²  is solved in dimensionless form ∂T/∂τ = ∂²T/∂ξ²,
 * with ξ = x/L and τ = αt/L². Physical time is recovered as t = τL²/α.
 * Explicit FTCS scheme, sub-stepped so r = Δτ/Δξ² ≤ 0.4 (stable).
 * Node 0 = hot boundary, node n−1 = cold boundary (fixed temperatures).
 */
export const ROD_NODES = 48;

export function createRodProfile(initialC: number, hotC: number): Float64Array {
  const T = new Float64Array(ROD_NODES).fill(initialC);
  T[0] = hotC;
  return T;
}

const scratch = new Float64Array(ROD_NODES);

export function stepRod(T: Float64Array, hotC: number, coldC: number, dTau: number): void {
  const n = T.length;
  const dx = 1 / (n - 1);
  const maxStep = 0.4 * dx * dx;
  const steps = Math.min(600, Math.max(1, Math.ceil(dTau / maxStep)));
  const d = Math.min(dTau / steps, maxStep);
  const r = d / (dx * dx);
  for (let s = 0; s < steps; s++) {
    T[0] = hotC;
    T[n - 1] = coldC;
    for (let i = 1; i < n - 1; i++) {
      scratch[i] = T[i] + r * (T[i + 1] - 2 * T[i] + T[i - 1]);
    }
    for (let i = 1; i < n - 1; i++) T[i] = scratch[i];
  }
  T[0] = hotC;
  T[n - 1] = coldC;
}

/** Heat-transfer rate leaving the rod at the cold end: Q̇ = −kA ∂T/∂x. */
export function rodColdEndRate(T: Float64Array, k: number, area: number, length: number): number {
  const n = T.length;
  const dxPhys = length / (n - 1);
  return safe((k * area * (T[n - 2] - T[n - 1])) / dxPhys);
}

/* ================================================================== */
/* CONVECTION — Newton's law of cooling  Q̇ = hAΔT                      */
/* h from a natural-convection correlation (heated plate facing up):  */
/*   Ra = gβΔT·Lc³ / (να)                                             */
/*   Nu = 0.54 Ra^(1/4)   (10⁴ ≲ Ra ≲ 10⁷, laminar)                   */
/*   Nu = 0.15 Ra^(1/3)   (10⁷ ≲ Ra ≲ 10¹¹, turbulent)                */
/*   h  = Nu·k / Lc,  Lc = A/P                                         */
/* ================================================================== */

export interface Fluid {
  id: string;
  name: string;
  k: number; // W/(m·K)
  nu: number; // kinematic viscosity ν — m²/s
  alpha: number; // thermal diffusivity α — m²/s
  /** Volumetric expansion coefficient β — 1/K. null = ideal gas (β = 1/T_film). */
  beta: number | null;
  heaterMinC: number;
  heaterMaxC: number;
  ambientMinC: number;
  ambientMaxC: number;
  limitReason: string;
}

export const FLUIDS: Fluid[] = [
  {
    id: 'water',
    name: 'Water',
    k: 0.598,
    nu: 1.004e-6,
    alpha: 1.43e-7,
    beta: 2.07e-4,
    heaterMinC: 10,
    heaterMaxC: 95,
    ambientMinC: 10,
    ambientMaxC: 60,
    limitReason: 'kept liquid: below boiling (100 °C at 1 atm)',
  },
  {
    id: 'air',
    name: 'Air',
    k: 0.0262,
    nu: 1.589e-5,
    alpha: 2.25e-5,
    beta: null,
    heaterMinC: -30,
    heaterMaxC: 400,
    ambientMinC: -30,
    ambientMaxC: 50,
    limitReason: 'ideal-gas air at 1 atm',
  },
];

/** Container geometry (m). The heater spans part of the base. */
export const CONVECTION_GEOMETRY = { width: 0.3, height: 0.2, depth: 0.1 };

export interface ConvectionParams {
  heaterC: number;
  ambientC: number;
  fluidId: string;
  /** Heating intensity = fraction of the base covered by the heater, 0.2–1.
   * Changes the heated area, not an arbitrary heat-rate multiplier. */
  intensity: number;
}

export const DEFAULT_CONVECTION: ConvectionParams = {
  heaterC: 80,
  ambientC: 20,
  fluidId: 'water',
  intensity: 0.5,
};

export function getFluid(id: string): Fluid {
  return FLUIDS.find((f) => f.id === id) ?? FLUIDS[0];
}

export function sanitizeConvection(p: ConvectionParams): ConvectionParams {
  const f = getFluid(p.fluidId);
  const ambientC = clamp(p.ambientC, f.ambientMinC, f.ambientMaxC);
  const heaterC = clamp(p.heaterC, ambientC, f.heaterMaxC);
  return { fluidId: f.id, ambientC, heaterC, intensity: clamp(p.intensity, 0.2, 1) };
}

export type ConvectionRegime = 'none' | 'weak' | 'laminar' | 'turbulent';

export interface ConvectionDerived {
  fluid: Fluid;
  deltaT: number; // K
  heaterWidth: number; // m
  heaterArea: number; // m²
  charLength: number; // Lc = A/P — m
  beta: number; // 1/K
  prandtl: number;
  rayleigh: number;
  nusselt: number;
  h: number; // W/(m²·K)
  heatRate: number; // Q̇ — W
  buoyancyVelocity: number; // √(gβΔT·H) — m/s, upper-bound velocity scale
  regime: ConvectionRegime;
}

export function deriveConvection(p: ConvectionParams): ConvectionDerived {
  const fluid = getFluid(p.fluidId);
  const g = CONVECTION_GEOMETRY;
  const deltaT = Math.max(0, p.heaterC - p.ambientC);
  const heaterWidth = p.intensity * g.width;
  const heaterArea = heaterWidth * g.depth;
  const charLength = heaterArea / (2 * (heaterWidth + g.depth));
  const filmK = celsiusToKelvin((p.heaterC + p.ambientC) / 2);
  const beta = fluid.beta ?? 1 / filmK;
  const rayleigh = safe((GRAVITY * beta * deltaT * charLength ** 3) / (fluid.nu * fluid.alpha));
  // Diffusion-dominated lower bound at very low Ra. The UI flags this range.
  // This is a plate correlation, not a CFD solution for the sealed chamber.
  const nusselt = Math.max(1, rayleigh < 1e7 ? 0.54 * rayleigh ** 0.25 : 0.15 * Math.cbrt(rayleigh));
  const h = safe((nusselt * fluid.k) / charLength);
  let regime: ConvectionRegime = 'none';
  if (rayleigh > 0) regime = rayleigh < 1e4 ? 'weak' : rayleigh < 1e7 ? 'laminar' : 'turbulent';
  return {
    fluid,
    deltaT,
    heaterWidth,
    heaterArea,
    charLength,
    beta,
    prandtl: fluid.nu / fluid.alpha,
    rayleigh,
    nusselt,
    h,
    heatRate: safe(h * heaterArea * deltaT),
    buoyancyVelocity: safe(Math.sqrt(GRAVITY * beta * deltaT * g.height)),
    regime,
  };
}

/* ================================================================== */
/* RADIATION — Stefan–Boltzmann  P = εσA(T⁴hot − T⁴cold)               */
/* Grey sphere completely enclosed by a black isothermal cold wall.   */
/* View factor = 1; temperatures maintained by reservoirs. This is not */
/* the general exchange between two arbitrarily separated objects.    */
/* ================================================================== */

export interface Surface {
  id: string;
  name: string;
  emissivity: number;
}

export const SURFACES: Surface[] = [
  { id: 'silver', name: 'Polished silver', emissivity: 0.02 },
  { id: 'aluminium', name: 'Polished aluminium', emissivity: 0.05 },
  { id: 'oxidised-steel', name: 'Oxidised steel', emissivity: 0.79 },
  { id: 'black-paint', name: 'Matte black paint', emissivity: 0.97 },
  { id: 'blackbody', name: 'Ideal black body', emissivity: 1.0 },
];

export const RADIATION_LIMITS = {
  hotMinK: 300,
  hotMaxK: 3000,
  coldMinK: 3, // ~ cosmic microwave background; never ≤ 0 K
  coldMaxK: 2500,
  emissivityMin: 0.02,
  emissivityMax: 1,
};

/** Radius of the hot sphere — m. */
export const RADIATOR_RADIUS = 0.1;

export interface RadiationParams {
  hotK: number;
  coldK: number;
  emissivity: number;
}

export const DEFAULT_RADIATION: RadiationParams = {
  hotK: 1200,
  coldK: 300,
  emissivity: 0.9,
};

export function sanitizeRadiation(p: RadiationParams): RadiationParams {
  const L = RADIATION_LIMITS;
  const coldK = clamp(p.coldK, L.coldMinK, L.coldMaxK);
  const hotK = clamp(p.hotK, Math.max(L.hotMinK, coldK), L.hotMaxK);
  return { hotK, coldK, emissivity: clamp(p.emissivity, L.emissivityMin, L.emissivityMax) };
}

export interface RadiationDerived {
  hotK: number;
  coldK: number;
  hotC: number;
  coldC: number;
  emissivity: number;
  area: number; // m²
  emittedPower: number; // εσAT⁴hot — W
  absorbedPower: number; // εσAT⁴cold — W
  netPower: number; // W
  peakHot: number; // λmax = b/T — m
  peakCold: number; // m
}

export function deriveRadiation(p: RadiationParams): RadiationDerived {
  const area = 4 * Math.PI * RADIATOR_RADIUS ** 2;
  const emittedPower = p.emissivity * STEFAN_BOLTZMANN * area * p.hotK ** 4;
  const absorbedPower = p.emissivity * STEFAN_BOLTZMANN * area * p.coldK ** 4;
  return {
    hotK: p.hotK,
    coldK: p.coldK,
    hotC: kelvinToCelsius(p.hotK),
    coldC: kelvinToCelsius(p.coldK),
    emissivity: p.emissivity,
    area,
    emittedPower: safe(emittedPower),
    absorbedPower: safe(absorbedPower),
    netPower: safe(emittedPower - absorbedPower),
    peakHot: WIEN_B / p.hotK,
    peakCold: WIEN_B / p.coldK,
  };
}

/** Blackbody spectral radiance Bλ (W·sr⁻¹·m⁻³), Planck's law. */
export function spectralRadiance(wavelength: number, temperatureK: number): number {
  if (wavelength <= 0 || temperatureK <= 0) return 0;
  const exponent = 0.01438776877 / (wavelength * temperatureK); // hc / kB
  if (exponent > 700) return 0;
  // Equivalent SI result using µm inside the denominator to avoid tiny literals.
  const wavelengthMicrons = wavelength * 1e6;
  return safe(1.191042972e14 / (wavelengthMicrons ** 5 * Math.expm1(exponent)));
}
/** Number formatting helpers for the heat-transfer simulation (display only). */

export function fmt(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e5 || abs < 1e-3) return value.toExponential(2).replace('e+', 'e');
  return Number(value.toPrecision(digits)).toLocaleString('en-US', { maximumFractionDigits: 6 });
}

function scaled(value: number, units: [number, string][]): { v: string; unit: string } {
  if (!Number.isFinite(value)) return { v: '—', unit: units[0][1] };
  const abs = Math.abs(value);
  let chosen = units[0];
  for (const u of units) if (abs >= u[0]) chosen = u;
  return { v: fmt(value / chosen[0]), unit: chosen[1] };
}

export const POWER_UNITS: [number, string][] = [
  [1e-6, 'µW'],
  [1e-3, 'mW'],
  [1, 'W'],
  [1e3, 'kW'],
  [1e6, 'MW'],
];

export const ENERGY_UNITS: [number, string][] = [
  [1e-3, 'mJ'],
  [1, 'J'],
  [1e3, 'kJ'],
  [1e6, 'MJ'],
  [1e9, 'GJ'],
];

export function formatPower(w: number) {
  if (w === 0) return { v: '0', unit: 'W' };
  return scaled(w, POWER_UNITS);
}

export function formatEnergy(j: number) {
  if (j === 0) return { v: '0', unit: 'J' };
  return scaled(j, ENERGY_UNITS);
}

export function formatPowerText(w: number): string {
  const p = formatPower(w);
  return `${p.v} ${p.unit}`;
}

export function formatDuration(s: number): { v: string; unit: string } {
  if (!Number.isFinite(s)) return { v: '—', unit: 's' };
  if (s < 120) return { v: fmt(s, 3), unit: 's' };
  if (s < 7200) return { v: fmt(s / 60, 3), unit: 'min' };
  if (s < 172800) return { v: fmt(s / 3600, 3), unit: 'h' };
  return { v: fmt(s / 86400, 3), unit: 'days' };
}

export function formatWavelength(m: number): string {
  if (!Number.isFinite(m)) return '—';
  if (m >= 1e-3) return `${fmt(m * 1e3)} mm`;
  if (m >= 1e-6) return `${fmt(m * 1e6)} µm`;
  return `${fmt(m * 1e9)} nm`;
}

export function formatTemp(c: number, digits = 0): string {
  return `${c.toFixed(digits)} °C`;
}

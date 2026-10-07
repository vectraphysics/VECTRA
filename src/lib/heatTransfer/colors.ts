/** Colour utilities for the heat-transfer visualisation. */

export type RGB = [number, number, number];

// Restrained thermal scale: deep space blue → steel blue → pale ice → gold → ember.
const THERMAL_STOPS: [number, RGB][] = [
  [0.0, [30, 52, 104]],
  [0.25, [52, 104, 158]],
  [0.48, [150, 190, 214]],
  [0.66, [232, 200, 122]],
  [0.84, [226, 132, 66]],
  [1.0, [196, 64, 44]],
];

export function thermalRGB(t: number): RGB {
  const x = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
  for (let i = 1; i < THERMAL_STOPS.length; i++) {
    const [p1, c1] = THERMAL_STOPS[i];
    if (x <= p1) {
      const [p0, c0] = THERMAL_STOPS[i - 1];
      const f = (x - p0) / (p1 - p0);
      return [c0[0] + (c1[0] - c0[0]) * f, c0[1] + (c1[1] - c0[1]) * f, c0[2] + (c1[2] - c0[2]) * f];
    }
  }
  return THERMAL_STOPS[THERMAL_STOPS.length - 1][1];
}

export function rgba(c: RGB, a = 1): string {
  return `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
}

export function mixRGB(a: RGB, b: RGB, t: number): RGB {
  const f = Math.min(1, Math.max(0, t));
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/**
 * Approximate perceived colour of a black body at temperature T (K).
 * Based on Tanner Helland's fit; valid ~1000–40000 K.
 */
export function blackbodyRGB(T: number): RGB {
  const t = Math.max(1000, Math.min(40000, T)) / 100;
  let r: number;
  let g: number;
  let b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = (v: number) => Math.min(255, Math.max(0, v));
  return [c(r), c(g), c(b)];
}

/** Visible incandescence (0–1): none below the Draper point (~798 K). */
export function glowFactor(T: number): number {
  const x = (T - 798) / (1800 - 798);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

/** Horizontal thermal legend (colour bar) with labels. */
export function drawThermalLegend(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  lowLabel: string,
  highLabel: string,
  title = 'TEMPERATURE'
) {
  const grad = ctx.createLinearGradient(x, 0, x + w, 0);
  for (let i = 0; i <= 10; i++) grad.addColorStop(i / 10, rgba(thermalRGB(i / 10)));
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, 4);
  ctx.globalAlpha = 1;
  ctx.font = '500 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(232, 237, 245, 0.35)';
  ctx.textAlign = 'left';
  ctx.fillText(title, x, y - 7);
  ctx.fillStyle = 'rgba(232, 237, 245, 0.55)';
  ctx.fillText(lowLabel, x, y + 17);
  ctx.textAlign = 'right';
  ctx.fillText(highLabel, x + w, y + 17);
  ctx.restore();
}

export const MONO = '"JetBrains Mono", monospace';
export const INK = 'rgba(232, 237, 245, ';

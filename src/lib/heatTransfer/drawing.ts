import { MONO } from './colors';

export type Ctx = CanvasRenderingContext2D;
export interface View { width: number; height: number; time: number; annotations: boolean }

export function label(ctx: Ctx, text: string, x: number, y: number, color = 'rgba(232,237,245,0.55)', size = 11, align: CanvasTextAlign = 'center') {
  ctx.font = `400 ${size}px ${MONO}`;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color = 'rgba(168,213,232,0.2)') {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
}

export function arrow(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, size = 5) {
  line(ctx, x1, y1, x2, y2, color);
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(a - 0.5), y2 - size * Math.sin(a - 0.5));
  ctx.lineTo(x2 - size * Math.cos(a + 0.5), y2 - size * Math.sin(a + 0.5));
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}

export function panel(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 10);
  ctx.fillStyle = 'rgba(11,16,32,0.7)'; ctx.fill();
  ctx.strokeStyle = 'rgba(120,150,200,0.15)'; ctx.lineWidth = 1; ctx.stroke();
}

export function dot(ctx: Ctx, x: number, y: number, radius: number, color: string, glow = 0) {
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  ctx.fill(); ctx.shadowBlur = 0;
}

export function bracket(ctx: Ctx, x1: number, x2: number, y: number, text: string) {
  line(ctx, x1, y, x2, y);
  line(ctx, x1, y - 4, x1, y + 4);
  line(ctx, x2, y - 4, x2, y + 4);
  label(ctx, text, (x1 + x2) / 2, y + 17, 'rgba(168,213,232,0.55)', 10);
}

export function background(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#04060d'; ctx.fillRect(0, 0, w, h);
  const light = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, Math.max(w, h) * 0.55);
  light.addColorStop(0, '#0b1323'); light.addColorStop(1, '#04060d');
  ctx.fillStyle = light; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 64; i++) {
    const x = ((i * 467 + 29) % 997) / 997 * w;
    const y = ((i * 313 + 179) % 991) / 991 * h;
    dot(ctx, x, y, i % 7 === 0 ? 1 : 0.55, 'rgba(168,213,232,0.2)');
  }
  const grid = 48;
  ctx.strokeStyle = 'rgba(120,150,200,0.035)'; ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = (w / 2) % grid; x < w; x += grid) { ctx.moveTo(x, 110); ctx.lineTo(x, h - 55); }
  for (let y = 130; y < h - 55; y += grid) { ctx.moveTo(20, y); ctx.lineTo(w - 20, y); }
  ctx.stroke();
}
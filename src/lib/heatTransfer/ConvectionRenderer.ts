import type { ConvectionParams, ConvectionDerived } from '@/lib/heatTransferPhysics';
import { thermalRGB, rgba, drawThermalLegend } from './colors';
import { fmt, formatPowerText } from './format';
import { label, line, arrow, panel, dot, bracket, type Ctx, type View } from './drawing';

/**
 * Qualitative two-cell circulation and temperature field, NOT a CFD solver.
 * Inner warm columns rise, cooled fluid returns down both outer walls.
 * Numerical h and Q̇ come only from the separate natural-convection model.
 */
export class ConvectionRenderer {
  private field = document.createElement('canvas');
  private fieldCtx: CanvasRenderingContext2D | null;
  private lastField = -1;
  private fieldKey = '';

  constructor() {
    this.field.width = 80; this.field.height = 56;
    this.fieldCtx = this.field.getContext('2d');
  }

  private updateField(time: number, p: ConvectionParams, d: ConvectionDerived) {
    const key = JSON.stringify(p);
    if (key === this.fieldKey && Math.abs(time - this.lastField) < 0.08) return;
    if (!this.fieldCtx) return;
    this.lastField = time; this.fieldKey = key;
    const image = this.fieldCtx.createImageData(80, 56);
    const active = Math.min(1, d.deltaT / 15);
    for (let y = 0; y < 56; y++) for (let x = 0; x < 80; x++) {
      const X = x / 79, Y = y / 55;
      const plumeWidth = 0.06 + p.intensity * 0.1 + (1 - Y) * 0.1;
      const wobble = 0.025 * Math.sin(time * 1.4 + Y * 7) * Math.sin(Y * Math.PI);
      const plume = Math.exp(-(((X - 0.5 - wobble) / plumeWidth) ** 2)) * (0.4 + 0.4 * Y);
      const base = Math.exp(-(1 - Y) * 10) * Math.exp(-(((X - 0.5) / (0.12 + p.intensity * 0.3)) ** 4));
      const cap = 0.28 * Math.exp(-(((Y - 0.18) / 0.18) ** 2)) * Math.sin(X * Math.PI);
      const value = active * Math.min(1, plume + base * 0.75 + cap);
      const col = thermalRGB(value);
      const i = (y * 80 + x) * 4;
      image.data[i] = col[0]; image.data[i + 1] = col[1]; image.data[i + 2] = col[2]; image.data[i + 3] = 145;
    }
    this.fieldCtx.putImageData(image, 0, 0);
  }

  draw(ctx: Ctx, v: View, p: ConvectionParams, d: ConvectionDerived) {
    const { width: w, height: h, time: t, annotations } = v;
    const mobile = w < 640;
    const tankW = mobile ? w - 72 : Math.min(w * 0.65, 620);
    const tankH = Math.min(h * 0.38, tankW * 0.62);
    const x = (w - tankW) / 2, y = h * (mobile ? 0.32 : 0.28);
    const depth = mobile ? 13 : 26;
    const flowSpeed = d.deltaT > 0 ? Math.min(1.2, 0.16 + Math.log10(1 + d.rayleigh) * 0.08) : 0;
    const phase = t * flowSpeed;
    this.updateField(phase, p, d);

    // Back wall, transparent rim and perspective edges.
    ctx.fillStyle = 'rgba(17,27,43,0.5)';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + depth, y - depth); ctx.lineTo(x + tankW + depth, y - depth); ctx.lineTo(x + tankW, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(168,213,232,0.22)'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + tankW, y); ctx.lineTo(x + tankW + depth, y - depth); ctx.lineTo(x + tankW + depth, y + tankH - depth); ctx.lineTo(x + tankW, y + tankH); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x, y, tankW, tankH, 5); ctx.clip();
    ctx.fillStyle = '#0b1425'; ctx.fillRect(x, y, tankW, tankH);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.field, x, y, tankW, tankH);

    // Subtle streamlines and tracer trails (two counter-rotating rolls).
    for (let side = 0; side < 2; side++) {
      const cx = x + tankW * (side === 0 ? 0.27 : 0.73);
      const cy = y + tankH * 0.5;
      const sign = side === 0 ? -1 : 1;
      for (let ring = 0; ring < 3; ring++) {
        const rx = tankW * (0.215 - ring * 0.042);
        const ry = tankH * (0.415 - ring * 0.06);
        if (flowSpeed > 0 && annotations) {
          ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(168,213,232,0.075)'; ctx.lineWidth = 1; ctx.stroke();
        }
        for (let i = 0; i < 15; i++) {
          const a = i / 15 * Math.PI * 2 + sign * phase + ring * 0.65;
          const px = cx + Math.cos(a) * rx;
          const py = cy + Math.sin(a) * ry;
          const inner = side === 0 ? (1 + Math.cos(a)) / 2 : (1 - Math.cos(a)) / 2;
          const col = rgba(thermalRGB(d.deltaT > 0 ? 0.1 + inner * 0.68 : 0), 0.85);
          if (flowSpeed > 0) {
            const prev = a - sign * 0.085;
            line(ctx, cx + Math.cos(prev) * rx, cy + Math.sin(prev) * ry, px, py, col);
          }
          dot(ctx, px, py, ring === 0 ? 1.8 : 1.3, col);
        }
      }
    }
    // Mild glass reflection, not so bright it hides the current.
    const glass = ctx.createLinearGradient(x, 0, x + tankW, 0);
    glass.addColorStop(0, 'rgba(168,213,232,0.1)'); glass.addColorStop(0.12, 'rgba(168,213,232,0)'); glass.addColorStop(0.9, 'rgba(168,213,232,0.025)'); glass.addColorStop(1, 'rgba(168,213,232,0.07)');
    ctx.fillStyle = glass; ctx.fillRect(x, y, tankW, tankH);
    ctx.restore();
    ctx.beginPath(); ctx.roundRect(x, y, tankW, tankH, 5); ctx.strokeStyle = 'rgba(168,213,232,0.45)'; ctx.lineWidth = 1; ctx.stroke();
    for (let i = 1; i < 5; i++) line(ctx, x + 5, y + tankH * i / 5, x + 11, y + tankH * i / 5, 'rgba(168,213,232,0.3)');

    // Heated bottom plate: intensity changes the real heated area.
    const heaterW = tankW * p.intensity;
    const heaterX = x + (tankW - heaterW) / 2;
    const heaterCol = thermalRGB(d.deltaT > 0 ? 1 : 0);
    ctx.shadowColor = rgba(heaterCol); ctx.shadowBlur = d.deltaT > 0 ? 14 : 0;
    ctx.fillStyle = rgba(heaterCol, 0.85); ctx.fillRect(heaterX, y + tankH - 5, heaterW, 7); ctx.shadowBlur = 0;
    const bench = ctx.createLinearGradient(0, y + tankH + 5, 0, y + tankH + 27);
    bench.addColorStop(0, '#2a3445'); bench.addColorStop(1, '#0c1320');
    ctx.fillStyle = bench; ctx.fillRect(x - 12, y + tankH + 7, tankW + 24, 18);
    for (const foot of [x + 10, x + tankW - 30]) { ctx.fillStyle = '#161e2c'; ctx.fillRect(foot, y + tankH + 25, 20, 11); }
    label(ctx, `${p.heaterC} °C`, w / 2, y + tankH + 59, '#e8c87a', 13);
    label(ctx, `${p.ambientC} °C · COOLED WALLS`, w / 2, y - depth - 16, '#9fb8e8', mobile ? 10 : 12);
    if (annotations && d.deltaT > 0) {
      arrow(ctx, w / 2, y + tankH * 0.73, w / 2, y + tankH * 0.27, 'rgba(232,200,122,0.9)', 7);
      for (const ax of [x + 19, x + tankW - 19]) arrow(ctx, ax, y + tankH * 0.25, ax, y + tankH * 0.7, 'rgba(159,184,232,0.75)', 6);
      label(ctx, 'WARM ↑', w / 2, y + tankH * 0.18, '#e8c87a', 10);
      if (!mobile) {
        label(ctx, 'COOL ↓', x - 10, y + tankH * 0.6, '#9fb8e8', 10, 'right');
        label(ctx, 'COOL ↓', x + tankW + depth + 15, y + tankH * 0.6, '#9fb8e8', 10, 'left');
      }
    }
    const infoY = y + tankH + 83;
    if (annotations && !mobile) bracket(ctx, heaterX, heaterX + heaterW, y + tankH + 76, `HEATER AREA = ${fmt(d.heaterArea)} m²`);
    const cardY = Math.max(infoY + 24, h * 0.78);
    if (cardY + 70 <= h - 75) {
      const cw = Math.min(w - 44, 530), cx = (w - cw) / 2;
      panel(ctx, cx, cardY, cw, 70);
      label(ctx, `${p.fluidId.toUpperCase()} · NATURAL CONVECTION`, cx + 14, cardY + 20, 'rgba(168,213,232,0.55)', mobile ? 9 : 10, 'left');
      label(ctx, d.deltaT > 0 ? 'BULK FLUID MOTION' : 'THERMAL EQUILIBRIUM', cx + 14, cardY + 46, '#e8edf5', mobile ? 10 : 13, 'left');
      label(ctx, formatPowerText(d.heatRate), cx + cw - 14, cardY + 45, '#e8c87a', mobile ? 16 : 22, 'right');
    }
    drawThermalLegend(ctx, w - (mobile ? 142 : 192), h - 35, mobile ? 120 : 160, 'COOLER', 'WARMER', 'SCHEMATIC FIELD');
    if (!mobile) label(ctx, 'CIRCULATION & FIELD ARE QUALITATIVE · NOT CFD', 28, h - 24, 'rgba(232,237,245,0.35)', 10, 'left');
  }
}
import type { ConductionParams, ConductionDerived } from '@/lib/heatTransferPhysics';
import { thermalRGB, rgba, drawThermalLegend } from './colors';
import { fmt, formatPowerText } from './format';
import { label, line, arrow, dot, panel, bracket, type Ctx, type View } from './drawing';

/** Steady rod solution: T(x) = Th − (Th−Tc)x/L; energy dots are illustrative. */
export class ConductionRenderer {
  rodStart = 0;
  rodEnd = 0;
  rodY = 0;

  draw(ctx: Ctx, v: View, p: ConductionParams, d: ConductionDerived, probe: number) {
    const { width: w, height: h, time: t, annotations } = v;
    const mobile = w < 640;
    const cy = h * 0.43 + (mobile ? 18 : 0);
    const lengthFrac = 0.3 + 0.36 * Math.sqrt(p.length);
    const length = w * lengthFrac;
    const x0 = (w - length) / 2;
    const x1 = x0 + length;
    const radius = 9 + 3.6 * Math.sqrt(p.areaCm2);
    this.rodStart = x0; this.rodEnd = x1; this.rodY = cy;
    const bathWidth = Math.min(65, Math.max(30, w * 0.07));
    const bathHeight = 110 + radius;
    const hot = thermalRGB(d.deltaT > 0 ? 1 : 0.48);
    const cold = thermalRGB(d.deltaT > 0 ? 0 : 0.48);

    // Optical-bench ground plane and recessed mounts.
    const benchY = cy + bathHeight / 2 + 10;
    ctx.beginPath(); ctx.ellipse(w / 2, benchY + 4, length / 2 + bathWidth + 25, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
    line(ctx, x0 - bathWidth - 10, benchY, x1 + bathWidth + 10, benchY, 'rgba(120,150,200,0.18)');
    for (const x of [x0 + length * 0.25, x0 + length * 0.75]) {
      ctx.fillStyle = '#151e2d'; ctx.fillRect(x - 4, cy + radius, 8, benchY - cy - radius);
      ctx.fillStyle = '#1d2737'; ctx.fillRect(x - 22, benchY - 5, 44, 7);
    }

    // Reservoirs: machined metal blocks with coloured face strips.
    for (const [x, col] of [[x0 - bathWidth, hot], [x1, cold]] as const) {
      const halo = ctx.createRadialGradient(x + bathWidth / 2, cy, 5, x + bathWidth / 2, cy, 110);
      halo.addColorStop(0, rgba(col, 0.1)); halo.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = halo; ctx.fillRect(x - 90, cy - 120, 220, 240);
      const steel = ctx.createLinearGradient(x, 0, x + bathWidth, 0);
      steel.addColorStop(0, '#17202e'); steel.addColorStop(0.42, '#303746'); steel.addColorStop(1, '#111b2b');
      ctx.beginPath(); ctx.roundRect(x, cy - bathHeight / 2, bathWidth, bathHeight, 6);
      ctx.fillStyle = steel; ctx.fill(); ctx.strokeStyle = rgba(col, 0.45); ctx.stroke();
      ctx.fillStyle = rgba(col, 0.7); ctx.fillRect(x + 4, cy - bathHeight / 2 + 10, 3, bathHeight - 20);
      for (let i = 1; i < 6; i++) line(ctx, x + 12, cy - bathHeight / 2 + i * bathHeight / 7, x + bathWidth - 8, cy - bathHeight / 2 + i * bathHeight / 7, 'rgba(255,255,255,0.06)');
      dot(ctx, x + bathWidth - 9, cy - bathHeight / 2 + 9, 2, 'rgba(232,237,245,0.25)');
      dot(ctx, x + bathWidth - 9, cy + bathHeight / 2 - 9, 2, 'rgba(232,237,245,0.25)');
    }

    // Cylindrical bar: steady axial temperature field plus cross-section shading.
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x0, cy - radius, length, radius * 2, radius * 0.4); ctx.clip();
    const grad = ctx.createLinearGradient(x0, 0, x1, 0);
    for (let i = 0; i <= 12; i++) grad.addColorStop(i / 12, rgba(thermalRGB(d.deltaT > 0 ? 1 - i / 12 : 0.48), 0.82));
    ctx.fillStyle = grad; ctx.fillRect(x0, cy - radius, length, radius * 2);
    const metal = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
    metal.addColorStop(0, 'rgba(0,0,0,0.55)'); metal.addColorStop(0.22, 'rgba(255,255,255,0.23)');
    metal.addColorStop(0.44, 'rgba(255,255,255,0.04)'); metal.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = metal; ctx.fillRect(x0, cy - radius, length, radius * 2);
    for (let i = 0; i < length; i += 5) line(ctx, x0 + i, cy - radius, x0 + i, cy + radius, 'rgba(0,0,0,0.04)');
    if (d.heatRate > 0) {
      const speed = 0.025 + Math.log1p(d.heatRate) * 0.035;
      for (let lane = 0; lane < 3; lane++) for (let i = 0; i < 12; i++) {
        const f = (i / 12 + t * speed + lane * 0.025) % 1;
        const y = cy + (lane - 1) * radius * 0.45;
        const col = rgba(thermalRGB(0.2 + 0.65 * (1 - f)), 0.9);
        line(ctx, x0 + f * length - 8, y, x0 + f * length, y, col);
        dot(ctx, x0 + f * length, y, 1.5, col, 4);
      }
    }
    ctx.restore();
    line(ctx, x0, cy - radius, x1, cy - radius, 'rgba(232,237,245,0.25)');

    label(ctx, `${p.hotC} °C`, x0, cy - bathHeight / 2 - 16, '#e8c87a', mobile ? 14 : 18);
    label(ctx, `${p.coldC} °C`, x1, cy - bathHeight / 2 - 16, '#a8d5e8', mobile ? 14 : 18);
    if (annotations) {
      label(ctx, 'HOT', x0, cy - bathHeight / 2 - 38, 'rgba(232,237,245,0.4)', 10);
      label(ctx, 'COLD', x1, cy - bathHeight / 2 - 38, 'rgba(232,237,245,0.4)', 10);
      label(ctx, d.material.name.toUpperCase(), w / 2, cy - radius - 18, 'rgba(232,237,245,0.65)', 11);
      bracket(ctx, x0, x1, benchY + 21, `L = ${fmt(p.length)} m  ·  A = ${fmt(p.areaCm2)} cm²`);
      if (d.deltaT > 0) arrow(ctx, w / 2 - 35, cy + radius + 22, w / 2 + 35, cy + radius + 22, 'rgba(232,200,122,0.65)');
    }

    // Probe and exact temperature (not a proxy for energy flow).
    const px = x0 + probe * length;
    const temp = p.hotC - d.deltaT * probe;
    dot(ctx, px, cy, 4, '#e8edf5', 5);
    line(ctx, px, cy - 7, px, cy - radius - 48, 'rgba(232,237,245,0.55)');
    panel(ctx, Math.max(6, Math.min(w - 90, px - 43)), cy - radius - 73, 86, 23);
    label(ctx, `${temp.toFixed(1)} °C`, Math.max(49, Math.min(w - 47, px)), cy - radius - 57, '#e8edf5', 11);

    // Exact linear temperature profile, with movable probe position.
    const chartX = mobile ? 22 : w * 0.08;
    const chartY = Math.max(benchY + 70, h * 0.71);
    const chartW = mobile ? w - 44 : w * 0.55;
    const chartH = Math.min(140, h - chartY - 50);
    if (chartH >= 80) {
      panel(ctx, chartX, chartY, chartW, chartH);
      label(ctx, 'STEADY TEMPERATURE PROFILE', chartX + 14, chartY + 19, 'rgba(168,213,232,0.55)', mobile ? 9 : 10, 'left');
      const ax = chartX + 48, ay = chartY + chartH - 24, aw = chartW - 68, ah = chartH - 50;
      line(ctx, ax, ay, ax + aw, ay); line(ctx, ax, ay, ax, ay - ah);
      const endY = d.deltaT > 0 ? ay : ay - ah / 2;
      const startY = d.deltaT > 0 ? ay - ah : endY;
      const fill = ctx.createLinearGradient(ax, 0, ax + aw, 0);
      fill.addColorStop(0, rgba(hot, 0.16)); fill.addColorStop(1, rgba(cold, 0.05));
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, startY); ctx.lineTo(ax + aw, endY); ctx.lineTo(ax + aw, ay); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      line(ctx, ax, startY, ax + aw, endY, '#a8d5e8');
      label(ctx, `${p.hotC}°`, ax - 8, startY + 4, 'rgba(232,237,245,0.5)', 9, 'right');
      if (d.deltaT > 0) label(ctx, `${p.coldC}°`, ax - 8, endY + 4, 'rgba(232,237,245,0.5)', 9, 'right');
      label(ctx, '0', ax, ay + 14, 'rgba(232,237,245,0.3)', 9);
      label(ctx, `${fmt(p.length)} m`, ax + aw, ay + 14, 'rgba(232,237,245,0.3)', 9);
      dot(ctx, ax + probe * aw, startY + probe * (endY - startY), 3, '#e8c87a');
    }
    if (!mobile) {
      label(ctx, 'HEAT-TRANSFER RATE', w * 0.81, chartY + 20, 'rgba(232,237,245,0.4)', 10);
      label(ctx, formatPowerText(d.heatRate), w * 0.81, chartY + 58, '#e8c87a', 26);
      label(ctx, 'Q̇ = kAΔT / L', w * 0.81, chartY + 87, 'rgba(168,213,232,0.6)', 12);
    }
    drawThermalLegend(ctx, w - (mobile ? 132 : 186), h - 35, mobile ? 110 : 160, `${p.coldC} °C`, `${p.hotC} °C`, 'THERMAL COLOUR');
    if (!mobile) label(ctx, 'DRAG THE PROBE ALONG THE ROD', 28, h - 24, 'rgba(232,237,245,0.35)', 10, 'left');
  }
}
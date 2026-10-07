import { spectralRadiance, type RadiationParams, type RadiationDerived } from '@/lib/heatTransferPhysics';
import { blackbodyRGB, glowFactor, mixRGB, rgba } from './colors';
import { formatPowerText, formatWavelength } from './format';
import { label, line, dot, panel, arrow, type Ctx, type View } from './drawing';

/** Grey sphere in a cold black enclosure. Wavy rays are symbolic, not to scale. */
export class RadiationRenderer {
  draw(ctx: Ctx, v: View, p: RadiationParams, d: RadiationDerived) {
    const { width: w, height: h, time: t, annotations } = v;
    const mobile = w < 640;
    const x = mobile ? 24 : w * 0.09, y = h * (mobile ? 0.32 : 0.28);
    const cw = w - 2 * x, ch = Math.min(h * (mobile ? 0.29 : 0.34), cw * 0.6);
    const cx = x + cw * 0.32, cy = y + ch / 2;
    const r = Math.min(ch * 0.31, cw * 0.135);
    const glow = glowFactor(p.hotK);
    const incandescent = blackbodyRGB(p.hotK);
    const color = mixRGB([87, 99, 118], incandescent, glow);

    // Cold, blackbody receiver wraps around the emitter — view factor exactly 1.
    ctx.beginPath(); ctx.roundRect(x - 8, y - 8, cw + 16, ch + 16, 10);
    const steel = ctx.createLinearGradient(x, y, x + cw, y + ch);
    steel.addColorStop(0, '#27354b'); steel.addColorStop(0.5, '#101724'); steel.addColorStop(1, '#314057');
    ctx.fillStyle = steel; ctx.fill(); ctx.strokeStyle = 'rgba(159,184,232,0.4)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#03060b'; ctx.fillRect(x, y, cw, ch);
    const coldGlow = glowFactor(p.coldK);
    const coldColor = mixRGB([159, 184, 232], blackbodyRGB(p.coldK), coldGlow);
    ctx.strokeStyle = rgba(coldColor, 0.55); ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
    for (let i = 0; i < 5; i++) {
      line(ctx, x + cw - 8 + i * 2, y + 5, x + cw - 8 + i * 2, y + ch - 5, rgba(coldColor, 0.13 + i * 0.05));
    }
    for (const bx of [x - 3, x + cw + 3]) for (const by of [y - 3, y + ch + 3]) dot(ctx, bx, by, 2, '#4d5b70');

    ctx.save(); ctx.beginPath(); ctx.rect(x + 2, y + 2, cw - 4, ch - 4); ctx.clip();
    if (glow > 0) {
      const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.5);
      halo.addColorStop(0, rgba(incandescent, glow * 0.25)); halo.addColorStop(0.4, rgba(incandescent, glow * 0.12)); halo.addColorStop(1, rgba(incandescent, 0));
      ctx.fillStyle = halo; ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    }

    // Energy radiates in all directions. Show a selection of outgoing ray packets.
    const emission = Math.min(1, 0.2 + Math.log1p(d.emittedPower) / 13);
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      const dx = Math.cos(a), dy = Math.sin(a);
      const wallX = Math.abs(dx) < 1e-6 ? Infinity : ((dx > 0 ? x + cw : x) - cx) / dx;
      const wallY = Math.abs(dy) < 1e-6 ? Infinity : ((dy > 0 ? y + ch : y) - cy) / dy;
      const reach = Math.max(0, Math.min(wallX, wallY) - r);
      for (let packet = 0; packet < 2; packet++) {
        const f = (t * 0.3 + packet * 0.5 + i * 0.041) % 1;
        const distance = r + f * reach;
        const opacity = emission * (1 - f * 0.5) * 0.65;
        ctx.beginPath();
        for (let j = 0; j <= 20; j++) {
          const along = distance + j * 1.5;
          const wave = Math.sin(j * 0.65) * 2.5;
          const px = cx + along * Math.cos(a) - wave * Math.sin(a);
          const py = cy + along * Math.sin(a) + wave * Math.cos(a);
          if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(232,174,100,${opacity})`; ctx.lineWidth = 1.1; ctx.stroke();
      }
    }
    // Incoming enclosure radiation: rate ratio reflects T⁴cold/T⁴hot.
    const incoming = d.emittedPower > 0 ? d.absorbedPower / d.emittedPower : 0;
    for (let i = 0; i < 5; i++) {
      const iy = y + ch * (0.2 + i * 0.15);
      const f = (t * 0.3 + i * 0.19) % 1;
      const ix = x + cw - f * (x + cw - cx - r);
      ctx.beginPath();
      for (let j = 0; j < 15; j++) {
        const px = ix - j * 1.5, py = iy + Math.sin(j * 0.7) * 2;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `rgba(159,184,232,${Math.min(0.8, 0.05 + incoming * 0.65)})`; ctx.stroke();
    }

    // Metallic sphere with physically meaningful visible incandescence.
    const body = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.32, 0, cx, cy, r);
    body.addColorStop(0, rgba(mixRGB(color, [255, 255, 240], 0.4)));
    body.addColorStop(0.32, rgba(color)); body.addColorStop(0.75, rgba(mixRGB(color, [14, 18, 26], 0.4)));
    body.addColorStop(1, rgba(mixRGB(color, [5, 8, 15], 0.78)));
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = body; ctx.fill();
    ctx.strokeStyle = rgba(color, 0.6); ctx.stroke();
    ctx.restore();

    label(ctx, `${p.hotK} K`, cx, y - 23, '#e8c87a', mobile ? 14 : 18);
    label(ctx, `${p.coldK} K`, x + cw - 5, y - 23, rgba(coldColor), mobile ? 14 : 18, 'right');
    if (annotations) {
      label(ctx, 'HOT SPHERE', cx, y - 44, 'rgba(232,237,245,0.4)', 10);
      label(ctx, 'COLD ENCLOSURE', x + cw - 5, y - 44, 'rgba(232,237,245,0.4)', 10, 'right');
      label(ctx, 'VACUUM', x + cw * 0.73, cy - 7, 'rgba(232,237,245,0.45)', mobile ? 11 : 13);
      label(ctx, 'NO CONTACT · NO FLUID', x + cw * 0.73, cy + 14, 'rgba(232,237,245,0.3)', mobile ? 7 : 10);
      if (d.netPower > 0) arrow(ctx, cx + r + 18, y + ch + 37, x + cw - 4, y + ch + 37, 'rgba(232,200,122,0.6)');
      label(ctx, d.netPower > 0 ? 'NET ENERGY TRANSFER →' : 'BALANCED RADIATION', x + cw * 0.65, y + ch + 58, 'rgba(232,200,122,0.75)', mobile ? 9 : 11);
      label(ctx, `ε = ${p.emissivity.toFixed(2)}`, cx, y + ch + 36, 'rgba(232,237,245,0.65)', 11);
    }

    // Planck spectrum (same radiance scale for both temperatures; log wavelength).
    const chartX = mobile ? 22 : w * 0.09, chartW = mobile ? w - 44 : w * 0.53;
    const chartY = Math.max(y + ch + 80, h * 0.73);
    const chartH = Math.min(145, h - chartY - 48);
    if (chartH >= 80) {
      panel(ctx, chartX, chartY, chartW, chartH);
      label(ctx, 'EMISSION SPECTRUM · RELATIVE', chartX + 14, chartY + 20, 'rgba(168,213,232,0.55)', mobile ? 9 : 10, 'left');
      const ax = chartX + 18, ay = chartY + chartH - 22, aw = chartW - 36, ah = chartH - 53;
      line(ctx, ax, ay, ax + aw, ay);
      const peak = Math.max(p.emissivity * spectralRadiance(d.peakHot, p.hotK), spectralRadiance(d.peakCold, p.coldK));
      for (const [T, col, eps] of [[p.hotK, 'rgba(232,174,100,0.9)', p.emissivity], [p.coldK, 'rgba(159,184,232,0.7)', 1]] as const) {
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const lambda = Math.pow(10, -6.7 + i / 120 * 3); // 0.2–200 µm
          const value = Math.min(1, spectralRadiance(lambda, T) * eps / peak);
          const px = ax + aw * i / 120, py = ay - value * ah;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
      }
      for (const m of [1, 10, 100]) {
        const px = ax + aw * (Math.log10(m * 1e-6) + 6.7) / 3;
        label(ctx, `${m} µm`, px, ay + 14, 'rgba(232,237,245,0.4)', 9);
      }
      label(ctx, 'INFRARED', ax + aw - 3, chartY + 20, 'rgba(232,200,122,0.4)', 9, 'right');
    }
    if (!mobile) {
      label(ctx, 'NET RADIATIVE POWER', w * 0.8, chartY + 20, 'rgba(232,237,245,0.4)', 10);
      label(ctx, formatPowerText(d.netPower), w * 0.8, chartY + 58, '#e8c87a', 26);
      label(ctx, `λpeak = ${formatWavelength(d.peakHot)}`, w * 0.8, chartY + 88, 'rgba(168,213,232,0.65)', 11);
    }
    label(ctx, 'RAYS SHOWN SYMBOLICALLY · SPEED NOT TO SCALE', mobile ? w / 2 : 28, h - 23, 'rgba(232,237,245,0.35)', mobile ? 8 : 10, mobile ? 'center' : 'left');
  }
}
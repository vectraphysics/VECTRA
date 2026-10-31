import { useRef, useEffect } from 'react';
import type { WaveParameters, WaveDerivedData } from '@/lib/wavePhysics';
import { firstCrestPosition, waveValue } from '@/lib/wavePhysics';

export interface WaveCanvasConfig {
  params: WaveParameters;
  derived: WaveDerivedData;
  isPlaying: boolean;
  speedMultiplier: number;
  showMeasurements: boolean;
  showGrid: boolean;
  showEquilibrium: boolean;
}

const WAVE_COLOR = '#65cbd8';
const WAVE_GLOW = 'rgba(101, 203, 216, 0.13)';
const ACCENT_GOLD = '#e8c87a';
const GRID_COLOR = 'rgba(120, 150, 200, 0.055)';
const EQUILIBRIUM_COLOR = 'rgba(168, 213, 232, 0.2)';

/**
 * Canvas renderer for a travelling sinusoidal wave.
 * Measurement geometry is calculated from the same phase equation as the
 * plotted curve. No decorative crest markers are drawn.
 */
export function useWaveCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
  config: WaveCanvasConfig
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const configRef = useRef(config);

  configRef.current = config;

  useEffect(() => {
    const canvasNode = canvasRef.current;
    const containerNode = containerRef.current;
    if (!canvasNode || !containerNode) return;

    const context = canvasNode.getContext('2d');
    if (!context) return;

    // Explicit non-null aliases are safe after the guards above and remain
    // narrowed inside the nested renderer callbacks used by this effect.
    const canvas: HTMLCanvasElement = canvasNode;
    const container: HTMLDivElement = containerNode;
    const ctx: CanvasRenderingContext2D = context;

    let width = 0;
    let height = 0;
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width <= 0 || height <= 0) return;

      // A 1.5 DPR cap limits fill-rate and memory use on lower-powered phones.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawGrid() {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      const gridSize = 50;
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }

    function drawEquilibrium(cy: number) {
      ctx.strokeStyle = EQUILIBRIUM_COLOR;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawWave(cy: number) {
      const { params, derived } = configRef.current;
      const t = timeRef.current;
      const step = 2;

      // A restrained under-stroke gives the curve separation without particle effects.
      ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        const y = cy + waveValue(x, t, params, derived);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = WAVE_GLOW;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#55c5d4');
      gradient.addColorStop(0.55, '#86d8dc');
      gradient.addColorStop(1, '#b7d9d4');

      ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        const y = cy + waveValue(x, t, params, derived);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(101, 203, 216, 0.28)';
      ctx.shadowBlur = 7;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function drawLabel(text: string, x: number, y: number, align: CanvasTextAlign = 'left') {
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.textAlign = align;
      const metrics = ctx.measureText(text);
      const textX = align === 'center' ? x - metrics.width / 2 : align === 'right' ? x - metrics.width : x;
      ctx.fillStyle = 'rgba(4, 6, 13, 0.88)';
      ctx.fillRect(textX - 5, y - 11, metrics.width + 10, 16);
      ctx.fillStyle = ACCENT_GOLD;
      ctx.fillText(text, x, y);
    }

    function drawArrowHead(x: number, y: number, direction: 1 | -1) {
      const size = 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - size, y + direction * size);
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y + direction * size);
      ctx.stroke();
    }

    function drawMeasurements(cy: number) {
      const { params, derived } = configRef.current;
      const { amplitude, wavelength, direction } = params;
      if (amplitude <= 0 || wavelength <= 0 || derived.waveNumber <= 0) return;

      // Amplitude is the maximum displacement from equilibrium, not the
      // instantaneous displacement at an arbitrary point on the curve.
      const crestY = cy - amplitude;
      const troughY = cy + amplitude;
      const amplitudeX = 24;

      ctx.save();
      ctx.strokeStyle = 'rgba(232, 200, 122, 0.38)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(12, crestY);
      ctx.lineTo(width - 12, crestY);
      ctx.moveTo(12, troughY);
      ctx.lineTo(width - 12, troughY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = ACCENT_GOLD;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(amplitudeX, cy);
      ctx.lineTo(amplitudeX, crestY);
      ctx.stroke();
      drawArrowHead(amplitudeX, cy, -1);
      drawArrowHead(amplitudeX, crestY, 1);
      drawLabel(`A = ${amplitude.toFixed(0)} px`, amplitudeX + 12, cy - amplitude / 2 + 3);
      ctx.restore();

      // Find two consecutive mathematical crests that both fit in the view.
      // Their separation is exactly lambda, regardless of phase or direction.
      const firstCrest = firstCrestPosition(timeRef.current, params, derived);
      const leftMargin = 26;
      const rightMargin = width - 26;
      const cycleOffset = Math.ceil((leftMargin - firstCrest) / wavelength);
      const crest1 = firstCrest + cycleOffset * wavelength;
      const crest2 = crest1 + wavelength;

      ctx.save();
      ctx.strokeStyle = ACCENT_GOLD;
      ctx.fillStyle = ACCENT_GOLD;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.78;

      if (crest1 >= leftMargin && crest2 <= rightMargin) {
        // Keep the bracket inside the canvas even at the maximum amplitude.
        const measureY = Math.min(height - 28, cy + amplitude + 38);
        ctx.beginPath();
        ctx.moveTo(crest1, crestY);
        ctx.lineTo(crest1, measureY);
        ctx.moveTo(crest2, crestY);
        ctx.lineTo(crest2, measureY);
        ctx.moveTo(crest1, measureY);
        ctx.lineTo(crest2, measureY);
        ctx.stroke();

        const head = 5;
        ctx.beginPath();
        ctx.moveTo(crest1, measureY);
        ctx.lineTo(crest1 + head, measureY - head);
        ctx.moveTo(crest1, measureY);
        ctx.lineTo(crest1 + head, measureY + head);
        ctx.moveTo(crest2, measureY);
        ctx.lineTo(crest2 - head, measureY - head);
        ctx.moveTo(crest2, measureY);
        ctx.lineTo(crest2 - head, measureY + head);
        ctx.stroke();

        drawLabel(`\u03bb = ${wavelength.toFixed(0)} px`, (crest1 + crest2) / 2, measureY - 8, 'center');
      } else {
        // Do not draw a shortened bracket that could be mistaken for lambda.
        drawLabel(
          `\u03bb = ${wavelength.toFixed(0)} px · full span outside view`,
          width / 2,
          height - 14,
          'center'
        );
      }
      ctx.restore();

      // Propagation direction indicator.
      const arrowX = width - 44;
      const arrowY = 32;
      const sign = direction;
      ctx.save();
      ctx.strokeStyle = WAVE_COLOR;
      ctx.fillStyle = WAVE_COLOR;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(arrowX - 17 * sign, arrowY);
      ctx.lineTo(arrowX + 17 * sign, arrowY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrowX + 17 * sign, arrowY);
      ctx.lineTo(arrowX + 10 * sign, arrowY - 4);
      ctx.lineTo(arrowX + 10 * sign, arrowY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(direction === 1 ? 'RIGHT' : 'LEFT', arrowX, arrowY + 17);
      ctx.restore();
    }

    function render(now: number) {
      const cfg = configRef.current;
      const dt = lastFrameRef.current > 0
        ? Math.min((now - lastFrameRef.current) / 1000, 0.05)
        : 0;
      lastFrameRef.current = now;

      if (cfg.isPlaying && !reducedMotion) {
        timeRef.current += dt * cfg.speedMultiplier;
      }

      ctx.fillStyle = '#04060d';
      ctx.fillRect(0, 0, width, height);

      const cy = height / 2;
      if (cfg.showGrid) drawGrid();
      if (cfg.showEquilibrium) drawEquilibrium(cy);
      drawWave(cy);
      if (cfg.showMeasurements) drawMeasurements(cy);

      if (!document.hidden) {
        animRef.current = requestAnimationFrame(render);
      } else {
        animRef.current = 0;
        lastFrameRef.current = 0;
      }
    }

    function startAnimation() {
      if (document.hidden || animRef.current !== 0) return;
      lastFrameRef.current = 0;
      animRef.current = requestAnimationFrame(render);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
        animRef.current = 0;
        lastFrameRef.current = 0;
      } else {
        startAnimation();
      }
    }

    function handleReducedMotionChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      lastFrameRef.current = 0;
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', handleReducedMotionChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startAnimation();

    return () => {
      cancelAnimationFrame(animRef.current);
      resizeObserver.disconnect();
      motionQuery.removeEventListener('change', handleReducedMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [containerRef]);

  return canvasRef;
}

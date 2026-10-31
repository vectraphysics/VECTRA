import { useRef, useEffect } from 'react';
import type { WaveParameters, WaveDerivedData } from '@/lib/wavePhysics';
import { waveValue } from '@/lib/wavePhysics';

export interface WaveCanvasConfig {
  params: WaveParameters;
  derived: WaveDerivedData;
  isPlaying: boolean;
  speedMultiplier: number;
  showMeasurements: boolean;
  showGrid: boolean;
  showEquilibrium: boolean;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  twinkle: number;
  phase: number;
}

const WAVE_COLOR = '#5ec8d8';
const WAVE_GLOW = 'rgba(94, 200, 216, 0.15)';
const ACCENT_GOLD = '#e8c87a';
const GRID_COLOR = 'rgba(120, 150, 200, 0.06)';
const EQUILIBRIUM_COLOR = 'rgba(168, 213, 232, 0.15)';

/**
 * Canvas-based wave renderer. Draws a travelling sinusoidal wave with glow,
 * optional grid, equilibrium line, and measurement indicators.
 *
 * Uses requestAnimationFrame with a single animation loop. All draw operations
 * are done on a 2D canvas — no DOM elements are created per frame.
 */
export function useWaveCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
  config: WaveCanvasConfig
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const starsRef = useRef<Star[]>([]);
  const configRef = useRef(config);
  const dprRef = useRef(1);

  // Keep configRef in sync without re-creating the animation loop
  configRef.current = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas || !container || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateStars();
    }

    function generateStars() {
      const count = Math.floor((width * height) / 8000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.1 + 0.2,
        twinkle: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function drawStars(t: number) {
      if (!ctx) return;
      for (const s of starsRef.current) {
        const opacity = 0.15 + Math.sin(t * s.twinkle + s.phase) * 0.12;
        const clamped = Math.max(0.05, Math.min(0.4, opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 237, 245, ${clamped})`;
        ctx.fill();
      }
    }

    function drawGrid() {
      if (!ctx) return;
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      const gridSize = 40;
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
      if (!ctx) return;
      ctx.strokeStyle = EQUILIBRIUM_COLOR;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function drawWave(cy: number) {
      if (!ctx) return;
      const cfg = configRef.current;
      const { params, derived } = cfg;
      const t = timeRef.current;

      // Glow layer — thick, low-opacity stroke
      ctx.strokeStyle = WAVE_GLOW;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const step = 2;
      let first = true;
      for (let x = 0; x <= width; x += step) {
        const y = cy + waveValue(x, t, params, derived);
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Main wave line
      ctx.strokeStyle = WAVE_COLOR;
      ctx.lineWidth = 2;
      ctx.shadowColor = WAVE_COLOR;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      first = true;
      for (let x = 0; x <= width; x += step) {
        const y = cy + waveValue(x, t, params, derived);
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Crest dots for visual polish
      ctx.fillStyle = WAVE_COLOR;
      const k = derived.waveNumber;
      if (k > 0) {
        // Crests occur where sin(kx - ωt + φ) = 1, i.e. kx - ωt + φ = π/2 + 2nπ
        const sign = params.direction === 1 ? -1 : 1;
        const phaseTerm = sign * derived.angularFrequency * t + params.phase;
        // Find first crest: kx = π/2 - phaseTerm + 2nπ
        let firstCrestX = (Math.PI / 2 - phaseTerm) / k;
        // Normalize to [0, wavelength)
        const lambda = params.wavelength;
        firstCrestX = ((firstCrestX % lambda) + lambda) % lambda;

        for (let cx = firstCrestX; cx <= width; cx += lambda) {
          ctx.beginPath();
          ctx.arc(cx, cy - params.amplitude, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function drawMeasurements(cy: number) {
      if (!ctx) return;
      const cfg = configRef.current;
      const { params, derived } = cfg;
      const t = timeRef.current;
      const lambda = params.wavelength;
      const A = params.amplitude;
      const k = derived.waveNumber;

      if (k <= 0 || lambda <= 0) return;

      // Find crest positions
      const sign = params.direction === 1 ? -1 : 1;
      const phaseTerm = sign * derived.angularFrequency * t + params.phase;
      let firstCrestX = (Math.PI / 2 - phaseTerm) / k;
      firstCrestX = ((firstCrestX % lambda) + lambda) % lambda;

      // Pick two crests within view for wavelength measurement
      let c1 = firstCrestX;
      let c2 = c1 + lambda;
      if (c2 > width - 40) {
        // Shift back so both are visible
        while (c1 > 40 && c2 > width - 40) {
          c1 -= lambda;
          c2 -= lambda;
        }
      }
      if (c1 < 20) {
        c1 += lambda;
        c2 += lambda;
      }

      const measureY = cy + A + 45;

      // Wavelength bracket
      if (c2 <= width - 10) {
        ctx.strokeStyle = ACCENT_GOLD;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        // Vertical lines from crests down to measurement line
        ctx.beginPath();
        ctx.moveTo(c1, cy - A);
        ctx.lineTo(c1, measureY);
        ctx.moveTo(c2, cy - A);
        ctx.lineTo(c2, measureY);
        ctx.stroke();
        // Horizontal bracket
        ctx.beginPath();
        ctx.moveTo(c1, measureY);
        ctx.lineTo(c2, measureY);
        ctx.stroke();
        // Arrowheads
        const ah = 5;
        ctx.beginPath();
        ctx.moveTo(c1, measureY);
        ctx.lineTo(c1 + ah, measureY - ah);
        ctx.moveTo(c1, measureY);
        ctx.lineTo(c1 + ah, measureY + ah);
        ctx.moveTo(c2, measureY);
        ctx.lineTo(c2 - ah, measureY - ah);
        ctx.moveTo(c2, measureY);
        ctx.lineTo(c2 - ah, measureY + ah);
        ctx.stroke();
        // Label
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = ACCENT_GOLD;
        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`λ = ${lambda.toFixed(0)}px`, (c1 + c2) / 2, measureY + 16);
        ctx.globalAlpha = 1;
      }

      // Amplitude measurement — at the first visible crest
      const ampX = c1 < width - 60 ? c1 : firstCrestX;
      if (ampX >= 20 && ampX <= width - 20) {
        ctx.strokeStyle = ACCENT_GOLD;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        // Double-headed arrow from equilibrium to crest
        ctx.beginPath();
        ctx.moveTo(ampX, cy);
        ctx.lineTo(ampX, cy - A);
        ctx.stroke();
        // Arrowheads
        const ah = 4;
        ctx.beginPath();
        ctx.moveTo(ampX, cy);
        ctx.lineTo(ampX - ah, cy - ah);
        ctx.moveTo(ampX, cy);
        ctx.lineTo(ampX + ah, cy - ah);
        ctx.moveTo(ampX, cy - A);
        ctx.lineTo(ampX - ah, cy - A + ah);
        ctx.moveTo(ampX, cy - A);
        ctx.lineTo(ampX + ah, cy - A + ah);
        ctx.stroke();
        // Label
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = ACCENT_GOLD;
        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`A = ${A.toFixed(0)}px`, ampX + 8, cy - A / 2 + 4);
        ctx.globalAlpha = 1;
      }

      // Direction arrow — at top right area
      const dirX = width - 80;
      const dirY = 40;
      const dir = params.direction;
      ctx.strokeStyle = WAVE_COLOR;
      ctx.fillStyle = WAVE_COLOR;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(dirX - 20 * dir, dirY);
      ctx.lineTo(dirX + 20 * dir, dirY);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(dirX + 20 * dir, dirY);
      ctx.lineTo(dirX + (20 - 6) * dir, dirY - 4);
      ctx.lineTo(dirX + (20 - 6) * dir, dirY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.7;
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(dir === 1 ? '→ v' : '← v', dirX, dirY + 16);
      ctx.globalAlpha = 1;
    }

    function render(now: number) {
      if (!ctx) return;
      const cfg = configRef.current;

      // Time advancement
      const dt = lastFrameRef.current > 0 ? (now - lastFrameRef.current) / 1000 : 0;
      lastFrameRef.current = now;
      if (cfg.isPlaying) {
        timeRef.current += dt * cfg.speedMultiplier;
      }

      // Background
      ctx.fillStyle = '#04060d';
      ctx.fillRect(0, 0, width, height);

      // Stars
      drawStars(now / 1000);

      // Center Y
      const cy = height / 2;

      // Grid
      if (cfg.showGrid) drawGrid();

      // Equilibrium
      if (cfg.showEquilibrium) drawEquilibrium(cy);

      // Wave
      drawWave(cy);

      // Measurements
      if (cfg.showMeasurements) drawMeasurements(cy);

      animRef.current = requestAnimationFrame(render);
    }

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [containerRef]);

  return canvasRef;
}

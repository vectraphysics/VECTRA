import { useRef, useEffect } from 'react';
import type { DoubleSlitParameters, SlitMode } from '@/lib/doubleSlitPhysics';
import { sampleDetectionPosition, theoreticalDistribution } from '@/lib/doubleSlitPhysics';

export interface DoubleSlitCanvasConfig {
  params: DoubleSlitParameters;
  mode: SlitMode;
  isPlaying: boolean;
  speedMultiplier: number;
  showProbability: boolean;
  showGrid: boolean;
  particleType: 'photon' | 'electron';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  phase: 'source-to-barrier' | 'barrier-to-screen';
  age: number;
  speed: number;
}

interface Impact {
  y: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  twinkle: number;
  phase: number;
}

const MAX_PARTICLES = 80;
const MAX_IMPACTS = 5000;
const PARTICLE_COLOR_PHOTON = '#5ec8d8';
const PARTICLE_COLOR_ELECTRON = '#a8d5e8';
const BARRIER_COLOR = '#2a3450';
const SOURCE_COLOR = '#5ec8d8';
const SCREEN_COLOR = '#1a2138';
const GRID_COLOR = 'rgba(120, 150, 200, 0.05)';

/**
 * Canvas-based double-slit experiment renderer.
 *
 * Layout (horizontal beam, left-to-right):
 *   [Source] →→→ [Barrier with slits] →→→ [Detection screen]
 *
 * Particles are emitted from the source, travel to the barrier, pass through
 * a slit, then travel to the screen where they are detected at a position
 * sampled from the quantum probability distribution. The detection point
 * persists, and the pattern accumulates statistically.
 */
export function useDoubleSlitCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
  config: DoubleSlitCanvasConfig,
  detectorCountRef: React.MutableRefObject<number>,
  onParticleDetected: () => void
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const impactsRef = useRef<Impact[]>([]);
  const emissionAccumRef = useRef(0);
  const lastFrameRef = useRef(0);
  const starsRef = useRef<Star[]>([]);
  const configRef = useRef(config);
  const detectorCountInternal = useRef(0);
  const distCacheRef = useRef<{ y: number; prob: number }[] | null>(null);
  const distCacheKeyRef = useRef('');

  configRef.current = config;

  // Keep the external counter ref in sync
  useEffect(() => {
    detectorCountRef.current = detectorCountInternal.current;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = false;

    // Layout positions — computed from canvas size
    let sourceX = 0, barrierX = 0, screenX = 0, centerY = 0;

    function resize() {
      if (!canvas || !container || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sourceX = width * 0.08;
      barrierX = width * 0.45;
      screenX = width * 0.88;
      centerY = height / 2;

      generateStars();
    }

    function generateStars() {
      const count = Math.floor((width * height) / 10000);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.0 + 0.2,
        twinkle: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function drawStars(t: number) {
      if (!ctx) return;
      for (const s of starsRef.current) {
        const opacity = 0.1 + Math.sin(t * s.twinkle + s.phase) * 0.08;
        const clamped = Math.max(0.03, Math.min(0.3, opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 237, 245, ${clamped})`;
        ctx.fill();
      }
    }

    function drawGrid() {
      if (!ctx) return;
      const cfg = configRef.current;
      if (!cfg.showGrid) return;
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

    function drawSource() {
      if (!ctx) return;
      // Source glow
      const grad = ctx.createRadialGradient(sourceX, centerY, 0, sourceX, centerY, 25);
      grad.addColorStop(0, 'rgba(94, 200, 216, 0.3)');
      grad.addColorStop(1, 'rgba(94, 200, 216, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(sourceX - 25, centerY - 25, 50, 50);

      // Source circle
      ctx.fillStyle = SOURCE_COLOR;
      ctx.beginPath();
      ctx.arc(sourceX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Source ring
      ctx.strokeStyle = 'rgba(94, 200, 216, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sourceX, centerY, 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    function drawBarrier() {
      if (!ctx) return;
      const cfg = configRef.current;
      const { slitSeparation, slitWidth } = cfg.params;
      const mode = cfg.mode;

      const halfSep = slitSeparation / 2;
      const halfWidth = slitWidth / 2;

      ctx.fillStyle = BARRIER_COLOR;
      const barrierWidth = 6;
      const bx = barrierX - barrierWidth / 2;

      if (mode === 'double') {
        // Top segment (above top slit)
        const topSlitTop = centerY - halfSep - halfWidth;
        const topSlitBottom = centerY - halfSep + halfWidth;
        const bottomSlitTop = centerY + halfSep - halfWidth;
        const bottomSlitBottom = centerY + halfSep + halfWidth;

        ctx.fillRect(bx, 0, barrierWidth, topSlitTop);
        // Middle segment
        ctx.fillRect(bx, topSlitBottom, barrierWidth, bottomSlitTop - topSlitBottom);
        // Bottom segment
        ctx.fillRect(bx, bottomSlitBottom, barrierWidth, height - bottomSlitBottom);
      } else {
        // Single slit — centered
        const slitTop = centerY - halfWidth;
        const slitBottom = centerY + halfWidth;
        ctx.fillRect(bx, 0, barrierWidth, slitTop);
        ctx.fillRect(bx, slitBottom, barrierWidth, height - slitBottom);
      }

      // Slit edge highlights
      ctx.strokeStyle = 'rgba(168, 213, 232, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (mode === 'double') {
        const halfSepVal = halfSep;
        const halfWVal = halfWidth;
        // Top slit edges
        ctx.moveTo(bx, centerY - halfSepVal - halfWVal);
        ctx.lineTo(bx + barrierWidth, centerY - halfSepVal - halfWVal);
        ctx.moveTo(bx, centerY - halfSepVal + halfWVal);
        ctx.lineTo(bx + barrierWidth, centerY - halfSepVal + halfWVal);
        // Bottom slit edges
        ctx.moveTo(bx, centerY + halfSepVal - halfWVal);
        ctx.lineTo(bx + barrierWidth, centerY + halfSepVal - halfWVal);
        ctx.moveTo(bx, centerY + halfSepVal + halfWVal);
        ctx.lineTo(bx + barrierWidth, centerY + halfSepVal + halfWVal);
      } else {
        ctx.moveTo(bx, centerY - halfWidth);
        ctx.lineTo(bx + barrierWidth, centerY - halfWidth);
        ctx.moveTo(bx, centerY + halfWidth);
        ctx.lineTo(bx + barrierWidth, centerY + halfWidth);
      }
      ctx.stroke();
    }

    function drawScreen() {
      if (!ctx) return;
      const screenW = 4;
      ctx.fillStyle = SCREEN_COLOR;
      ctx.fillRect(screenX - screenW / 2, 0, screenW, height);
      // Screen edge highlight
      ctx.strokeStyle = 'rgba(120, 150, 200, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();
    }

    function drawImpacts() {
      if (!ctx) return;
      for (const imp of impactsRef.current) {
        ctx.fillStyle = `rgba(232, 200, 122, ${imp.opacity})`;
        ctx.beginPath();
        ctx.arc(screenX, centerY + imp.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawProbabilityOverlay() {
      if (!ctx) return;
      const cfg = configRef.current;
      if (!cfg.showProbability) return;

      // Cache the distribution — recompute only when params change
      const cacheKey = `${cfg.params.wavelength}-${cfg.params.slitSeparation}-${cfg.params.slitWidth}-${cfg.params.screenDistance}-${cfg.mode}`;
      if (cacheKey !== distCacheKeyRef.current) {
        const maxScreenY = height * 0.45;
        distCacheRef.current = theoreticalDistribution(cfg.params, cfg.mode, maxScreenY);
        distCacheKeyRef.current = cacheKey;
      }

      const dist = distCacheRef.current;
      if (!dist || dist.length < 2) return;

      const overlayWidth = 60;
      const overlayX = screenX + 10;

      // Draw the curve
      ctx.strokeStyle = 'rgba(94, 200, 216, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < dist.length; i++) {
        const px = overlayX + dist[i].prob * overlayWidth;
        const py = centerY + dist[i].y;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Fill area
      ctx.fillStyle = 'rgba(94, 200, 216, 0.06)';
      ctx.beginPath();
      ctx.moveTo(overlayX, centerY + dist[0].y);
      for (let i = 0; i < dist.length; i++) {
        const px = overlayX + dist[i].prob * overlayWidth;
        const py = centerY + dist[i].y;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(overlayX, centerY + dist[dist.length - 1].y);
      ctx.closePath();
      ctx.fill();
    }

    function drawParticles() {
      if (!ctx) return;
      const cfg = configRef.current;
      const color = cfg.particleType === 'photon' ? PARTICLE_COLOR_PHOTON : PARTICLE_COLOR_ELECTRON;

      for (const p of particlesRef.current) {
        // Fade in based on age
        const opacity = Math.min(1, p.age * 4);
        ctx.fillStyle = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Subtle trail
        ctx.strokeStyle = `rgba(94, 200, 216, ${opacity * 0.15})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 0.01, p.y - p.vy * 0.01);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    function emitParticle() {
      const cfg = configRef.current;
      const maxScreenY = height * 0.45;
      const targetY = sampleDetectionPosition(cfg.params, cfg.mode, maxScreenY);

      // Particle travels source → barrier → screen
      const speed = 200 * cfg.speedMultiplier;
      const vx = speed;

      particlesRef.current.push({
        x: sourceX,
        y: centerY,
        vx,
        vy: 0,
        targetY,
        phase: 'source-to-barrier',
        age: 0,
        speed,
      });
    }

    function updateParticles(dt: number) {
      const cfg = configRef.current;
      if (!cfg.isPlaying) return;

      const remaining: Particle[] = [];

      for (const p of particlesRef.current) {
        p.age += dt;

        if (p.phase === 'source-to-barrier') {
          p.x += p.vx * dt;
          if (p.x >= barrierX) {
            // Particle reaches barrier — switch to screen phase
            p.phase = 'barrier-to-screen';
            p.x = barrierX;
            // Set velocity toward target Y on screen
            const dx = screenX - barrierX;
            const dy = p.targetY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const time = dist / p.speed;
            p.vx = dx / time;
            p.vy = dy / time;
          }
          remaining.push(p);
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x >= screenX) {
            // Particle detected!
            impactsRef.current.push({ y: p.targetY, opacity: 0.7 });
            if (impactsRef.current.length > MAX_IMPACTS) {
              impactsRef.current.shift();
            }
            detectorCountInternal.current++;
            onParticleDetected();
          } else {
            remaining.push(p);
          }
        }
      }
      particlesRef.current = remaining;
    }

    const schedule = () => {
      if (isVisible && !document.hidden && animRef.current === 0) {
        animRef.current = requestAnimationFrame(render);
      }
    };

    function render(now: number) {
      animRef.current = 0;
      if (!ctx || !isVisible || document.hidden) return;
      const cfg = configRef.current;

      const dt = lastFrameRef.current > 0 ? Math.min(0.05, (now - lastFrameRef.current) / 1000) : 0;
      lastFrameRef.current = now;

      // Emission
      if (cfg.isPlaying) {
        emissionAccumRef.current += dt * cfg.params.emissionRate * cfg.speedMultiplier;
        while (emissionAccumRef.current >= 1 && particlesRef.current.length < MAX_PARTICLES) {
          emitParticle();
          emissionAccumRef.current -= 1;
        }
        // Cap accumulated emissions
        if (emissionAccumRef.current > 10) emissionAccumRef.current = 0;
      }

      // Update particles
      updateParticles(dt);

      // Draw
      ctx.fillStyle = '#04060d';
      ctx.fillRect(0, 0, width, height);

      drawStars(now / 1000);
      drawGrid();
      drawSource();
      drawBarrier();
      drawScreen();
      drawImpacts();
      drawProbabilityOverlay();
      drawParticles();

      schedule();
    }

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    const intersection = new IntersectionObserver((entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting);
      lastFrameRef.current = 0;
      if (isVisible) schedule();
      else {
        cancelAnimationFrame(animRef.current);
        animRef.current = 0;
      }
    });
    intersection.observe(container);
    const onVisibilityChange = () => {
      lastFrameRef.current = 0;
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
        animRef.current = 0;
      } else {
        schedule();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(animRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      intersection.disconnect();
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  // Expose methods to clear detector
  const clearDetector = () => {
    impactsRef.current = [];
    detectorCountInternal.current = 0;
    detectorCountRef.current = 0;
  };

  const resetAll = () => {
    particlesRef.current = [];
    impactsRef.current = [];
    detectorCountInternal.current = 0;
    detectorCountRef.current = 0;
    emissionAccumRef.current = 0;
  };

  return { canvasRef, clearDetector, resetAll };
}

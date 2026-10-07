import type { HeatTransferControls } from '@/hooks/useHeatTransferSimulation';
import { background, type View } from './heatTransfer/drawing';
import { ConductionRenderer } from './heatTransfer/ConductionRenderer';
import { ConvectionRenderer } from './heatTransfer/ConvectionRenderer';
import { RadiationRenderer } from './heatTransfer/RadiationRenderer';

/** One 2D-canvas lifecycle for all three thermal experiments. No WebGL dependency. */
export class HeatTransferEngine {
  private ctx: CanvasRenderingContext2D | null;
  private conduction = new ConductionRenderer();
  private convection = new ConvectionRenderer();
  private radiation = new RadiationRenderer();
  private width = 0;
  private height = 0;
  private time = 0;
  private lastNow = 0;
  private lastDraw = 0;
  private frame = 0;
  private dirty = true;
  private observer: ResizeObserver;
  private drag = false;
  private disposed = false;

  constructor(private canvas: HTMLCanvasElement, private config: HeatTransferControls) {
    this.ctx = canvas.getContext('2d');
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas.parentElement ?? canvas);
    canvas.addEventListener('pointerdown', this.pointerDown);
    canvas.addEventListener('pointermove', this.pointerMove);
    canvas.addEventListener('pointerup', this.pointerUp);
    canvas.addEventListener('pointercancel', this.pointerUp);
    this.resize();
    this.frame = requestAnimationFrame(this.render);
  }

  update(config: HeatTransferControls) {
    if (config.resetKey !== this.config.resetKey) this.time = 0;
    this.config = config;
    this.dirty = true;
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width; this.height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.dirty = true;
  }

  private render = (now: number) => {
    if (this.disposed) return;
    const dt = this.lastNow ? Math.min(0.05, (now - this.lastNow) / 1000) : 0;
    this.lastNow = now;
    if (this.config.isPlaying && !document.hidden) this.time += dt;
    // Cap drawing at 30 fps. Paused/static frames are only redrawn on a change.
    if (this.ctx && (this.dirty || (this.config.isPlaying && now - this.lastDraw >= 1000 / 30)) && !document.hidden) {
      this.draw(this.ctx);
      this.lastDraw = now; this.dirty = false;
    }
    this.frame = requestAnimationFrame(this.render);
  };

  private draw(ctx: CanvasRenderingContext2D) {
    const c = this.config;
    ctx.clearRect(0, 0, this.width, this.height);
    background(ctx, this.width, this.height);
    const v: View = { width: this.width, height: this.height, time: this.time, annotations: c.showAnnotations };
    ctx.save();
    if (c.mode === 'conduction') this.conduction.draw(ctx, v, c.conduction, c.conductionData, c.probe);
    if (c.mode === 'convection') this.convection.draw(ctx, v, c.convection, c.convectionData);
    if (c.mode === 'radiation') this.radiation.draw(ctx, v, c.radiation, c.radiationData);
    ctx.restore();
  }

  private setProbe(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const { rodStart, rodEnd } = this.conduction;
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left - rodStart) / Math.max(1, rodEnd - rodStart)));
    this.config.setProbe(fraction);
  }
  private pointerDown = (e: PointerEvent) => {
    if (this.config.mode !== 'conduction') return;
    const rect = this.canvas.getBoundingClientRect();
    if (Math.abs(e.clientY - rect.top - this.conduction.rodY) > 60) return;
    this.drag = true;
    this.canvas.setPointerCapture(e.pointerId);
    this.setProbe(e);
  };
  private pointerMove = (e: PointerEvent) => { if (this.drag) this.setProbe(e); };
  private pointerUp = (e: PointerEvent) => {
    this.drag = false;
    if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.canvas.removeEventListener('pointerdown', this.pointerDown);
    this.canvas.removeEventListener('pointermove', this.pointerMove);
    this.canvas.removeEventListener('pointerup', this.pointerUp);
    this.canvas.removeEventListener('pointercancel', this.pointerUp);
  }
}
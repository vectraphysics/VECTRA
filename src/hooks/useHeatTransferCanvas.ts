import { useEffect, useRef } from 'react';
import type { HeatTransferControls } from './useHeatTransferSimulation';
import { HeatTransferEngine } from '@/lib/HeatTransferEngine';

export function useHeatTransferCanvas(config: HeatTransferControls) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HeatTransferEngine | null>(null);
  const initial = useRef(config);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new HeatTransferEngine(canvasRef.current, initial.current);
    engineRef.current = engine;
    return () => { engine.dispose(); engineRef.current = null; };
  }, []);

  useEffect(() => { engineRef.current?.update(config); }, [config]);
  return canvasRef;
}
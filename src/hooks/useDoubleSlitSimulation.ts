import { useCallback, useMemo, useRef, useState } from 'react';
import {
  type DoubleSlitParameters,
  type DoubleSlitDerivedData,
  type SlitMode,
  type ParticleType,
  DEFAULT_DS_PARAMS,
  deriveDSData,
} from '@/lib/doubleSlitPhysics';
import { useDoubleSlitCanvas } from './useDoubleSlitCanvas';

export interface DoubleSlitControls {
  // Parameters
  params: DoubleSlitParameters;
  derived: DoubleSlitDerivedData;
  mode: SlitMode;
  particleType: ParticleType;
  // Playback
  isPlaying: boolean;
  speed: number;
  // Visualization
  showProbability: boolean;
  showGrid: boolean;
  // Detection
  particlesDetected: number;
  // Canvas
  canvasRef: React.RefObject<HTMLCanvasElement>;
  // Actions
  togglePlay: () => void;
  reset: () => void;
  clearDetector: () => void;
  setSpeed: (s: number) => void;
  setWavelength: (v: number) => void;
  setSlitSeparation: (v: number) => void;
  setSlitWidth: (v: number) => void;
  setScreenDistance: (v: number) => void;
  setEmissionRate: (v: number) => void;
  setMode: (m: SlitMode) => void;
  setParticleType: (t: ParticleType) => void;
  toggleProbability: () => void;
  toggleGrid: () => void;
}

export function useDoubleSlitSimulation(
  containerRef: React.RefObject<HTMLDivElement | null>
): DoubleSlitControls {
  const [params, setParams] = useState<DoubleSlitParameters>({ ...DEFAULT_DS_PARAMS });
  const [mode, setModeState] = useState<SlitMode>('double');
  const [particleType, setParticleTypeState] = useState<ParticleType>('photon');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeedState] = useState(1);
  const [showProbability, setShowProbability] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [particlesDetected, setParticlesDetected] = useState(0);

  const detectorCountRef = useRef(0);

  const derived = useMemo(() => deriveDSData(params), [params]);

  const { canvasRef, clearDetector: canvasClearDetector, resetAll: canvasResetAll } =
    useDoubleSlitCanvas(
      containerRef,
      {
        params,
        mode,
        isPlaying,
        speedMultiplier: speed,
        showProbability,
        showGrid,
        particleType,
      },
      detectorCountRef,
      () => setParticlesDetected(detectorCountRef.current)
    );

  const togglePlay = useCallback(() => setIsPlaying((v) => !v), []);

  const clearDetector = useCallback(() => {
    canvasClearDetector();
    setParticlesDetected(0);
  }, [canvasClearDetector]);

  const reset = useCallback(() => {
    setParams({ ...DEFAULT_DS_PARAMS });
    setModeState('double');
    setParticleTypeState('photon');
    setIsPlaying(true);
    setSpeedState(1);
    setShowProbability(false);
    setShowGrid(false);
    canvasResetAll();
    setParticlesDetected(0);
  }, [canvasResetAll]);

  const setSpeed = useCallback((s: number) => setSpeedState(s), []);

  const setWavelength = useCallback((v: number) => {
    setParams((p) => ({ ...p, wavelength: Math.max(1, Math.min(100, v)) }));
  }, []);

  const setSlitSeparation = useCallback((v: number) => {
    setParams((p) => ({ ...p, slitSeparation: Math.max(10, Math.min(200, v)) }));
  }, []);

  const setSlitWidth = useCallback((v: number) => {
    setParams((p) => ({ ...p, slitWidth: Math.max(2, Math.min(60, v)) }));
  }, []);

  const setScreenDistance = useCallback((v: number) => {
    setParams((p) => ({ ...p, screenDistance: Math.max(50, Math.min(500, v)) }));
  }, []);

  const setEmissionRate = useCallback((v: number) => {
    setParams((p) => ({ ...p, emissionRate: Math.max(1, Math.min(200, v)) }));
  }, []);

  const setMode = useCallback((m: SlitMode) => setModeState(m), []);
  const setParticleType = useCallback((t: ParticleType) => setParticleTypeState(t), []);

  const toggleProbability = useCallback(() => setShowProbability((v) => !v), []);
  const toggleGrid = useCallback(() => setShowGrid((v) => !v), []);

  return {
    params,
    derived,
    mode,
    particleType,
    isPlaying,
    speed,
    showProbability,
    showGrid,
    particlesDetected,
    canvasRef,
    togglePlay,
    reset,
    clearDetector,
    setSpeed,
    setWavelength,
    setSlitSeparation,
    setSlitWidth,
    setScreenDistance,
    setEmissionRate,
    setMode,
    setParticleType,
    toggleProbability,
    toggleGrid,
  };
}

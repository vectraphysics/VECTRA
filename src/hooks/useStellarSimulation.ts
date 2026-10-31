import { useCallback, useEffect, useRef, useState } from 'react';
import { StellarEngine } from '@/lib/StellarEngine';
import type { StellarStage } from '@/lib/stellarEvolution';
import { getStagesForMass, getPathForMass, getRemnantType } from '@/lib/stellarEvolution';

const DEFAULT_MASS = 1.0;

export interface StellarControls {
  // State
  mass: number;
  stages: StellarStage[];
  currentStageIndex: number;
  currentStage: StellarStage | null;
  isPlaying: boolean;
  speed: number;
  path: 'low-mass' | 'high-mass';
  remnantType: 'white-dwarf' | 'neutron-star' | 'black-hole';
  // Actions
  togglePlay: () => void;
  reset: () => void;
  setSpeed: (s: number) => void;
  setMass: (m: number) => void;
  goToStage: (index: number) => void;
  nextStage: () => void;
  prevStage: () => void;
  resetCamera: () => void;
}

export function useStellarSimulation(
  containerRef: React.RefObject<HTMLDivElement | null>
): StellarControls {
  const engineRef = useRef<StellarEngine | null>(null);
  const [mass, setMassState] = useState(DEFAULT_MASS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [stages, setStages] = useState<StellarStage[]>(() => getStagesForMass(DEFAULT_MASS));
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const currentStage = stages[currentStageIndex] ?? null;
  const path = getPathForMass(mass);
  const remnantType = getRemnantType(mass);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new StellarEngine(containerRef.current, DEFAULT_MASS, {
      onStageChange: (idx) => {
        setCurrentStageIndex(idx);
      },
    });
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [containerRef]);

  const togglePlay = useCallback(() => {
    setIsPlaying((v) => {
      const next = !v;
      if (next) engineRef.current?.play();
      else engineRef.current?.pause();
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    engineRef.current?.reset();
    setIsPlaying(false);
    setCurrentStageIndex(0);
  }, []);

  const setSpeed = useCallback((s: number) => {
    engineRef.current?.setSpeed(s);
    setSpeedState(s);
  }, []);

  const setMass = useCallback((m: number) => {
    setMassState(m);
    setStages(getStagesForMass(m));
    setCurrentStageIndex(0);
    engineRef.current?.setMass(m);
    setIsPlaying(false);
  }, []);

  const goToStage = useCallback((index: number) => {
    engineRef.current?.goToStage(index);
    setCurrentStageIndex(index);
    setIsPlaying(false);
  }, []);

  const nextStage = useCallback(() => {
    engineRef.current?.nextStage();
  }, []);

  const prevStage = useCallback(() => {
    engineRef.current?.prevStage();
  }, []);

  const resetCamera = useCallback(() => {
    engineRef.current?.resetCamera();
  }, []);

  return {
    mass,
    stages,
    currentStageIndex,
    currentStage,
    isPlaying,
    speed,
    path,
    remnantType,
    togglePlay,
    reset,
    setSpeed,
    setMass,
    goToStage,
    nextStage,
    prevStage,
    resetCamera,
  };
}

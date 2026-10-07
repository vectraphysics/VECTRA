import { useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_CONDUCTION, DEFAULT_CONVECTION, DEFAULT_RADIATION,
  deriveConduction, deriveConvection, deriveRadiation,
  sanitizeConduction, sanitizeConvection, sanitizeRadiation,
  type ConductionParams, type ConvectionParams, type RadiationParams, type HeatMode,
} from '@/lib/heatTransferPhysics';

export function useHeatTransferSimulation() {
  const [mode, setModeState] = useState<HeatMode>('conduction');
  const [conduction, setConduction] = useState({ ...DEFAULT_CONDUCTION });
  const [convection, setConvection] = useState({ ...DEFAULT_CONVECTION });
  const [radiation, setRadiation] = useState({ ...DEFAULT_RADIATION });
  const [isPlaying, setIsPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [probe, setProbe] = useState(0.5);

  const conductionData = useMemo(() => deriveConduction(conduction), [conduction]);
  const convectionData = useMemo(() => deriveConvection(convection), [convection]);
  const radiationData = useMemo(() => deriveRadiation(radiation), [radiation]);

  const updateConduction = useCallback((patch: Partial<ConductionParams>) => {
    setConduction((p) => sanitizeConduction({ ...p, ...patch }));
  }, []);
  const updateConvection = useCallback((patch: Partial<ConvectionParams>) => {
    setConvection((p) => sanitizeConvection({ ...p, ...patch }));
  }, []);
  const updateRadiation = useCallback((patch: Partial<RadiationParams>) => {
    setRadiation((p) => sanitizeRadiation({ ...p, ...patch }));
  }, []);
  const setMode = useCallback((m: HeatMode) => {
    setModeState(m);
    setResetKey((n) => n + 1);
  }, []);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);
  const toggleAnnotations = useCallback(() => setShowAnnotations((p) => !p), []);
  const reset = useCallback(() => {
    // Reset only the active experiment; preserve the other mode's controls.
    if (mode === 'conduction') setConduction({ ...DEFAULT_CONDUCTION });
    if (mode === 'convection') setConvection({ ...DEFAULT_CONVECTION });
    if (mode === 'radiation') setRadiation({ ...DEFAULT_RADIATION });
    setIsPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setProbe(0.5);
    setShowAnnotations(true);
    setResetKey((n) => n + 1);
  }, [mode]);

  return {
    mode, setMode, conduction, convection, radiation,
    conductionData, convectionData, radiationData,
    updateConduction, updateConvection, updateRadiation,
    isPlaying, togglePlay, reset, resetKey,
    showAnnotations, toggleAnnotations, probe, setProbe,
  };
}

export type HeatTransferControls = ReturnType<typeof useHeatTransferSimulation>;
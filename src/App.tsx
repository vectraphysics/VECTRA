import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';

const KinematicsPage = lazy(() =>
  import('@/pages/KinematicsPage').then((m) => ({ default: m.KinematicsPage }))
);

const OrbitalMechanicsPage = lazy(() =>
  import('@/pages/OrbitalMechanicsPage').then((m) => ({ default: m.OrbitalMechanicsPage }))
);

const WavesPage = lazy(() =>
  import('@/pages/WavesPage').then((m) => ({ default: m.WavesPage }))
);

const DoubleSlitPage = lazy(() =>
  import('@/pages/DoubleSlitPage').then((m) => ({ default: m.DoubleSlitPage }))
);

const MagneticFieldPage = lazy(() =>
  import('@/pages/MagneticFieldPage').then((m) => ({ default: m.MagneticFieldPage }))
);

const StellarLifecyclePage = lazy(() =>
  import('@/pages/StellarLifecyclePage').then((m) => ({ default: m.StellarLifecyclePage }))
);

function App() {
  return (
   <BrowserRouter basename={import.meta.env.BASE_URL}>
     <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/lessons/kinematics"
          element={
            <Suspense fallback={
              <div className="flex min-h-screen items-center justify-center bg-space-900">
                <span className="font-mono text-sm text-star-white/40">Loading lesson…</span>
              </div>
            }>
              <KinematicsPage />
            </Suspense>
          }
        />
        <Route
          path="/simulations/orbital-mechanics"
          element={
            <Suspense fallback={
              <div className="flex min-h-screen items-center justify-center bg-space-900">
                <span className="font-mono text-sm text-star-white/40">Loading simulation…</span>
              </div>
            }>
              <OrbitalMechanicsPage />
            </Suspense>
          }
        />
        <Route
          path="/simulations/waves"
          element={
            <Suspense fallback={
              <div className="flex min-h-screen items-center justify-center bg-space-900">
                <span className="font-mono text-sm text-star-white/40">Loading simulation…</span>
              </div>
            }>
              <WavesPage />
            </Suspense>
          }
        />
        <Route
          path="/simulations/double-slit"
          element={
            <Suspense fallback={
              <div className="flex min-h-screen items-center justify-center bg-space-900">
                <span className="font-mono text-sm text-star-white/40">Loading simulation…</span>
              </div>
            }>
              <DoubleSlitPage />
            </Suspense>
          }
        />
        <Route
          path="/simulations/magnetic-fields"
          element={
            <Suspense fallback={
              <div className="flex min-h-screen items-center justify-center bg-space-900">
                <span className="font-mono text-sm text-star-white/40">Loading simulation…</span>
              </div>
            }>
              <MagneticFieldPage />
            </Suspense>
          }
        />
        <Route
          path="/simulations/stellar-life-cycle"
          element={
            <Suspense fallback={
              <div className="flex min-h-screen items-center justify-center bg-space-900">
                <span className="font-mono text-sm text-star-white/40">Loading simulation…</span>
              </div>
            }>
              <StellarLifecyclePage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

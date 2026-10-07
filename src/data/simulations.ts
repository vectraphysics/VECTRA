import { Orbit, Atom, Waves, Magnet, Telescope, Flame, type LucideIcon } from 'lucide-react';

export interface Simulation {
  id: string;
  title: string;
  icon: LucideIcon;
  category: string;
  description: string;
  status: 'coming-soon' | 'preview';
  tags: string[];
  route?: string;
}

export const simulations: Simulation[] = [
  {
    id: 'orbital-mechanics',
    title: 'Orbital Mechanics',
    icon: Orbit,
    category: 'Mechanics',
    description: "Explore how gravity shapes planetary orbits. Adjust mass and velocity to see Kepler's laws in action.",
    status: 'preview',
    tags: ['Gravity', 'Orbits', 'Kepler'],
    route: '/simulations/orbital-mechanics',
  },
  {
    id: 'wave-interference',
    title: 'Waves',
    icon: Waves,
    category: 'Waves',
    description: 'Explore how wavelength, frequency, amplitude and wave speed shape a travelling wave.',
    status: 'preview',
    tags: ['Wavelength', 'Frequency', 'Amplitude'],
    route: '/simulations/waves',
  },
  {
    id: 'double-slit',
    title: 'Double-Slit Experiment',
    icon: Atom,
    category: 'Modern Physics',
    description: 'The iconic experiment revealing wave-particle duality. Watch the interference pattern emerge.',
    status: 'preview',
    tags: ['Quantum', 'Duality'],
    route: '/simulations/double-slit',
  },
  {
    id: 'magnetic-field',
    title: 'Magnetic Field Lines',
    icon: Magnet,
    category: 'Electromagnetism',
    description: 'Explore the 3D magnetic field of a dipole. Trace field lines, move a probe, and visualize field vectors.',
    status: 'preview',
    tags: ['Fields', 'Magnetism', 'Dipole'],
    route: '/simulations/magnetic-fields',
  },
  {
    id: 'stellar-lifecycle',
    title: 'Stellar Life Cycle',
    icon: Telescope,
    category: 'Astrophysics',
    description: 'Trace the journey of a star from nebula to main sequence to supernova or white dwarf — its mass decides its fate.',
    status: 'preview',
    tags: ['Stars', 'Evolution', 'Supernova'],
    route: '/simulations/stellar-life-cycle',
  },
  {
    id: 'heat-transfer',
    title: 'Heat Transfer',
    icon: Flame,
    category: 'Thermodynamics',
    description: 'Observe conduction, convection, and radiation as heat flows through different materials.',
    status: 'preview',
    tags: ['Conduction', 'Convection', 'Radiation'],
    route: '/simulations/heat-transfer',
  },
];

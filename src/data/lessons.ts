import { Atom, Waves, Zap, Magnet, Flame, Orbit, Telescope, type LucideIcon } from 'lucide-react';

export interface PhysicsTopic {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  topics: string[];
  accent: string;
}

export const physicsTopics: PhysicsTopic[] = [
  {
    id: 'mechanics',
    title: 'Mechanics',
    icon: Atom,
    description:
      "The study of motion, forces, and energy. From Newton's laws to rotational dynamics - the foundation of classical physics.",
    topics: ["Kinematics", "Newton's Laws", "Energy, Work & Power", "Momentum", "Rotational Motion", "Gravitation"],
    accent: 'from-amber-400/20 to-orange-500/5',
  },
  {
    id: 'waves',
    title: 'Waves',
    icon: Waves,
    description:
      'Oscillations and wave phenomena that shape our world - sound, light, interference, and the physics of resonance.',
    topics: ['Simple Harmonic Motion', 'Wave Properties', 'Sound', 'Interference', 'Doppler Effect', 'Standing Waves'],
    accent: 'from-cyan-400/20 to-sky-500/5',
  },
  {
    id: 'electricity',
    title: 'Electricity',
    icon: Zap,
    description:
      'Charges, fields, and circuits. The invisible forces that power our modern world, from static charge to current flow.',
    topics: ["Electric Charge", "Coulomb's Law", "Electric Fields", "Circuits", "Resistance & Ohm's Law", "Capacitance"],
    accent: 'from-yellow-400/20 to-amber-500/5',
  },
  {
    id: 'electromagnetism',
    title: 'Electromagnetism',
    icon: Magnet,
    description:
      "The unification of electricity and magnetism - Maxwell's equations, induction, and the electromagnetic spectrum.",
    topics: ['Magnetic Fields', 'Lorentz Force', 'Electromagnetic Induction', "Maxwell's Equations", 'EM Spectrum', 'Inductance'],
    accent: 'from-violet-400/20 to-purple-500/5',
  },
  {
    id: 'thermodynamics',
    title: 'Thermodynamics',
    icon: Flame,
    description:
      'Heat, work, and entropy. The laws governing energy transfer and the arrow of time in physical systems.',
    topics: ['Temperature & Heat', 'Gas Laws', 'First Law', 'Second Law & Entropy', 'Heat Engines', 'Statistical Mechanics'],
    accent: 'from-rose-400/20 to-red-500/5',
  },
  {
    id: 'modern-physics',
    title: 'Modern Physics',
    icon: Telescope,
    description:
      'Quantum mechanics and relativity - the revolutionary frameworks that redefine reality at the smallest and largest scales.',
    topics: ['Special Relativity', 'Photoelectric Effect', 'Quantum Mechanics', 'Wave-Particle Duality', 'Nuclear Physics', 'Standard Model'],
    accent: 'from-teal-400/20 to-emerald-500/5',
  },
  {
    id: 'astrophysics',
    title: 'Astrophysics',
    icon: Orbit,
    description:
      'The physics of stars, galaxies, and the cosmos. Stellar evolution, black holes, dark matter, and the fabric of spacetime.',
    topics: ['Stellar Evolution', 'Black Holes', 'Cosmology', 'Dark Matter & Energy', 'Galactic Dynamics', 'Exoplanets'],
    accent: 'from-blue-400/20 to-indigo-500/5',
  },
];

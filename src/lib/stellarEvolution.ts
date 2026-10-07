/**
 * Stellar evolution data and stage definitions.
 *
 * A star's life cycle is determined primarily by its initial mass.
 * The two main pathways are:
 *
 * Low / Sun-like mass (0.1–8 M☉):
 *   Nebula → Protostar → Main Sequence → Red Giant → Planetary Nebula → White Dwarf → Cooling
 *
 * High mass (8+ M☉):
 *   Nebula → Protostar → Massive Main Sequence → Red Supergiant → Supernova → Neutron Star / Black Hole
 */

export type StellarStageId =
  | 'nebula'
  | 'protostar'
  | 'main-sequence'
  | 'red-giant'
  | 'planetary-nebula'
  | 'white-dwarf'
  | 'cooling'
  | 'red-supergiant'
  | 'supernova'
  | 'neutron-star'
  | 'black-hole';

export type StellarPath = 'low-mass' | 'high-mass';

export interface StellarStage {
  id: StellarStageId;
  name: string;
  duration: string;
  temperature: string;
  mass: string;
  coreProcess: string;
  fusionProcess: string;
  finalOutcome: string;
  color: number;       // hex color for the star body
  emissive: number;    // emissive color
  radius: number;      // visual radius in scene units
  glowIntensity: number;
  description: string;
}

/**
 * Returns the ordered list of stages for a given initial mass (in solar masses).
 */
export function getStagesForMass(mass: number): StellarStage[] {
  const isHighMass = mass >= 8;
  const baseStages = getCommonStages(mass);
  return isHighMass ? [...baseStages, ...getHighMassStages(mass)] : [...baseStages, ...getLowMassStages(mass)];
}

function getCommonStages(mass: number): StellarStage[] {
  return [
    {
      id: 'nebula',
      name: 'Nebula',
      duration: '~1–10 Myr',
      temperature: '10–100 K',
      mass: `${(mass * 0.1).toFixed(1)}–${mass.toFixed(1)} M☉`,
      coreProcess: 'Gravitational contraction',
      fusionProcess: 'None — no fusion yet',
      finalOutcome: 'Dense molecular core forms',
      color: 0x4a6a8a,
      emissive: 0x2a4a6a,
      radius: 8,
      glowIntensity: 0.3,
      description: 'A vast cloud of gas and dust collapses under gravity. Dense cores form within the cloud, each potentially becoming a new star.',
    },
    {
      id: 'protostar',
      name: 'Protostar',
      duration: '~0.1–1 Myr',
      temperature: '~3,000 K',
      mass: `${mass.toFixed(1)} M☉`,
      coreProcess: 'Gravitational contraction, heating',
      fusionProcess: 'Deuterium burning begins',
      finalOutcome: 'Hydrogen fusion ignites',
      color: 0xcc6633,
      emissive: 0xaa3322,
      radius: 4,
      glowIntensity: 0.6,
      description: 'The collapsing core heats up as gravitational energy converts to thermal energy. A protostar forms, surrounded by an accretion disk.',
    },
    {
      id: 'main-sequence',
      name: 'Main Sequence',
      duration: mass >= 8 ? '~10–30 Myr' : mass >= 1 ? '~10 Gyr' : '~100+ Gyr',
      temperature: mass >= 8 ? '~30,000 K' : mass >= 1 ? '~5,800 K' : '~3,000 K',
      mass: `${mass.toFixed(1)} M☉`,
      coreProcess: 'Hydrostatic equilibrium',
      fusionProcess: 'Hydrogen → Helium (pp-chain or CNO cycle)',
      finalOutcome: 'Core hydrogen exhausted',
      color: mass >= 8 ? 0x99bbff : mass >= 1 ? 0xfff5e0 : 0xff8844,
      emissive: mass >= 8 ? 0x4466ff : mass >= 1 ? 0xffddaa : 0xcc4422,
      radius: mass >= 8 ? 3.5 : mass >= 1 ? 2.5 : 1.5,
      glowIntensity: 1.0,
      description: 'The star enters its longest and most stable phase. Hydrogen fuses into helium in the core, balancing gravity with radiation pressure.',
    },
  ];
}

function getLowMassStages(mass: number): StellarStage[] {
  return [
    {
      id: 'red-giant',
      name: 'Red Giant',
      duration: '~1 Gyr',
      temperature: '~3,500 K',
      mass: `${(mass * 0.7).toFixed(1)} M☉`,
      coreProcess: 'Shell hydrogen burning, helium ignition',
      fusionProcess: 'H → He (shell); He → C (core, triple-alpha)',
      finalOutcome: 'Helium exhausted, outer layers ejected',
      color: 0xff4422,
      emissive: 0xcc2200,
      radius: 7,
      glowIntensity: 0.8,
      description: 'Core hydrogen is exhausted. The core contracts and heats, igniting hydrogen in a shell. The outer envelope expands dramatically and cools.',
    },
    {
      id: 'planetary-nebula',
      name: 'Planetary Nebula',
      duration: '~10,000–50,000 yr',
      temperature: '~10,000–100,000 K (central star)',
      mass: `${(mass * 0.6).toFixed(1)} M☉`,
      coreProcess: 'No fusion — inert C/O core',
      fusionProcess: 'None',
      finalOutcome: 'Core exposed as white dwarf',
      color: 0x66ddff,
      emissive: 0x3399cc,
      radius: 6,
      glowIntensity: 0.5,
      description: 'The star sheds its outer layers into a beautiful expanding shell of glowing gas. The hot, exposed core remains at the center.',
    },
    {
      id: 'white-dwarf',
      name: 'White Dwarf',
      duration: '~Billions of years',
      temperature: '~100,000 K (initially)',
      mass: `${(mass * 0.6).toFixed(1)} M☉`,
      coreProcess: 'Electron degeneracy pressure',
      fusionProcess: 'None — no fuel remains',
      finalOutcome: 'Gradual cooling',
      color: 0xddeeff,
      emissive: 0x88aacc,
      radius: 1.2,
      glowIntensity: 0.9,
      description: 'The exposed stellar core — a dense, Earth-sized object with the mass of a star. No fusion occurs; it glows from residual heat.',
    },
    {
      id: 'cooling',
      name: 'Cooling White Dwarf',
      duration: '~Trillions of years',
      temperature: '< 4,000 K',
      mass: `${(mass * 0.6).toFixed(1)} M☉`,
      coreProcess: 'Electron degeneracy pressure',
      fusionProcess: 'None',
      finalOutcome: 'Black dwarf (theoretical)',
      color: 0x8899aa,
      emissive: 0x334455,
      radius: 1.0,
      glowIntensity: 0.3,
      description: 'The white dwarf slowly radiates its remaining heat into space. Over trillions of years, it will fade into a cold, dark remnant.',
    },
  ];
}

function getHighMassStages(mass: number): StellarStage[] {
  return [
    {
      id: 'red-supergiant',
      name: 'Red Supergiant',
      duration: '~1–2 Myr',
      temperature: '~3,500 K',
      mass: `${(mass * 0.8).toFixed(1)} M☉`,
      coreProcess: 'Layered fusion: C, Ne, O, Si',
      fusionProcess: 'Progressive burning up to iron',
      finalOutcome: 'Iron core collapse',
      color: 0xff3322,
      emissive: 0xaa1100,
      radius: 12,
      glowIntensity: 0.9,
      description: 'The massive star fuses heavier and heavier elements in concentric shells. Iron builds up in the core — iron cannot fuse for energy.',
    },
    {
      id: 'supernova',
      name: 'Supernova',
      duration: '~Seconds to weeks',
      temperature: '> 1 billion K (core)',
      mass: `${(mass * 0.5).toFixed(1)} M☉ (ejected)`,
      coreProcess: 'Core collapse, bounce shock',
      fusionProcess: 'Explosive nucleosynthesis',
      finalOutcome: 'Neutron star or black hole',
      color: 0xffffff,
      emissive: 0xffeecc,
      radius: 16,
      glowIntensity: 2.0,
      description: 'The iron core collapses in milliseconds. The outer layers rebound in a cataclysmic explosion, briefly outshining an entire galaxy.',
    },
    {
      id: mass >= 25 ? 'black-hole' : 'neutron-star',
      name: mass >= 25 ? 'Black Hole' : 'Neutron Star',
      duration: mass >= 25 ? 'Eternal' : '~Billions of years',
      temperature: mass >= 25 ? 'N/A' : '~600,000 K (surface)',
      mass: mass >= 25 ? `${(mass * 0.3).toFixed(1)} M☉` : `${(mass * 0.2).toFixed(1)} M☉`,
      coreProcess: mass >= 25 ? 'Gravitational singularity' : 'Neutron degeneracy pressure',
      fusionProcess: 'None',
      finalOutcome: mass >= 25 ? 'Permanent' : 'Gradual spin-down',
      color: mass >= 25 ? 0x000000 : 0xaaccff,
      emissive: mass >= 25 ? 0x000000 : 0x4466aa,
      radius: mass >= 25 ? 2.5 : 0.8,
      glowIntensity: mass >= 25 ? 0.0 : 1.2,
      description: mass >= 25
        ? 'Gravity overwhelms all forces. The core collapses past the neutron star stage into a singularity, surrounded by an event horizon.'
        : 'The core compresses to a ball of neutrons ~20 km across, with the mass of several suns. It spins rapidly and emits beams of radiation.',
    },
  ];
}

/**
 * Determine which path a star takes based on its initial mass.
 */
export function getPathForMass(mass: number): StellarPath {
  return mass >= 8 ? 'high-mass' : 'low-mass';
}

/**
 * Determine the final remnant type for a given mass.
 */
export function getRemnantType(mass: number): 'white-dwarf' | 'neutron-star' | 'black-hole' {
  if (mass >= 25) return 'black-hole';
  if (mass >= 8) return 'neutron-star';
  return 'white-dwarf';
}

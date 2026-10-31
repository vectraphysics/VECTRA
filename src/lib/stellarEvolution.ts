/**
 * Educational stellar-evolution pathways.
 *
 * These are representative single-star pathways, not a full stellar-evolution
 * calculation. The initial-mass boundaries are teaching heuristics: the final
 * outcome depends on the evolved core, composition, rotation, mass loss and
 * binary interaction.
 */

export type StellarStageId =
  | 'nebula'
  | 'protostar'
  | 'main-sequence'
  | 'red-dwarf'
  | 'red-giant'
  | 'helium-burning'
  | 'asymptotic-giant'
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
  color: number;
  emissive: number;
  radius: number;
  glowIntensity: number;
  description: string;
  visualNote?: string;
}

const CORE_COLLAPSE_HEURISTIC_MASS = 8;
const BLACK_HOLE_HEURISTIC_MASS = 25;

/**
 * Return a representative sequence for a star with the selected initial mass.
 * Stars below 0.5 solar masses remain on the main sequence for longer than the
 * current age of the Universe, so the simulator does not invent later stages.
 */
export function getStagesForMass(mass: number): StellarStage[] {
  const initialMass = Number.isFinite(mass) ? Math.max(0.1, mass) : 1;
  const commonStages = getCommonStages(initialMass);

  if (initialMass < 0.5) {
    return [
      commonStages[0],
      commonStages[1],
      {
        ...commonStages[2],
        id: 'red-dwarf',
        name: 'Red Dwarf Main Sequence',
        duration: 'Far longer than the current age of the Universe',
        temperature: '~2,500–4,000 K (surface)',
        coreProcess: 'Convection mixes much of the stellar interior',
        fusionProcess: 'Hydrogen → helium through the proton-proton chain',
        finalOutcome: 'Still burning hydrogen; later evolution is not shown',
        color: 0xff884e,
        emissive: 0xc64b20,
        radius: 1.35,
        glowIntensity: 0.65,
        description: 'A very low-mass red dwarf burns hydrogen slowly. Efficient convection circulates material through much of the star, allowing it to use its fuel over an extraordinary timespan.',
        visualNote: 'A 0.1 solar-mass red dwarf can remain on the main sequence for around 10 trillion years. The later stages lie far beyond the present age of the Universe.',
      },
    ];
  }

  return initialMass >= CORE_COLLAPSE_HEURISTIC_MASS
    ? [...commonStages, ...getHighMassStages(initialMass)]
    : [...commonStages, ...getIntermediateMassStages()];
}

function getCommonStages(mass: number): StellarStage[] {
  const initialMassLabel = `${mass.toFixed(1)} M☉ (initial mass)`;
  const isMassive = mass >= CORE_COLLAPSE_HEURISTIC_MASS;
  const isLowMass = mass < 1;

  return [
    {
      id: 'nebula',
      name: 'Molecular Cloud',
      duration: 'Cloud collapse: typically hundreds of thousands to millions of years',
      temperature: '~10–30 K in dense, cold regions',
      mass: 'Only part of the parent cloud becomes one star',
      coreProcess: 'Turbulence, gravity and dense-core formation',
      fusionProcess: 'No sustained stellar hydrogen fusion',
      finalOutcome: 'A collapsing protostellar core forms',
      color: 0x617da8,
      emissive: 0x263e68,
      radius: 8.5,
      glowIntensity: 0.25,
      description: 'Cold molecular gas and dust gather into dense cores. Gravity pulls a core inward while surrounding material feeds the forming object. The cloud is irregular and filamentary, not a smooth solid ball.',
      visualNote: 'The cloud is a diffuse gas-and-dust region. Particle density and colour are artistic representations, not a measured composition map.',
    },
    {
      id: 'protostar',
      name: 'Protostar',
      duration: '~100,000 to 1 million years (mass-dependent)',
      temperature: '~2,000–5,000 K (illustrative surface range)',
      mass: initialMassLabel,
      coreProcess: 'Gravitational contraction and accretion',
      fusionProcess: 'Deuterium burning can occur; sustained core hydrogen fusion has not begun',
      finalOutcome: 'The core heats until stable hydrogen fusion can begin',
      color: 0xe58a4d,
      emissive: 0xb94c25,
      radius: 3.8,
      glowIntensity: 0.75,
      description: 'Gas spirals through a rotating accretion disk onto a growing protostar. Magnetic fields can launch narrow bipolar outflows that carry away angular momentum. The object is still contracting and accreting.',
      visualNote: 'The disk and bipolar outflows are schematic. Their dimensions, tilt and appearance vary substantially between young stellar systems.',
    },
    {
      id: 'main-sequence',
      name: isMassive ? 'Massive Main-Sequence Star' : isLowMass ? 'Low-Mass Main-Sequence Star' : 'Main Sequence',
      duration: isMassive ? 'A few to tens of millions of years' : mass < 2 ? 'Billions to tens of billions of years' : 'Hundreds of millions to a few billion years',
      temperature: isMassive ? '~20,000–40,000 K (hot massive-star surface)' : isLowMass ? '~3,500–5,000 K (surface)' : '~5,800 K for a Sun-like star',
      mass: initialMassLabel,
      coreProcess: 'Hydrostatic equilibrium: inward gravity balanced by internal pressure',
      fusionProcess: 'Hydrogen → helium; pp-chain or CNO cycle depending on stellar mass',
      finalOutcome: 'Core hydrogen becomes depleted',
      color: isMassive ? 0x9bbcff : isLowMass ? 0xffa05c : 0xffe8b0,
      emissive: isMassive ? 0x496fff : isLowMass ? 0xc85b2d : 0xc99749,
      radius: isMassive ? 3.8 : isLowMass ? 1.7 : 2.5,
      glowIntensity: 1,
      description: 'The star spends most of its life fusing hydrogen in its core. Energy flowing outward maintains a balance against gravity. Hot, massive stars are generally larger and much more luminous, but they consume their fuel faster.',
      visualNote: 'Colour follows approximate surface temperature. The displayed radii are deliberately exaggerated and are not a common physical scale.',
    },
  ];
}

function getIntermediateMassStages(): StellarStage[] {
  const remnantMass = 'Typically about 0.5–1.3 M☉; depends on the progenitor';
  return [
    {
      id: 'red-giant',
      name: 'Red Giant Branch',
      duration: 'Tens to hundreds of millions of years (mass-dependent)',
      temperature: '~3,000–5,000 K (surface)',
      mass: 'The envelope expands while stellar winds remove mass',
      coreProcess: 'Contracting, helium-rich core surrounded by hydrogen-burning shell',
      fusionProcess: 'Hydrogen → helium in a shell around the core',
      finalOutcome: 'Helium ignition in the core',
      color: 0xff7443,
      emissive: 0xb83b20,
      radius: 7.2,
      glowIntensity: 0.8,
      description: 'After core hydrogen is exhausted, the core contracts while hydrogen burns in a surrounding shell. The outer envelope expands and cools, making the star larger and redder.',
      visualNote: 'The large envelope is real, but the core is tiny by comparison. The scene enlarges the core so its later transformation remains visible.',
    },
    {
      id: 'helium-burning',
      name: 'Core Helium Burning',
      duration: 'Tens to hundreds of millions of years',
      temperature: '~4,000–6,000 K (surface; mass-dependent)',
      mass: 'The star continues to lose mass through its outer layers',
      coreProcess: 'Helium fusion in the core after helium ignition',
      fusionProcess: 'Helium → carbon and oxygen through the triple-alpha process',
      finalOutcome: 'Core helium becomes depleted',
      color: 0xffb36b,
      emissive: 0xc46a33,
      radius: 4.8,
      glowIntensity: 0.85,
      description: 'Helium ignites in the core and fuses into carbon and oxygen. The star settles into a more compact giant configuration while hydrogen fusion can continue in a surrounding shell.',
      visualNote: 'This is a representative core-helium-burning phase. The exact track depends on mass and composition.',
    },
    {
      id: 'asymptotic-giant',
      name: 'Asymptotic Giant Branch',
      duration: 'Hundreds of thousands to a few million years',
      temperature: '~2,500–3,500 K (cool outer surface)',
      mass: 'Strong stellar winds remove much of the remaining envelope',
      coreProcess: 'Compact carbon-oxygen core with hydrogen- and helium-burning shells',
      fusionProcess: 'Alternating shell burning; helium-shell thermal pulses can occur',
      finalOutcome: 'Outer envelope is expelled',
      color: 0xff573d,
      emissive: 0xa92b19,
      radius: 8.2,
      glowIntensity: 0.75,
      description: 'The star becomes enormous and cool at its surface. Hydrogen and helium burn in separate shells around the carbon-oxygen core. Thermal pulses and powerful winds help remove the outer envelope.',
      visualNote: 'Dust formation and mass loss can make this stage heavily obscured. The pulsation shown is an educational visual cue, not a hydrodynamic model.',
    },
    {
      id: 'planetary-nebula',
      name: 'Planetary Nebula',
      duration: '~10,000–50,000 years for the bright visible phase',
      temperature: '~30,000–200,000 K (hot central star; evolves with time)',
      mass: remnantMass,
      coreProcess: 'The exposed core contracts toward a white dwarf',
      fusionProcess: 'No sustained fusion in the exposed carbon-oxygen core',
      finalOutcome: 'The central remnant becomes a white dwarf',
      color: 0x80dfff,
      emissive: 0x3c9fca,
      radius: 0.9,
      glowIntensity: 1.1,
      description: 'The expelled envelope expands into space. Ultraviolet light from the extremely hot central remnant ionises the gas, making the nebula glow. A dense stellar core remains at the centre.',
      visualNote: 'Shown as a representative layered, bipolar shell. Real planetary nebulae range from nearly spherical shells to complex multi-lobed structures.',
    },
    {
      id: 'white-dwarf',
      name: 'White Dwarf',
      duration: 'Billions of years of cooling',
      temperature: 'Can exceed 100,000 K when newly exposed',
      mass: remnantMass,
      coreProcess: 'Electron degeneracy pressure supports the compact remnant',
      fusionProcess: 'No sustained core fusion; the object radiates stored thermal energy',
      finalOutcome: 'Gradual cooling and fading',
      color: 0xe3f2ff,
      emissive: 0x91bde5,
      radius: 0.85,
      glowIntensity: 0.95,
      description: 'The exposed carbon-oxygen core is roughly Earth-sized but contains a substantial fraction of a solar mass. Electron degeneracy pressure, not ongoing fusion, supports it against gravity.',
      visualNote: 'The white dwarf is vastly smaller than its former giant star. This scene enlarges it for visibility and does not preserve the true size ratio.',
    },
    {
      id: 'cooling',
      name: 'Cooling White Dwarf',
      duration: 'Many billions of years; final cooling takes far longer',
      temperature: 'Surface temperature steadily falls with time',
      mass: remnantMass,
      coreProcess: 'Electron degeneracy pressure remains important',
      fusionProcess: 'No sustained nuclear fusion',
      finalOutcome: 'A hypothetical black dwarf after an extremely long time',
      color: 0x91a6bd,
      emissive: 0x344c67,
      radius: 0.78,
      glowIntensity: 0.22,
      description: 'The white dwarf slowly releases its stored heat and becomes dimmer. A fully cooled black dwarf is theoretical: the Universe is not old enough for one to have formed.',
      visualNote: 'The fade is accelerated for teaching. It does not represent a calibrated cooling curve.',
    },
  ];
}

function getHighMassStages(mass: number): StellarStage[] {
  const formsBlackHole = mass >= BLACK_HOLE_HEURISTIC_MASS;
  const remnantStage: StellarStage = formsBlackHole
    ? {
        id: 'black-hole',
        name: 'Black Hole',
        duration: 'Remnant persists; growth depends on later accretion and mergers',
        temperature: 'No solid surface temperature; surrounding accretion gas can be hot',
        mass: 'Final black-hole mass depends on core collapse and fallback',
        coreProcess: 'Collapse forms an event horizon',
        fusionProcess: 'No stellar fusion occurs in the black-hole remnant',
        finalOutcome: 'Matter and light crossing the event horizon cannot escape',
        color: 0x03050a,
        emissive: 0x000000,
        radius: 1.6,
        glowIntensity: 0,
        description: 'The collapsed core forms an event horizon. The black hole itself does not shine; any bright disk comes from hot matter outside the horizon, and is present only if matter is available to accrete.',
        visualNote: 'The dark horizon, photon-ring cue and disk are a schematic accreting black-hole view. Relativistic light bending is not numerically ray-traced.',
      }
    : {
        id: 'neutron-star',
        name: 'Neutron Star',
        duration: 'Cools over millions to billions of years; spin evolves',
        temperature: '~10⁶ K at the surface for a young neutron star (order of magnitude)',
        mass: '~1.4 M☉ is a representative value; individual masses vary',
        coreProcess: 'Ultra-dense neutron-rich matter; the equation of state remains an active research topic',
        fusionProcess: 'No sustained stellar fusion',
        finalOutcome: 'May be observed as a pulsar if its radiation beam sweeps across our line of sight',
        color: 0x9fd4ff,
        emissive: 0x4b9fff,
        radius: 0.72,
        glowIntensity: 1.1,
        description: 'The collapsed core is compressed into a city-scale object containing more mass than the Sun. Some neutron stars rotate rapidly and have tilted magnetic axes. Their radiation beams sweep through space like a lighthouse.',
        visualNote: 'The radius is about 10–12 km in reality. The object is enlarged enormously here. Beam rotation is slowed to a visible teaching speed, and not every neutron star is an observable pulsar.',
      };

  return [
    {
      id: 'red-supergiant',
      name: 'Evolved Massive Star',
      duration: 'Final stages: hundreds of thousands to a few million years',
      temperature: '~3,000–4,500 K if in a red-supergiant phase',
      mass: 'Strong winds and possible eruptions remove mass',
      coreProcess: 'Layered burning shells develop around an increasingly dense core',
      fusionProcess: 'Advanced burning can build elements up to the iron group',
      finalOutcome: 'Core becomes unstable and collapses',
      color: 0xff4b32,
      emissive: 0xb32117,
      radius: 11.5,
      glowIntensity: 0.9,
      description: 'A representative massive-star pathway is shown as a red supergiant. Deep inside, successive burning shells produce heavier elements. Iron-group core material cannot provide energy through further fusion.',
      visualNote: 'Not all massive stars become red supergiants. Some evolve through blue-supergiant or stripped-star phases; this is one representative route.',
    },
    {
      id: 'supernova',
      name: 'Core-Collapse Supernova',
      duration: 'Core collapse occurs in seconds; ejecta remain visible for much longer',
      temperature: 'The collapsing core reaches billions of kelvin',
      mass: 'A large fraction of the envelope is ejected; the amount varies',
      coreProcess: 'Core collapse, shock formation and neutrino-driven dynamics',
      fusionProcess: 'Explosive nucleosynthesis in the ejecta',
      finalOutcome: 'A neutron star or black hole may remain',
      color: 0xffe7d2,
      emissive: 0xffbb80,
      radius: 0.95,
      glowIntensity: 1.7,
      description: 'When the core can no longer support itself, it collapses rapidly. A successful explosion ejects the outer layers and enriches surrounding space. The detailed explosion mechanism is complex and not every collapse produces the same outcome.',
      visualNote: 'The luminous expanding shell is an accelerated schematic of ejecta, not a fluid simulation or a prediction of supernova brightness.',
    },
    remnantStage,
  ];
}

/** A broad initial-mass pathway label, not a complete stellar model. */
export function getPathForMass(mass: number): StellarPath {
  return mass >= CORE_COLLAPSE_HEURISTIC_MASS ? 'high-mass' : 'low-mass';
}

/**
 * Return the illustrative remnant chosen by this teaching model.
 * The 8 and 25 solar-mass thresholds are not universal physical boundaries.
 */
export function getRemnantType(mass: number): 'white-dwarf' | 'neutron-star' | 'black-hole' {
  if (mass >= BLACK_HOLE_HEURISTIC_MASS) return 'black-hole';
  if (mass >= CORE_COLLAPSE_HEURISTIC_MASS) return 'neutron-star';
  return 'white-dwarf';
}

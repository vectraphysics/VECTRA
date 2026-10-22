export interface LessonModule {
  id: string;
  title: string;
  discipline: string;
  equation: string;
  description: string;
  duration: string;
  level: 'Introductory' | 'Intermediate' | 'Advanced';
}

export const lessonModules: LessonModule[] = [
  {
    id: 'kinematics',
    title: 'Kinematics',
    discipline: 'Mechanics',
    equation: 'Δx = vᵢt + ½at²',
    description: 'Build an accurate motion model with vectors, graphs, constant-acceleration equations, free fall, and guided practice.',
    duration: '25–35 min',
    level: 'Introductory',
  },
  {
    id: 'newtons-laws',
    title: "Newton's Laws of Motion",
    discipline: 'Mechanics',
    equation: 'F⃗net = m.a',
    description: 'Explore inertia, resultant force, acceleration, and interaction pairs through worked examples and three interactive experiments.',
    duration: '25–35 min',
    level: 'Introductory',
  },
  {
    id: 'energy-work-power',
    title: 'Energy, Work and Power',
    discipline: 'Mechanics',
    equation: 'W = Fd cos θ · Ek = ½mv²',
    description: 'Connect work, motion, gravitational energy, power, and efficiency through interactive models and worked problems.',
    duration: '35–45 min',
    level: 'Introductory',
  },
  {
    id: 'maxwell-equations',
    title: "Maxwell's Equations",
    discipline: 'Electromagnetism',
    equation: '∇ · E = ρ/ε₀',
    description: 'Four equations that unified electricity, magnetism, and light into a single elegant framework.',
    duration: '25 min',
    level: 'Advanced',
  },
  {
    id: 'schrodinger-equation',
    title: 'The Schrödinger Equation',
    discipline: 'Modern Physics',
    equation: 'iℏ ∂ψ/∂t = Ĥψ',
    description: 'The wave equation at the heart of quantum mechanics, describing how quantum states evolve.',
    duration: '20 min',
    level: 'Advanced',
  },
  {
    id: 'thermo-entropy',
    title: 'Entropy & The Second Law',
    discipline: 'Thermodynamics',
    equation: 'ΔS ≥ 0',
    description: 'Why time flows in one direction - the statistical nature of irreversibility and disorder.',
    duration: '15 min',
    level: 'Intermediate',
  },
];

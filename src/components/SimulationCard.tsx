import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpotlightCard from '@/components/SpotlightCard';
import type { PhysicsTopic } from '@/data/topics';
import { useReveal } from '@/hooks/useReveal';
import './DisciplineCard.css';

interface TopicCardProps {
  topic: PhysicsTopic;
  index: number;
}

interface DisciplineTheme {
  code: string;
  focus: string;
  spotlight: string;
}

const disciplineThemes: Record<string, DisciplineTheme> = {
  mechanics: {
    code: '01',
    focus: 'Motion / force',
    spotlight: 'rgba(219, 166, 91, 0.28)',
  },
  waves: {
    code: '02',
    focus: 'Oscillation / signal',
    spotlight: 'rgba(89, 194, 218, 0.28)',
  },
  electricity: {
    code: '03',
    focus: 'Charge / circuits',
    spotlight: 'rgba(218, 190, 91, 0.27)',
  },
  electromagnetism: {
    code: '04',
    focus: 'Fields / induction',
    spotlight: 'rgba(157, 128, 226, 0.28)',
  },
  thermodynamics: {
    code: '05',
    focus: 'Heat / entropy',
    spotlight: 'rgba(222, 117, 102, 0.28)',
  },
  'modern-physics': {
    code: '06',
    focus: 'Quanta / spacetime',
    spotlight: 'rgba(89, 190, 164, 0.28)',
  },
  astrophysics: {
    code: '07',
    focus: 'Stars / orbits',
    spotlight: 'rgba(105, 146, 228, 0.3)',
  },
};

function DisciplineGlyph({ disciplineId }: { disciplineId: string }) {
  switch (disciplineId) {
    case 'mechanics':
      return (
        <svg viewBox="0 0 320 112" className="discipline-glyph" aria-hidden="true">
          <path d="M24 88H298M38 88V17" className="discipline-glyph__axis" />
          <path d="M39 83C83 18 151 12 207 60S270 78 292 27" className="discipline-glyph__primary" />
          <path d="M39 83L292 27" className="discipline-glyph__guide" />
          <circle cx="207" cy="60" r="4.5" className="discipline-glyph__point" />
          <circle cx="39" cy="83" r="2.5" className="discipline-glyph__point" />
        </svg>
      );
    case 'waves':
      return (
        <svg viewBox="0 0 320 112" className="discipline-glyph" aria-hidden="true">
          <path
            d="M16 56C28 21 40 21 52 56S76 91 88 56S112 21 124 56S148 91 160 56S184 21 196 56S220 91 232 56S256 21 268 56S292 91 304 56"
            className="discipline-glyph__primary"
          />
          <path d="M16 56H304" className="discipline-glyph__guide" />
          <path d="M88 56V91M160 56V21M232 56V91" className="discipline-glyph__axis" />
          <circle cx="160" cy="56" r="3.5" className="discipline-glyph__point" />
        </svg>
      );
    case 'electricity':
      return (
        <svg viewBox="0 0 320 112" className="discipline-glyph" aria-hidden="true">
          <path d="M24 27H104M216 27H296V88H168M140 88H24V27" className="discipline-glyph__primary" />
          <path d="M104 27L116 14L132 40L148 14L164 40L180 14L196 40L216 27" className="discipline-glyph__primary" />
          <path d="M140 70V106M168 78V98" className="discipline-glyph__primary" />
          <circle cx="24" cy="27" r="3.5" className="discipline-glyph__point" />
          <circle cx="296" cy="27" r="3.5" className="discipline-glyph__point" />
          <path d="M43 46H83M237 46H277" className="discipline-glyph__guide" />
        </svg>
      );
    case 'electromagnetism':
      return (
        <svg viewBox="0 0 320 112" className="discipline-glyph" aria-hidden="true">
          <ellipse cx="160" cy="56" rx="126" ry="39" transform="rotate(-10 160 56)" className="discipline-glyph__guide" />
          <ellipse cx="160" cy="56" rx="94" ry="28" transform="rotate(12 160 56)" className="discipline-glyph__primary" />
          <ellipse cx="160" cy="56" rx="58" ry="17" transform="rotate(-8 160 56)" className="discipline-glyph__guide" />
          <rect x="137" y="43" width="46" height="26" rx="4" className="discipline-glyph__block" />
          <path d="M160 43V69" className="discipline-glyph__divider" />
          <path d="M150 56H156M164 56H170" className="discipline-glyph__primary" />
        </svg>
      );
    case 'thermodynamics':
      return (
        <svg viewBox="0 0 320 112" className="discipline-glyph" aria-hidden="true">
          <rect x="137" y="35" width="46" height="42" rx="5" className="discipline-glyph__block" />
          <path d="M160 16V27M160 85V98M122 56H108M198 56H212M133 29L124 20M187 83L196 92M187 29L196 20M133 83L124 92" className="discipline-glyph__primary" />
          <path d="M160 45V67M149 56H171" className="discipline-glyph__divider" />
          <path d="M70 56H99M221 56H250" className="discipline-glyph__guide" />
          <circle cx="70" cy="56" r="3" className="discipline-glyph__point" />
          <circle cx="250" cy="56" r="3" className="discipline-glyph__point" />
        </svg>
      );
    case 'modern-physics':
      return (
        <svg viewBox="0 0 320 112" className="discipline-glyph" aria-hidden="true">
          <path d="M18 59C46 59 47 28 76 28S106 84 135 84S164 42 193 42S222 69 251 69H302" className="discipline-glyph__primary" />
          <path d="M18 59H302" className="discipline-glyph__guide" />
          <circle cx="76" cy="28" r="4" className="discipline-glyph__point" />
          <circle cx="193" cy="42" r="5" className="discipline-glyph__point" />
          <circle cx="251" cy="69" r="3" className="discipline-glyph__point" />
          <path d="M193 15V30M193 54V69" className="discipline-glyph__axis" />
        </svg>
      );
    case 'astrophysics':
      return (
        <svg viewBox="0 0 320 112" className="discipline-glyph" aria-hidden="true">
          <ellipse cx="160" cy="56" rx="126" ry="32" transform="rotate(-14 160 56)" className="discipline-glyph__guide" />
          <ellipse cx="160" cy="56" rx="89" ry="23" transform="rotate(19 160 56)" className="discipline-glyph__primary" />
          <circle cx="160" cy="56" r="11" className="discipline-glyph__star" />
          <path d="M160 36V27M160 76V85M140 56H131M180 56H189M146 42L139 35M174 70L181 77M174 42L181 35M146 70L139 77" className="discipline-glyph__rays" />
          <circle cx="275" cy="26" r="4.5" className="discipline-glyph__point" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 320 112" className="discipline-glyph" aria-hidden="true">
          <path d="M24 56H296" className="discipline-glyph__guide" />
          <circle cx="160" cy="56" r="28" className="discipline-glyph__primary" />
          <circle cx="160" cy="56" r="5" className="discipline-glyph__point" />
        </svg>
      );
  }
}

export function TopicCard({ topic, index }: TopicCardProps) {
  const { ref, isVisible } = useReveal();
  const Icon = topic.icon;
  const theme = disciplineThemes[topic.id] ?? {
    code: String(index + 1).padStart(2, '0'),
    focus: 'Physics field',
    spotlight: 'rgba(94, 200, 216, 0.24)',
  };

  return (
    <article
      ref={ref}
      className={`relative reveal reveal-up parallax-panel ${isVisible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
    >
      <SpotlightCard
        data-discipline={topic.id}
        className="discipline-card group relative flex h-full flex-col gap-5 p-6 sm:p-7"
        spotlightColor={theme.spotlight}
        intensity={0.14}
        spotlightSize={250}
        borderGlow={0.42}
        proximity={90}
        smoothing={0.24}
      >
        <div className="discipline-card__visual">
          <div className="discipline-card__visual-meta">
            <span>FIELD / {theme.code}</span>
            <span>{theme.focus}</span>
          </div>
          <DisciplineGlyph disciplineId={topic.id} />
        </div>

        <div className="relative flex items-start justify-between">
          <div className="discipline-card__icon">
            <Icon className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <ArrowUpRight
            className="discipline-card__arrow h-5 w-5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>

        <div className="relative flex flex-col gap-3">
          <h3 className="discipline-card__title font-display text-xl font-medium text-star-white">
            {topic.title}
          </h3>
          <p className="font-body text-sm leading-relaxed text-star-white/55">
            {topic.description}
          </p>
        </div>

        <div className="relative mt-auto flex flex-wrap gap-1.5 pt-2">
          {topic.topics.slice(0, 4).map((t) => (
            topic.id === 'mechanics' && (t === 'Kinematics' || t === "Newton's Laws" || t === 'Energy, Work & Power') ? (
              <Link
                key={t}
                to={t === 'Kinematics' ? '/lessons/kinematics' : t === "Newton's Laws" ? '/lessons/mechanics/newtons-laws' : '/lessons/mechanics/energy-work-power'}
                className="discipline-card__topic discipline-card__topic--linked"
              >
                {t} · Start lesson
              </Link>
            ) : (
              <span key={t} className="discipline-card__topic">
                {t}
              </span>
            )
          ))}
          {topic.topics.length > 4 && (
            <span className="discipline-card__more">
              +{topic.topics.length - 4} more
            </span>
          )}
        </div>
      </SpotlightCard>
    </article>
  );
}

import BlurText from '@/components/BlurText';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  sectionIndex?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  sectionIndex,
}: SectionHeadingProps) {
  return (
    <div className={`vectra-section-heading${align === 'center' ? ' is-centered' : ''}`}>
      <div className="vectra-section-heading__meta">
        <div className="vectra-section-heading__eyebrow">
          <span className="h-px w-8 bg-accent-cyan/60" aria-hidden="true" />
          <span className="eyebrow vectra-heading-eyebrow">{eyebrow}</span>
        </div>
        {sectionIndex && (
          <span className="vectra-section-heading__index">SECTION {sectionIndex}</span>
        )}
      </div>
      <div className="vectra-section-heading__content">
        <h2 className="vectra-section-heading__title font-display text-star-white">
        <BlurText
          as="span"
          text={title}
          delay={65}
          animateBy="words"
          direction="bottom"
          threshold={0.12}
          stepDuration={0.32}
          blur={6}
          distance={12}
          effect="focus"
          className="vectra-blur-title"
        />
      </h2>
        {description && (
          <p className="vectra-heading-description vectra-section-heading__description font-body text-star-white/55">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

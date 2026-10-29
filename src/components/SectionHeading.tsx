import BlurText from '@/components/BlurText';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-4 ${alignment}`}>
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-accent-cyan/60" aria-hidden="true" />
        <span className="eyebrow vectra-heading-eyebrow">{eyebrow}</span>
      </div>
      <h2 className="font-display text-display text-star-white">
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
        <p className="vectra-heading-description max-w-2xl font-body text-base leading-relaxed text-star-white/55 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

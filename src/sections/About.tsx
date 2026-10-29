import { BookOpen, FunctionSquare, Lightbulb } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { LessonCard } from '@/components/LessonCard';
import { lessonModules } from '@/data/simulations';
import { useReveal } from '@/hooks/useReveal';

const features = [
  {
    icon: FunctionSquare,
    title: 'Equations explained',
    description: 'Every formula is broken down: what it means, where it comes from, and when to use it.',
  },
  {
    icon: Lightbulb,
    title: 'Visual demonstrations',
    description: 'Diagrams and animations that make abstract concepts concrete and memorable.',
  },
  {
    icon: BookOpen,
    title: 'Guided lessons',
    description: 'Structured learning paths that build understanding step by step, at your own pace.',
  },
];

export function About() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="about" className="relative py-20 sm:py-28 lg:py-32">
      <div className="container-vectra">
        <div
          ref={ref}
          className={`reveal reveal-up ${isVisible ? 'is-visible' : ''}`}
        >
          <SectionHeading
            eyebrow="About VECTRA"
            title="Understand the why, not just the what"
            description="Guided lessons combine clear explanations, mathematical foundations, and visual demonstrations to build genuine intuition."
          />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-panel flex items-start gap-4 p-5 reveal reveal-up parallax-panel"
                style={{ transitionDelay: `${i * 140}ms` }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-surface-border bg-space-700/40 text-accent-cyan">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-sm font-medium text-star-white">
                    {feature.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-star-white/45">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {lessonModules.map((lesson, index) => (
            <div key={lesson.id} className="reveal reveal-up" style={{ transitionDelay: `${index * 100}ms` }}>
              <LessonCard lesson={lesson} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

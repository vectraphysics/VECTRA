import { Clock, BookOpen, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LessonModule } from '@/data/lessons';
import { useReveal } from '@/hooks/useReveal';

interface LessonCardProps {
  lesson: LessonModule;
  index: number;
}

const levelColors: Record<LessonModule['level'], string> = {
  Introductory: 'text-emerald-400/70 border-emerald-400/20 bg-emerald-400/5',
  Intermediate: 'text-accent-gold/70 border-accent-gold/20 bg-accent-gold/5',
  Advanced: 'text-rose-400/70 border-rose-400/20 bg-rose-400/5',
};

export function LessonCard({ lesson, index }: LessonCardProps) {
  const { ref, isVisible } = useReveal();

  return (
    <article
      ref={ref}
      className={`glass-panel glass-panel-hover group relative flex flex-col gap-5 p-6 sm:p-7 section-fade ${
        isVisible ? 'is-visible' : ''
      }`}
      style={{ transitionDelay: `${(index % 2) * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest-2 text-star-white/35">
          {lesson.discipline}
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest-2 ${levelColors[lesson.level]}`}
        >
          {lesson.level}
        </span>
      </div>

      {/* Equation display */}
      <div className="flex items-center justify-center rounded-xl border border-surface-border bg-space-900/50 py-6">
        <code className="font-mono text-lg text-accent-ice sm:text-xl">{lesson.equation}</code>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-lg font-medium text-star-white">{lesson.title}</h3>
        <p className="font-body text-sm leading-relaxed text-star-white/50">
          {lesson.description}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-4 text-star-white/30">
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
            {lesson.duration}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
            Guided
          </span>
        </div>
        {lesson.id === 'kinematics' && (
          <Link to="/lessons/kinematics" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-accent-cyan/25 px-4 py-2 text-xs font-medium text-accent-ice transition-colors hover:border-accent-cyan/50 hover:bg-accent-cyan/10">
            Start lesson <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}

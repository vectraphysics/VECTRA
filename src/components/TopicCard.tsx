import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PhysicsTopic } from '@/data/topics';
import { useReveal } from '@/hooks/useReveal';

interface TopicCardProps {
  topic: PhysicsTopic;
  index: number;
}

export function TopicCard({ topic, index }: TopicCardProps) {
  const { ref, isVisible } = useReveal();
  const Icon = topic.icon;

  return (
    <article
      ref={ref}
      className={`glass-panel glass-panel-hover card-glow group relative flex flex-col gap-5 p-6 sm:p-7 section-fade ${
        isVisible ? 'is-visible' : ''
      }`}
      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${topic.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-surface-border bg-space-700/50 text-accent-cyan transition-colors duration-500 group-hover:border-accent-cyan/30 group-hover:text-accent-ice">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <ArrowUpRight
          className="h-5 w-5 text-star-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-cyan"
          strokeWidth={1.5}
        />
      </div>

      <div className="relative flex flex-col gap-3">
        <h3 className="font-display text-xl font-medium text-star-white">{topic.title}</h3>
        <p className="font-body text-sm leading-relaxed text-star-white/50">
          {topic.description}
        </p>
      </div>

      <div className="relative mt-auto flex flex-wrap gap-1.5 pt-2">
        {topic.topics.slice(0, 4).map((t) => (
          topic.id === 'mechanics' && t === 'Kinematics' ? (
            <Link
              key={t}
              to="/lessons/kinematics"
              className="rounded-md border border-accent-cyan/25 bg-accent-cyan/5 px-2.5 py-1 font-mono text-[0.7rem] text-accent-ice transition-colors hover:border-accent-cyan/50 hover:bg-accent-cyan/10"
            >
              {t} · Start lesson
            </Link>
          ) : (
            <span
              key={t}
              className="rounded-md border border-surface-border bg-space-800/40 px-2.5 py-1 font-mono text-[0.7rem] text-star-white/40"
            >
              {t}
            </span>
          )
        ))}
        {topic.topics.length > 4 && (
          <span className="rounded-md px-2.5 py-1 font-mono text-[0.7rem] text-star-white/30">
            +{topic.topics.length - 4} more
          </span>
        )}
      </div>
    </article>
  );
}

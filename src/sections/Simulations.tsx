import { SectionHeading } from '@/components/SectionHeading';
import { TopicCard } from '@/components/TopicCard';
import { physicsTopics } from '@/data/topics';
import { useReveal } from '@/hooks/useReveal';

export function Explore() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="explore" className="relative py-20 sm:py-28 lg:py-32">
      <div className="container-vectra">
        <div
          ref={ref}
          className={`reveal reveal-up ${isVisible ? 'is-visible' : ''}`}
        >
          <SectionHeading
            eyebrow="Explore"
            title="Physics, organized by discipline"
            description="Seven major areas of physics, each with its own set of topics, simulations, and guided lessons. Start anywhere — follow your curiosity."
          />
        </div>

        <div className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {physicsTopics.map((topic, index) => (
            <div
              key={topic.id}
              className="reveal reveal-up"
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <TopicCard topic={topic} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

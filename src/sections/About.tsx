import { ArrowRight, BookOpen, FunctionSquare, Lightbulb } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';
import { SectionHeading } from '@/components/SectionHeading';
import { useReveal } from '@/hooks/useReveal';
import './About.css';

const principles = [
  {
    number: '01',
    icon: FunctionSquare,
    title: 'Mathematics with meaning',
    description: 'Understand what an equation describes, what each variable represents, and how the relationship applies to a physical system.',
    tag: 'Build the foundation',
  },
  {
    number: '02',
    icon: Lightbulb,
    title: 'Ideas made visible',
    description: 'Use diagrams, models, and interactive simulations to connect abstract principles with observable behaviour.',
    tag: 'Explore the model',
  },
  {
    number: '03',
    icon: BookOpen,
    title: 'Learning with structure',
    description: 'Move through guided explanations and worked examples in a sequence that makes each new idea easier to place.',
    tag: 'Develop understanding',
  },
];

export function About() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="about" className="relative isolate vectra-section-flow about-section py-20 sm:py-28 lg:py-32">
      <div className="container-vectra">
        <div className="about-layout">
          <div className="about-intro">
            <div ref={ref} className={`reveal reveal-up ${isVisible ? 'is-visible' : ''}`}>
              <SectionHeading
                eyebrow="The VECTRA approach"
                title="Understand the physics behind the formula"
                description="VECTRA brings mathematical reasoning, visual explanations, and interactive models into one learning environment."
              />
            </div>

            <div className="about-manifesto mt-8">
              <span className="about-manifesto__label">A different way to learn</span>
              <p>
                A formula is more than a line of symbols. It describes a relationship in the physical world. VECTRA is designed to help you connect the mathematics to the phenomenon.
              </p>
              <div className="about-manifesto__footer">
                <span>Question</span>
                <span className="about-manifesto__line" aria-hidden="true" />
                <span>Model</span>
                <span className="about-manifesto__line" aria-hidden="true" />
                <span>Insight</span>
              </div>
            </div>
          </div>

          <div className="about-principles" aria-label="How VECTRA supports learning">
            {principles.map((principle, index) => {
              const Icon = principle.icon;

              return (
                <div
                  key={principle.number}
                  className="about-principle-wrap reveal reveal-up"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <SpotlightCard
                    className="about-principle glass-panel glass-panel-hover group"
                    spotlightColor="rgba(48, 68, 136, 0.72)"
                    intensity={0.12}
                    spotlightSize={220}
                    borderGlow={0.32}
                    proximity={80}
                    smoothing={0.24}
                  >
                    <div className="about-principle__top">
                      <span className="about-principle__number">{principle.number}</span>
                      <span className="about-principle__tag">{principle.tag}</span>
                    </div>
                    <div className="about-principle__body">
                      <span className="about-principle__icon">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3>{principle.title}</h3>
                        <p>{principle.description}</p>
                      </div>
                      <ArrowRight className="about-principle__arrow h-4 w-4" aria-hidden="true" />
                    </div>
                  </SpotlightCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Particles from '@/components/Particles';
import { Hero } from '@/sections/Hero';
import { Explore } from '@/sections/Explore';
import { Simulations } from '@/sections/Simulations';
import { Learn } from '@/sections/Learn';
import { About } from '@/sections/About';

export function HomePage() {
  useEffect(() => {
    // One page-level observer animates layout wrappers. Elements managed by
    // useReveal are excluded so two observers never fight over their classes.
    const elements = document.querySelectorAll<HTMLElement>(
      '.reveal:not([data-reveal-local]), .section-fade:not([data-reveal-local])'
    );
    const allRevealElements = document.querySelectorAll<HTMLElement>('.reveal, .section-fade');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      allRevealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      },
      { threshold: 0.01, rootMargin: '0px' }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative isolate bg-space-900 vectra-landing-flow">
      {/* React Bits starfield: a quiet, continuous layer behind the existing iridescent hero. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Particles
          particleCount={60}
          particleSpread={10}
          speed={0.12}
          particleColors={['#8be9ff', '#8099cc', '#c4b5fd']}
          moveParticlesOnHover={false}
          alphaParticles={false}
          particleBaseSize={32}
          sizeRandomness={0.55}
          pixelRatio={0.8}
          shape="circle"
          glow={0.24}
          twinkle={0.22}
          depthOfField={0.12}
          connections={false}
          drift="none"
          intro
          opacity={0.78}
          className="vectra-particles-canvas"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Explore />
          <Simulations />
          <Learn />
          <About />
          <div className="mt-8 text-center">
            <div className="vectra-dev-team">
              <span className="vectra-dev-name">Elihle</span>
              <span className="vectra-dev-name">Minenhle</span>
              <span className="vectra-dev-name">Kwanele</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

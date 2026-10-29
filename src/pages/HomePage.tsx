import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Particles from '@/components/Particles';
import { Hero } from '@/sections/Hero';
import { Explore } from '@/sections/Explore';
import { Simulations } from '@/sections/Simulations';
import { Learn } from '@/sections/Learn';
import { About } from '@/sections/About';
import { useEffect } from 'react';

export function HomePage() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative isolate bg-space-900 vectra-landing-flow">
      {/* React Bits starfield: a quiet, continuous layer behind the existing iridescent hero. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Particles
          particleCount={42}
          particleSpread={10}
          speed={0.12}
          particleColors={['#8be9ff', '#8099cc', '#c4b5fd']}
          moveParticlesOnHover={false}
          alphaParticles
          particleBaseSize={2}
          sizeRandomness={0.65}
          pixelRatio={0.55}
          shape="circle"
          glow={0.18}
          twinkle={0.18}
          depthOfField={0.12}
          connections={false}
          drift="none"
          intro
          opacity={0.55}
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

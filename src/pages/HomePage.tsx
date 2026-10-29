import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
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
    <div className="relative bg-space-900 vectra-landing-flow">
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
  );
}

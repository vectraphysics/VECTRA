
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/sections/Hero';
import { Explore } from '@/sections/Explore';
import { Simulations } from '@/sections/Simulations';
import { Learn } from '@/sections/Learn';
import { About } from '@/sections/About';

export function HomePage() {
  return (
    <div className="relative bg-space-900">
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

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
          <p className="text-sm tracking-wide text-star-white/60">
            Developed by{' '}
            <span className="text-glowing-rainbow">
              Elihle, Minenhle & Kwanele
            </span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

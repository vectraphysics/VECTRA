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

       
<div className="vectra-dev-team">
  <span className="vectra-dev-name">Elihle</span>
  <span className="vectra-dev-name">Minenhle</span>
  <span className="vectra-dev-name">Kwanele</span>
</div>
 <div className="mt-8 text-center">
.vectra-dev-team {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px 28px;
  padding: 12px 0;
}

.vectra-dev-team .vectra-dev-name {
  font-size: clamp(1.3rem, 4vw, 2rem);
}

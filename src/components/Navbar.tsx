import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Explore', href: '#explore' },
  { label: 'Simulations', href: '#simulations' },
  { label: 'Learn', href: '#learn' },
  { label: 'About', href: '#about' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-surface-border bg-space-900/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className={`vectra-nav-iridescence ${scrolled ? 'is-scrolled' : ''}`} aria-hidden="true" />
      <nav className="container-vectra relative z-10 flex h-16 items-center justify-between sm:h-20" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5" onClick={closeMobile}>
          <Logo />
          <span className="font-display text-lg font-semibold tracking-wider text-star-white">
            VECTRA
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-display text-sm text-star-white/55 transition-colors duration-300 hover:text-star-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a href="#explore" className="hidden btn-primary md:inline-flex">
          Explore Physics
        </a>

        {/* Mobile menu button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-border text-star-white transition-colors hover:bg-surface-hover md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="relative z-10 border-t border-surface-border bg-space-900/95 backdrop-blur-xl md:hidden">
          <div className="container-vectra flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="rounded-lg px-4 py-3 font-display text-base text-star-white/60 transition-colors hover:bg-surface-hover hover:text-star-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#explore"
              onClick={closeMobile}
              className="btn-primary mt-3 w-full justify-center"
            >
              Explore Physics
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="3" fill="#5ec8d8" />
      <circle cx="14" cy="14" r="3" fill="#5ec8d8" className="animate-pulse-glow" />
      <ellipse cx="14" cy="14" rx="11" ry="4.5" stroke="#a8d5e8" strokeOpacity="0.35" strokeWidth="1" transform="rotate(-20 14 14)" />
      <ellipse cx="14" cy="14" rx="11" ry="4.5" stroke="#5ec8d8" strokeOpacity="0.2" strokeWidth="1" transform="rotate(30 14 14)" />
      <circle cx="24" cy="9" r="1.2" fill="#a8d5e8" />
    </svg>
  );
}

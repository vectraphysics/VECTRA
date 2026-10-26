@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-space-900 text-star-white font-body;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    text-rendering: optimizeLegibility;
    background-image:
      radial-gradient(circle at top, rgba(94, 200, 216, 0.08), transparent 35%),
      radial-gradient(circle at bottom right, rgba(168, 213, 232, 0.06), transparent 30%);
    background-attachment: fixed;
  }

  ::selection {
    @apply bg-accent-cyan/30 text-star-white;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-space-900;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-space-400 rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-space-300;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer components {
  .container-vectra {
    @apply mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12;
  }

  .glass-panel {
    @apply rounded-2xl border border-surface-border bg-surface backdrop-blur-md;
  }

  .glass-panel-hover {
    @apply transition-all duration-500 hover:border-surface-border-hover hover:bg-surface-hover;
  }

  .text-gradient {
    @apply bg-clip-text text-transparent;
    background-image: linear-gradient(135deg, #e8edf5 0%, #a8d5e8 50%, #5ec8d8 100%);
  }

  .eyebrow {
    @apply font-mono text-eyebrow uppercase tracking-widest-2 text-accent-cyan;
  }

  .btn-primary {
    @apply inline-flex items-center gap-2 rounded-full bg-accent-cyan px-6 py-3 font-display text-sm font-medium text-space-900 transition-all duration-300 hover:bg-accent-ice hover:shadow-[0_0_30px_rgba(94,200,216,0.45)];
  }

  .btn-ghost {
    @apply inline-flex items-center gap-2 rounded-full border border-surface-border px-6 py-3 font-display text-sm font-medium text-star-white transition-all duration-300 hover:border-surface-border-hover hover:bg-space-800/70 hover:shadow-[0_0_20px_rgba(168,213,232,0.12)];
  }

  .card-glow {
    position: relative;
  }

  .card-glow::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(94, 200, 216, 0.4), transparent 40%, transparent 60%, rgba(168, 213, 232, 0.2));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }

  .card-glow:hover::before {
    opacity: 1;
  }

  .section-fade,
  .reveal {
    opacity: 0;
    transform: translate3d(0, 30px, 0) scale(0.98);
    filter: blur(8px);
    transition:
      opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform, opacity, filter;
  }

  .section-fade.is-visible,
  .reveal.is-visible {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }

  .reveal-up {
    transform: translate3d(0, 36px, 0) scale(0.98);
  }

  .reveal-left {
    transform: translate3d(-28px, 0, 0) scale(0.98);
  }

  .reveal-right {
    transform: translate3d(28px, 0, 0) scale(0.98);
  }

  .reveal-scale {
    transform: scale(0.9);
  }

  .reveal-tilt {
    transform: perspective(1200px) rotateX(10deg) translateY(38px);
  }

  .reveal-up.is-visible,
  .reveal-left.is-visible,
  .reveal-right.is-visible,
  .reveal-scale.is-visible,
  .reveal-tilt.is-visible {
    transform: translate3d(0, 0, 0) scale(1) rotateX(0deg);
  }

  .parallax-panel {
    position: relative;
    transform: translate3d(0, 0, 0);
    transition: transform 0.7s ease-out;
  }

  .parallax-panel::after {
    content: '';
    position: absolute;
    inset: -10%;
    background: radial-gradient(circle at center, rgba(94, 200, 216, 0.14), transparent 55%);
    opacity: 0;
    transition: opacity 0.6s ease;
    z-index: -1;
  }

  .parallax-panel:hover::after {
    opacity: 1;
  }
}

@layer utilities {
  .perspective-1000 {
    perspective: 1000px;
  }

  .preserve-3d {
    transform-style: preserve-3d;
  }

  .float-slow {
    animation: floatSlow 9s ease-in-out infinite;
  }

  .float-medium {
    animation: floatMedium 6s ease-in-out infinite;
  }

  .pulse-glow-soft {
    animation: pulseGlowSoft 4s ease-in-out infinite;
  }
}

@keyframes floatSlow {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes floatMedium {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-18px) rotate(1deg);
  }
}

@keyframes pulseGlowSoft {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.04);
  }
}

.vectra-dev-name {
  display: inline-block;
  position: relative;
  font-weight: 800;
  letter-spacing: -0.035em;

  color: #c4b5fd;

  background: linear-gradient(
    110deg,
    #ffffff 0%,
    #c4b5fd 18%,
    #8be9ff 35%,
    #f0abfc 52%,
    #ffffff 65%,
    #a5b4fc 82%,
    #ffffff 100%
  );

  background-size: 250% 100%;
  background-position: 0% 50%;

  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  filter: drop-shadow(0 0 8px rgb(167 139 250 / 20%));
  transition: filter 300ms ease, transform 300ms ease;
}

@media (prefers-reduced-motion: no-preference) {
  .vectra-dev-name {
    animation: vectra-name-shimmer 7s ease-in-out infinite;
  }
}

@keyframes vectra-name-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.vectra-dev-name:hover {
  filter: drop-shadow(0 0 14px rgb(139 233 255 / 45%));
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .vectra-dev-name {
    animation: none;
    background-position: 50% 50%;
    transition: none;
  }
}

.vectra-dev-team {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px 28px;
  padding: 12px 0;
}

.vectra-dev-team .vectra-dev-name {
  display: inline-block;
  font-size: clamp(1.3rem, 4vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.035em;

  background: linear-gradient(
    110deg,
    #ffffff,
    #c4b5fd,
    #8be9ff,
    #f0abfc,
    #ffffff,
    #a5b4fc,
    #ffffff
  );

  background-size: 250% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  filter: drop-shadow(0 0 8px rgb(167 139 250 / 25%));
  transition: filter 300ms ease, transform 300ms ease;
}

@media (prefers-reduced-motion: no-preference) {
  .vectra-dev-team .vectra-dev-name {
    animation: vectra-dev-shimmer 7s ease-in-out infinite;
  }
}

@keyframes vectra-dev-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.vectra-dev-team .vectra-dev-name:hover {
  filter: drop-shadow(0 0 14px rgb(139 233 255 / 45%));
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .vectra-dev-team .vectra-dev-name {
    animation: none;
    transition: none;
  }
}

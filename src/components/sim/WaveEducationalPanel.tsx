import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function WaveEducationalPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sim-panel">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="sim-panel-header w-full transition-colors hover:bg-surface-hover"
      >
        <span className="sim-panel-title">Understanding Waves</span>
        {expanded ? (
          <ChevronUp className="ml-auto h-4 w-4 text-star-white/40" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="ml-auto h-4 w-4 text-star-white/40" strokeWidth={1.5} />
        )}
      </button>
      {expanded && (
        <div className="space-y-4 p-4">
          <Section title="The Travelling Wave" equation="y(x, t) = A sin(kx − ωt + φ)">
            A wave is a disturbance that travels through space. At any position x and time t,
            the displacement y is given by a sinusoidal function. The wave moves because the
            phase (kx − ωt) shifts as time advances, carrying the pattern forward.
          </Section>

          <Section title="Amplitude" equation="A">
            Amplitude is the maximum displacement from equilibrium. It is measured from the
            centre line to a crest or trough, not from crest to trough. For a sinusoidal wave
            on the same string, average power is proportional to amplitude squared when the
            frequency and string properties are held fixed.
          </Section>

          <Section title="Wavelength" equation="λ — k = 2π/λ">
            The wavelength is the distance between two successive crests. A short wavelength
            produces a tight, choppy wave; a long wavelength produces broad, gentle swells.
            The wave number k relates to wavelength as k = 2π/λ.
          </Section>

          <Section title="Frequency & Period" equation="f — T = 1/f — ω = 2πf">
            Frequency is how many oscillations occur per second. The period T is its inverse:
            the time for one complete cycle. Angular frequency ω = 2πf is the rate of phase
            change in radians per second.
          </Section>

          <Section title="Wave Speed" equation="v = fλ">
            The model uses v = fλ, so its calculated speed changes when either frequency or
            wavelength changes. In a real fixed medium, the medium sets the propagation speed.
            A change in frequency then produces a corresponding change in wavelength. The
            playback-rate control changes only how quickly the animation is shown.
          </Section>

          <Section title="Direction">
            Flipping the sign of the time term changes the propagation direction. With
            (kx − ωt) the wave moves right; with (kx + ωt) it moves left. Toggle the direction
            control to see the wave reverse instantly.
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  equation,
  children,
}: {
  title: string;
  equation?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <h4 className="font-display text-sm font-medium text-star-white">{title}</h4>
        {equation && (
          <code className="rounded border border-surface-border bg-space-900/50 px-1.5 py-0.5 font-mono text-[0.7rem] text-accent-ice">
            {equation}
          </code>
        )}
      </div>
      <p className="font-body text-xs leading-relaxed text-star-white/45">{children}</p>
    </div>
  );
}

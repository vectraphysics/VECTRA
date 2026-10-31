import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function MFEducationalPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sim-panel">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="sim-panel-header w-full transition-colors hover:bg-surface-hover"
      >
        <span className="sim-panel-title">Understanding Magnetism</span>
        {expanded ? (
          <ChevronUp className="ml-auto h-4 w-4 text-star-white/40" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="ml-auto h-4 w-4 text-star-white/40" strokeWidth={1.5} />
        )}
      </button>
      {expanded && (
        <div className="space-y-4 p-4">
          <Section title="What Is a Magnetic Field?">
            A magnetic field is a vector field. Every point has a direction and a magnitude.
            Permanent magnets produce fields through aligned microscopic magnetic moments,
            while electric currents also create magnetic fields.
          </Section>

          <Section title="Field-Line Direction" equation="B = [3(m·r̂)r̂ − m] / r³">
            The field direction is tangent to a field line at every point. Outside a bar
            magnet, the field points from north to south. Inside the magnet it returns from
            south to north, forming closed loops. This 3D view draws the exterior dipole
            paths only. It does not draw the interior return path. Gold chevrons show direction.
          </Section>

          <Section title="Field Strength">
            Closer field lines represent a stronger field. Turn on the strength display to
            see the line colour shift from muted teal to gold where the modelled field is
            stronger. The probe also reports the local field magnitude and its three vector
            components.
          </Section>

          <Section title="Line Density Is a Display Setting">
            Changing field-line density changes how many paths are drawn. It does not change
            the magnet or its physical field. Field lines are a visual model, not strings or
            moving particles. They never cross because the field has one direction at each
            point.
          </Section>

          <Section title="The Compass Probe">
            The gold needle represents a small compass. Its north-seeking end aligns with
            the local magnetic field. Drag the probe to a new position and compare the
            direction and magnitude shown in the live data panel.
          </Section>

          <Section title="Model Limits and Units" equation="|B| ∝ 1/r³">
            This is an ideal magnetic-dipole model, not a detailed calculation for a finite
            bar magnet close to its surface. The displayed moment and field values use
            normalized arbitrary units, not amperes per metre or tesla. Use the results to
            compare positions and settings, not as laboratory measurements.
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

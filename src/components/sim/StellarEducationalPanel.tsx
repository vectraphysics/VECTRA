import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function StellarEducationalPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sim-panel">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="sim-panel-header w-full transition-colors hover:bg-surface-hover"
        aria-expanded={expanded}
      >
        <span className="sim-panel-title">Stellar Evolution Notes</span>
        {expanded ? (
          <ChevronUp className="ml-auto h-4 w-4 text-star-white/40" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="ml-auto h-4 w-4 text-star-white/40" strokeWidth={1.5} />
        )}
      </button>
      {expanded && (
        <div className="space-y-4 p-4">
          <Section title="Birth: cloud, disk and outflows">
            Stars form when dense regions of cold molecular clouds collapse under gravity. Rotation causes infalling gas to form an accretion disk. Magnetic fields can drive bipolar outflows that carry away angular momentum. A protostar is still contracting; sustained core hydrogen fusion begins later.
          </Section>

          <Section title="Main-sequence balance">
            During the main sequence, hydrogen fusion supplies energy to the star. The outward pressure gradient balances gravity in hydrostatic equilibrium. Higher-mass stars are hotter and much more luminous, so they use their core fuel faster.
          </Section>

          <Section title="Low- and intermediate-mass pathway">
            A representative path is red giant branch, core helium burning, asymptotic giant branch, planetary nebula, then white dwarf. In the asymptotic giant branch, hydrogen and helium burn in shells around a carbon-oxygen core. Stellar winds expel the envelope. Ultraviolet light from the exposed hot core ionises the expanding gas.
          </Section>

          <Section title="Very low-mass red dwarfs">
            Stars below roughly half the Sun's mass can remain on the main sequence for times far longer than the current age of the Universe. A 0.1-solar-mass red dwarf can have a main-sequence lifetime of around 10 trillion years. The simulation therefore does not rush these stars through giant and remnant stages.
          </Section>

          <Section title="Massive-star pathway">
            Massive stars can develop layered burning shells and build an iron-group core. When the core can no longer support itself, it collapses. A successful core-collapse supernova ejects outer material and may leave a neutron star or black hole. A red supergiant is one representative evolved phase, not the fate of every massive star.
          </Section>

          <Section title="Neutron stars and pulsars">
            A neutron star packs roughly a solar mass or more into a sphere only about 10–12 km in radius. It is supported by the physics of ultra-dense nuclear matter. A pulsar is a neutron star whose tilted magnetic axis produces beams that sweep across space as it rotates. We observe pulses only when the beam crosses our line of sight.
          </Section>

          <Section title="White dwarfs and black dwarfs">
            Electron degeneracy pressure supports a white dwarf against gravity. It no longer sustains ordinary core fusion and slowly cools. A black dwarf is a hypothetical, fully cooled remnant; the Universe is not old enough for one to have formed.
          </Section>

          <Section title="Why mass thresholds are approximate">
            Initial mass strongly influences stellar evolution, but it does not determine the final remnant through one exact universal cut-off. Metallicity, rotation, mass loss, binary interaction and the mass of the final collapsing core all matter. The slider uses simplified teaching thresholds to select representative pathways.
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="font-display text-sm font-medium text-star-white">{title}</h4>
      <p className="font-body text-xs leading-relaxed text-star-white/45">{children}</p>
    </div>
  );
}

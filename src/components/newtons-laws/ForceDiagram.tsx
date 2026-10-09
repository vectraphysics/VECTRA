import type { ReactNode } from 'react'

export interface DiagramForce {
  label: string
  direction: 'up' | 'down' | 'left' | 'right'
  color?: string
}

const vector: Record<DiagramForce['direction'], { x: number; y: number; tx: number; ty: number }> = {
  up: { x: 0, y: -1, tx: 0, ty: -9 },
  down: { x: 0, y: 1, tx: 0, ty: 18 },
  left: { x: -1, y: 0, tx: -8, ty: 4 },
  right: { x: 1, y: 0, tx: 8, ty: 4 },
}

export function ForceDiagram({ forces, caption, object = 'object' }: { forces: DiagramForce[]; caption: string; object?: ReactNode }) {
  return (
    <figure className="rounded-xl border border-surface-border bg-space-900/55 p-3 sm:p-5">
      <svg viewBox="0 0 300 190" role="img" aria-label={`${caption}. Forces on the ${typeof object === 'string' ? object : 'selected object'}: ${forces.map((force) => `${force.label} ${force.direction}`).join(', ')}.`} className="mx-auto block h-auto w-full max-w-sm">
        <defs>
          <marker id="force-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L7,3 z" fill="context-stroke" /></marker>
        </defs>
        <rect x="112" y="66" width="76" height="54" rx="8" fill="#152638" stroke="#315069" strokeWidth="1.5" />
        <text x="150" y="97" textAnchor="middle" fill="#dce9f4" fontSize="12" fontFamily="Inter, sans-serif">{typeof object === 'string' ? object : 'selected object'}</text>
        {forces.map((force, index) => {
          const dir = vector[force.direction]
          const color = force.color ?? '#5ec8d8'
          const offset = (index - (forces.length - 1) / 2) * 13
          const sx = 150 + (force.direction === 'left' || force.direction === 'right' ? 0 : offset)
          const sy = 93 + (force.direction === 'up' || force.direction === 'down' ? 0 : offset)
          const ex = sx + dir.x * 54
          const ey = sy + dir.y * 54
          const lx = ex + dir.x * 13 + dir.tx
          const ly = ey + dir.y * 13 + dir.ty
          return <g key={`${force.label}-${index}`}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth="2.5" markerEnd="url(#force-arrow)" />
            <text x={lx} y={ly} textAnchor="middle" fill={color} fontSize="11" fontFamily="ui-monospace, monospace">{force.label}</text>
          </g>
        })}
        <line x1="38" y1="151" x2="262" y2="151" stroke="#456074" strokeWidth="1" />
        <text x="265" y="155" fill="#8296a8" fontSize="10" fontFamily="ui-monospace, monospace">surface</text>
      </svg>
      <figcaption className="mt-2 text-center text-xs leading-5 text-star-white/45">{caption}</figcaption>
    </figure>
  )
}

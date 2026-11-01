/**
 * Front-view technical drawing of Bit: outline, centre lines and dimensions, drawn in the same
 * coordinates as the robot itself (Robot.tsx, 240 × 300) so the two always match.
 */
export default function BitBlueprint({ className = '' }: { className?: string }) {
  const text = { fill: 'currentColor', stroke: 'none', fontFamily: '"IBM Plex Mono", monospace', fontSize: 9 }

  return (
    <svg viewBox="0 0 380 380" className={`drawing ${className}`} aria-hidden="true">
      <defs>
        <marker
          id="bp-arrow"
          viewBox="0 0 8 8"
          refX="7.5"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0 1 L8 4 L0 7 z" fill="currentColor" />
        </marker>
      </defs>

      <g transform="translate(70 40)" fill="none" stroke="currentColor" strokeWidth="1">
        {/* Outline */}
        <line x1="120" y1="52" x2="120" y2="29" />
        <circle cx="120" cy="22" r="7" />
        <rect x="20" y="104" width="18" height="44" rx="9" />
        <rect x="202" y="104" width="18" height="44" rx="9" />
        <rect x="32" y="50" width="176" height="136" rx="60" />
        <rect x="50" y="74" width="140" height="88" rx="42" />
        <rect x="80" y="102" width="24" height="34" rx="12" />
        <rect x="136" y="102" width="24" height="34" rx="12" />
        <rect x="108" y="146" width="24" height="4" rx="2" />
        <rect x="106" y="186" width="28" height="12" />
        <path d="M62 214 Q62 200 78 198 L162 198 Q178 200 178 214 L170 268 Q168 284 152 284 L88 284 Q72 284 70 268 Z" />
        <rect x="94" y="220" width="52" height="32" rx="9" />
        <rect x="44" y="206" width="20" height="58" rx="10" transform="rotate(14 54 212)" />
        <rect x="176" y="206" width="20" height="58" rx="10" transform="rotate(-14 186 212)" />

        {/* Centre lines */}
        <g strokeDasharray="10 3 2 3" opacity="0.7">
          <line x1="120" y1="-8" x2="120" y2="300" />
          <line x1="-6" y1="119" x2="246" y2="119" />
        </g>

        {/* Dimensions */}
        <g opacity="0.85">
          <line x1="32" y1="44" x2="32" y2="-24" />
          <line x1="208" y1="44" x2="208" y2="-24" />
          <line x1="32" y1="-18" x2="208" y2="-18" markerStart="url(#bp-arrow)" markerEnd="url(#bp-arrow)" />
          <text x="120" y="-23" textAnchor="middle" {...text}>
            176
          </text>

          <line x1="130" y1="15" x2="270" y2="15" />
          <line x1="180" y1="284" x2="270" y2="284" />
          <line x1="262" y1="15" x2="262" y2="284" markerStart="url(#bp-arrow)" markerEnd="url(#bp-arrow)" />
          <text x="256" y="150" textAnchor="middle" transform="rotate(-90 256 150)" {...text}>
            269
          </text>

          <line x1="26" y1="50" x2="-28" y2="50" />
          <line x1="26" y1="186" x2="-28" y2="186" />
          <line x1="-20" y1="50" x2="-20" y2="186" markerStart="url(#bp-arrow)" markerEnd="url(#bp-arrow)" />
          <text x="-26" y="118" textAnchor="middle" transform="rotate(-90 -26 118)" {...text}>
            136
          </text>

          <polyline points="50,67 10,26 -12,26" markerStart="url(#bp-arrow)" />
          <text x="-14" y="22" textAnchor="end" {...text}>
            R60
          </text>

          <polyline points="126,16 148,-4 168,-4" markerStart="url(#bp-arrow)" />
          <text x="170" y="-1" {...text}>
            Ø14
          </text>
        </g>

        <text x="120" y="322" textAnchor="middle" letterSpacing="1.5" {...text}>
          BIT · FRONT VIEW
        </text>
      </g>
    </svg>
  )
}

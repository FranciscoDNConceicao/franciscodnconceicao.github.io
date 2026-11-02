/**
 * Side-view technical drawing of Bit, the robot arm, in its reference pose: outline, axis lines,
 * link lengths, the shoulder angle and the work envelope. Uses the same coordinates as Robot.tsx
 * (shoulder at 130,222; links of 100 and 86) so the numbers match the real thing.
 */
const SHOULDER = { x: 130, y: 222 }
const ELBOW = { x: 164.2, y: 128 }
const WRIST = { x: 245, y: 98.6 }

export default function ArmBlueprint({ className = '' }: { className?: string }) {
  const text = { fill: 'currentColor', stroke: 'none', fontFamily: '"IBM Plex Mono", monospace', fontSize: 9 }
  const arrows = { markerStart: 'url(#ab-arrow)', markerEnd: 'url(#ab-arrow)' }

  return (
    <svg viewBox="0 0 400 360" className={`drawing ${className}`} aria-hidden="true">
      <defs>
        <marker
          id="ab-arrow"
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

      <g transform="translate(40 10)" fill="none" stroke="currentColor" strokeWidth="1">
        {/* Outline in the reference pose: shoulder at 70°, forearm at 20° */}
        <rect x="60" y="272" width="140" height="18" rx="3" />
        <path d="M92 272 L168 272 L158 240 L102 240 Z" />
        <rect x="94" y="230" width="72" height="13" rx="5" />
        <rect x="-15" y="-15" width="130" height="30" rx="15" transform={`translate(${SHOULDER.x} ${SHOULDER.y}) rotate(-70)`} />
        <rect x="-11" y="-11" width="108" height="22" rx="11" transform={`translate(${ELBOW.x} ${ELBOW.y}) rotate(-20)`} />
        <circle cx={SHOULDER.x} cy={SHOULDER.y} r="18" />
        <circle cx={ELBOW.x} cy={ELBOW.y} r="13" />
        <g transform={`translate(${WRIST.x} ${WRIST.y}) rotate(-20)`}>
          <circle r="9" />
          <rect x="6" y="-12" width="30" height="24" rx="6" />
          <circle cx="38" r="10" />
        </g>

        {/* Axis lines */}
        <g strokeDasharray="10 3 2 3" opacity="0.7">
          <line x1="121.4" y1="245.5" x2="167.6" y2="118.6" />
          <line x1="150" y1="133" x2="262" y2="92.4" />
          <line x1={SHOULDER.x} y1={SHOULDER.y} x2="190" y2={SHOULDER.y} />
        </g>

        {/* Work envelope: everywhere the wrist can reach */}
        <path d="M-31.1 129 A186 186 0 0 1 309.7 173.9" strokeDasharray="2 4" opacity="0.8" />
        <text x="130" y="30" textAnchor="middle" letterSpacing="1" {...text}>
          WORK ENVELOPE R186
        </text>

        <g opacity="0.85">
          {/* Upper arm length */}
          <line x1="111.2" y1="215.2" x2="93.5" y2="208.7" />
          <line x1="145.4" y1="121.2" x2="127.7" y2="114.7" />
          <line x1="98" y1="210.4" x2="132.2" y2="116.4" {...arrows} />
          <text x="104" y="160" textAnchor="middle" transform="rotate(-70 104 160)" {...text}>
            L1 = 100
          </text>

          {/* Forearm length */}
          <line x1="159.4" y1="114.8" x2="153.9" y2="99.8" />
          <line x1="240.2" y1="85.4" x2="234.7" y2="70.4" />
          <line x1="153.9" y1="99.8" x2="234.7" y2="70.4" {...arrows} />
          <text x="190" y="78" textAnchor="middle" transform="rotate(-20 190 78)" {...text}>
            L2 = 86
          </text>

          {/* Shoulder angle */}
          <path d="M170 222 A40 40 0 0 0 143.7 184.4" markerEnd="url(#ab-arrow)" />
          <text x="176" y="196" {...text}>
            70°
          </text>

          {/* Shoulder joint */}
          <polyline points="117.3,234.7 82,252 62,252" markerStart="url(#ab-arrow)" />
          <text x="58" y="255" textAnchor="end" {...text}>
            Ø36
          </text>

          {/* Base width */}
          <line x1="60" y1="294" x2="60" y2="316" />
          <line x1="200" y1="294" x2="200" y2="316" />
          <line x1="60" y1="310" x2="200" y2="310" {...arrows} />
          <text x="130" y="306" textAnchor="middle" {...text}>
            140
          </text>
        </g>

        <text x="130" y="336" textAnchor="middle" letterSpacing="1.5" {...text}>
          BIT · SIDE VIEW
        </text>
      </g>
    </svg>
  )
}

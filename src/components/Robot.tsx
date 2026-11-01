import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useReducedMotion } from '../hooks'

/** What Bit says each time it is clicked, in order. */
const LINES = [
  "I'm Bit. Francisco taught my cousin Q.bo to recognise faces.",
  'Running a face scan…',
  'Beep boop. That tickles.',
  "Scroll down, there's more about him.",
]

interface Props {
  /** Starts the face scan on the portrait. */
  onScan: () => void
  /** True while the portrait is being scanned; Bit looks at it. */
  scanning: boolean
  /** The element Bit looks at while scanning. */
  lookAt: RefObject<HTMLElement>
}

const clamp = (n: number) => Math.max(-1, Math.min(1, n))

/** Bit, a small robot whose eyes follow the cursor. Click it to say hello. */
export default function Robot({ onScan, scanning, lookAt }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const eyesRef = useRef<SVGGElement>(null)
  const reducedMotion = useReducedMotion()
  const [text, setText] = useState('')
  const [talking, setTalking] = useState(false)
  const [happy, setHappy] = useState(false)
  const [waving, setWaving] = useState(false)
  const lineIndex = useRef(0)
  const timers = useRef<number[]>([])
  const hideTimer = useRef(0)
  const scanningRef = useRef(scanning)
  const onScanRef = useRef(onScan)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  const say = useCallback((line: string, ms: number) => {
    window.clearTimeout(hideTimer.current)
    setText(line)
    setTalking(true)
    hideTimer.current = window.setTimeout(() => setTalking(false), ms)
  }, [])

  // Announce the result when a scan finishes.
  useEffect(() => {
    const finished = scanningRef.current && !scanning
    scanningRef.current = scanning
    if (finished) say('Match found. Hi, Francisco!', 2400)
  }, [scanning, say])

  // Introduce itself, then scan the portrait once.
  useEffect(() => {
    later(() => say('Hello, human.', 2200), 1500)
    later(() => {
      say('Running a face scan…', 2200)
      onScanRef.current()
    }, 4000)
    const pending = timers.current
    return () => {
      pending.forEach(window.clearTimeout)
      window.clearTimeout(hideTimer.current)
    }
  }, [later, say])

  const poke = () => {
    const line = LINES[lineIndex.current % LINES.length]
    lineIndex.current += 1
    say(line, line.length > 32 ? 3800 : 2400)
    if (line.startsWith('Running')) onScanRef.current()
    setHappy(true)
    setWaving(true)
    later(() => setHappy(false), 1300)
    later(() => setWaving(false), 1600)
  }

  // Eyes and head follow the cursor (or wander when it is idle), with natural blinks.
  useEffect(() => {
    const svg = svgRef.current
    const head = headRef.current
    const eyes = eyesRef.current
    if (!svg || !head || !eyes) return

    const apply = (x: number, y: number, lid: number) => {
      head.setAttribute('transform', `translate(${x * 5} ${y * 3}) rotate(${x * 7} 120 186)`)
      eyes.setAttribute('transform', `translate(${x * 14} ${y * 10}) translate(0 119) scale(1 ${lid}) translate(0 -119)`)
    }

    if (reducedMotion) {
      apply(0.45, 0, 1)
      return
    }

    let frame = 0
    let visible = true
    let last = performance.now()
    let lookX = 0
    let lookY = 0
    let targetX = 0.45
    let targetY = 0
    let lastPointer = -Infinity
    let nextWander = 0
    let blinkAt = performance.now() + 1600
    let blinkStart = -1
    let doubled = false

    const aimAt = (x: number, y: number) => {
      const rect = svg.getBoundingClientRect()
      targetX = clamp((x - (rect.left + rect.width / 2)) / 320)
      targetY = clamp((y - (rect.top + rect.height * 0.4)) / 260)
    }
    const aimAtPortrait = () => {
      const rect = lookAt.current?.getBoundingClientRect()
      if (rect) aimAt(rect.left + rect.width / 2, rect.top + rect.height * 0.45)
    }

    const tick = (now: number) => {
      frame = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      if (scanningRef.current) {
        aimAtPortrait()
      } else if (now - lastPointer > 3500 && now > nextWander) {
        nextWander = now + 2000 + Math.random() * 2400
        if (Math.random() < 0.35) aimAtPortrait()
        else {
          targetX = (Math.random() * 2 - 1) * 0.8
          targetY = (Math.random() * 2 - 1) * 0.45
        }
      }

      const ease = 1 - Math.pow(0.0006, dt)
      lookX += (targetX - lookX) * ease
      lookY += (targetY - lookY) * ease

      let lid = 1
      if (blinkStart < 0 && now >= blinkAt) blinkStart = now
      if (blinkStart >= 0) {
        const t = (now - blinkStart) / 150
        if (t >= 1) {
          blinkStart = -1
          doubled = !doubled && Math.random() < 0.2
          blinkAt = now + (doubled ? 120 : 2400 + Math.random() * 3600)
        } else {
          lid = Math.max(0.08, Math.abs(1 - 2 * t))
        }
      }

      apply(lookX, lookY, lid)
      schedule()
    }

    const schedule = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick)
    }
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      lastPointer = performance.now()
      if (!scanningRef.current) aimAt(event.clientX, event.clientY)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      schedule()
    })
    const onVisibility = () => schedule()

    observer.observe(svg)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    schedule()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reducedMotion, lookAt])

  return (
    <div className="relative h-full w-full">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute bottom-[90%] left-1/2 z-20 w-max max-w-[14rem] -translate-x-1/2 transition duration-300 ease-out ${
          talking ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <p className="rounded-2xl bg-ink px-3.5 py-2 text-center text-[13px] font-medium leading-snug text-bg shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)]">
          {text}
        </p>
        <span className="mx-auto block h-2.5 w-2.5 -translate-y-1.5 rotate-45 bg-ink" />
      </div>

      <button
        type="button"
        onClick={poke}
        aria-label="Say hello to Bit, the robot"
        className="block h-full w-full cursor-pointer rounded-3xl"
      >
        <svg
          ref={svgRef}
          viewBox="0 0 240 300"
          className={`bit h-full w-full overflow-visible ${talking ? 'bit-talking' : ''} ${waving ? 'bit-waving' : ''} ${
            scanning ? 'bit-scanning' : ''
          }`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bit-shell" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0" stopColor="#fbfbf9" />
              <stop offset="0.45" stopColor="#dededa" />
              <stop offset="1" stopColor="#a3a39f" />
            </linearGradient>
            <linearGradient id="bit-metal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#c4c4c0" />
              <stop offset="1" stopColor="#82827e" />
            </linearGradient>
            <radialGradient id="bit-visor" cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#3a3a3a" />
              <stop offset="0.6" stopColor="#121212" />
              <stop offset="1" stopColor="#050505" />
            </radialGradient>
            <filter id="bit-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="bit-visor-clip">
              <rect x="50" y="74" width="140" height="88" rx="42" />
            </clipPath>
          </defs>

          <ellipse className="bit-shadow" cx="120" cy="292" rx="70" ry="6" fill="#000" opacity="0.3" />

          <g className="bit-float">
            {/* Arms (the right one waves) */}
            <g transform="rotate(14 54 212)">
              <rect x="44" y="206" width="20" height="58" rx="10" fill="url(#bit-metal)" />
            </g>
            <g transform="rotate(-14 186 212)">
              <rect className="bit-arm-wave" x="176" y="206" width="20" height="58" rx="10" fill="url(#bit-metal)" />
            </g>

            {/* Body with a little status display */}
            <path
              d="M62 214 Q62 200 78 198 L162 198 Q178 200 178 214 L170 268 Q168 284 152 284 L88 284 Q72 284 70 268 Z"
              fill="url(#bit-shell)"
            />
            <rect x="94" y="220" width="52" height="32" rx="9" fill="url(#bit-visor)" />
            <g className="bit-bars" fill="#f4f4f2" opacity="0.85">
              <rect x="106" y="230" width="6" height="14" rx="3" />
              <rect x="117" y="230" width="6" height="14" rx="3" />
              <rect x="128" y="230" width="6" height="14" rx="3" />
            </g>

            <rect x="106" y="180" width="28" height="22" rx="6" fill="#77777a" />

            {/* Head */}
            <g ref={headRef}>
              <line x1="120" y1="52" x2="120" y2="28" stroke="#9a9a97" strokeWidth="4" strokeLinecap="round" />
              <circle className="bit-antenna" cx="120" cy="22" r="7" fill="#ffffff" filter="url(#bit-glow)" />
              <rect x="20" y="104" width="18" height="44" rx="9" fill="url(#bit-metal)" />
              <rect x="202" y="104" width="18" height="44" rx="9" fill="url(#bit-metal)" />
              <rect x="32" y="50" width="176" height="136" rx="60" fill="url(#bit-shell)" />
              <rect x="50" y="74" width="140" height="88" rx="42" fill="url(#bit-visor)" />
              <ellipse cx="86" cy="86" rx="26" ry="7" fill="#fff" opacity="0.09" transform="rotate(-14 86 86)" />

              <g clipPath="url(#bit-visor-clip)">
                <rect className="bit-visor-scan" x="50" y="76" width="140" height="2" fill="#fff" opacity="0" />
              </g>

              <g ref={eyesRef} filter="url(#bit-glow)">
                {happy ? (
                  <g fill="none" stroke="#f7f7f5" strokeWidth="6" strokeLinecap="round">
                    <path d="M80 124 Q92 106 104 124" />
                    <path d="M136 124 Q148 106 160 124" />
                  </g>
                ) : (
                  <g fill="#f7f7f5">
                    <rect x="80" y="102" width="24" height="34" rx="12" />
                    <rect x="136" y="102" width="24" height="34" rx="12" />
                  </g>
                )}
              </g>
              <rect className="bit-mouth" x="108" y="146" width="24" height="4" rx="2" fill="#f7f7f5" opacity="0.55" />
            </g>
          </g>
        </svg>
      </button>
    </div>
  )
}

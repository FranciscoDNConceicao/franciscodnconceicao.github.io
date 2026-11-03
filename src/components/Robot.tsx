import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useReducedMotion } from '../hooks'
import { BIT, solveArm } from '../lib/bit'
import type { Point } from '../lib/bit'

/** What Bit says each time it is clicked, in order. */
const LINES = [
  "I'm Bit. Francisco taught my cousin Q.bo to recognise faces.",
  'Running a face scan…',
  'Two joints, a bit of trigonometry, and I can follow your cursor.',
  'I can draw, too. Find me in the Lab, further down.',
]

interface Props {
  /** Starts the face scan on the portrait. */
  onScan: () => void
  /** True while the portrait is being scanned; Bit points its camera at it. */
  scanning: boolean
  /** The element Bit looks at while scanning. */
  lookAt: RefObject<HTMLElement>
}

// Arm geometry, in SVG units (viewBox 260 × 300).
const SHOULDER: Point = { x: 130, y: 222 }
const UPPER = 100
const FORE = 86
const { lens: LENS, orangeLight: ORANGE_LIGHT, orange: ORANGE, steel: STEEL } = BIT
const DEG = 180 / Math.PI

const solve = (target: Point) => solveArm(SHOULDER, UPPER, FORE, target, 'up')

/** Bit, an industrial robot arm whose camera follows the cursor. Click it to say hello. */
export default function Robot({ onScan, scanning, lookAt }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const upperRef = useRef<SVGGElement>(null)
  const foreRef = useRef<SVGGElement>(null)
  const elbowRef = useRef<SVGGElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const lensRef = useRef<SVGCircleElement>(null)
  const beamRef = useRef<SVGPolygonElement>(null)
  const beamGradientRef = useRef<SVGLinearGradientElement>(null)
  const reducedMotion = useReducedMotion()
  const [text, setText] = useState('')
  const [talking, setTalking] = useState(false)
  const lineIndex = useRef(0)
  const timers = useRef<number[]>([])
  const hideTimer = useRef(0)
  const wiggleUntil = useRef(0)
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
    wiggleUntil.current = performance.now() + 900
  }

  // Drive the joints every frame towards the cursor, the portrait (while scanning) or an idle path.
  useEffect(() => {
    const svg = svgRef.current
    const upper = upperRef.current
    const fore = foreRef.current
    const elbowCap = elbowRef.current
    const head = headRef.current
    const lens = lensRef.current
    const beam = beamRef.current
    const beamGradient = beamGradientRef.current
    if (!svg || !upper || !fore || !elbowCap || !head || !lens || !beam || !beamGradient) return

    const toSvg = (x: number, y: number): Point | null => {
      const matrix = svg.getScreenCTM()
      if (!matrix) return null
      const p = new DOMPoint(x, y).matrixTransform(matrix.inverse())
      return { x: p.x, y: p.y }
    }
    const portraitTarget = (): Point | null => {
      const rect = lookAt.current?.getBoundingClientRect()
      return rect ? toSvg(rect.left + rect.width * 0.48, rect.top + rect.height * 0.55) : null
    }

    const pose = (target: Point, aim: Point, now: number) => {
      const { shoulder, elbow, forearm, wrist } = solve(target)
      let camera = Math.hypot(aim.x - wrist.x, aim.y - wrist.y) > 10 ? Math.atan2(aim.y - wrist.y, aim.x - wrist.x) : forearm
      // A real wrist only bends so far.
      const relative = Math.atan2(Math.sin(camera - forearm), Math.cos(camera - forearm))
      camera = forearm + Math.max(-1.2, Math.min(1.2, relative))
      if (now < wiggleUntil.current) camera += Math.sin(now / 45) * 0.35

      upper.setAttribute('transform', `translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${shoulder * DEG})`)
      fore.setAttribute('transform', `translate(${elbow.x} ${elbow.y}) rotate(${forearm * DEG})`)
      elbowCap.setAttribute('transform', `translate(${elbow.x} ${elbow.y})`)
      head.setAttribute('transform', `translate(${wrist.x} ${wrist.y}) rotate(${camera * DEG})`)

      // The scan beam runs from the lens to the face.
      const lensX = wrist.x + Math.cos(camera) * 38
      const lensY = wrist.y + Math.sin(camera) * 38
      const nx = -Math.sin(camera)
      const ny = Math.cos(camera)
      const length = Math.max(40, Math.hypot(aim.x - lensX, aim.y - lensY))
      const endX = lensX + Math.cos(camera) * length
      const endY = lensY + Math.sin(camera) * length
      const spread = length * 0.32
      beam.setAttribute(
        'points',
        `${lensX + nx * 3},${lensY + ny * 3} ${lensX - nx * 3},${lensY - ny * 3} ${endX - nx * spread},${endY - ny * spread} ${endX + nx * spread},${endY + ny * spread}`,
      )
      beamGradient.setAttribute('x1', String(lensX))
      beamGradient.setAttribute('y1', String(lensY))
      beamGradient.setAttribute('x2', String(endX))
      beamGradient.setAttribute('y2', String(endY))
    }

    const rest: Point = { x: 196, y: 120 }
    if (reducedMotion) {
      pose(rest, portraitTarget() ?? rest, 0)
      return
    }

    let frame = 0
    let visible = true
    let last = performance.now()
    let time = 0
    let lastPointer = -Infinity
    let pointer: Point = rest
    let target: Point = { ...rest }
    let aim: Point = { ...rest }
    let blinkAt = performance.now() + 2500

    const tick = (now: number) => {
      frame = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      time += dt

      let goal: Point
      if (scanningRef.current) {
        goal = portraitTarget() ?? rest
      } else if (now - lastPointer < 3500) {
        goal = pointer
      } else {
        // Idle: trace a slow figure of eight above the base.
        goal = { x: 140 + Math.sin(time * 0.45) * 70, y: 105 + Math.sin(time * 0.9) * 32 }
      }
      // Never reach into the floor.
      goal = { x: goal.x, y: Math.min(goal.y, SHOULDER.y + 6) }

      const ease = 1 - Math.pow(0.002, dt)
      aim = { x: aim.x + (goal.x - aim.x) * ease, y: aim.y + (goal.y - aim.y) * ease }
      const armEase = 1 - Math.pow(0.008, dt)
      target = { x: target.x + (aim.x - target.x) * armEase, y: target.y + (aim.y - target.y) * armEase }
      pose(target, aim, now)

      // The lens closes for a moment now and then, like a camera shutter.
      let radius = 6
      if (now > blinkAt) {
        const t = (now - blinkAt) / 180
        if (t >= 1) blinkAt = now + 2600 + Math.random() * 3600
        else radius = 6 * Math.max(0.15, Math.abs(1 - 2 * t))
      }
      lens.setAttribute('r', radius.toFixed(2))

      schedule()
    }

    const schedule = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick)
    }
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const p = toSvg(event.clientX, event.clientY)
      if (!p) return
      pointer = p
      lastPointer = performance.now()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      schedule()
    })
    const onVisibility = () => schedule()

    pose(rest, rest, 0)
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
        className={`pointer-events-none absolute bottom-[96%] left-1/2 z-20 w-max max-w-[14rem] -translate-x-1/2 transition duration-300 ease-out ${
          talking ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <p className="rounded-lg bg-ink px-3.5 py-2 text-center text-[13px] font-medium leading-snug text-bg shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)]">
          {text}
        </p>
        <span className="mx-auto block h-2.5 w-2.5 -translate-y-1.5 rotate-45 bg-ink" />
      </div>

      <button
        type="button"
        onClick={poke}
        aria-label="Say hello to Bit, the robot arm"
        className="block h-full w-full cursor-pointer rounded-2xl"
      >
        <svg
          ref={svgRef}
          viewBox="0 0 260 300"
          className={`arm h-full w-full overflow-visible ${talking ? 'arm-talking' : ''}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="arm-orange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={ORANGE_LIGHT} />
              <stop offset="1" stopColor={ORANGE} />
            </linearGradient>
            <linearGradient id="arm-steel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#45454b" />
              <stop offset="1" stopColor="#1d1d20" />
            </linearGradient>
            <pattern id="arm-hazard" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="12" fill="#f5b400" />
              <rect x="6" width="6" height="12" fill="#1b1b1d" />
            </pattern>
            <linearGradient ref={beamGradientRef} id="arm-beam" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={LENS} stopOpacity="0.55" />
              <stop offset="1" stopColor={LENS} stopOpacity="0.04" />
            </linearGradient>
            <filter id="arm-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <polygon
            ref={beamRef}
            fill="url(#arm-beam)"
            className={`transition-opacity duration-300 ${scanning ? 'opacity-100' : 'opacity-0'}`}
          />

          <ellipse cx="130" cy="293" rx="78" ry="6" fill="#000" opacity="0.3" />

          {/* Base: a hazard-striped plate, a pedestal with a status light, and a turntable */}
          <rect x="60" y="272" width="140" height="18" rx="3" fill="url(#arm-hazard)" stroke={STEEL} strokeWidth="2" />
          <path d="M92 272 L168 272 L158 240 L102 240 Z" fill="url(#arm-steel)" />
          <circle className="arm-led" cx="130" cy="257" r="3.5" fill={LENS} filter="url(#arm-glow)" />
          <rect x="94" y="230" width="72" height="13" rx="5" fill="url(#arm-orange)" />

          {/* Upper arm, drawn along +x from the shoulder */}
          <g ref={upperRef}>
            <rect x="-15" y="-15" width={UPPER + 30} height="30" rx="15" fill="url(#arm-orange)" />
            <path d={`M10 -8 L${UPPER - 10} -8`} stroke={STEEL} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
            <circle cx={UPPER / 2} cy="5" r="2" fill={STEEL} opacity="0.6" />
          </g>

          {/* Forearm, drawn along +x from the elbow */}
          <g ref={foreRef}>
            <rect x="-11" y="-11" width={FORE + 22} height="22" rx="11" fill="url(#arm-orange)" />
            <path d={`M8 -5 L${FORE - 8} -5`} stroke={STEEL} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          </g>

          {/* Joint caps */}
          <circle cx={SHOULDER.x} cy={SHOULDER.y} r="18" fill="url(#arm-steel)" stroke="#55555c" strokeWidth="2" />
          <circle cx={SHOULDER.x} cy={SHOULDER.y} r="6" fill="#55555c" />
          <g ref={elbowRef}>
            <circle r="13" fill="url(#arm-steel)" stroke="#55555c" strokeWidth="2" />
            <circle r="4.5" fill="#55555c" />
          </g>

          {/* Camera head on the wrist, drawn along +x */}
          <g ref={headRef}>
            <circle r="9" fill="url(#arm-steel)" stroke="#55555c" strokeWidth="2" />
            <rect x="6" y="-12" width="30" height="24" rx="6" fill="url(#arm-steel)" />
            <rect x="12" y="-16" width="10" height="5" rx="2" fill={ORANGE} />
            <circle cx="38" cy="0" r="10" fill="#0e0e10" stroke="#55555c" strokeWidth="1.5" />
            <circle ref={lensRef} cx="38" cy="0" r="6" fill={LENS} filter="url(#arm-glow)" />
          </g>
        </svg>
      </button>
    </div>
  )
}

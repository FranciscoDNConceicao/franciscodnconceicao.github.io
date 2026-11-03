import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useReducedMotion } from '../hooks'
import { BIT, solveArm } from '../lib/bit'
import type { Point } from '../lib/bit'
import Section from './Section'

// Workspace, in drawing units. The geometry keeps every point of the sheet reachable and the
// elbow inside the frame with a single, fixed elbow side (checked numerically).
const W = 640
const H = 420
const SHOULDER: Point = { x: 320, y: 410 }
const UPPER = 290
const FORE = 160
const SHEET = { x: 130, y: 24, w: 380, h: 240 }
const REST: Point = { x: 470, y: 230 }
const DRAW_SPEED = 320
const TRAVEL_SPEED = 640
const DEG = 180 / Math.PI

type Stroke = Point[]

// ---------- Things Bit knows how to draw ----------

const arc = (cx: number, cy: number, r: number, from: number, to: number, steps = 20): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })

/** Single-stroke letters on a baseline at y = 0, with an x-height of 1. */
const GLYPHS: Record<string, { advance: number; strokes: Stroke[] }> = {
  h: {
    advance: 1.25,
    strokes: [
      [{ x: 0, y: -2 }, { x: 0, y: 0 }],
      [...arc(0.4, -0.55, 0.4, 180, 360), { x: 0.8, y: 0 }],
    ],
  },
  e: { advance: 1.3, strokes: [[{ x: 0, y: -0.45 }, ...arc(0.45, -0.45, 0.45, 360, 50, 28)]] },
  l: { advance: 0.55, strokes: [[{ x: 0, y: -2 }, { x: 0, y: 0 }]] },
  o: { advance: 1.3, strokes: [arc(0.45, -0.45, 0.45, 270, 630, 32)] },
  '!': {
    advance: 0.4,
    strokes: [
      [{ x: 0, y: -2 }, { x: 0, y: -0.6 }],
      [{ x: 0, y: -0.12 }, { x: 0, y: 0 }],
    ],
  },
}

/** Scales strokes to fit the sheet with some padding, centred. */
function fit(strokes: Stroke[], padding: number): Stroke[] {
  const all = strokes.flat()
  const minX = Math.min(...all.map((p) => p.x))
  const maxX = Math.max(...all.map((p) => p.x))
  const minY = Math.min(...all.map((p) => p.y))
  const maxY = Math.max(...all.map((p) => p.y))
  const scale = Math.min((SHEET.w - 2 * padding) / (maxX - minX || 1), (SHEET.h - 2 * padding) / (maxY - minY || 1))
  const offsetX = SHEET.x + (SHEET.w - (maxX - minX) * scale) / 2
  const offsetY = SHEET.y + (SHEET.h - (maxY - minY) * scale) / 2
  return strokes.map((stroke) =>
    stroke.map((p) => ({ x: offsetX + (p.x - minX) * scale, y: offsetY + (p.y - minY) * scale })),
  )
}

function lettering(word: string): Stroke[] {
  let x = 0
  const strokes: Stroke[] = []
  for (const char of word) {
    const glyph = GLYPHS[char]
    strokes.push(...glyph.strokes.map((stroke) => stroke.map((p) => ({ x: p.x + x, y: p.y }))))
    x += glyph.advance
  }
  return fit(strokes, 44)
}

/** Hypotrochoids (the curves a Spirograph draws), as [fixed radius, rolling radius, pen offset]. */
const SPIROGRAPHS: [number, number, number][] = [
  [5, 3, 4],
  [8, 5, 4.5],
  [7, 3, 2.6],
  [9, 4, 3.5],
  [6, 5, 3.8],
]

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

function spirograph(index: number): Stroke[] {
  const [R, r, d] = SPIROGRAPHS[index % SPIROGRAPHS.length]
  const turns = r / gcd(R, r)
  const steps = turns * 140
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * turns * Math.PI * 2
    return {
      x: (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t),
      y: (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t),
    }
  })
  return fit([points], 14)
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

const clampToSheet = (p: Point): Point => ({
  x: Math.min(SHEET.x + SHEET.w, Math.max(SHEET.x, p.x)),
  y: Math.min(SHEET.y + SHEET.h, Math.max(SHEET.y, p.y)),
})

interface Controls {
  write: () => void
  spiro: () => void
  clear: () => void
}

/** Bit as a pen plotter: it copies whatever is sketched on the sheet, one joint angle at a time. */
export default function Plotter() {
  const reducedMotion = useReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const upperRef = useRef<SVGGElement>(null)
  const foreRef = useRef<SVGGElement>(null)
  const elbowRef = useRef<SVGGElement>(null)
  const wristRef = useRef<SVGGElement>(null)
  const penRef = useRef<SVGCircleElement>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)
  const statusRef = useRef<HTMLSpanElement>(null)
  const controls = useRef<Controls | null>(null)
  const pointerDown = useRef<(event: ReactPointerEvent<HTMLCanvasElement>) => void>(() => undefined)

  useEffect(() => {
    const box = boxRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const upper = upperRef.current
    const fore = foreRef.current
    const elbowCap = elbowRef.current
    const wrist = wristRef.current
    const penTip = penRef.current
    const readout = readoutRef.current
    const status = statusRef.current
    if (!box || !canvas || !ctx || !upper || !fore || !elbowCap || !wrist || !penTip || !readout || !status) return

    let sketches: Stroke[] = []
    let pending: Stroke[] = []
    let queue: Stroke[] = []
    let ink: Stroke[] = []
    let job: { stroke: Stroke; index: number } | null = null
    let drawing: Stroke | null = null
    let pen: Point = { ...REST }
    let penDown = false
    let label = 'Draw on the sheet'
    let frame = 0
    let last = 0
    let flushTimer = 0
    let spiroIndex = 0
    let demoDone = false

    const setStatus = (text: string) => {
      label = text
      status.textContent = text
    }

    // ---------- Rendering ----------

    const draw = () => {
      const scale = canvas.width / W
      const root = getComputedStyle(document.documentElement)
      const rgb = (name: string) => root.getPropertyValue(name).trim().split(/\s+/).join(', ')
      const inkVar = rgb('--ink')
      const light = document.documentElement.dataset.theme === 'light'
      const inkColor = light ? '#0b7f91' : BIT.lens

      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.clearRect(0, 0, W, H)

      // The sheet, with a fine grid and crop marks.
      ctx.fillStyle = `rgb(${rgb('--surface')})`
      ctx.fillRect(SHEET.x, SHEET.y, SHEET.w, SHEET.h)
      ctx.lineWidth = 1 / scale
      ctx.strokeStyle = `rgba(${inkVar}, 0.06)`
      ctx.beginPath()
      for (let x = SHEET.x + 20; x < SHEET.x + SHEET.w; x += 20) {
        ctx.moveTo(x, SHEET.y)
        ctx.lineTo(x, SHEET.y + SHEET.h)
      }
      for (let y = SHEET.y + 20; y < SHEET.y + SHEET.h; y += 20) {
        ctx.moveTo(SHEET.x, y)
        ctx.lineTo(SHEET.x + SHEET.w, y)
      }
      ctx.stroke()
      ctx.strokeStyle = `rgba(${inkVar}, 0.3)`
      ctx.strokeRect(SHEET.x, SHEET.y, SHEET.w, SHEET.h)
      ctx.beginPath()
      for (const [cx, cy, sx, sy] of [
        [SHEET.x, SHEET.y, -1, -1],
        [SHEET.x + SHEET.w, SHEET.y, 1, -1],
        [SHEET.x, SHEET.y + SHEET.h, -1, 1],
        [SHEET.x + SHEET.w, SHEET.y + SHEET.h, 1, 1],
      ]) {
        ctx.moveTo(cx + sx * 4, cy)
        ctx.lineTo(cx + sx * 14, cy)
        ctx.moveTo(cx, cy + sy * 4)
        ctx.lineTo(cx, cy + sy * 14)
      }
      ctx.stroke()
      ctx.fillStyle = `rgba(${inkVar}, 0.45)`
      ctx.font = '500 9px "IBM Plex Mono", monospace'
      ctx.fillText('SHEET 01 · BIT PLOTTER', SHEET.x + 8, SHEET.y + SHEET.h - 8)

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // The visitor's sketch, in pencil.
      ctx.strokeStyle = `rgba(${inkVar}, 0.38)`
      ctx.lineWidth = 1.4
      for (const stroke of drawing ? [...sketches, drawing] : sketches) {
        ctx.beginPath()
        stroke.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
        ctx.stroke()
      }

      // Bit's ink.
      ctx.strokeStyle = inkColor
      ctx.lineWidth = 2.2
      ctx.shadowColor = light ? 'transparent' : 'rgba(124, 244, 255, 0.55)'
      ctx.shadowBlur = 6
      ink.forEach((line, i) => {
        ctx.beginPath()
        line.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
        if (penDown && i === ink.length - 1) ctx.lineTo(pen.x, pen.y)
        ctx.stroke()
      })
      ctx.shadowBlur = 0
    }

    const pose = () => {
      const { shoulder, elbow, forearm } = solveArm(SHOULDER, UPPER, FORE, pen, 'left-handed')
      upper.setAttribute('transform', `translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${shoulder * DEG})`)
      fore.setAttribute('transform', `translate(${elbow.x} ${elbow.y}) rotate(${forearm * DEG})`)
      elbowCap.setAttribute('transform', `translate(${elbow.x} ${elbow.y})`)
      wrist.setAttribute('transform', `translate(${pen.x} ${pen.y})`)
      penTip.setAttribute('r', penDown ? '4' : '2.5')
      penTip.setAttribute('opacity', penDown ? '1' : '0.45')

      // Joint angles as an engineer would read them: counter-clockwise from the x axis.
      const theta1 = -shoulder * DEG
      const theta2 = -Math.atan2(Math.sin(forearm - shoulder), Math.cos(forearm - shoulder)) * DEG
      const f = (n: number) => `${n < 0 ? '−' : ' '}${Math.abs(n).toFixed(1).padStart(5, '0')}°`
      readout.textContent = `θ1 ${f(theta1)}   θ2 ${f(theta2)}   Z ${penDown ? 'DOWN' : 'UP  '}`
    }

    // ---------- Motion ----------

    const moveTowards = (target: Point, speed: number, time: number) => {
      const d = distance(pen, target)
      const reach = speed * time
      if (reach >= d) {
        pen = { ...target }
        return time - d / speed
      }
      pen = { x: pen.x + ((target.x - pen.x) / d) * reach, y: pen.y + ((target.y - pen.y) / d) * reach }
      return 0
    }

    const advance = (dt: number) => {
      let time = dt
      while (time > 0) {
        if (!job) {
          const next = queue.shift()
          if (!next) {
            penDown = false
            time = moveTowards(REST, TRAVEL_SPEED, time)
            break
          }
          job = { stroke: next, index: 0 }
        }
        const target = job.stroke[job.index]
        time = moveTowards(target, job.index === 0 ? TRAVEL_SPEED : DRAW_SPEED, time)
        if (distance(pen, target) > 0.001) break
        if (job.index === 0) {
          penDown = true
          ink.push([{ ...target }])
        } else {
          ink[ink.length - 1].push({ ...target })
        }
        job.index += 1
        if (job.index >= job.stroke.length) {
          job = null
          penDown = false
        }
      }
    }

    const busy = () => Boolean(job) || queue.length > 0 || distance(pen, REST) > 0.5

    const tick = (now: number) => {
      frame = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      advance(dt)
      if (job || queue.length) {
        const remaining = queue.length + (job ? 1 : 0)
        setStatus(`Plotting · ${remaining} stroke${remaining === 1 ? '' : 's'} left`)
      } else if (label.startsWith('Plotting')) {
        setStatus('Done. Draw something else?')
      }
      pose()
      draw()
      if (busy() || drawing) schedule()
    }

    const schedule = () => {
      if (frame || document.hidden) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const plot = (strokes: Stroke[]) => {
      if (reducedMotion) {
        ink.push(...strokes.map((stroke) => stroke.map((p) => ({ ...p }))))
        setStatus('Done. Draw something else?')
        draw()
        return
      }
      queue.push(...strokes)
      schedule()
    }

    const reset = () => {
      window.clearTimeout(flushTimer)
      sketches = []
      pending = []
      queue = []
      ink = []
      job = null
      penDown = false
    }

    controls.current = {
      write: () => {
        reset()
        setStatus('Writing')
        plot(lettering('hello!'))
      },
      spiro: () => {
        reset()
        setStatus('Drawing a spirograph')
        plot(spirograph(spiroIndex++))
      },
      clear: () => {
        reset()
        setStatus('Draw on the sheet')
        schedule()
        draw()
      },
    }

    // ---------- Sketching ----------

    const toSheet = (event: { clientX: number; clientY: number }) => {
      const rect = canvas.getBoundingClientRect()
      return clampToSheet({
        x: ((event.clientX - rect.left) / rect.width) * W,
        y: ((event.clientY - rect.top) / rect.height) * H,
      })
    }

    pointerDown.current = (event) => {
      if (event.button !== 0) return
      demoDone = true
      window.clearTimeout(flushTimer)
      canvas.setPointerCapture(event.pointerId)
      drawing = [toSheet(event)]
      setStatus('Sketching…')
      schedule()
    }

    const onMove = (event: PointerEvent) => {
      if (!drawing) return
      const p = toSheet(event)
      if (distance(p, drawing[drawing.length - 1]) >= 2.5) drawing.push(p)
    }

    const onUp = () => {
      if (!drawing) return
      const stroke = drawing.length > 1 ? drawing : [drawing[0], { x: drawing[0].x + 1, y: drawing[0].y }]
      drawing = null
      sketches.push(stroke)
      pending.push(stroke)
      // Wait for a short pause, so a drawing made of several strokes is copied in one go.
      window.clearTimeout(flushTimer)
      flushTimer = window.setTimeout(() => {
        plot(pending)
        pending = []
      }, 550)
      setStatus('Bit is watching…')
      schedule()
    }

    // ---------- Lifecycle ----------

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      draw()
    }

    const resizeObserver = new ResizeObserver(resize)
    const themeObserver = new MutationObserver(draw)
    // Show what Bit can do the first time the sheet comes into view.
    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !demoDone) {
          demoDone = true
          controls.current?.write()
        }
      },
      { threshold: 0.6 },
    )
    const onVisibility = () => (busy() ? schedule() : undefined)

    resizeObserver.observe(canvas)
    viewObserver.observe(box)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    document.addEventListener('visibilitychange', onVisibility)
    pose()
    resize()

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(flushTimer)
      resizeObserver.disconnect()
      viewObserver.disconnect()
      themeObserver.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      document.removeEventListener('visibilitychange', onVisibility)
      controls.current = null
    }
  }, [reducedMotion])

  const button =
    'rounded-md border border-ink/15 px-3 py-1.5 text-[14px] text-ink2 transition-colors hover:border-ink/40 hover:text-ink'

  return (
    <Section id="lab" title="Lab">
      <p className="text-[17px] leading-[1.75] text-ink2">
        Bit, the arm at the top of the page, can also draw. Sketch something on the sheet and it copies it with its
        pen. Every position is two joint angles, solved with inverse kinematics while it moves.
      </p>

      <div ref={boxRef} className="mt-6 overflow-hidden rounded-md border border-ink/20 bg-bg/90">
        <div className="flex items-center justify-between gap-3 border-b border-ink/20 px-3 py-2 font-mono text-[11px] text-ink3">
          <span ref={statusRef} aria-live="polite">
            Draw on the sheet
          </span>
          <span className="hidden sm:inline">pen plotter · 2 DOF</span>
        </div>
        <div className="relative aspect-[640/420] w-full select-none">
          <canvas
            ref={canvasRef}
            onPointerDown={(event) => pointerDown.current(event)}
            aria-label="Drawing sheet. Draw on it with a mouse, pen or finger and Bit copies your drawing."
            className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          />
          <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="plot-orange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={BIT.orangeLight} />
                <stop offset="1" stopColor={BIT.orange} />
              </linearGradient>
              <radialGradient id="plot-steel" cx="0.35" cy="0.3" r="0.8">
                <stop offset="0" stopColor="#5a5a62" />
                <stop offset="1" stopColor="#1d1d20" />
              </radialGradient>
              <pattern id="plot-hazard" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="7" height="14" fill="#f5b400" />
                <rect x="7" width="7" height="14" fill="#1b1b1d" />
              </pattern>
              <filter id="plot-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#000" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Base, seen from above */}
            <rect x="250" y="388" width="140" height="40" rx="6" fill="url(#plot-hazard)" stroke={BIT.steel} strokeWidth="2" />
            <circle cx={SHOULDER.x} cy={SHOULDER.y} r="36" fill="url(#plot-steel)" stroke="#55555c" strokeWidth="2" />

            <g filter="url(#plot-shadow)">
              <g ref={upperRef}>
                <rect x="-18" y="-18" width={UPPER + 36} height="36" rx="18" fill="url(#plot-orange)" />
                <path d={`M14 0 L${UPPER - 14} 0`} stroke={BIT.steel} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
              </g>
              <g ref={foreRef}>
                <rect x="-13" y="-13" width={FORE + 26} height="26" rx="13" fill="url(#plot-orange)" />
                <path d={`M12 0 L${FORE - 12} 0`} stroke={BIT.steel} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
              </g>
              <circle cx={SHOULDER.x} cy={SHOULDER.y} r="22" fill="url(#plot-steel)" stroke="#55555c" strokeWidth="2" />
              <circle cx={SHOULDER.x} cy={SHOULDER.y} r="7" fill="#55555c" />
              <g ref={elbowRef}>
                <circle r="18" fill="url(#plot-steel)" stroke="#55555c" strokeWidth="2" />
                <circle r="6" fill="#55555c" />
              </g>
              <g ref={wristRef}>
                <circle r="14" fill="url(#plot-steel)" stroke="#55555c" strokeWidth="2" />
                <circle r="7.5" fill="#0e0e10" />
                <circle ref={penRef} r="2.5" fill={BIT.lens} />
              </g>
            </g>
          </svg>
        </div>
        <div className="border-t border-ink/20 px-3 py-2 font-mono text-[11px] text-ink3">
          <span ref={readoutRef} className="whitespace-pre tabular-nums" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={button} onClick={() => controls.current?.write()}>
          Write “hello!”
        </button>
        <button type="button" className={button} onClick={() => controls.current?.spiro()}>
          Draw a spirograph
        </button>
        <button type="button" className={button} onClick={() => controls.current?.clear()}>
          Clear the sheet
        </button>
      </div>
    </Section>
  )
}

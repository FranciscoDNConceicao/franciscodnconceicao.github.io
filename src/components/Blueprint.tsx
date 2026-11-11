import { useEffect, useRef } from 'react'
import { useMediaQuery, useReducedMotion } from '../hooks'

/** Size of the lit patch of grid around the cursor, in px. */
const LENS = 340
/** Minor grid pitch; the pick box snaps to these intersections. */
const STEP = 24

/**
 * The blueprint sheet behind the whole page. The grid stays fixed to the viewport but scrolls with
 * the page, and the cursor works like a CAD crosshair: the grid lights up around it, a pick box
 * snaps to the nearest intersection, and a click draws a compass ring.
 * Also lights up any `.spot` card under the cursor by setting `--spot-x` / `--spot-y` on it.
 */
export default function Blueprint() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reducedMotion = useReducedMotion()
  const lensRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const lineXRef = useRef<HTMLDivElement>(null)
  const lineYRef = useRef<HTMLDivElement>(null)
  const pickRef = useRef<HTMLDivElement>(null)
  const ringsRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  // Keep the fixed grid in step with the page as it scrolls, like paper under a lens.
  useEffect(() => {
    let frame = 0
    const paint = () => {
      frame = 0
      document.documentElement.style.setProperty('--sy', `${-window.scrollY}px`)
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }
    paint()
    window.addEventListener('scroll', request, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
    }
  }, [])

  useEffect(() => {
    if (!finePointer) return
    let frame = 0
    // Where the pointer is, and where the eased crosshair has got to.
    const target = { x: -1000, y: -1000 }
    const eased = { x: -1000, y: -1000 }
    let visible = false

    const place = () => {
      const { x, y } = eased
      const sy = window.scrollY
      if (lensRef.current) {
        lensRef.current.style.transform = `translate3d(${x - LENS / 2}px, ${y - LENS / 2}px, 0)`
        lensRef.current.style.backgroundPosition = `${-(x - LENS / 2)}px ${-(y - LENS / 2) - sy}px`
      }
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${x - 350}px, ${y - 350}px, 0)`
      if (lineXRef.current) lineXRef.current.style.transform = `translate3d(0, ${y}px, 0)`
      if (lineYRef.current) lineYRef.current.style.transform = `translate3d(${x}px, 0, 0)`
      if (pickRef.current) {
        // Snap to the grid as drawn on the page, so the box lands on real intersections.
        const sx = Math.round(target.x / STEP) * STEP
        const snapY = Math.round((target.y + sy) / STEP) * STEP - sy
        pickRef.current.style.transform = `translate3d(${sx}px, ${snapY}px, 0)`
      }
    }

    const tick = () => {
      frame = 0
      const ease = reducedMotion ? 1 : 0.22
      eased.x += (target.x - eased.x) * ease
      eased.y += (target.y - eased.y) * ease
      place()
      if (Math.abs(target.x - eased.x) > 0.3 || Math.abs(target.y - eased.y) > 0.3) request()
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const show = (on: boolean) => {
      if (visible === on) return
      visible = on
      cursorRef.current?.classList.toggle('opacity-0', !on)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      target.x = event.clientX
      target.y = event.clientY
      if (!visible) {
        eased.x = target.x
        eased.y = target.y
      }
      show(true)
      request()

      const el = (event.target as Element | null)?.closest<HTMLElement>('.spot')
      if (el) {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
        el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
      }
    }
    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) show(false)
    }
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || reducedMotion || !ringsRef.current) return
      const ring = document.createElement('span')
      ring.className = 'blueprint-ring'
      ring.style.left = `${event.clientX}px`
      ring.style.top = `${event.clientY}px`
      ring.addEventListener('animationend', () => ring.remove())
      ringsRef.current.appendChild(ring)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', request, { passive: true })
    document.addEventListener('pointerout', onLeave)
    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', request)
      document.removeEventListener('pointerout', onLeave)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [finePointer, reducedMotion])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="graph-paper absolute inset-0 [background-position:0_var(--sy,0px)]" />
      <div className="blueprint-vignette absolute inset-0" />

      {finePointer && (
        <div ref={cursorRef} className="opacity-0 transition-opacity duration-300">
          <div
            ref={glowRef}
            className="absolute left-0 top-0 h-[700px] w-[700px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent)/0.16),transparent)] will-change-transform"
          />
          <div
            ref={lensRef}
            className="graph-paper is-lit absolute left-0 top-0 will-change-transform"
            style={{ width: LENS, height: LENS }}
          />
          {/* CAD crosshair: a hairline across the whole sheet in each direction. */}
          <div ref={lineXRef} className="absolute inset-x-0 top-0 h-px bg-accent-ink/20 will-change-transform" />
          <div ref={lineYRef} className="absolute inset-y-0 left-0 w-px bg-accent-ink/20 will-change-transform" />
          <div
            ref={pickRef}
            className="absolute left-0 top-0 transition-transform duration-150 ease-out will-change-transform"
          >
            <span className="absolute -left-[5px] -top-[5px] h-[11px] w-[11px] border border-accent-ink/90" />
            <span className="absolute -left-[1.5px] -top-[1.5px] h-[4px] w-[4px] bg-accent-ink" />
          </div>
          <div ref={ringsRef} />
        </div>
      )}
    </div>
  )
}

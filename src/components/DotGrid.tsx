import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks'

const SPACING = 26
const REACH = 170
const BAND = 70

/**
 * A field of sensor dots that light up around the cursor, with a scan line sweeping down
 * every few seconds. It only redraws while something is moving.
 */
export default function DotGrid({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let ink = '240, 240, 238'
    let frame = 0
    let visible = true
    let last = performance.now()
    let bandY = -1
    let bandTimer = 0
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, power: 0, target: 0 }

    const readTheme = () => {
      ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim().split(/\s+/).join(', ')
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const offsetX = (width % SPACING) / 2
      const offsetY = (height % SPACING) / 2
      for (let y = offsetY; y < height; y += SPACING) {
        const band = bandY < 0 ? 0 : Math.max(0, 1 - Math.abs(y - bandY) / BAND) ** 2 * 0.7
        for (let x = offsetX; x < width; x += SPACING) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / REACH) ** 2 * pointer.power
          const k = near > band ? near : band
          ctx.fillStyle = `rgba(${ink}, ${0.09 + k * 0.6})`
          const r = 0.85 + k * 1.4
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const tick = (now: number) => {
      frame = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const ease = 1 - Math.pow(0.0005, dt)
      pointer.x += (pointer.tx - pointer.x) * ease
      pointer.y += (pointer.ty - pointer.y) * ease
      pointer.power += (pointer.target - pointer.power) * (1 - Math.pow(0.02, dt))
      if (bandY >= 0) {
        bandY += dt * 380
        if (bandY > height + BAND) bandY = -1
      }
      draw()
      const settled =
        Math.abs(pointer.tx - pointer.x) < 0.3 &&
        Math.abs(pointer.ty - pointer.y) < 0.3 &&
        Math.abs(pointer.target - pointer.power) < 0.005
      if (!settled || bandY >= 0) schedule()
    }

    const schedule = () => {
      if (reducedMotion || frame || !visible || document.hidden) return
      frame = requestAnimationFrame(tick)
    }

    const queueBand = () => {
      bandTimer = window.setTimeout(() => {
        if (visible && !document.hidden && !reducedMotion) {
          bandY = 0
          schedule()
        }
        queueBand()
      }, 7000 + Math.random() * 4000)
    }

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      if (pointer.power < 0.01) {
        pointer.x = x
        pointer.y = y
      }
      pointer.tx = x
      pointer.ty = y
      pointer.target = y >= 0 && y <= rect.height ? 1 : 0
      schedule()
    }
    const onLeave = () => {
      pointer.target = 0
      schedule()
    }

    readTheme()
    resize()
    draw()
    queueBand()

    const resizeObserver = new ResizeObserver(() => {
      resize()
      draw()
    })
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    const themeObserver = new MutationObserver(() => {
      readTheme()
      draw()
    })

    resizeObserver.observe(canvas)
    viewObserver.observe(canvas)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(bandTimer)
      resizeObserver.disconnect()
      viewObserver.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}

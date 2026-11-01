import { useEffect, useRef } from 'react'

const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F']
const ROWS = ['1', '2', '3', '4']
/** Width of the sidebar rail the frame sits next to. */
const RAIL = 88

const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, '0')

/**
 * The border of an engineering drawing sheet around the viewport: an outer and inner line with
 * zone letters and numbers between them. The bottom strip doubles as a CAD-style status bar
 * with the cursor position.
 * Desktop only; content scrolls underneath the opaque margins.
 */
export default function DrawingFrame() {
  const readout = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame = 0
    let x = 0
    let y = 0
    const paint = () => {
      frame = 0
      if (readout.current) readout.current.textContent = `X ${pad(x)}   Y ${pad(y + window.scrollY)}`
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x = event.clientX - RAIL
      y = event.clientY
      request()
    }
    paint()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', request, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', request)
    }
  }, [])

  const label = 'flex items-center justify-center font-mono text-[9px] text-ink3'

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 left-[5.5rem] right-0 z-40 hidden lg:block">
      <div className="absolute inset-x-0 top-0 h-[26px] bg-bg" />
      <div className="absolute inset-x-0 bottom-0 h-[26px] bg-bg" />
      <div className="absolute inset-y-0 left-0 w-[26px] bg-bg" />
      <div className="absolute inset-y-0 right-0 w-[26px] bg-bg" />
      <div className="absolute inset-[10px] border border-ink/20" />
      <div className="absolute inset-[26px] border border-ink/20" />

      <div className="absolute inset-x-[26px] top-[10px] flex h-4">
        {COLUMNS.map((column, i) => (
          <span key={column} className={`${label} flex-1 ${i > 0 ? 'border-l border-ink/20' : ''}`}>
            {column}
          </span>
        ))}
      </div>
      <div className="absolute inset-x-[26px] bottom-[10px] flex h-4 items-center justify-between px-3 font-mono text-[9px] tracking-[0.06em] text-ink3">
        <span>SCALE 1:1 · UNITS PX</span>
        <span ref={readout} className="whitespace-pre tabular-nums" />
      </div>
      {(['left-[10px]', 'right-[10px]'] as const).map((edge) => (
        <div key={edge} className={`absolute inset-y-[26px] ${edge} flex w-4 flex-col`}>
          {ROWS.map((row, i) => (
            <span key={row} className={`${label} flex-1 ${i > 0 ? 'border-t border-ink/20' : ''}`}>
              {row}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

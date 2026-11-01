import { useEffect, useState } from 'react'

/** Reading progress as a battery that charges while you scroll down the page. */
export default function ScrollBattery({ vertical = false, showLabel = false }: { vertical?: boolean; showLabel?: boolean }) {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPercent(max > 0 ? Math.round(Math.min(1, Math.max(0, window.scrollY / max)) * 100) : 0)
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [])

  const full = percent >= 100

  return (
    <span className={`flex items-center gap-1.5 ${vertical ? 'flex-col' : ''}`} title={`${percent}% of the page read`}>
      <span className={`flex items-center ${vertical ? 'flex-col-reverse' : ''}`} aria-hidden="true">
        <span
          className={`relative overflow-hidden rounded-[4px] border-[1.5px] ${full ? 'border-ink' : 'border-ink/45'} ${
            vertical ? 'h-7 w-[15px]' : 'h-[13px] w-6'
          }`}
        >
          <span
            className={`absolute rounded-[1.5px] bg-ink transition-[height,width] duration-200 ease-out ${
              vertical ? 'inset-x-[2px] bottom-[2px]' : 'inset-y-[2px] left-[2px]'
            }`}
            style={vertical ? { height: `calc(${percent}% - 4px * ${percent / 100})` } : { width: `calc(${percent}% - 4px * ${percent / 100})` }}
          />
        </span>
        <span className={`rounded-[1px] ${full ? 'bg-ink' : 'bg-ink/45'} ${vertical ? 'h-[3px] w-1.5' : 'h-1.5 w-[3px]'}`} />
      </span>
      {showLabel && (
        <span className="font-mono text-[10px] tabular-nums text-ink3" aria-hidden="true">
          {String(percent).padStart(2, '0')}%
        </span>
      )}
    </span>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { intro, profile } from '../data/content'
import { useReducedMotion } from '../hooks'
import ArmBlueprint from './ArmBlueprint'
import { ArrowDown } from './Icons'
import Robot from './Robot'

type ScanState = 'idle' | 'scanning' | 'found'

/** Where the face sits inside the 4:5 portrait crop, as percentages of the frame. */
const FACE_BOX = { left: '21%', top: '30%', width: '54%', height: '54%' }

/** A hand-drawn arrow; `flip` points it up and to the right instead of up and to the left. */
function Scribble({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="38"
      height="34"
      viewBox="0 0 38 34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${flip ? '-scale-x-100' : ''}`}
      aria-hidden="true"
    >
      <path d="M34 30c-6 0-14-3-19-9S8 10 7 5" />
      <path d="M3 11l4-6.5 5 5.5" />
    </svg>
  )
}

export default function Hero() {
  const reducedMotion = useReducedMotion()
  const portraitRef = useRef<HTMLDivElement>(null)
  const [scan, setScan] = useState<ScanState>('idle')
  const [scanId, setScanId] = useState(0)
  const scanRef = useRef<ScanState>('idle')
  const hovering = useRef(false)
  const timers = useRef<number[]>([])

  const update = useCallback((next: ScanState) => {
    scanRef.current = next
    setScan(next)
  }, [])

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }, [])

  /** Sweep a scan line over the portrait, then frame the face like Q.bo's recogniser did. */
  const startScan = useCallback(() => {
    if (scanRef.current === 'scanning') return
    clearTimers()
    setScanId((n) => n + 1)
    update('scanning')
    timers.current.push(
      window.setTimeout(
        () => {
          update('found')
          timers.current.push(
            window.setTimeout(() => {
              if (!hovering.current) update('idle')
            }, 4200),
          )
        },
        reducedMotion ? 50 : 1300,
      ),
    )
  }, [clearTimers, reducedMotion, update])

  useEffect(() => clearTimers, [clearTimers])

  const onPortraitEnter = () => {
    hovering.current = true
    if (scanRef.current === 'idle') startScan()
    else if (scanRef.current === 'found') clearTimers()
  }
  const onPortraitLeave = () => {
    hovering.current = false
    if (scanRef.current === 'found') timers.current.push(window.setTimeout(() => update('idle'), 1500))
  }

  return (
    <section id="top" className="relative isolate pb-10 pt-24 sm:pb-14 sm:pt-28 lg:pt-20">
      <div className="page grid items-center gap-16 lg:grid-cols-[1fr_auto]">
        <div className="max-w-[40rem]">
          <p className="text-[18px] text-ink2">Olá, I'm</p>
          <h1 className="mt-1 text-[clamp(2.7rem,6.2vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            Francisco Conceição
          </h1>
          <p className="mt-6 max-w-[34rem] text-[18px] leading-[1.65] text-ink2 sm:text-[19px]">{intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 text-[15px]">
            <a href={profile.cv} target="_blank" rel="noopener" className="btn-primary">
              Download my CV
              <ArrowDown size={15} />
            </a>
            <a href={`mailto:${profile.email}`} className="text-link">
              Email me
            </a>
            <a href={profile.github} target="_blank" rel="noopener" className="text-link">
              GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener" className="text-link">
              LinkedIn
            </a>
          </div>
        </div>

        <figure className="relative mb-14 w-[min(14rem,58vw)] lg:w-[15rem] xl:w-[17rem]">
          <ArmBlueprint className="pointer-events-none absolute -left-[104%] -top-[6%] -z-10 hidden w-[175%] text-ink/[0.22] lg:block" />
          <div
            ref={portraitRef}
            className="arch relative bg-ink/20 p-px shadow-[0_40px_90px_-35px_rgba(0,0,0,0.75)]"
            onMouseEnter={onPortraitEnter}
            onMouseLeave={onPortraitLeave}
            onClick={startScan}
          >
            <div className="arch-inner relative overflow-hidden">
              <img
                src={profile.photo}
                alt="Portrait of Francisco Conceição"
                width={720}
                height={720}
                className="block aspect-[4/5] w-full object-cover object-[50%_30%]"
              />
              {scan === 'scanning' && !reducedMotion && (
                <div key={scanId} aria-hidden="true" className="scan-sweep pointer-events-none absolute inset-0" />
              )}
              <div
                aria-hidden="true"
                className={`face-box pointer-events-none absolute ${scan === 'found' ? 'is-on' : ''}`}
                style={FACE_BOX}
              >
                <span className="absolute inset-0 rounded-lg border border-[#7cf4ff]/30" />
                <span className="corner left-0 top-0 rounded-tl-lg border-l-2 border-t-2" />
                <span className="corner right-0 top-0 rounded-tr-lg border-r-2 border-t-2" />
                <span className="corner bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2" />
                <span className="corner bottom-0 right-0 rounded-br-lg border-b-2 border-r-2" />
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-black/65 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.06em] text-white backdrop-blur-sm sm:text-[10.5px] sm:tracking-[0.08em]">
                  Francisco · 98.6%
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -right-[58%] bottom-[-3%] z-10 aspect-[13/15] w-[80%] lg:-left-[18%] lg:right-auto lg:w-[48%] xl:-left-[20%] xl:w-[54%] min-[1360px]:-left-[42%] min-[1360px]:w-[60%]">
            <Robot onScan={startScan} scanning={scan === 'scanning'} lookAt={portraitRef} />
          </div>

          <p
            aria-hidden="true"
            className="pointer-events-none absolute -right-[40%] top-full mt-5 flex -rotate-3 items-start gap-1 font-hand text-[21px] leading-none text-ink2 lg:hidden"
          >
            this is Bit, say hi!
            <Scribble flip />
          </p>
          <p
            aria-hidden="true"
            className="pointer-events-none absolute left-[6%] top-full mt-5 hidden rotate-[-4deg] items-start gap-1 font-hand text-[22px] leading-none text-ink2 lg:flex"
          >
            <Scribble />
            this is Bit, say hi!
          </p>
        </figure>
      </div>
    </section>
  )
}

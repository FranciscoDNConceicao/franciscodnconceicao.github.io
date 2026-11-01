import { useCallback, useEffect, useRef, useState } from 'react'
import { profile, spokenLanguages } from '../data/content'
import { delay, useClock, useReducedMotion } from '../hooks'
import DotGrid from './DotGrid'
import { ArrowDown, ArrowRight } from './Icons'
import Robot from './Robot'

const facts = [
  { label: 'Based in', value: profile.location },
  { label: 'Studied', value: 'Computer Engineering, UTAD' },
  { label: 'Speaks', value: spokenLanguages.map((l) => l.name).join(' & ') },
]

type ScanState = 'idle' | 'scanning' | 'found'

/** Where the face sits inside the 4:5 portrait crop, as percentages of the frame. */
const FACE_BOX = { left: '21%', top: '30%', width: '54%', height: '54%' }

export default function Hero() {
  const time = useClock('Europe/Lisbon')
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
    <section id="top" className="relative isolate overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pt-14">
      <div aria-hidden="true" className="spotlight absolute inset-0 -z-10" />
      <DotGrid className="absolute inset-0 -z-10 h-full w-full [mask-image:linear-gradient(to_bottom,black_45%,transparent)]" />

      <div className="page">
        <div className="fade-up flex flex-wrap items-center justify-between gap-3 kicker">
          <span className="flex items-center gap-2.5">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            {profile.role}
          </span>
          <span className="tabular-nums">
            Paredes, PT <span className="mx-1.5 text-ink3/50">—</span>
            <time>{time}</time>
          </span>
        </div>

        <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-12">
          <h1 className="relative z-10 text-[clamp(3.3rem,14.5vw,10.5rem)] font-semibold leading-[0.9] tracking-[-0.055em] lg:pt-8 lg:text-[clamp(3.3rem,13vw,10.5rem)]">
            <span className="line-mask">
              <span className="line-rise block">Francisco</span>
            </span>
            <span className="line-mask">
              <span className="line-rise block sm:pl-[0.9em]" style={delay(110)}>
                <span className="text-silver font-serif font-normal italic tracking-[-0.03em]">Conceição</span>
              </span>
            </span>
          </h1>

          <figure
            className="fade-up relative order-first w-[min(14rem,58vw)] lg:order-none lg:w-[15rem] xl:w-[18rem]"
            style={delay(200)}
          >
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
                  <span className="absolute inset-0 rounded-lg border border-white/25" />
                  <span className="corner left-0 top-0 rounded-tl-lg border-l-2 border-t-2" />
                  <span className="corner right-0 top-0 rounded-tr-lg border-r-2 border-t-2" />
                  <span className="corner bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2" />
                  <span className="corner bottom-0 right-0 rounded-br-lg border-b-2 border-r-2" />
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-black/65 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white backdrop-blur-sm sm:text-[10.5px]">
                    Francisco Conceição · 98.6%
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -right-[46%] bottom-[-3%] z-10 aspect-[4/5] w-[62%] lg:-left-[18%] lg:right-auto lg:w-[48%] xl:-left-[20%] xl:w-[54%] min-[1360px]:-left-[42%] min-[1360px]:w-[60%]">
              <Robot onScan={startScan} scanning={scan === 'scanning'} lookAt={portraitRef} />
            </div>
          </figure>
        </div>

        <div className="mt-14 grid gap-14 sm:mt-16 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="fade-up lg:col-span-7" style={delay(320)}>
            <p className="max-w-[40rem] text-[clamp(1.3rem,2.2vw,1.85rem)] leading-[1.4] tracking-[-0.02em] text-ink2">
              I'm a software engineer from Portugal with a strong passion for{' '}
              <span className="text-ink">technology, continuous learning and personal growth.</span> I like
              understanding how things work, and I'm always looking for the next thing to learn.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href={profile.cv} target="_blank" rel="noopener" className="btn-primary">
                Download CV
                <ArrowDown size={15} />
              </a>
              <a href="#contact" className="btn-ghost group">
                Get in touch
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          <dl className="fade-up lg:col-span-4 lg:col-start-9" style={delay(440)}>
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-6 border-t hairline py-4">
                <dt className="kicker">{fact.label}</dt>
                <dd className="text-right text-[15.5px] font-medium">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

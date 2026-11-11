import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { projects } from '../data/content'
import { useReducedMotion } from '../hooks'
import { ArrowUpRight, Pause, Play } from './Icons'
import Section from './Section'

interface ProjectProps {
  number: string
  title: string
  description: string
  stack: string[]
  link: string
  media: ReactNode
  /** Controls laid over the thumbnail. They sit above the card's link so they stay separate buttons. */
  overlay?: ReactNode
  /** Span the whole grid with a wider thumbnail. */
  featured?: boolean
}

/** Corner crop marks around a thumbnail, like the registration marks on a drawing. */
function CropMarks() {
  const mark =
    'absolute h-2.5 w-2.5 border-ink/40 transition-colors duration-200 group-hover:border-accent-ink group-focus-within:border-accent-ink'
  return (
    <span aria-hidden="true">
      <span className={`${mark} -left-1.5 -top-1.5 border-l border-t`} />
      <span className={`${mark} -right-1.5 -top-1.5 border-r border-t`} />
      <span className={`${mark} -bottom-1.5 -left-1.5 border-b border-l`} />
      <span className={`${mark} -bottom-1.5 -right-1.5 border-b border-r`} />
    </span>
  )
}

/** A project card. The title link stretches over the whole card, so anywhere on it opens the code. */
function Project({ number, title, description, stack, link, media, overlay, featured = false }: ProjectProps) {
  return (
    <article className={`group relative flex flex-col ${featured ? 'sm:col-span-2' : ''}`}>
      <div className="panel flex flex-1 flex-col transition-colors duration-200 group-hover:border-ink/35">
        <div
          className={`relative overflow-hidden rounded-t-[3px] border-b border-ink/10 bg-surface ${
            featured ? 'aspect-[16/10] sm:aspect-[2/1]' : 'aspect-[16/10]'
          }`}
        >
          <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:group-hover:scale-100">
            {media}
          </div>
          {overlay}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="eyebrow">Project {number}</p>
          <h3 className="mt-2 text-[20px] font-semibold leading-tight">
            <a href={link} target="_blank" rel="noopener" className="after:absolute after:inset-0 after:content-['']">
              {title}
            </a>
          </h3>
          <p className={`mt-2.5 flex-1 text-[15.5px] leading-relaxed text-ink2 ${featured ? 'max-w-[40rem]' : ''}`}>{description}</p>
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Built with">
            {stack.map((item) => (
              <li key={item} className="chip">
                {item}
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent-ink">
            Code on GitHub
            <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
      <CropMarks />
    </article>
  )
}

/** Plays muted while on screen and pauses when scrolled away, unless `playing` is off. */
function InViewVideo({ src, poster, label, playing }: { src: string; poster: string; label: string; playing: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (!playing) {
      video.pause()
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => undefined)
        else video.pause()
      },
      { threshold: 0.35 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [playing])

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover object-top"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}

export default function Projects() {
  const { stockFinance, qbo, gammingHour } = projects
  const reducedMotion = useReducedMotion()
  // Moving content needs a way to stop it; with reduced motion it starts paused instead.
  const [choice, setChoice] = useState<boolean | null>(null)
  const playing = choice ?? !reducedMotion

  return (
    <Section id="projects" title="Projects" wide>
      <div className="grid gap-6 sm:grid-cols-2">
        <Project
          {...stockFinance}
          number="01"
          featured
          media={
            <img
              src={stockFinance.image}
              alt="Stock Finance dashboard with market breadth, a stock heatmap, portfolio balances and market news"
              loading="lazy"
              width={1600}
              height={789}
              className="absolute inset-0 h-full w-full object-cover object-left-top"
            />
          }
        />
        <Project
          {...qbo}
          number="02"
          media={
            <>
              <img
                src={qbo.image}
                alt="Camera feed from the robot recognising Francisco and drawing a box around his face"
                loading="lazy"
                width={601}
                height={526}
                className="absolute left-[7%] top-[10%] h-[80%] w-auto rounded-sm shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)]"
              />
              <img
                src={qbo.robot}
                alt="The Q.bo One robot"
                loading="lazy"
                width={358}
                height={567}
                className="absolute bottom-0 right-[8%] h-[92%] w-auto"
              />
            </>
          }
        />
        <Project
          {...gammingHour}
          number="03"
          media={
            <InViewVideo
              src={gammingHour.video}
              poster={gammingHour.poster}
              label="Screen recording of The Gamming Hour store"
              playing={playing}
            />
          }
          overlay={
            <button
              type="button"
              onClick={() => setChoice(!playing)}
              className="absolute bottom-3 left-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/65 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/80"
              aria-label={playing ? 'Pause video' : 'Play video'}
              title={playing ? 'Pause video' : 'Play video'}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
          }
        />
      </div>
    </Section>
  )
}

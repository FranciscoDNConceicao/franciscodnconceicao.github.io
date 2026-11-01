import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { projects } from '../data/content'
import { useReducedMotion } from '../hooks'
import Section from './Section'

interface ProjectProps {
  title: string
  description: string
  stack: string[]
  link: string
  media: ReactNode
}

/** Corner crop marks around a thumbnail, like the registration marks on a drawing. */
function CropMarks() {
  const mark = 'absolute h-2.5 w-2.5 border-ink/40'
  return (
    <span aria-hidden="true">
      <span className={`${mark} -left-1.5 -top-1.5 border-l border-t`} />
      <span className={`${mark} -right-1.5 -top-1.5 border-r border-t`} />
      <span className={`${mark} -bottom-1.5 -left-1.5 border-b border-l`} />
      <span className={`${mark} -bottom-1.5 -right-1.5 border-b border-r`} />
    </span>
  )
}

/** One project per row: a fixed-size thumbnail on the left, the details on the right. */
function Project({ title, description, stack, link, media }: ProjectProps) {
  return (
    <article className="grid gap-5 py-9 first:pt-1 last:pb-1 sm:grid-cols-[15rem_1fr] sm:gap-8">
      <a href={link} target="_blank" rel="noopener" className="relative block self-start" aria-label={`${title} on GitHub`}>
        <span className="relative block aspect-[16/10] overflow-hidden rounded-[3px] border border-ink/15 bg-surface">
          {media}
        </span>
        <CropMarks />
      </a>
      <div>
        <h3 className="text-[18px] font-semibold">{title}</h3>
        <p className="mt-2 text-[15.5px] leading-relaxed text-ink2">{description}</p>
        <p className="mt-3 font-mono text-[12.5px] text-ink3">{stack.join(' · ')}</p>
        <a href={link} target="_blank" rel="noopener" className="text-link mt-4 inline-block text-[14px]">
          Code on GitHub
        </a>
      </div>
    </article>
  )
}

/** Plays muted while on screen and pauses when scrolled away. */
function InViewVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const video = ref.current
    if (!video || reducedMotion) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => undefined)
        else video.pause()
      },
      { threshold: 0.35 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reducedMotion])

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

  return (
    <Section id="projects" title="Projects">
      <div className="divide-y divide-ink/10">
        <Project
          {...stockFinance}
          media={
            <img
              src={stockFinance.image}
              alt="Stock Finance dashboard with a price chart, account balances and market news"
              loading="lazy"
              width={1600}
              height={770}
              className="absolute inset-0 h-full w-full object-cover object-left-top"
            />
          }
        />
        <Project
          {...qbo}
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
          media={
            <InViewVideo
              src={gammingHour.video}
              poster={gammingHour.poster}
              label="Screen recording of The Gamming Hour store"
            />
          }
        />
      </div>
    </Section>
  )
}

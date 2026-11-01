import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { profile, projects } from '../data/content'
import type { Project } from '../data/content'
import { delay, useReducedMotion } from '../hooks'
import { ArrowUpRight, GitHub } from './Icons'
import SectionHeader, { Serif } from './SectionHeader'

function ProjectText({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 kicker">
        <span className="text-accent-ink">{project.index}</span>
        <span>{project.kind}</span>
      </div>
      <h3
        className={`mt-4 font-semibold tracking-[-0.04em] ${large ? 'text-[clamp(2rem,3.4vw,2.9rem)]' : 'text-[clamp(1.7rem,2.6vw,2.2rem)]'}`}
      >
        {project.title}
      </h3>
      <p className="mt-4 max-w-[36rem] text-[15.5px] leading-relaxed text-ink2">{project.description}</p>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
        {project.stack.map((tech) => (
          <li key={tech} className="chip">
            {tech}
          </li>
        ))}
      </ul>
      <a
        href={project.link}
        target="_blank"
        rel="noopener"
        className="group mt-8 inline-flex w-fit items-center gap-2 text-[14px] font-medium lg:mt-auto lg:pt-8"
      >
        <GitHub size={15} />
        <span className="link-underline">View source</span>
        <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </div>
  )
}

function Frame({ children, bar }: { children: ReactNode; bar?: string }) {
  return (
    <div className="overflow-hidden rounded-[14px] border hairline bg-bg shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)]">
      {bar && (
        <div className="flex h-8 items-center gap-1.5 border-b hairline px-3">
          <span className="h-2 w-2 rounded-full bg-ink/15" />
          <span className="h-2 w-2 rounded-full bg-ink/15" />
          <span className="h-2 w-2 rounded-full bg-ink/15" />
          <span className="mx-auto rounded-md bg-ink/[0.06] px-3 py-0.5 font-mono text-[10px] text-ink3">{bar}</span>
          <span className="w-8" />
        </div>
      )}
      {children}
    </div>
  )
}

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
      className="block aspect-[16/10] w-full object-cover object-top"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      controls={reducedMotion}
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}

const card = 'group/card rounded-[24px] border hairline bg-surface/60 p-5 transition-colors duration-500 hover:border-ink/20 sm:p-7'

export default function Projects() {
  const { stockFinance, qbo, gammingHour } = projects

  return (
    <section id="projects" className="py-20 sm:py-28">
      <div className="page">
        <SectionHeader
          index="03"
          label="Projects"
          aside="Selected work"
          title={
            <>
              Things I've built <Serif>along the way</Serif>.
            </>
          }
        />

        <div className="grid gap-5 sm:gap-6">
          <article data-reveal className={`${card} grid gap-8 lg:grid-cols-12 lg:gap-10`}>
            <div className="lg:col-span-7">
              <Frame bar="stock-finance">
                <div className="overflow-hidden">
                  <img
                    src={stockFinance.image}
                    alt="Stock Finance dashboard with a price chart, account balances and market news"
                    loading="lazy"
                    width={1600}
                    height={770}
                    className="block w-full transition duration-[1.2s] ease-out group-hover/card:scale-[1.025]"
                  />
                </div>
              </Frame>
            </div>
            <div className="lg:col-span-5 lg:py-2">
              <ProjectText project={stockFinance} large />
            </div>
          </article>

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
            <article data-reveal className={`${card} flex flex-col gap-8`}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] border hairline bg-[radial-gradient(120%_120%_at_80%_100%,rgb(var(--ink)/0.08),transparent_60%)]">
                <img
                  src={qbo.image}
                  alt="Camera feed from the robot recognising Francisco and drawing a box around his face"
                  loading="lazy"
                  width={601}
                  height={526}
                  className="absolute left-[6%] top-[10%] h-[80%] w-auto rounded-lg shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
                />
                <img
                  src={qbo.robot}
                  alt="The Q.bo One robot"
                  loading="lazy"
                  width={358}
                  height={567}
                  className="absolute bottom-0 right-[6%] h-[90%] w-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)] transition duration-[1.2s] ease-out group-hover/card:-translate-y-1 group-hover/card:rotate-[-2deg]"
                />
              </div>
              <ProjectText project={qbo} />
            </article>

            <article data-reveal style={delay(100)} className={`${card} flex flex-col gap-8`}>
              <Frame>
                <InViewVideo
                  src={gammingHour.video}
                  poster={gammingHour.poster}
                  label="Screen recording of The Gamming Hour store"
                />
              </Frame>
              <ProjectText project={gammingHour} />
            </article>
          </div>

          <article
            data-reveal
            className="flex flex-col items-start justify-between gap-6 rounded-[24px] border border-dashed hairline p-6 sm:flex-row sm:items-center sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span className="kicker mt-1 text-accent-ink">04</span>
              <div>
                <h3 className="text-[19px] font-semibold tracking-[-0.02em]">This website</h3>
                <p className="mt-1 max-w-[40rem] text-[15px] leading-relaxed text-ink2">
                  Designed and built from scratch with React, TypeScript, Vite and Tailwind. Press{' '}
                  <kbd className="whitespace-nowrap rounded border hairline px-1 font-mono text-[12px]">⌘K</kbd> or{' '}
                  <kbd className="whitespace-nowrap rounded border hairline px-1 font-mono text-[12px]">Ctrl K</kbd> to
                  get around.
                </p>
              </div>
            </div>
            <a href={profile.repo} target="_blank" rel="noopener" className="btn-ghost shrink-0">
              <GitHub size={15} />
              Source
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}

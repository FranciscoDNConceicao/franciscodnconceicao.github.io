import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { sections } from '../data/content'
import { useReducedMotion } from '../hooks'

interface Props {
  id: string
  title: string
  /** Let the content use the full page width instead of a reading-width column. */
  wide?: boolean
  children: ReactNode
}

/**
 * A page section laid out like my CV: the heading on the left, the content on the right.
 * The heading carries the same number as the section in the sidebar.
 */
export default function Section({ id, title, wide = false, children }: Props) {
  const number = String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0')
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const [shown, setShown] = useState(true)

  // Sections below the fold fade up a little as they come into view. Anything already on screen
  // (or everything, with reduced motion) is left alone, so content is never hidden by default.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reducedMotion || el.getBoundingClientRect().top < window.innerHeight) return
    setShown(false)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <section ref={ref} id={id} className="py-14 sm:py-20">
      <div className="page">
        <div
          className={`grid gap-6 border-t hairline pt-8 transition-[opacity,transform] duration-[400ms] ease-out lg:grid-cols-[12rem_1fr] lg:gap-12 ${
            shown ? '' : 'translate-y-3 opacity-0'
          }`}
        >
          <h2 className="group/title flex cursor-default items-baseline gap-3 text-[1.35rem] font-semibold lg:sticky lg:top-10 lg:flex-col lg:gap-1.5 lg:self-start lg:text-[1.2rem]">
            <span aria-hidden="true" className="flex items-center gap-2 font-mono text-[13px] font-medium text-accent-ink">
              {number}
              <span className="h-px w-0 bg-accent-ink transition-[width] duration-300 ease-out group-hover/title:w-8" />
            </span>
            <span className="transition-transform duration-300 ease-out group-hover/title:translate-x-1">{title}</span>
          </h2>
          <div className={`min-w-0 ${wide ? '' : 'max-w-[44rem]'}`}>{children}</div>
        </div>
      </div>
    </section>
  )
}

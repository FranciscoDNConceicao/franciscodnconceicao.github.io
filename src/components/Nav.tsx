import { useEffect, useState } from 'react'
import { profile, sections } from '../data/content'
import { useActiveSection } from '../hooks'
import { ArrowUp, Briefcase, Code, Download, Layers, Mail, Menu, User } from './Icons'
import ScrollBattery from './ScrollBattery'

// The hero ('top') is observed too, so no link stays highlighted when scrolling back up.
const sectionIds = ['top', ...sections.map((s) => s.id)]

function Mark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-ink text-bg transition-[transform,background-color,box-shadow] duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-accent-ink group-hover:shadow-[0_0_24px_-4px_rgb(var(--accent)/0.8)]">
      <svg width="17" height="17" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M10 56V8h26v9H20v11h15v9H20v19z" fill="currentColor" />
        <circle cx="47" cy="47" r="9" fill="currentColor" opacity="0.45" />
      </svg>
    </span>
  )
}

/** A rail control: an icon with a short label under it, so nothing in the rail is icon-only. */
const railButton =
  'flex w-full flex-col items-center gap-1 rounded-md py-1.5 text-[10.5px] font-medium text-ink3 transition-colors duration-200 hover:bg-accent/10 hover:text-accent-ink [&>svg]:transition-transform [&>svg]:duration-200 hover:[&>svg]:-translate-y-0.5'

const index = (i: number) => String(i + 1).padStart(2, '0')

const sectionIcons = { about: User, projects: Layers, experience: Briefcase, skills: Code, contact: Mail }

/** Desktop: a fixed rail on the left. Mobile: a top bar with a drop-down menu. */
export default function Nav() {
  const active = useActiveSection(sectionIds)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[5.5rem] flex-col items-center border-r hairline bg-bg/80 py-6 backdrop-blur-xl lg:flex [@media(max-height:760px)]:py-4">
        <a href="#top" className="group shrink-0" aria-label="Francisco Conceição, back to top">
          <Mark />
        </a>
        <span aria-hidden="true" className="mt-5 h-px w-8 shrink-0 bg-ink/15 [@media(max-height:760px)]:mt-3" />

        {/* Primary: the page sections, each a tile with an icon and the zone number in its corner. */}
        <nav aria-label="Sections" className="flex min-h-0 w-full flex-1 flex-col justify-center overflow-y-auto px-2 py-4">
          <ul className="flex flex-col gap-1">
            {sections.map((s, i) => {
              const current = active === s.id
              const SectionIcon = sectionIcons[s.id]
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={current ? 'true' : undefined}
                    className={`group/link relative flex flex-col items-center gap-1.5 rounded-lg border py-2.5 transition-[background-color,border-color,color] duration-200 [@media(max-height:820px)]:gap-1 [@media(max-height:820px)]:py-2 ${
                      current
                        ? 'border-accent-ink/30 bg-accent/[0.14] text-ink'
                        : 'border-transparent text-ink3 hover:border-ink/10 hover:bg-ink/[0.04] hover:text-ink'
                    }`}
                  >
                    {/* Active marker: a short glowing bar on the rail's outer edge. */}
                    <span
                      aria-hidden="true"
                      className={`absolute -left-2 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_10px_rgb(var(--accent)/0.9)] transition-[transform,opacity] duration-300 ease-out ${
                        current ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                      }`}
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute right-1.5 top-1 font-mono text-[8.5px] leading-none transition-colors duration-200 ${
                        current ? 'text-accent-ink' : 'text-ink3/70 group-hover/link:text-accent-ink'
                      }`}
                    >
                      {index(i)}
                    </span>
                    <SectionIcon
                      size={18}
                      className={`transition-[color,transform] duration-200 ease-out group-hover/link:-translate-y-0.5 ${
                        current ? 'text-accent-ink' : ''
                      }`}
                    />
                    <span className={`text-[11px] leading-none ${current ? 'font-medium' : ''}`}>{s.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Secondary: reading progress and the page controls, grouped in one panel. */}
        <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-xl border hairline bg-surface/60 p-1.5">
          <div className="py-2 [@media(max-height:760px)]:py-1">
            <ScrollBattery vertical showLabel />
          </div>
          <span aria-hidden="true" className="h-px w-8 bg-ink/10" />
          <a href={profile.cv} target="_blank" rel="noopener" className={railButton} aria-label="Download CV">
            <Download size={15} />
            <span aria-hidden="true">CV</span>
          </a>
          <a href="#top" className={`${railButton} [@media(max-height:700px)]:hidden`}>
            <ArrowUp size={15} />
            Top
          </a>
        </div>
      </aside>

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500 lg:hidden ${
          scrolled || menuOpen ? 'border-ink/10 bg-bg/95 backdrop-blur-xl' : 'border-transparent'
        }`}
      >
        <div className="page flex h-16 items-center justify-between gap-4">
          <a href="#top" className="group flex items-center gap-2.5" aria-label="Francisco Conceição, back to top">
            <Mark />
            <span className="hidden text-[15px] font-medium sm:block">{profile.name}</span>
          </a>
          <div className="flex items-center gap-2">
            <span className="mr-1">
              <ScrollBattery />
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-9 items-center gap-2 rounded-lg bg-ink px-3.5 text-[14px] font-medium text-bg transition-colors duration-200 hover:bg-accent-ink"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={15} />
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-menu" aria-label="Sections" className="page pb-4">
            <ul className="border-t hairline">
              {sections.map((s) => {
                const current = active === s.id
                const SectionIcon = sectionIcons[s.id]
                return (
                  <li key={s.id} className="border-b hairline">
                    <a
                      href={`#${s.id}`}
                      onClick={() => setMenuOpen(false)}
                      aria-current={current ? 'true' : undefined}
                      className={`flex items-center justify-between py-3.5 text-[17px] transition-[color,padding] duration-200 hover:pl-1.5 hover:text-accent-ink ${current ? 'font-medium text-ink' : 'text-ink2'}`}
                    >
                      <span className="flex items-center gap-3">
                        <SectionIcon size={17} className={current ? 'text-accent-ink' : 'text-ink3'} />
                        {s.label}
                      </span>
                      {current && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </a>
                  </li>
                )
              })}
              <li>
                <a
                  href={profile.cv}
                  target="_blank"
                  rel="noopener"
                  onClick={() => setMenuOpen(false)}
                  className="block py-3.5 text-[17px] text-ink2 transition-[color,padding] duration-200 hover:pl-1.5 hover:text-accent-ink"
                >
                  Download CV (PDF)
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  )
}

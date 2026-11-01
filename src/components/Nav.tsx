import { useEffect, useState } from 'react'
import { profile, sections } from '../data/content'
import { useActiveSection } from '../hooks'
import type { Theme } from '../hooks'
import { ArrowUp, Download, Menu, Moon, Sun } from './Icons'
import ScrollBattery from './ScrollBattery'

interface Props {
  theme: Theme
  onToggleTheme: () => void
}

// The hero ('top') is observed too, so no link stays highlighted when scrolling back up.
const sectionIds = ['top', ...sections.map((s) => s.id)]

function Mark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-ink text-bg">
      <svg width="17" height="17" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M10 56V8h26v9H20v11h15v9H20v19z" fill="currentColor" />
        <circle cx="47" cy="47" r="9" fill="currentColor" opacity="0.45" />
      </svg>
    </span>
  )
}

const railButton =
  'grid h-9 w-9 place-items-center rounded-full text-ink3 transition-colors duration-300 hover:bg-ink/[0.07] hover:text-ink'

/** Desktop: a fixed rail on the left. Mobile: a top bar with a drop-down menu. */
export default function Nav({ theme, onToggleTheme }: Props) {
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

  const themeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[5.5rem] flex-col items-center border-r hairline bg-bg/80 backdrop-blur-xl lg:flex">
        <a href="#top" className="mt-7 shrink-0" aria-label="Francisco Conceição, back to top">
          <Mark />
        </a>

        <nav aria-label="Sections" className="flex min-h-0 w-full flex-1 flex-col justify-center overflow-y-auto py-6">
          <ul className="w-full border-b hairline">
            {sections.map((s) => {
              const current = active === s.id
              return (
                <li key={s.id} className="border-t hairline">
                  <a
                    href={`#${s.id}`}
                    aria-current={current ? 'true' : undefined}
                    className={`relative flex justify-center py-6 transition-colors duration-300 [@media(max-height:760px)]:py-4 ${
                      current ? 'text-ink' : 'text-ink3 hover:text-ink2'
                    }`}
                  >
                    <span
                      className={`absolute inset-y-3 right-0 w-px transition-colors duration-300 ${
                        current ? 'bg-ink' : 'bg-transparent'
                      }`}
                    />
                    <span className="vertical-label text-[13px]">{s.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mb-6 flex shrink-0 flex-col items-center gap-1.5">
          <div className="mb-4 [@media(max-height:760px)]:mb-2">
            <ScrollBattery vertical showLabel />
          </div>
          <button type="button" onClick={onToggleTheme} className={railButton} aria-label={themeLabel} title={themeLabel}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <a href={profile.cv} target="_blank" rel="noopener" className={railButton} aria-label="Download CV" title="Download CV">
            <Download size={15} />
          </a>
          <a
            href="#top"
            className="mt-3 flex flex-col items-center gap-1.5 text-[11px] text-ink3 transition-colors hover:text-ink [@media(max-height:760px)]:hidden"
          >
            <ArrowUp size={13} />
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
          <a href="#top" className="flex items-center gap-2.5" aria-label="Francisco Conceição, back to top">
            <Mark />
            <span className="hidden text-[15px] font-medium sm:block">{profile.name}</span>
          </a>
          <div className="flex items-center gap-2">
            <span className="mr-1">
              <ScrollBattery />
            </span>
            <button
              type="button"
              onClick={onToggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full border hairline text-ink2 transition hover:text-ink"
              aria-label={themeLabel}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-9 items-center gap-2 rounded-lg bg-ink px-3.5 text-[14px] font-medium text-bg"
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
              {sections.map((s) => (
                <li key={s.id} className="border-b hairline">
                  <a href={`#${s.id}`} onClick={() => setMenuOpen(false)} className="block py-3.5 text-[17px]">
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={profile.cv}
                  target="_blank"
                  rel="noopener"
                  onClick={() => setMenuOpen(false)}
                  className="block py-3.5 text-[17px] text-ink2"
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

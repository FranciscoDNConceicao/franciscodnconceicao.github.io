import { useCallback, useEffect, useState } from 'react'
import About from './components/About'
import CommandPalette from './components/CommandPalette'
import Contact from './components/Contact'
import Journey from './components/Journey'
import Footer from './components/Footer'
import Hero from './components/Hero'
import { Check } from './components/Icons'
import Nav from './components/Nav'
import Projects from './components/Projects'
import Skills from './components/Skills'
import { profile } from './data/content'
import { useCopy, useReveal, useTheme } from './hooks'

export default function App() {
  const { theme, toggle } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { copied, copy } = useCopy(profile.email)

  useReveal()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closePalette = useCallback(() => setPaletteOpen(false), [])
  const openPalette = useCallback(() => setPaletteOpen(true), [])

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-[80] -translate-y-20 rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="grain" aria-hidden="true" />
      <Nav theme={theme} onToggleTheme={toggle} onOpenPalette={openPalette} />
      <div className="lg:pl-[5.5rem]">
        <main id="main">
          <Hero />
          <About />
          <Journey />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </div>
      <CommandPalette
        open={paletteOpen}
        onClose={closePalette}
        theme={theme}
        onToggleTheme={toggle}
        onCopyEmail={copy}
      />
      <div
        role="status"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[75] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13.5px] font-medium text-bg shadow-2xl transition duration-500 ease-out ${
          copied ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <Check size={15} />
        Email copied to clipboard
      </div>
    </>
  )
}

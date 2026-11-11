import About from './components/About'
import Blueprint from './components/Blueprint'
import Contact from './components/Contact'
import DrawingFrame from './components/DrawingFrame'
import Experience from './components/Experience'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Nav from './components/Nav'
import Projects from './components/Projects'
import Skills from './components/Skills'

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-[80] -translate-y-20 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-bg focus:translate-y-0"
      >
        Skip to content
      </a>
      <Blueprint />
      <Nav />
      <DrawingFrame />
      <div className="lg:pl-[5.5rem]">
        <main id="main">
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}

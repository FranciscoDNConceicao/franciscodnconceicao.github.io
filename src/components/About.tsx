import { drivers, story } from '../data/content'
import { delay } from '../hooks'
import SectionHeader, { Serif } from './SectionHeader'

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="page">
        <SectionHeader
          index="01"
          label="About"
          aside="In my own words"
          title={
            <>
              Hi, I'm Francisco. <Serif>Curious</Serif> by default.
            </>
          }
        />

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p
              data-reveal
              className="text-[clamp(1.55rem,3vw,2.5rem)] font-medium leading-[1.2] tracking-[-0.03em]"
            >
              {story.lead}
            </p>
            <div data-reveal style={delay(100)} className="mt-10 space-y-6 text-[17px] leading-[1.75] text-ink2">
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <p data-reveal className="kicker">
              What drives me
            </p>
            <ol className="mt-5 border-b hairline">
              {drivers.map((driver, i) => (
                <li
                  key={driver.title}
                  data-reveal
                  style={delay(80 + i * 80)}
                  className="grid grid-cols-[2.5rem_1fr] border-t hairline py-6"
                >
                  <span className="pt-1.5 font-mono text-[11px] text-accent-ink">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-[21px] font-semibold tracking-[-0.025em]">{driver.title}</p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink2">{driver.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

import { journey } from '../data/content'
import { delay } from '../hooks'
import SectionHeader, { Serif } from './SectionHeader'

export default function Journey() {
  return (
    <section id="journey" className="py-20 sm:py-28">
      <div className="page">
        <SectionHeader
          index="02"
          label="Journey"
          aside="2017 — today"
          title={
            <>
              The path <Serif>so far</Serif>.
            </>
          }
        />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <p data-reveal className="max-w-[22rem] text-[17px] leading-relaxed text-ink2 lg:col-span-4">
            From secondary school in Paredes to a degree at UTAD and a job building software in Porto, one step at
            a time.
          </p>

          <ol className="lg:col-span-8">
            {journey.map((milestone, i) => (
              <li key={milestone.title} data-reveal style={delay(i * 90)} className="relative pl-10 sm:pl-12">
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-[7px] top-2 w-px ${
                    milestone.current
                      ? 'bg-gradient-to-b from-ink/70 to-ink/15'
                      : 'bg-ink/15'
                  } ${i === journey.length - 1 ? 'hidden' : ''}`}
                />
                <span aria-hidden="true" className="absolute left-0 top-1 flex">
                  <span
                    className={`h-[15px] w-[15px] rounded-full ${
                      milestone.current ? 'pulse-dot bg-ink' : 'border-2 border-ink/25 bg-bg'
                    }`}
                  />
                </span>

                <div className={i === journey.length - 1 ? '' : 'pb-14'}>
                  <p
                    className={`font-mono text-[12px] uppercase tracking-[0.12em] ${
                      milestone.current ? 'text-accent-ink' : 'text-ink3'
                    }`}
                  >
                    {milestone.period}
                  </p>
                  <h3 className="mt-3 text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 text-[15.5px] text-ink2">{milestone.place}</p>
                  {milestone.text && (
                    <p className="mt-4 max-w-[38rem] text-[16px] leading-relaxed text-ink2">{milestone.text}</p>
                  )}
                  {milestone.tags && (
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
                      {milestone.tags.map((tag) => (
                        <li key={tag} className="chip">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

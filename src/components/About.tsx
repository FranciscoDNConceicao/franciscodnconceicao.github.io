import { about, facts } from '../data/content'
import Section from './Section'

export default function About() {
  return (
    <Section id="about" title="About me">
      <div className="space-y-5 text-[16px] leading-[1.75] text-ink2">
        {about.map((paragraph, i) => (
          <p
            key={paragraph.slice(0, 24)}
            className={`transition-colors duration-300 hover:text-ink ${i === 0 ? 'text-ink' : ''}`}
          >
            {paragraph}
          </p>
        ))}
      </div>
      {/* Laid out like a spec table: hairline cells, drawn by the 1px gaps over a tinted background. */}
      <dl className="spot mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-ink/15 bg-ink/10 transition-[border-color,box-shadow] duration-300 hover:border-accent-ink/40 hover:shadow-[0_20px_50px_-30px_rgb(var(--accent)/0.6)] sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="spec-cell bg-surface/90 px-4 py-3.5">
            <dt className="eyebrow">{fact.label}</dt>
            <dd className="mt-1.5 text-[15px] leading-snug">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

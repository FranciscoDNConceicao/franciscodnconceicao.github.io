import { about, facts } from '../data/content'
import Section from './Section'

export default function About() {
  return (
    <Section id="about" title="About me">
      <div className="space-y-5 text-[17px] leading-[1.75] text-ink2">
        {about.map((paragraph, i) => (
          <p key={paragraph.slice(0, 24)} className={i === 0 ? 'text-ink' : undefined}>
            {paragraph}
          </p>
        ))}
      </div>
      <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t hairline pt-8 sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-[13px] text-ink3">{fact.label}</dt>
            <dd className="mt-1 text-[15px] leading-snug">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

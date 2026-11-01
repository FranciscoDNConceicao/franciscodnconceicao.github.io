import { experience } from '../data/content'
import Section from './Section'

export default function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ol className="space-y-10">
        {experience.map((role) => (
          <li key={role.title} className="grid gap-1.5 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <p className="font-mono text-[13px] text-ink3 sm:pt-[3px]">{role.period}</p>
            <div>
              <h3 className="text-[17px] font-semibold">{role.title}</h3>
              <p className="text-[15px] text-ink2">{role.place}</p>
              {role.text && <p className="mt-3 text-[16px] leading-relaxed text-ink2">{role.text}</p>}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

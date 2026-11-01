import { skills } from '../data/content'
import Section from './Section'

export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      <dl className="divide-y divide-ink/10 border-y border-ink/10">
        {skills.map((group) => (
          <div key={group.label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <dt className="text-[15px] text-ink3">{group.label}</dt>
            <dd className="text-[16px]">{group.items.join(', ')}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

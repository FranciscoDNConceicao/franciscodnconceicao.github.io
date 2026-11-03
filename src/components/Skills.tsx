import { skills } from '../data/content'
import Section from './Section'

export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {skills.map((group) => (
          <div key={group.label}>
            <h3 className="eyebrow border-b hairline pb-2.5">{group.label}</h3>
            <ul className="mt-3.5 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li key={item} className="chip text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

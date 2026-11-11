import { skills } from '../data/content'
import Section from './Section'

export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {skills.map((group) => (
          <div key={group.label} className="group">
            <h3 className="eyebrow relative border-b hairline pb-2.5 transition-colors duration-200 group-hover:text-accent-ink">
              {group.label}
              <span
                aria-hidden="true"
                className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-accent-ink transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
            </h3>
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

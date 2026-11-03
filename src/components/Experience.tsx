import { experience } from '../data/content'
import Section from './Section'

/** A timeline down a single drawn line; the role I'm in now gets the orange marker. */
export default function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ol className="relative ml-[5px] border-l border-ink/15">
        {experience.map((role) => {
          const current = role.period.endsWith('now')
          return (
            <li key={role.title} className="relative pb-11 pl-8 last:pb-0">
              <span
                aria-hidden="true"
                className={`absolute -left-[6px] top-[5px] h-[11px] w-[11px] rounded-full border-2 ${
                  current ? 'border-accent bg-accent shadow-[0_0_0_4px_rgb(var(--accent)/0.18)]' : 'border-ink/35 bg-bg'
                }`}
              />
              <p className="flex flex-wrap items-center gap-2.5 font-mono text-[12.5px] text-ink3">
                {role.period}
                {current && (
                  <span className="rounded-[3px] border border-accent-ink/40 px-1.5 py-px text-[10.5px] uppercase tracking-[0.1em] text-accent-ink">
                    Current
                  </span>
                )}
              </p>
              <h3 className="mt-2 text-[18px] font-semibold">{role.title}</h3>
              <p className="text-[15px] text-ink2">{role.place}</p>
              {role.text && <p className="mt-3 text-[16px] leading-relaxed text-ink2">{role.text}</p>}
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

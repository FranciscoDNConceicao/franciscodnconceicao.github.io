import { experience } from '../data/content'
import Section from './Section'

/** A timeline down a single drawn line; the role I'm in now gets the blue marker. */
export default function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ol className="relative ml-[5px] border-l border-ink/15">
        {experience.map((role) => {
          const current = role.period.endsWith('now')
          return (
            <li key={role.title} className="group relative pb-11 pl-8 last:pb-0">
              {/* The line lights up beside the role under the cursor. */}
              <span
                aria-hidden="true"
                className="absolute -left-px top-0 h-full w-px origin-top scale-y-0 bg-accent-ink/70 transition-transform duration-500 ease-out group-hover:scale-y-100"
              />
              <span
                aria-hidden="true"
                className={`absolute -left-[6px] top-[5px] h-[11px] w-[11px] rounded-full border-2 transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out group-hover:scale-125 group-hover:border-accent ${
                  current
                    ? 'border-accent bg-accent shadow-[0_0_0_4px_rgb(var(--accent)/0.18)] group-hover:shadow-[0_0_0_7px_rgb(var(--accent)/0.2)]'
                    : 'border-ink/35 bg-bg group-hover:bg-accent/30'
                }`}
              />
              <div className="transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:group-hover:translate-x-0">
                <p className="flex flex-wrap items-center gap-2.5 font-mono text-[12.5px] text-ink3">
                  {role.period}
                  {current && (
                    <span className="rounded-[3px] border border-accent-ink/40 px-1.5 py-px text-[10.5px] uppercase tracking-[0.1em] text-accent-ink">
                      Current
                    </span>
                  )}
                </p>
                <h3 className="mt-2 text-[18px] font-semibold transition-colors duration-200 group-hover:text-accent-ink">{role.title}</h3>
                <p className="text-[15px] text-ink2">{role.place}</p>
                {role.text && (
                  <p className="mt-3 text-[16px] leading-relaxed text-ink2 transition-colors duration-300 group-hover:text-ink">
                    {role.text}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

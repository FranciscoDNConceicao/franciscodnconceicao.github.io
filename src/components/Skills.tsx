import { useMemo, useState } from 'react'
import { contexts, skillGroups } from '../data/content'
import type { ContextId, Skill } from '../data/content'
import { delay } from '../hooks'
import SectionHeader, { Serif } from './SectionHeader'

type Focus = { type: 'skill'; skill: Skill } | { type: 'context'; id: ContextId } | null

const allSkills = skillGroups.flatMap((g) => g.skills)

export default function Skills() {
  const [focus, setFocus] = useState<Focus>(null)

  const counts = useMemo(() => {
    const result = {} as Record<ContextId, number>
    for (const c of contexts) result[c.id] = allSkills.filter((s) => s.usedIn.includes(c.id)).length
    return result
  }, [])

  const skillState = (skill: Skill) => {
    if (!focus) return 'idle'
    if (focus.type === 'skill') return focus.skill.name === skill.name ? 'on' : 'dim'
    return skill.usedIn.includes(focus.id) ? 'on' : 'dim'
  }

  const contextState = (id: ContextId) => {
    if (!focus) return 'idle'
    if (focus.type === 'context') return focus.id === id ? 'on' : 'dim'
    return focus.skill.usedIn.includes(id) ? 'on' : 'dim'
  }

  const panelTitle =
    focus?.type === 'skill'
      ? focus.skill.name
      : focus?.type === 'context'
        ? contexts.find((c) => c.id === focus.id)?.label
        : null

  const panelHint =
    focus?.type === 'skill'
      ? focus.skill.usedIn.length
        ? `Used in ${focus.skill.usedIn.length} of the places below.`
        : 'Part of my toolkit, not tied to a project listed here.'
      : focus?.type === 'context'
        ? `${counts[focus.id]} skills from this list.`
        : 'Hover or tap a skill to see where I have used it.'

  return (
    <section id="skills" className="py-20 sm:py-28">
      <div className="page">
        <SectionHeader
          index="04"
          label="Skills"
          aside="Hover to trace"
          title={
            <>
              The stack, and where it's <Serif>been put to work</Serif>.
            </>
          }
        />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10" onMouseLeave={() => setFocus(null)}>
          <div className="lg:col-span-8">
            {skillGroups.map((group, gi) => (
              <div
                key={group.label}
                data-reveal
                style={delay(gi * 60)}
                className="grid gap-4 border-t hairline py-6 sm:grid-cols-[11rem_1fr] sm:gap-6"
              >
                <h3 className="kicker pt-2">{group.label}</h3>
                <ul className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => {
                    const state = skillState(skill)
                    return (
                      <li key={skill.name}>
                        <button
                          type="button"
                          onMouseEnter={() => setFocus({ type: 'skill', skill })}
                          onFocus={() => setFocus({ type: 'skill', skill })}
                          onClick={() => setFocus({ type: 'skill', skill })}
                          aria-pressed={focus?.type === 'skill' && focus.skill.name === skill.name}
                          className={`rounded-full border px-4 py-2 text-[15px] transition duration-300 ${
                            state === 'on'
                              ? 'border-accent-ink/70 bg-accent/10 text-ink'
                              : state === 'dim'
                                ? 'hairline text-ink3 opacity-50'
                                : 'hairline text-ink hover:border-ink/30'
                          }`}
                        >
                          {skill.name}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <aside data-reveal style={delay(120)} className="lg:col-span-4">
            <div className="rounded-[22px] border hairline bg-surface/60 p-6 lg:sticky lg:top-28">
              <p className="kicker">Where</p>
              <div className="mt-3 min-h-[4.5rem]" aria-live="polite">
                <p className="text-[20px] font-semibold tracking-[-0.02em]">{panelTitle ?? 'Evidence, not percentages'}</p>
                <p className="mt-1 text-[14px] text-ink2">{panelHint}</p>
              </div>
              <ul className="mt-5 border-b hairline">
                {contexts.map((context) => {
                  const state = contextState(context.id)
                  return (
                    <li key={context.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setFocus({ type: 'context', id: context.id })}
                        onFocus={() => setFocus({ type: 'context', id: context.id })}
                        onClick={() => setFocus({ type: 'context', id: context.id })}
                        aria-pressed={focus?.type === 'context' && focus.id === context.id}
                        className={`flex w-full items-center gap-3 border-t hairline py-3 text-left transition duration-300 ${
                          state === 'dim' ? 'opacity-40' : ''
                        }`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full transition duration-300 ${
                            state === 'on' ? 'bg-accent-ink' : 'bg-ink/15'
                          }`}
                        />
                        <span className="flex-1 text-[15px]">{context.label}</span>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink3">
                          {context.kind}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

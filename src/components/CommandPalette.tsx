import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { profile, sections } from '../data/content'
import type { Theme } from '../hooks'
import { ArrowUpRight, Copy, Download, GitHub, Hash, LinkedIn, Moon, Search, Sun } from './Icons'

interface Command {
  id: string
  group: 'Navigate' | 'Actions' | 'Elsewhere'
  label: string
  keywords?: string
  icon: ReactNode
  hint?: string
  run: () => void
}

interface Props {
  open: boolean
  onClose: () => void
  theme: Theme
  onToggleTheme: () => void
  onCopyEmail: () => void
}

export default function CommandPalette({ open, onClose, theme, onToggleTheme, onCopyEmail }: Props) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const commands = useMemo<Command[]>(
    () => [
      ...sections.map((s) => ({
        id: `go-${s.id}`,
        group: 'Navigate' as const,
        label: s.label,
        icon: <Hash size={15} />,
        run: () => document.getElementById(s.id)?.scrollIntoView(),
      })),
      {
        id: 'copy-email',
        group: 'Actions',
        label: 'Copy email address',
        keywords: 'mail contact',
        icon: <Copy size={15} />,
        hint: profile.email,
        run: onCopyEmail,
      },
      {
        id: 'cv',
        group: 'Actions',
        label: 'Download CV',
        keywords: 'resume pdf curriculum',
        icon: <Download size={15} />,
        hint: 'PDF',
        run: () => window.open(profile.cv, '_blank', 'noopener'),
      },
      {
        id: 'theme',
        group: 'Actions',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        keywords: 'theme dark light mode',
        icon: theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />,
        run: onToggleTheme,
      },
      {
        id: 'github',
        group: 'Elsewhere',
        label: 'GitHub',
        keywords: 'code repositories',
        icon: <GitHub size={15} />,
        hint: 'FranciscoDNConceicao',
        run: () => window.open(profile.github, '_blank', 'noopener'),
      },
      {
        id: 'linkedin',
        group: 'Elsewhere',
        label: 'LinkedIn',
        icon: <LinkedIn size={15} />,
        hint: 'franciscoconceicao14',
        run: () => window.open(profile.linkedin, '_blank', 'noopener'),
      },
      {
        id: 'source',
        group: 'Elsewhere',
        label: 'Source code of this site',
        keywords: 'repo github website',
        icon: <ArrowUpRight size={15} />,
        run: () => window.open(profile.repo, '_blank', 'noopener'),
      },
    ],
    [theme, onToggleTheme, onCopyEmail],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.keywords ?? ''} ${c.group}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    setQuery('')
    setActive(0)
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const execute = (command: Command | undefined) => {
    if (!command) return
    onClose()
    // Let the dialog unmount and restore scrolling before navigating.
    requestAnimationFrame(command.run)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      execute(results[active])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'Tab') {
      // Keep focus inside the dialog; the input is the only tab stop.
      event.preventDefault()
    }
  }

  let lastGroup = ''

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="fade-up absolute inset-0 bg-bg/70 backdrop-blur-md" style={{ animationDuration: '0.3s' }} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="fade-up relative w-full max-w-[34rem] overflow-hidden rounded-2xl border hairline bg-surface shadow-[0_30px_100px_-20px_rgba(0,0,0,0.55)]"
        style={{ animationDuration: '0.45s' }}
      >
        <div className="flex items-center gap-3 border-b hairline px-4">
          <Search size={16} className="shrink-0 text-ink3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to…"
            className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink3"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          />
          <kbd className="rounded-md border hairline px-1.5 py-0.5 font-mono text-[10.5px] text-ink3">esc</kbd>
        </div>
        <ul ref={listRef} id="command-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink3">No results for “{query}”</li>}
          {results.map((command, i) => {
            const header = command.group !== lastGroup ? command.group : null
            lastGroup = command.group
            return (
              <li key={command.id} role="presentation">
                {header && <div className="kicker px-3 pb-1.5 pt-3">{header}</div>}
                <div
                  id={`cmd-${command.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-active={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => execute(command)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] transition-colors ${
                    i === active ? 'bg-ink/[0.07] text-ink' : 'text-ink2'
                  }`}
                >
                  <span className={i === active ? 'text-accent-ink' : 'text-ink3'}>{command.icon}</span>
                  <span className="flex-1">{command.label}</span>
                  {command.hint && (
                    <span className="hidden truncate font-mono text-[11px] text-ink3 sm:block">{command.hint}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between border-t hairline px-4 py-2.5 font-mono text-[10.5px] text-ink3">
          <span>↑↓ to move · ↵ to select</span>
          <span>{profile.name}</span>
        </div>
      </div>
    </div>
  )
}

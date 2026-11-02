import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { cvDatabase } from '../data/database'
import { display, run } from '../lib/sql'
import type { Result } from '../lib/sql'
import Section from './Section'

const EXAMPLES = [
  'SELECT name, stack FROM projects;',
  'SELECT name FROM skills WHERE at_work ORDER BY name;',
  'SELECT category, COUNT(*) FROM skills GROUP BY category ORDER BY 2 DESC;',
  'SELECT * FROM experience;',
  'DROP TABLE skills;',
]

interface Entry {
  id: number
  input: string
  result: Result
}

function Output({ result }: { result: Result }) {
  if (result.kind === 'clear') return null
  if (result.kind === 'text') return result.text ? <pre className="whitespace-pre-wrap text-ink2">{result.text}</pre> : null
  if (result.kind === 'error') return <pre className="whitespace-pre-wrap text-[#ff8f80]">{result.text}</pre>

  const count = result.rows.length
  return (
    <div className="overflow-x-auto">
      {result.title && <p className="text-ink2">{result.title}</p>}
      <table className="border-collapse text-left">
        <thead>
          <tr>
            {result.columns.map((column, i) => (
              <th
                key={i}
                className="whitespace-nowrap border-b border-ink/25 px-2.5 py-0.5 font-medium text-ink first:pl-0 [&+th]:border-l [&+th]:border-l-ink/15"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, r) => (
            <tr key={r}>
              {row.map((value, i) => (
                <td
                  key={i}
                  className={`whitespace-nowrap px-2.5 py-0.5 text-ink2 first:pl-0 [&+td]:border-l [&+td]:border-l-ink/15 ${
                    typeof value === 'number' ? 'text-right' : ''
                  }`}
                >
                  {display(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-ink3">
        ({count} {count === 1 ? 'row' : 'rows'})
      </p>
    </div>
  )
}

/** A psql-style console over my CV, loaded into a tiny in-browser SQL engine. */
export default function Query() {
  const [entries, setEntries] = useState<Entry[]>(() => [{ id: 0, input: '\\dt', result: run(cvDatabase, '\\dt') }])
  const [input, setInput] = useState('')
  const history = useRef<string[]>([])
  const cursor = useRef(-1)
  const nextId = useRef(1)
  const scroller = useRef<HTMLDivElement>(null)

  // Keep the newest output in view inside the console (the page itself does not scroll).
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries])

  const execute = (sql: string) => {
    const query = sql.trim()
    if (!query) return
    history.current = [...history.current, query]
    cursor.current = -1
    const result = run(cvDatabase, query)
    if (result.kind === 'clear') setEntries([])
    else setEntries((current) => [...current.slice(-30), { id: nextId.current++, input: query, result }])
    setInput('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const past = history.current
    if (event.key === 'ArrowUp' && past.length) {
      event.preventDefault()
      cursor.current = cursor.current === -1 ? past.length - 1 : Math.max(0, cursor.current - 1)
      setInput(past[cursor.current])
    } else if (event.key === 'ArrowDown' && cursor.current !== -1) {
      event.preventDefault()
      cursor.current += 1
      if (cursor.current >= past.length) {
        cursor.current = -1
        setInput('')
      } else {
        setInput(past[cursor.current])
      }
    }
  }

  return (
    <Section id="query" title="Query my CV">
      <p className="text-[17px] leading-[1.75] text-ink2">
        I spend a good part of my day in PostgreSQL, so here is my CV as a small database. It runs in your browser and
        it's read-only, so go ahead and try anything.
      </p>

      <div className="mt-6 overflow-hidden rounded-md border border-ink/20 bg-bg/90">
        <div className="flex items-center justify-between border-b border-ink/20 px-3 py-2 font-mono text-[11px] text-ink3">
          <span>psql · cv@francisco</span>
          <span>read-only</span>
        </div>
        <div
          ref={scroller}
          className="max-h-[24rem] space-y-4 overflow-y-auto px-3 py-3 font-mono text-[12.5px] leading-relaxed sm:px-4 sm:text-[13px]"
        >
          <p className="text-ink3">
            psql (16, sort of)
            <br />
            Type "help" for help.
          </p>
          {entries.map((entry) => (
            <div key={entry.id}>
              <p className="break-words">
                <span className="text-ink3">cv=#</span> <span className="text-ink">{entry.input}</span>
              </p>
              <div className="mt-1">
                <Output result={entry.result} />
              </div>
            </div>
          ))}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              execute(input)
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="sql-input" className="shrink-0 text-ink3">
              cv=#
            </label>
            <input
              id="sql-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              placeholder="SELECT * FROM projects;"
              className="min-w-0 flex-1 bg-transparent text-[16px] text-ink caret-[#7cf4ff] outline-none placeholder:text-ink3/60 sm:text-[13px]"
            />
          </form>
        </div>
      </div>

      <p className="mt-5 text-[14px] text-ink3">Or pick one:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {EXAMPLES.map((sql) => (
          <button
            key={sql}
            type="button"
            onClick={() => execute(sql)}
            className="max-w-full break-words rounded-md border border-ink/15 px-2.5 py-1.5 text-left font-mono text-[12px] text-ink2 transition-colors hover:border-ink/40 hover:text-ink"
          >
            {sql}
          </button>
        ))}
      </div>
    </Section>
  )
}

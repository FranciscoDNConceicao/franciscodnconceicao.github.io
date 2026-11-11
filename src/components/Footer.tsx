import type { ReactNode } from 'react'
import { profile } from '../data/content'

function Cell({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`spec-cell border-b border-r border-ink/20 px-3 py-2.5 ${wide ? 'col-span-2' : ''}`}>
      <div className="text-[11px] uppercase tracking-[0.1em] text-ink3">{label}</div>
      <div className="mt-1 text-ink">{children}</div>
    </div>
  )
}

/** The page closes like a technical drawing, with a title block in the bottom-right corner. */
export default function Footer() {
  return (
    <footer className="pb-14 pt-8">
      <div className="page">
        <div className="spot ml-auto grid max-w-[42rem] grid-cols-2 border-l border-t border-ink/20 bg-bg font-mono text-[12px] transition-shadow duration-300 hover:shadow-[0_20px_50px_-30px_rgb(var(--accent)/0.6)] sm:grid-cols-4">
          <Cell label="Title" wide>
            {profile.name}
            <span className="block text-ink2">Software engineer</span>
          </Cell>
          <Cell label="Location">Paredes, PT</Cell>
          <Cell label="Date">© {new Date().getFullYear()}</Cell>
          <Cell label="Scale">1:1</Cell>
          <Cell label="Sheet">1 of 1</Cell>
          <Cell label="Source">
            <a href={profile.repo} target="_blank" rel="noopener" className="text-link">
              GitHub
            </a>
          </Cell>
          <Cell label="Return">
            <a href="#top" className="text-link">
              Back to top
            </a>
          </Cell>
        </div>
      </div>
    </footer>
  )
}

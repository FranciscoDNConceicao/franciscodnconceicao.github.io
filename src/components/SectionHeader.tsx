import type { ReactNode } from 'react'
import { delay } from '../hooks'

interface Props {
  index: string
  label: string
  aside?: ReactNode
  title: ReactNode
}

export default function SectionHeader({ index, label, aside, title }: Props) {
  return (
    <div className="mb-14 sm:mb-20">
      <div data-reveal className="flex items-baseline justify-between border-t hairline pt-5">
        <span className="kicker">
          <span className="text-accent-ink">{index}</span>
          <span className="mx-2 text-ink3/60">/</span>
          {label}
        </span>
        {aside && <span className="kicker hidden sm:block">{aside}</span>}
      </div>
      <h2
        data-reveal
        style={delay(80)}
        className="mt-8 max-w-[18ch] text-[clamp(2.3rem,5.6vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
      >
        {title}
      </h2>
    </div>
  )
}

export function Serif({ children }: { children: ReactNode }) {
  return <span className="text-silver font-serif text-[1.08em] font-normal italic tracking-[-0.02em]">{children}</span>
}

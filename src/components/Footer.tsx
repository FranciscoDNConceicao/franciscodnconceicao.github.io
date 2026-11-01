import { profile } from '../data/content'
import { ArrowUp } from './Icons'

export default function Footer() {
  return (
    <footer className="overflow-hidden pt-10">
      <div className="page flex flex-col gap-4 border-t hairline py-8 text-[13px] text-ink3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>Designed and built with React, TypeScript, Vite and Tailwind.</span>
        <a href="#top" className="group inline-flex items-center gap-1.5 text-ink2 transition hover:text-ink">
          Back to top
          <ArrowUp size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        </a>
      </div>
      <div
        aria-hidden="true"
        className="page select-none whitespace-nowrap pb-3 text-[clamp(2rem,8.4vw,7.6rem)] font-semibold leading-[0.85] tracking-[-0.06em] text-ink/[0.06]"
      >
        Francisco{' '}
        <span className="text-silver font-serif font-normal italic tracking-[-0.03em] opacity-30">Conceição</span>
      </div>
    </footer>
  )
}

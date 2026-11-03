import { profile } from '../data/content'
import { useCopy } from '../hooks'
import { ArrowUpRight, Check, Copy } from './Icons'
import Section from './Section'

export default function Contact() {
  const { copied, copy } = useCopy(profile.email)

  return (
    <Section id="contact" title="Contact">
      <div className="panel p-6 sm:p-8">
        <p className="eyebrow">Email</p>
        <p className="mt-3 text-[18px] leading-relaxed">The easiest way to reach me is by email:</p>
        <a
          href={`mailto:${profile.email}`}
          className="mt-2 inline-block break-all text-[clamp(1.2rem,3.4vw,1.75rem)] font-semibold tracking-[-0.01em] underline decoration-ink/25 decoration-1 underline-offset-[6px] transition-colors duration-200 hover:decoration-accent-ink"
        >
          {profile.email}
        </a>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={`mailto:${profile.email}`} className="btn-primary">
            Write to me
            <ArrowUpRight size={15} />
          </a>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-ink/20 px-4 text-[15px] text-ink2 transition-colors duration-200 hover:border-ink/40 hover:text-ink"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy address'}
          </button>
        </div>
        <p className="mt-8 border-t hairline pt-6 text-[16px] leading-relaxed text-ink2">
          I'm also on{' '}
          <a href={profile.linkedin} target="_blank" rel="noopener" className="text-link">
            LinkedIn
          </a>{' '}
          and{' '}
          <a href={profile.github} target="_blank" rel="noopener" className="text-link">
            GitHub
          </a>
          , and you can{' '}
          <a href={profile.cv} target="_blank" rel="noopener" className="text-link">
            download my CV as a PDF
          </a>
          .
        </p>
      </div>
    </Section>
  )
}

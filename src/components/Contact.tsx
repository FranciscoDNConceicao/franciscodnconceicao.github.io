import { profile } from '../data/content'
import { useCopy } from '../hooks'
import { Check, Copy } from './Icons'
import Section from './Section'

export default function Contact() {
  const { copied, copy } = useCopy(profile.email)

  return (
    <Section id="contact" title="Contact">
      <p className="text-[18px] leading-relaxed">The easiest way to reach me is by email:</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a href={`mailto:${profile.email}`} className="text-link text-[clamp(1.15rem,3.4vw,1.6rem)] font-medium">
          {profile.email}
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border hairline px-3 text-[14px] text-ink2 transition-colors hover:text-ink"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="mt-8 text-[16px] leading-relaxed text-ink2">
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
    </Section>
  )
}

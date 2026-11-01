import { profile } from '../data/content'
import { delay, useCopy } from '../hooks'
import { ArrowDown, ArrowUpRight, Check, Copy, GitHub, LinkedIn, Mail } from './Icons'
import SectionHeader, { Serif } from './SectionHeader'

const links = [
  { label: 'LinkedIn', href: profile.linkedin, icon: <LinkedIn size={16} /> },
  { label: 'GitHub', href: profile.github, icon: <GitHub size={16} /> },
]

export default function Contact() {
  const { copied, copy } = useCopy(profile.email)
  const [user, domain] = profile.email.split('@')

  return (
    <section id="contact" className="relative isolate overflow-hidden py-20 sm:py-28">
      <div aria-hidden="true" className="glow absolute -left-[18rem] top-[8%] -z-10 h-[40rem] w-[40rem]" />
      <div className="page">
        <SectionHeader
          index="05"
          label="Contact"
          aside="Say hello"
          title={
            <>
              Let's build something <Serif>reliable</Serif>.
            </>
          }
        />

        <div data-reveal className="max-w-[52rem]">
          <p className="text-[17px] leading-relaxed text-ink2">
            The quickest way to reach me is by email. Click to copy it, or open your mail app.
          </p>
          <button
            type="button"
            onClick={copy}
            className="group mt-6 flex w-full items-center justify-between gap-4 border-b border-ink/20 pb-5 text-left transition-colors hover:border-accent-ink"
          >
            <span className="min-w-0 break-words text-[clamp(1.35rem,4.4vw,3.2rem)] font-medium leading-tight tracking-[-0.035em]">
              {user}@<wbr />
              {domain}
            </span>
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition duration-300 ${
                copied ? 'border-transparent bg-accent text-on-accent' : 'border-ink/20 text-ink2 group-hover:text-ink'
              }`}
            >
              {copied ? <Check size={17} /> : <Copy size={17} />}
            </span>
          </button>
          <p className="mt-3 h-5 font-mono text-[11.5px] text-ink3" aria-live="polite">
            {copied ? 'Copied to clipboard.' : ''}
          </p>
        </div>

        <div data-reveal style={delay(100)} className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href={`mailto:${profile.email}`}
            className="group flex items-center justify-between rounded-2xl border hairline p-5 transition hover:border-ink/30"
          >
            <span className="flex items-center gap-3">
              <Mail size={16} />
              <span className="text-[15px] font-medium">Send an email</span>
            </span>
            <ArrowUpRight size={15} className="text-ink3 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
          </a>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener"
              className="group flex items-center justify-between rounded-2xl border hairline p-5 transition hover:border-ink/30"
            >
              <span className="flex items-center gap-3">
                {link.icon}
                <span className="text-[15px] font-medium">{link.label}</span>
              </span>
              <ArrowUpRight size={15} className="text-ink3 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </a>
          ))}
          <a
            href={profile.cv}
            target="_blank"
            rel="noopener"
            className="group flex items-center justify-between rounded-2xl bg-ink p-5 text-bg transition hover:-translate-y-0.5"
          >
            <span className="text-[15px] font-medium">Download CV</span>
            <ArrowDown size={15} />
          </a>
        </div>
      </div>
    </section>
  )
}

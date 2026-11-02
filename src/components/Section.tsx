import type { ReactNode } from 'react'

/** A page section laid out like my CV: the heading on the left, the content on the right. */
export default function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="py-12 sm:py-16">
      <div className="page">
        <div className="grid gap-6 border-t hairline pt-8 lg:grid-cols-[12rem_1fr] lg:gap-12">
          <h2 className="text-[1.35rem] font-semibold lg:sticky lg:top-8 lg:self-start lg:text-[1.15rem]">{title}</h2>
          <div className="min-w-0 max-w-[44rem]">{children}</div>
        </div>
      </div>
    </section>
  )
}

import type { ReactNode } from 'react'
import type { Stage } from '../../api'

interface Props {
  stage: Stage
  count: number
  children?: ReactNode
}

export function BoardColumn({ stage, count, children }: Props) {
  return (
    <section
      aria-labelledby={`column-${stage}`}
      className="flex min-w-72 snap-start md:min-w-0 flex-col rounded-md border border-border bg-surface"
    >
      <header className="flex items-center justify-between border-b border-border px-3 py-2">
        <h2 id={`column-${stage}`} className="text-sm font-semibold">
          {stage}
        </h2>
        <span className="rounded-full bg-surface-muted px-2 text-xs font-medium tabular-nums text-text-muted">
          {count}
        </span>
      </header>
      <div className="flex min-h-40 flex-1 flex-col gap-2 p-2">{children}</div>
    </section>
  )
}

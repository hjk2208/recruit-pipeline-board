import { STAGES } from '../../api'

export function BoardSkeleton() {
  return (
    <div
      role="status"
      aria-label="지원자 목록을 불러오는 중"
      className="flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible motion-safe:animate-pulse"
    >
      {STAGES.map((stage) => (
        <div key={stage} className="flex min-w-72 flex-col md:min-w-0 rounded-md border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="h-4 w-16 rounded bg-surface-muted" />
            <div className="h-4 w-6 rounded-full bg-surface-muted" />
          </div>
          <div className="flex flex-col gap-2 p-2">
            <div className="h-16 rounded bg-surface-muted" />
            <div className="h-16 rounded bg-surface-muted" />
            <div className="h-16 rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

import type { Stage } from '../../api'

const tone: Record<Stage, string> = {
  서류검토: 'bg-surface-muted text-text-muted',
  면접: 'bg-surface-muted text-text-muted',
  처우협의: 'bg-surface-muted text-text-muted',
  최종합격: 'bg-success/10 text-success',
  불합격: 'bg-danger/10 text-danger',
}

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${tone[stage]}`}>{stage}</span>
  )
}

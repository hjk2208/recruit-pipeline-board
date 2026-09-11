import { STAGES, type Candidate, type Stage } from '../../api'
import { useMoveCandidate } from './useMoveCandidate'

interface Props {
  candidate: Candidate
}

export function StageSelect({ candidate }: Props) {
  const move = useMoveCandidate()
  return (
    <select
      aria-label={`${candidate.name} 단계 이동`}
      value={candidate.stage}
      disabled={move.isPending}
      onChange={(e) => move.mutate({ id: candidate.id, to: e.target.value as Stage })}
      className="rounded border border-border bg-surface px-1.5 py-0.5 text-xs text-text transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-progress disabled:opacity-60"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}

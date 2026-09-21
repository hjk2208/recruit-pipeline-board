import { useEffect, useRef } from 'react'
import { STAGES, type Candidate, type Stage } from '../../api'
import { claimFocus, rememberFocus } from '../a11y/focusRestore'
import { useMoveCandidate } from './useMoveCandidate'

interface Props {
  candidate: Candidate
}

export function StageSelect({ candidate }: Props) {
  const move = useMoveCandidate()
  const ref = useRef<HTMLSelectElement>(null)

  // 다른 컬럼으로 옮겨져 리마운트된 경우 포커스를 되찾는다 (키보드 조작 연속성)
  useEffect(() => claimFocus(candidate.id, ref.current), [candidate.id])

  return (
    <select
      ref={ref}
      aria-label={`${candidate.name} 단계 이동`}
      value={candidate.stage}
      disabled={move.isPending}
      onChange={(e) => {
        rememberFocus(candidate.id)
        move.mutate({ id: candidate.id, to: e.target.value as Stage })
      }}
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

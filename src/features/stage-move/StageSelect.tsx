import { useIsMutating } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { STAGES, type Candidate, type Stage } from '../../api'
import { claimFocus, rememberFocus } from '../a11y/focusRestore'
import { moveMutationKey, useMoveCandidate } from './useMoveCandidate'

interface Props {
  candidate: Candidate
}

export function StageSelect({ candidate }: Props) {
  const move = useMoveCandidate(candidate.id)
  // 낙관적 이동으로 카드가 다른 컬럼에 리마운트되면 이 컴포넌트의 mutation 인스턴스는 새것이라 isPending이 false.
  // 진행 여부는 카드 단위로 캐시에서 읽는다 — 카드 셀렉트와 상세 패널 셀렉트가 같이 잠긴다.
  const isMoving = useIsMutating({ mutationKey: moveMutationKey(candidate.id) }) > 0
  const ref = useRef<HTMLSelectElement>(null)

  // 다른 컬럼으로 옮겨져 리마운트된 경우 포커스를 되찾는다 (키보드 조작 연속성)
  useEffect(() => claimFocus(candidate.id, ref.current), [candidate.id])

  return (
    <select
      ref={ref}
      aria-label={`${candidate.name} 단계 이동`}
      value={candidate.stage}
      disabled={isMoving}
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

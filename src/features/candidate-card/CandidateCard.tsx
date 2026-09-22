import { memo, useEffect, useRef } from 'react'
import type { Candidate } from '../../api'
import { claimFocus } from '../a11y/focusRestore'
import { useDetailStore } from '../detail-panel/detailStore'
import { StageSelect } from '../stage-move/StageSelect'
import { StageBadge } from './StageBadge'

interface Props {
  candidate: Candidate
}

/**
 * 포커스 대상은 이름 버튼 — 카드 전체를 button으로 만들면 단계 이동 select를 안에 넣을 수 없다.
 * memo: 카드 한 장 이동에 다른 카드 수백 장이 리렌더되지 않게. candidate 객체는 이동한 카드만 새로 만들어진다.
 */
export const CandidateCard = memo(function CandidateCard({ candidate }: Props) {
  const metaId = `card-meta-${candidate.id}`
  const open = useDetailStore((s) => s.open)
  const nameRef = useRef<HTMLButtonElement>(null)
  // 가상 스크롤에서 키보드 탐색 목표가 이제 막 마운트된 카드면 포커스를 받는다
  useEffect(() => claimFocus(candidate.id, nameRef.current, 'name'), [candidate.id])

  return (
    <div className="rounded-md border border-border bg-surface p-3 shadow-xs transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between gap-2">
        <button
          ref={nameRef}
          type="button"
          data-card-id={candidate.id}
          aria-describedby={metaId}
          aria-haspopup="dialog"
          onClick={(e) => open(candidate.id, e.currentTarget)}
          className="rounded text-left text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {candidate.name}
        </button>
        <StageBadge stage={candidate.stage} />
      </div>
      <p id={metaId} className="mt-1 text-xs text-text-muted">
        {candidate.role} · <time dateTime={candidate.appliedAt}>{candidate.appliedAt}</time> 지원
      </p>
      <div className="mt-2 flex justify-end">
        <StageSelect candidate={candidate} />
      </div>
    </div>
  )
})

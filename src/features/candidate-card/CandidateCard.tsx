import type { Candidate } from '../../api'
import { StageBadge } from './StageBadge'

interface Props {
  candidate: Candidate
}

/**
 * 카드 자체는 li. 포커스 대상은 이름 버튼 — 카드 전체를 button으로 만들면
 * 나중에 단계 이동 select를 안에 넣을 수 없다(인터랙티브 요소 중첩 금지).
 */
export function CandidateCard({ candidate }: Props) {
  const metaId = `card-meta-${candidate.id}`
  return (
    <li className="rounded-md border border-border bg-surface p-3 shadow-xs transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          aria-describedby={metaId}
          className="rounded text-left text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {candidate.name}
        </button>
        <StageBadge stage={candidate.stage} />
      </div>
      <p id={metaId} className="mt-1 text-xs text-text-muted">
        {candidate.role} · <time dateTime={candidate.appliedAt}>{candidate.appliedAt}</time> 지원
      </p>
    </li>
  )
}

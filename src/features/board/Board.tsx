import { useDeferredValue, useState } from 'react'
import { STAGES } from '../../api'
import { CandidateCard } from '../candidate-card/CandidateCard'
import { EMPTY_FILTER, filterCandidates } from '../search-filter/filterCandidates'
import { SearchFilterBar } from '../search-filter/SearchFilterBar'
import { BoardColumn } from './BoardColumn'
import { groupByStage } from './groupByStage'
import { useCandidates } from './useCandidates'

export function Board() {
  const candidates = useCandidates()
  // 검색 상태는 이 컴포넌트 로컬 — 쓰는 곳이 검색바와 보드뿐. URL 동기화가 필요해지면 그때 올린다.
  const [filter, setFilter] = useState(EMPTY_FILTER)
  // 입력은 즉시 반영하고 250건 필터링은 한 박자 늦춘다 — 타이핑이 끊기지 않게
  const deferredFilter = useDeferredValue(filter)
  const byStage = groupByStage(filterCandidates(candidates, deferredFilter))

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <SearchFilterBar value={filter} onChange={setFilter} isStale={filter !== deferredFilter} />
      <div className="flex min-h-0 flex-1 snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
        {STAGES.map((stage) => (
          <BoardColumn key={stage} stage={stage} count={byStage[stage].length}>
            {byStage[stage].map((c) => (
              <CandidateCard key={c.id} candidate={c} />
            ))}
          </BoardColumn>
        ))}
      </div>
    </div>
  )
}

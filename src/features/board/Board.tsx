import { useDeferredValue, useState } from 'react'
import { STAGES } from '../../api'
import { EMPTY_FILTER, filterCandidates } from '../search-filter/filterCandidates'
import { SearchFilterBar } from '../search-filter/SearchFilterBar'
import { EmptyState } from '../status/EmptyState'
import { BoardColumn } from './BoardColumn'
import { groupByStage } from './groupByStage'
import { useCandidates } from './useCandidates'

export function Board() {
  const candidates = useCandidates()
  // 검색 상태는 이 컴포넌트 로컬 — 쓰는 곳이 검색바와 보드뿐. URL 동기화가 필요해지면 그때 올린다.
  const [filter, setFilter] = useState(EMPTY_FILTER)
  // 입력은 즉시 반영하고 필터링은 한 박자 늦춘다 — 타이핑이 끊기지 않게
  const deferredFilter = useDeferredValue(filter)
  const visible = filterCandidates(candidates, deferredFilter)
  const byStage = groupByStage(visible)
  const isFiltering = deferredFilter.query.trim() !== '' || deferredFilter.role !== 'all'

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <SearchFilterBar value={filter} onChange={setFilter} isStale={filter !== deferredFilter} />
      {visible.length === 0 ? (
        <EmptyState
          message={
            isFiltering ? '조건에 맞는 지원자가 없습니다. 검색어나 직무 필터를 바꿔 보세요.' : '아직 등록된 지원자가 없습니다.'
          }
        />
      ) : (
        <div className="flex min-h-0 flex-1 snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
          {STAGES.map((stage) => (
            <BoardColumn
              key={stage}
              stage={stage}
              items={byStage[stage]}
              emptyMessage={isFiltering ? '조건에 맞는 지원자 없음' : '이 단계의 지원자 없음'}
            />
          ))}
        </div>
      )}
    </div>
  )
}

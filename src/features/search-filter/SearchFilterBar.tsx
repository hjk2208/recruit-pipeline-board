import { ROLES, type Role } from '../../api'
import type { Filter } from './filterCandidates'

interface Props {
  value: Filter
  onChange: (next: Filter) => void
  /** 지연 필터링 중이면 true — 입력은 즉시 반영되지만 목록은 아직 이전 값 */
  isStale?: boolean
}

export function SearchFilterBar({ value, onChange, isStale }: Props) {
  return (
    <div role="search" className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        aria-label="이름 검색"
        placeholder="이름 검색"
        value={value.query}
        onChange={(e) => onChange({ ...value, query: e.target.value })}
        className="w-56 rounded-md border border-border bg-surface px-3 py-1.5 text-sm transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
      />
      <select
        aria-label="직무 필터"
        value={value.role}
        onChange={(e) => onChange({ ...value, role: e.target.value as Role | 'all' })}
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
      >
        <option value="all">전체 직무</option>
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <span aria-live="polite" className="text-xs text-text-muted">
        {isStale ? '검색 중…' : ''}
      </span>
    </div>
  )
}

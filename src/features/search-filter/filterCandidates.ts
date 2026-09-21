import type { Candidate, Role } from '../../api'

export interface Filter {
  query: string
  role: Role | 'all'
}

export const EMPTY_FILTER: Filter = { query: '', role: 'all' }

/** 조건이 없으면 원본 참조를 돌려줘 groupByStage 등 하위 계산이 재실행되지 않게 한다 */
export function filterCandidates(list: readonly Candidate[], { query, role }: Filter): readonly Candidate[] {
  const q = query.trim().toLowerCase()
  if (!q && role === 'all') return list
  return list.filter((c) => (role === 'all' || c.role === role) && (!q || c.name.toLowerCase().includes(q)))
}

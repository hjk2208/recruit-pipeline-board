import type { Stage } from '../../api'

interface ColumnHandle {
  ids: readonly string[]
  scrollToIndex: (index: number) => void
}

/**
 * 키보드 탐색이 옆 컬럼의 목록·스크롤에 닿기 위한 레지스트리. 컬럼이 마운트/갱신 시 등록한다.
 * 모듈 레벨 — 보드가 하나라는 전제. 보드가 여럿이면 Context로 옮긴다.
 */
const registry = new Map<Stage, ColumnHandle>()

export const columnRegistry = {
  set: (stage: Stage, handle: ColumnHandle) => void registry.set(stage, handle),
  delete: (stage: Stage) => void registry.delete(stage),
  get: (stage: Stage) => registry.get(stage),
}

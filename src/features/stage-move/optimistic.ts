import type { Candidate, Stage } from '../../api'

/**
 * 낙관적 반영: 해당 항목의 단계만 바꾼 새 목록과, 롤백에 쓸 이전 단계를 돌려준다.
 * 다른 항목은 참조를 유지해 리렌더 범위를 최소화한다.
 */
export function applyStage(
  list: readonly Candidate[],
  id: string,
  to: Stage,
): { list: Candidate[]; previous: Stage | undefined } {
  const target = list.find((c) => c.id === id)
  if (!target) return { list: list as Candidate[], previous: undefined }
  return {
    list: list.map((c) => (c.id === id ? { ...c, stage: to } : c)),
    previous: target.stage,
  }
}

/**
 * 항목 단위 롤백: 실패한 항목만 이전 단계로 되돌린다.
 * 목록 전체 스냅샷을 복원하면 그 사이 다른 카드에 반영된 낙관적 상태까지 지워지므로 그렇게 하지 않는다.
 */
export function rollbackStage(list: readonly Candidate[], id: string, previous: Stage): Candidate[] {
  return list.map((c) => (c.id === id ? { ...c, stage: previous } : c))
}

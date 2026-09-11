import type { Candidate, Stage } from '../../api'

export type CandidatesByStage = Record<Stage, Candidate[]>

/** 단계 순서대로 빈 배열까지 보장해서 컬럼 렌더가 키 존재를 검사하지 않게 한다 */
export function groupByStage(candidates: readonly Candidate[]): CandidatesByStage {
  const groups: CandidatesByStage = { 서류검토: [], 면접: [], 처우협의: [], 최종합격: [], 불합격: [] }
  for (const c of candidates) groups[c.stage].push(c)
  return groups
}

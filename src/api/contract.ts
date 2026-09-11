import type { Candidate, Stage } from './types'

/**
 * 화면·훅이 의존하는 유일한 계약.
 * mock 구현체와 실제 백엔드 구현체가 이 인터페이스를 각각 구현한다.
 */
export interface CandidateApi {
  fetchCandidates(): Promise<Candidate[]>
  /** 단계 변경 후 갱신된 지원자 하나를 돌려준다 */
  moveCandidate(id: string, to: Stage): Promise<Candidate>
}

import type { CandidateApi } from './contract'
import { createMockApi } from './mock/createMockApi'

/**
 * 앱 전체가 쓰는 API 인스턴스.
 * 실제 백엔드가 붙으면 여기서 구현체만 바꾼다 — 화면·훅은 CandidateApi만 안다.
 */
export const api: CandidateApi = createMockApi()

export type { CandidateApi } from './contract'
export type { Candidate, Role, Stage } from './types'
export { ROLES, STAGES } from './types'
export { ApiError, isApiError } from './errors'

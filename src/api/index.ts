import type { CandidateApi } from './contract'
import { createMockApi, STORAGE_KEY } from './mock/createMockApi'
import { readDevOverrides } from './mock/devOverrides'
import { generateCandidates } from './mock/seed'

/**
 * 앱 전체가 쓰는 API 인스턴스.
 * 실제 백엔드가 붙으면 여기서 구현체만 바꾼다 — 화면·훅은 CandidateApi만 안다.
 * URL 쿼리(?failRate=1 등)는 개발·검증용 오버라이드 — devOverrides.ts 참조.
 */
const dev = typeof location !== 'undefined' ? readDevOverrides(location.search) : {}
if (dev.reset || dev.seedCount !== undefined) localStorage.removeItem(STORAGE_KEY)

export const api: CandidateApi = createMockApi({
  ...dev,
  seed: dev.seedCount !== undefined ? () => generateCandidates({ count: dev.seedCount }) : undefined,
})

export type { CandidateApi } from './contract'
export type { Candidate, Role, Stage } from './types'
export { ROLES, STAGES } from './types'
export { ApiError, isApiError } from './errors'

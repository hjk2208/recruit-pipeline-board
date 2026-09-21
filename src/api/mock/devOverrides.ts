import type { MockApiOptions } from './createMockApi'

/**
 * 개발·검증용: URL 쿼리로 mock 동작을 덮어쓴다. 프로덕션 코드 경로가 아니라
 * 에러·빈 상태 화면을 재현하기 위한 스위치다.
 *
 *   ?failRate=1        조회·쓰기 모두 100% 실패 (에러 화면)
 *   ?failRate=0        실패 없음
 *   ?delay=0           지연 없음
 *   ?seed=0            데이터 0건 (빈 상태)
 *   ?reset             localStorage 초기화 후 다시 seed
 */
export function readDevOverrides(search: string): Partial<MockApiOptions> & { reset?: boolean; seedCount?: number } {
  const q = new URLSearchParams(search)
  const out: ReturnType<typeof readDevOverrides> = {}
  const failRate = q.get('failRate')
  if (failRate !== null) {
    const rate = clamp01(Number(failRate))
    out.failRate = { read: rate, write: rate }
  }
  const delay = q.get('delay')
  if (delay !== null) {
    const ms = Math.max(0, Number(delay) || 0)
    out.delayMs = { min: ms, max: ms }
  }
  const seed = q.get('seed')
  if (seed !== null) out.seedCount = Math.max(0, Number(seed) || 0)
  if (q.has('reset')) out.reset = true
  return out
}

function clamp01(n: number) {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0
}

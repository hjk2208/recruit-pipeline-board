import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../errors'
import type { Candidate } from '../types'
import { createMockApi, STORAGE_KEY, type MockApiOptions } from './createMockApi'

function memory(): NonNullable<MockApiOptions['storage']> & { dump(): string | null } {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    dump: () => m.get(STORAGE_KEY) ?? null,
  }
}

/** 주어진 수열을 순서대로 돌려주는 난수. 다 쓰면 마지막 값 반복 */
function sequence(values: number[]): () => number {
  let i = 0
  return () => values[Math.min(i++, values.length - 1)]
}

const seed3 = (): Candidate[] => [
  { id: 'a', name: '김서준', role: '프론트엔드', appliedAt: '2026-09-01', stage: '서류검토', email: '', phone: '', memo: '', updatedAt: '2026-09-01T00:00:00.000Z' },
  { id: 'b', name: '이지우', role: '백엔드', appliedAt: '2026-09-02', stage: '면접', email: '', phone: '', memo: '', updatedAt: '2026-09-02T00:00:00.000Z' },
  { id: 'c', name: '박하은', role: '디자인', appliedAt: '2026-09-03', stage: '불합격', email: '', phone: '', memo: '', updatedAt: '2026-09-03T00:00:00.000Z' },
]

const instant = { delayMs: { min: 0, max: 0 }, failRate: { read: 0, write: 0 } }

describe('createMockApi — 조회·이동·영속', () => {
  it('첫 조회에서 seed를 넣고 돌려준다', async () => {
    const api = createMockApi({ ...instant, storage: memory(), seed: seed3 })
    const list = await api.fetchCandidates()
    expect(list).toHaveLength(3)
    expect(list.map((c) => c.id)).toEqual(['a', 'b', 'c'])
  })

  it('반환값을 바꿔도 내부 데이터는 영향 없다', async () => {
    const api = createMockApi({ ...instant, storage: memory(), seed: seed3 })
    const list = await api.fetchCandidates()
    list[0].stage = '최종합격'
    expect((await api.fetchCandidates())[0].stage).toBe('서류검토')
  })

  it('이동하면 갱신된 지원자 하나를 돌려주고 updatedAt이 바뀐다', async () => {
    const now = () => new Date('2026-09-11T10:00:00.000Z')
    const api = createMockApi({ ...instant, storage: memory(), seed: seed3, now })
    const moved = await api.moveCandidate('a', '면접')
    expect(moved.id).toBe('a')
    expect(moved.stage).toBe('면접')
    expect(moved.updatedAt).toBe('2026-09-11T10:00:00.000Z')
  })

  it('이동은 저장소에 남아 새 인스턴스에서도 유지된다 (새로고침)', async () => {
    const storage = memory()
    const first = createMockApi({ ...instant, storage, seed: seed3 })
    await first.moveCandidate('a', '처우협의')

    const second = createMockApi({ ...instant, storage, seed: seed3 })
    const list = await second.fetchCandidates()
    expect(list.find((c) => c.id === 'a')?.stage).toBe('처우협의')
  })

  it('없는 id를 옮기면 NOT_FOUND, 재시도 불가', async () => {
    const api = createMockApi({ ...instant, storage: memory(), seed: seed3 })
    const err = await api.moveCandidate('zzz', '면접').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).code).toBe('NOT_FOUND')
    expect((err as ApiError).retryable).toBe(false)
  })

  it('reset 후 첫 조회는 다시 seed 된다', async () => {
    const storage = memory()
    const api = createMockApi({ ...instant, storage, seed: seed3 })
    await api.moveCandidate('a', '불합격')
    api.reset()
    expect(storage.dump()).toBeNull()
    expect((await api.fetchCandidates())[0].stage).toBe('서류검토')
  })

  it('깨진 저장 데이터는 버리고 다시 seed 한다', async () => {
    const storage = memory()
    storage.setItem(STORAGE_KEY, '{not json')
    const api = createMockApi({ ...instant, storage, seed: seed3 })
    expect(await api.fetchCandidates()).toHaveLength(3)
  })
})

describe('createMockApi — 실패율', () => {
  // random()은 호출당 두 번 쓰인다: [지연 비율, 실패 판정]
  it('쓰기 실패율 1이면 이동은 항상 NETWORK 에러, 재시도 가능', async () => {
    const api = createMockApi({
      delayMs: { min: 0, max: 0 },
      failRate: { read: 0, write: 1 },
      storage: memory(),
      seed: seed3,
    })
    const err = await api.moveCandidate('a', '면접').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).code).toBe('NETWORK')
    expect((err as ApiError).status).toBe(503)
    expect((err as ApiError).retryable).toBe(true)
    // 실패한 이동은 저장되지 않는다
    expect((await api.fetchCandidates())[0].stage).toBe('서류검토')
  })

  it('실패 판정은 난수 < 실패율 — 주입한 수열대로 결정적으로 갈린다', async () => {
    const api = createMockApi({
      delayMs: { min: 0, max: 0 },
      failRate: { read: 0.5, write: 0.5 },
      random: sequence([0, 0.9, 0, 0.1]), // 1차 조회: 성공(0.9≥0.5) / 2차 조회: 실패(0.1<0.5)
      storage: memory(),
      seed: seed3,
    })
    await expect(api.fetchCandidates()).resolves.toHaveLength(3)
    await expect(api.fetchCandidates()).rejects.toBeInstanceOf(ApiError)
  })

  it('조회와 쓰기의 실패율이 따로 적용된다', async () => {
    const api = createMockApi({
      delayMs: { min: 0, max: 0 },
      failRate: { read: 0, write: 1 },
      storage: memory(),
      seed: seed3,
    })
    await expect(api.fetchCandidates()).resolves.toBeDefined()
    await expect(api.moveCandidate('a', '면접')).rejects.toBeInstanceOf(ApiError)
  })
})

describe('createMockApi — 지연', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('지연은 [min, max] 안에서 난수 비율로 정해진다', async () => {
    const api = createMockApi({
      delayMs: { min: 200, max: 800 },
      failRate: { read: 0, write: 0 },
      random: sequence([0.5, 0]), // 지연 = 200 + 0.5 * 600 = 500ms
      storage: memory(),
      seed: seed3,
    })
    let done = false
    const p = api.fetchCandidates().then(() => (done = true))
    await vi.advanceTimersByTimeAsync(499)
    expect(done).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await p
    expect(done).toBe(true)
  })

  it('기본 지연은 200~800ms', async () => {
    const api = createMockApi({ failRate: { read: 0, write: 0 }, random: sequence([1, 0]), storage: memory(), seed: seed3 })
    let done = false
    const p = api.fetchCandidates().then(() => (done = true))
    await vi.advanceTimersByTimeAsync(799)
    expect(done).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await p
    expect(done).toBe(true)
  })
})

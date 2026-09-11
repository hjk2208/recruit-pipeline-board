import type { CandidateApi } from '../contract'
import { ApiError } from '../errors'
import type { Candidate, Stage } from '../types'
import { generateCandidates } from './seed'

export interface MockApiOptions {
  /** 호출마다 [min, max] 사이 랜덤 지연(ms). 기본 200~800 */
  delayMs?: { min: number; max: number }
  /** 실패 확률 0~1. 기본 조회 0.05 / 쓰기 0.15 */
  failRate?: { read: number; write: number }
  /** 지연·실패 판정에 쓰는 난수 소스. 테스트에서 고정 수열 주입 */
  random?: () => number
  /** 영속 저장소. 기본 localStorage, 테스트에선 메모리 구현 주입 */
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  /** 첫 실행 시 저장소가 비어 있으면 넣을 초기 데이터 */
  seed?: () => Candidate[]
  now?: () => Date
}

export const STORAGE_KEY = 'recruit-pipeline-board:candidates'

const defaults = {
  delayMs: { min: 200, max: 800 },
  failRate: { read: 0.05, write: 0.15 },
}

function memoryStorage(): NonNullable<MockApiOptions['storage']> {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  }
}

export function createMockApi(options: MockApiOptions = {}): CandidateApi & { reset(): void } {
  const delayMs = options.delayMs ?? defaults.delayMs
  const failRate = options.failRate ?? defaults.failRate
  const random = options.random ?? Math.random
  const storage =
    options.storage ?? (typeof localStorage !== 'undefined' ? localStorage : memoryStorage())
  const seed = options.seed ?? (() => generateCandidates())
  const now = options.now ?? (() => new Date())

  function load(): Candidate[] {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        return JSON.parse(raw) as Candidate[]
      } catch {
        // 깨진 데이터는 버리고 다시 seed
      }
    }
    const initial = seed()
    save(initial)
    return initial
  }

  function save(list: Candidate[]) {
    storage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  // 네트워크처럼: 지연이 먼저 흐르고, 그 다음 성공/실패가 갈린다
  async function simulate(kind: 'read' | 'write') {
    const wait = delayMs.min + random() * (delayMs.max - delayMs.min)
    await new Promise((r) => setTimeout(r, wait))
    if (random() < failRate[kind]) {
      throw new ApiError('NETWORK', 503, true, '네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
    }
  }

  return {
    async fetchCandidates() {
      await simulate('read')
      return structuredClone(load())
    },

    async moveCandidate(id: string, to: Stage) {
      await simulate('write')
      const list = load()
      const target = list.find((c) => c.id === id)
      if (!target) {
        throw new ApiError('NOT_FOUND', 404, false, `지원자를 찾을 수 없습니다: ${id}`)
      }
      target.stage = to
      target.updatedAt = now().toISOString()
      save(list)
      return structuredClone(target)
    },

    /** 저장소를 비워 다음 조회에서 다시 seed 되게 한다. 개발·테스트용 */
    reset() {
      storage.removeItem(STORAGE_KEY)
    },
  }
}

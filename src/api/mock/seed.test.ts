import { describe, expect, it } from 'vitest'
import { ROLES, STAGES } from '../types'
import { createRandom, generateCandidates } from './seed'

describe('generateCandidates', () => {
  it('기본 250건을 만든다', () => {
    expect(generateCandidates()).toHaveLength(250)
  })

  it('같은 시드면 같은 결과 — 테스트 재현 가능', () => {
    expect(generateCandidates({ seed: 1 })).toEqual(generateCandidates({ seed: 1 }))
    expect(generateCandidates({ seed: 1 })).not.toEqual(generateCandidates({ seed: 2 }))
  })

  it('모든 필드가 유효하다', () => {
    const list = generateCandidates({ count: 50 })
    const ids = new Set(list.map((c) => c.id))
    expect(ids.size).toBe(50)
    for (const c of list) {
      expect(STAGES).toContain(c.stage)
      expect(ROLES).toContain(c.role)
      expect(c.appliedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(c.name.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('다섯 단계 모두에 지원자가 분포한다', () => {
    const stages = new Set(generateCandidates().map((c) => c.stage))
    expect(stages.size).toBe(STAGES.length)
  })
})

describe('createRandom', () => {
  it('0 이상 1 미만의 수를 낸다', () => {
    const r = createRandom(42)
    for (let i = 0; i < 1000; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

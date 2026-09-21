import { describe, expect, it } from 'vitest'
import { readDevOverrides } from './devOverrides'

describe('readDevOverrides', () => {
  it('쿼리가 없으면 빈 객체', () => {
    expect(readDevOverrides('')).toEqual({})
  })
  it('failRate는 0~1로 잘리고 조회·쓰기에 같이 적용', () => {
    expect(readDevOverrides('?failRate=1').failRate).toEqual({ read: 1, write: 1 })
    expect(readDevOverrides('?failRate=7').failRate).toEqual({ read: 1, write: 1 })
    expect(readDevOverrides('?failRate=abc').failRate).toEqual({ read: 0, write: 0 })
  })
  it('delay·seed·reset', () => {
    expect(readDevOverrides('?delay=0').delayMs).toEqual({ min: 0, max: 0 })
    expect(readDevOverrides('?seed=0').seedCount).toBe(0)
    expect(readDevOverrides('?reset').reset).toBe(true)
  })
})

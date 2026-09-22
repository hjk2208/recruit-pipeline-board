import { describe, expect, it } from 'vitest'
import { nextTarget } from './columnKeyNav'

const lengths = { 서류검토: 3, 면접: 1, 처우협의: 0, 최종합격: 0, 불합격: 2 } as const
const lengthOf = (s: keyof typeof lengths) => lengths[s]

describe('nextTarget', () => {
  it('↓/↑ 같은 컬럼 순환', () => {
    expect(nextTarget('ArrowDown', { stage: '서류검토', index: 2 }, lengthOf)).toEqual({ stage: '서류검토', index: 0 })
    expect(nextTarget('ArrowUp', { stage: '서류검토', index: 0 }, lengthOf)).toEqual({ stage: '서류검토', index: 2 })
  })
  it('→ 옆 컬럼 같은 순번, 넘치면 마지막', () => {
    expect(nextTarget('ArrowRight', { stage: '서류검토', index: 2 }, lengthOf)).toEqual({ stage: '면접', index: 0 })
  })
  it('← 빈 컬럼을 건너뛰고 순환', () => {
    expect(nextTarget('ArrowLeft', { stage: '면접', index: 0 }, lengthOf)).toEqual({ stage: '서류검토', index: 0 })
    expect(nextTarget('ArrowLeft', { stage: '서류검토', index: 1 }, lengthOf)).toEqual({ stage: '불합격', index: 1 })
  })
  it('다른 키는 null', () => {
    expect(nextTarget('Enter', { stage: '서류검토', index: 0 }, lengthOf)).toBeNull()
  })
})

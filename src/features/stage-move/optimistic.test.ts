import { describe, expect, it } from 'vitest'
import type { Candidate } from '../../api'
import { applyStage, rollbackStage } from './optimistic'

const c = (id: string, stage: Candidate['stage']): Candidate => ({
  id, name: id, role: 'PM', appliedAt: '2026-09-01', stage, email: '', phone: '', memo: '', updatedAt: '',
})
const base = [c('a', '서류검토'), c('b', '서류검토'), c('c', '면접')]

describe('applyStage — 낙관적 반영', () => {
  it('그 항목의 단계만 바꾸고 이전 단계를 돌려준다', () => {
    const { list, previous } = applyStage(base, 'a', '면접')
    expect(previous).toBe('서류검토')
    expect(list.find((x) => x.id === 'a')?.stage).toBe('면접')
    expect(list.find((x) => x.id === 'b')).toBe(base[1]) // 다른 항목은 참조 그대로
    expect(base[0].stage).toBe('서류검토') // 입력 불변
  })

  it('없는 id면 목록을 그대로 두고 previous는 undefined', () => {
    const { list, previous } = applyStage(base, 'zzz', '면접')
    expect(list).toBe(base)
    expect(previous).toBeUndefined()
  })
})

describe('rollbackStage — 항목 단위 롤백', () => {
  it('실패한 항목만 이전 단계로 되돌린다', () => {
    const moved = applyStage(base, 'a', '면접').list
    const rolled = rollbackStage(moved, 'a', '서류검토')
    expect(rolled.find((x) => x.id === 'a')?.stage).toBe('서류검토')
    expect(rolled.find((x) => x.id === 'c')?.stage).toBe('면접')
  })

  it('두 장 동시 이동 중 하나가 실패해도 다른 장의 낙관적 상태는 남는다', () => {
    const a = applyStage(base, 'a', '면접')
    const b = applyStage(a.list, 'b', '처우협의')
    const afterAFails = rollbackStage(b.list, 'a', a.previous!)
    expect(afterAFails.find((x) => x.id === 'a')?.stage).toBe('서류검토')
    expect(afterAFails.find((x) => x.id === 'b')?.stage).toBe('처우협의')
  })

  it('전체 스냅샷 복원이었다면 b의 상태가 날아갔을 것 — 이 함수는 그러지 않는다', () => {
    const a = applyStage(base, 'a', '면접')
    const b = applyStage(a.list, 'b', '처우협의')
    const wholeSnapshotRollback = base // 전체 스냅샷 방식이라면 이걸로 덮어씀
    expect(wholeSnapshotRollback.find((x) => x.id === 'b')?.stage).toBe('서류검토') // ← 문제의 동작
    expect(rollbackStage(b.list, 'a', a.previous!).find((x) => x.id === 'b')?.stage).toBe('처우협의')
  })
})

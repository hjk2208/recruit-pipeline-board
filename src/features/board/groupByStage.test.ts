import { describe, expect, it } from 'vitest'
import { STAGES, type Candidate } from '../../api'
import { groupByStage } from './groupByStage'

const c = (id: string, stage: Candidate['stage']): Candidate => ({
  id, name: id, role: 'PM', appliedAt: '2026-09-01', stage, email: '', phone: '', memo: '', updatedAt: '',
})

describe('groupByStage', () => {
  it('다섯 단계 키를 항상 만든다 — 비어 있어도', () => {
    const g = groupByStage([])
    expect(Object.keys(g)).toEqual([...STAGES])
    for (const s of STAGES) expect(g[s]).toEqual([])
  })

  it('단계별로 나누고 입력 순서를 유지한다', () => {
    const g = groupByStage([c('1', '면접'), c('2', '서류검토'), c('3', '면접')])
    expect(g['면접'].map((x) => x.id)).toEqual(['1', '3'])
    expect(g['서류검토'].map((x) => x.id)).toEqual(['2'])
    expect(g['불합격']).toEqual([])
  })
})

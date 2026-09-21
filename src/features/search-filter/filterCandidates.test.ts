import { describe, expect, it } from 'vitest'
import type { Candidate } from '../../api'
import { filterCandidates } from './filterCandidates'

const c = (id: string, name: string, role: Candidate['role']): Candidate => ({
  id, name, role, appliedAt: '2026-09-01', stage: '서류검토', email: '', phone: '', memo: '', updatedAt: '',
})
const list = [c('1', '김서준', '프론트엔드'), c('2', '이지우', '백엔드'), c('3', 'Kim Alice', '프론트엔드'), c('4', '박서연', '디자인')]

describe('filterCandidates', () => {
  it('빈 조건이면 원본 참조를 그대로 돌려준다', () => {
    expect(filterCandidates(list, { query: '', role: 'all' })).toBe(list)
    expect(filterCandidates(list, { query: '   ', role: 'all' })).toBe(list)
  })

  it('이름 부분 일치, 대소문자 무시, 앞뒤 공백 무시', () => {
    expect(filterCandidates(list, { query: '서', role: 'all' }).map((x) => x.id)).toEqual(['1', '4'])
    expect(filterCandidates(list, { query: 'kim', role: 'all' }).map((x) => x.id)).toEqual(['3'])
    expect(filterCandidates(list, { query: ' ALICE ', role: 'all' }).map((x) => x.id)).toEqual(['3'])
  })

  it('직무 필터', () => {
    expect(filterCandidates(list, { query: '', role: '프론트엔드' }).map((x) => x.id)).toEqual(['1', '3'])
  })

  it('검색과 필터가 동시에 걸린다', () => {
    expect(filterCandidates(list, { query: '서', role: '프론트엔드' }).map((x) => x.id)).toEqual(['1'])
    expect(filterCandidates(list, { query: '서', role: '백엔드' })).toEqual([])
  })
})

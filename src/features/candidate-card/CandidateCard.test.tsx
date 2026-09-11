import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Candidate } from '../../api'
import { CandidateCard } from './CandidateCard'

const c: Candidate = {
  id: 'c0001', name: '김서준', role: '프론트엔드', appliedAt: '2026-08-20', stage: '면접',
  email: '', phone: '', memo: '', updatedAt: '',
}

describe('CandidateCard', () => {
  it('이름·직무·지원일·단계를 보여준다', () => {
    render(<ul><CandidateCard candidate={c} /></ul>)
    expect(screen.getByRole('button', { name: '김서준' })).toBeInTheDocument()
    expect(screen.getByText('면접')).toBeInTheDocument()
    expect(screen.getByText(/프론트엔드/)).toHaveTextContent('프론트엔드 · 2026-08-20 지원')
  })

  it('이름 버튼이 키보드 포커스를 받고 메타 정보로 설명된다', () => {
    render(<ul><CandidateCard candidate={c} /></ul>)
    const btn = screen.getByRole('button', { name: '김서준' })
    btn.focus()
    expect(btn).toHaveFocus()
    expect(btn).toHaveAccessibleDescription('프론트엔드 · 2026-08-20 지원')
  })
})

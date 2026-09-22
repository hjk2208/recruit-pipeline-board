import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Candidate } from '../../api'
import { CandidateCard } from './CandidateCard'

vi.mock('../../api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api')>()
  return { ...mod, api: { fetchCandidates: vi.fn(), moveCandidate: vi.fn() } }
})

const c: Candidate = {
  id: 'c0001', name: '김서준', role: '프론트엔드', appliedAt: '2026-08-20', stage: '면접',
  email: '', phone: '', memo: '', updatedAt: '',
}

function renderCard() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <CandidateCard candidate={c} />
    </QueryClientProvider>,
  )
}

describe('CandidateCard', () => {
  it('이름·직무·지원일·단계를 보여준다', () => {
    renderCard()
    expect(screen.getByRole('button', { name: '김서준' })).toBeInTheDocument()
    expect(screen.getByText('면접', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText(/프론트엔드/)).toHaveTextContent('프론트엔드 · 2026-08-20 지원')
  })

  it('이름 버튼이 키보드 포커스를 받고 메타 정보로 설명된다', () => {
    renderCard()
    const btn = screen.getByRole('button', { name: '김서준' })
    btn.focus()
    expect(btn).toHaveFocus()
    expect(btn).toHaveAccessibleDescription('프론트엔드 · 2026-08-20 지원')
  })

  it('단계 셀렉트가 현재 단계를 가리킨다', () => {
    renderCard()
    expect(screen.getByRole('combobox', { name: '김서준 단계 이동' })).toHaveValue('면접')
  })
})

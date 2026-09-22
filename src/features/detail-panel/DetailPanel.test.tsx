import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Candidate } from '../../api'
import { candidatesQueryOptions } from '../board/queries'
import { CandidateCard } from '../candidate-card/CandidateCard'
import { DetailPanel } from './DetailPanel'
import { useDetailStore } from './detailStore'

vi.mock('../../api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api')>()
  return { ...mod, api: { fetchCandidates: vi.fn(), moveCandidate: vi.fn() } }
})

const a: Candidate = { id: 'a', name: '김서준', role: '프론트엔드', appliedAt: '2026-08-20', stage: '면접', email: 'a@x.com', phone: '010-1111-2222', memo: '메모 A', updatedAt: '' }
const b: Candidate = { ...a, id: 'b', name: '이지우', role: '백엔드', email: 'b@x.com', memo: '메모 B' }

function setup() {
  const client = new QueryClient()
  client.setQueryData(candidatesQueryOptions.queryKey, [a, b])
  render(
    <QueryClientProvider client={client}>
      <CandidateCard candidate={a} /><CandidateCard candidate={b} />
      <DetailPanel />
    </QueryClientProvider>,
  )
}

describe('DetailPanel', () => {
  beforeEach(() => useDetailStore.setState({ selectedId: null, opener: null }))

  it('이름을 누르면 상세가 열리고 닫기 버튼에 포커스가 간다', async () => {
    setup()
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-hidden', 'true')
    await userEvent.click(screen.getByRole('button', { name: '김서준' }))
    const dialog = screen.getByRole('dialog', { name: '김서준' })
    expect(dialog).toHaveTextContent('a@x.com')
    expect(dialog).toHaveTextContent('010-1111-2222')
    expect(dialog).toHaveTextContent('메모 A')
    expect(screen.getByRole('button', { name: '상세 닫기' })).toHaveFocus()
  })

  it('Esc로 닫히고 눌렀던 이름으로 포커스가 돌아간다', async () => {
    setup()
    const opener = screen.getByRole('button', { name: '김서준' })
    await userEvent.click(opener)
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-hidden', 'true')
    expect(opener).toHaveFocus()
  })

  it('열린 채로 다른 카드를 누르면 내용만 바뀌고, 닫으면 처음 연 이름으로 돌아간다', async () => {
    setup()
    const first = screen.getByRole('button', { name: '김서준' })
    await userEvent.click(first)
    await userEvent.click(screen.getByRole('button', { name: '이지우' }))
    expect(screen.getByRole('dialog', { name: '이지우' })).toHaveTextContent('메모 B')
    await userEvent.click(screen.getByRole('button', { name: '상세 닫기' }))
    expect(first).toHaveFocus()
  })

  it('패널 안에도 단계 셀렉트가 있다', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: '김서준' }))
    const dialog = screen.getByRole('dialog', { name: '김서준' })
    expect(dialog.querySelector('select')).toHaveValue('면접')
  })

  it('백드롭을 누르면 닫힌다', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: '김서준' }))
    const backdrop = document.querySelector('[aria-hidden="true"].fixed.inset-0')!
    await userEvent.click(backdrop)
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-hidden', 'true')
  })
})

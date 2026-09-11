import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Candidate } from '../../api'
import { Board } from './Board'
import { BoardSkeleton } from './BoardSkeleton'

const list: Candidate[] = [
  { id: 'a', name: '김서준', role: '프론트엔드', appliedAt: '2026-09-01', stage: '서류검토', email: '', phone: '', memo: '', updatedAt: '' },
  { id: 'b', name: '이지우', role: '백엔드', appliedAt: '2026-09-02', stage: '서류검토', email: '', phone: '', memo: '', updatedAt: '' },
  { id: 'c', name: '박하은', role: '디자인', appliedAt: '2026-09-03', stage: '불합격', email: '', phone: '', memo: '', updatedAt: '' },
]

vi.mock('../../api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api')>()
  return { ...mod, api: { fetchCandidates: () => Promise.resolve(list), moveCandidate: vi.fn() } }
})

function renderBoard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <Suspense fallback={<BoardSkeleton />}>
        <Board />
      </Suspense>
    </QueryClientProvider>,
  )
}

describe('Board', () => {
  it('로딩 중엔 스켈레톤, 이후 다섯 컬럼과 건수를 보여준다', async () => {
    renderBoard()
    expect(screen.getByRole('status', { name: '지원자 목록을 불러오는 중' })).toBeInTheDocument()

    const first = await screen.findByRole('heading', { name: '서류검토' })
    expect(first).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(5)

    const column = screen.getByRole('region', { name: '서류검토' })
    expect(column).toHaveTextContent('2')
    expect(screen.getByRole('region', { name: '불합격' })).toHaveTextContent('1')
    expect(screen.getByRole('region', { name: '면접' })).toHaveTextContent('0')
  })
})

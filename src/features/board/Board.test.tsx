import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { api, type Candidate } from '../../api'
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

  it('카드는 자기 단계의 컬럼 안에만 있다', async () => {
    renderBoard()
    await screen.findByRole('heading', { name: '서류검토' })
    const docs = screen.getByRole('region', { name: '서류검토' })
    const rejected = screen.getByRole('region', { name: '불합격' })
    expect(docs).toHaveTextContent('김서준')
    expect(docs).toHaveTextContent('이지우')
    expect(docs).not.toHaveTextContent('박하은')
    expect(rejected).toHaveTextContent('박하은')
  })

  it('셀렉트로 단계를 옮기면 카드가 그 컬럼으로 간다', async () => {
    vi.mocked(api.moveCandidate).mockImplementation(async (id, to) => ({ ...list.find((c) => c.id === id)!, stage: to }))
    renderBoard()
    await screen.findByRole('heading', { name: '서류검토' })
    await userEvent.selectOptions(screen.getByRole('combobox', { name: '김서준 단계 이동' }), '면접')
    const interview = screen.getByRole('region', { name: '면접' })
    expect(await within(interview).findByText('김서준')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '서류검토' })).not.toHaveTextContent('김서준')
    expect(interview).toHaveTextContent('1')
  })

  it('이름 검색과 직무 필터가 동시에 걸린다', async () => {
    renderBoard()
    await screen.findByRole('heading', { name: '서류검토' })
    await userEvent.type(screen.getByRole('searchbox', { name: '이름 검색' }), '지우')
    await waitFor(() => expect(screen.getByRole('region', { name: '서류검토' })).not.toHaveTextContent('김서준'))
    expect(screen.getByRole('region', { name: '서류검토' })).toHaveTextContent('이지우')

    await userEvent.selectOptions(screen.getByRole('combobox', { name: '직무 필터' }), '프론트엔드')
    // 이지우(백엔드)는 프론트엔드 필터에 걸려 0건 → 컬럼 대신 안내 문구
    expect(await screen.findByText(/조건에 맞는 지원자가 없습니다/)).toBeInTheDocument()
  })
})

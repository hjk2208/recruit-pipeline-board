import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { api, ApiError, type Candidate } from '../../api'
import { Board } from '../board/Board'
import { BoardError } from './BoardError'
import { ErrorBoundary } from './ErrorBoundary'

vi.mock('../../api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api')>()
  return { ...mod, api: { fetchCandidates: vi.fn(), moveCandidate: vi.fn() } }
})

const list: Candidate[] = [
  { id: 'a', name: '김서준', role: '프론트엔드', appliedAt: '2026-09-01', stage: '서류검토', email: '', phone: '', memo: '', updatedAt: '' },
]

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset} fallback={(e, retry) => <BoardError error={e} onRetry={retry} />}>
            <Suspense fallback={<p>로딩</p>}>
              <Board />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>,
  )
}

describe('로딩 / 에러 / 빈 상태', () => {
  it('초기 조회 실패 → 에러 + 재시도 → 성공하면 보드', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(api.fetchCandidates)
      .mockImplementationOnce(() => Promise.reject(new ApiError('NETWORK', 503, true, '네트워크 오류가 발생했습니다.')))
      .mockImplementationOnce(() => Promise.resolve(list))
    renderApp()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('네트워크 오류가 발생했습니다.')
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByRole('heading', { name: '서류검토' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    spy.mockRestore()
  })

  it('데이터가 0건이면 빈 상태 안내', async () => {
    vi.mocked(api.fetchCandidates).mockImplementation(() => Promise.resolve([]))
    renderApp()
    expect(await screen.findByText('아직 등록된 지원자가 없습니다.')).toBeInTheDocument()
  })

  it('검색 결과 0건이면 안내, 카드 없는 컬럼엔 빈 컬럼 안내', async () => {
    vi.mocked(api.fetchCandidates).mockImplementation(() => Promise.resolve(list))
    renderApp()
    await screen.findByRole('heading', { name: '서류검토' })
    expect(screen.getByRole('region', { name: '면접' })).toHaveTextContent('이 단계의 지원자 없음')
    await userEvent.type(screen.getByRole('searchbox', { name: '이름 검색' }), '없는이름')
    expect(await screen.findByText(/조건에 맞는 지원자가 없습니다/)).toBeInTheDocument()
  })
})

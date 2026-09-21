import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, type Candidate } from '../../api'
import { Board } from '../board/Board'
import { DetailPanel } from '../detail-panel/DetailPanel'
import { useDetailStore } from '../detail-panel/detailStore'

vi.mock('../../api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api')>()
  return { ...mod, api: { fetchCandidates: vi.fn(), moveCandidate: vi.fn() } }
})

const list: Candidate[] = [
  { id: 'a', name: '김서준', role: '프론트엔드', appliedAt: '2026-09-01', stage: '서류검토', email: 'a@x', phone: '1', memo: '', updatedAt: '' },
  { id: 'b', name: '이지우', role: '백엔드', appliedAt: '2026-09-02', stage: '서류검토', email: 'b@x', phone: '2', memo: '', updatedAt: '' },
  { id: 'c', name: '박하은', role: '디자인', appliedAt: '2026-09-03', stage: '면접', email: 'c@x', phone: '3', memo: '', updatedAt: '' },
]

function setMobile(mobile: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes('768') ? !mobile : false, media: q, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  }))
}

async function setup() {
  vi.mocked(api.fetchCandidates).mockImplementation(() => Promise.resolve(list))
  vi.mocked(api.moveCandidate).mockImplementation(async (id, to) => ({ ...list.find((c) => c.id === id)!, stage: to }))
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <Suspense fallback={<p>로딩</p>}>
        <Board />
        <DetailPanel />
      </Suspense>
    </QueryClientProvider>,
  )
  await screen.findByRole('heading', { name: '서류검토' })
}

describe('키보드 접근성', () => {
  beforeEach(() => {
    useDetailStore.setState({ selectedId: null, opener: null })
    setMobile(false)
  })

  it('컬럼 안에서 ↓/↑로 카드 사이를 이동한다 (끝에서 순환)', async () => {
    await setup()
    const a = screen.getByRole('button', { name: '김서준' })
    a.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('button', { name: '이지우' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(a).toHaveFocus() // 순환
    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('button', { name: '이지우' })).toHaveFocus()
  })

  it('카드 이름에서 Enter/Space로 상세가 열리고 Esc로 닫히며 포커스가 돌아온다', async () => {
    await setup()
    const name = screen.getByRole('button', { name: '김서준' })
    name.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('dialog', { name: '김서준' })).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByRole('button', { name: '상세 닫기' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(name).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(screen.getByRole('dialog', { name: '김서준' })).toHaveAttribute('aria-hidden', 'false')
  })

  it('→/←로 옆 컬럼의 같은 순번 카드로 이동하고, 없으면 첫 카드, 끝에서 순환', async () => {
    await setup()
    screen.getByRole('button', { name: '이지우' }).focus() // 서류검토 2번째
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: '박하은' })).toHaveFocus() // 면접엔 1장뿐 → 첫 카드
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('button', { name: '김서준' })).toHaveFocus() // 면접 1번째 → 서류검토 1번째
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('button', { name: '박하은' })).toHaveFocus() // 왼쪽으로 순환: 불합격·최종합격·처우협의는 비어서 건너뛰고 면접
  })

  it('컬럼 헤더에 다음 컬럼으로 건너뛰는 링크가 있다', async () => {
    await setup()
    const skip = screen.getByRole('link', { name: '면접 컬럼으로 건너뛰기' })
    expect(skip).toHaveAttribute('href', '#column-section-면접')
    expect(screen.getByRole('link', { name: '서류검토 컬럼으로 건너뛰기' })).toBeInTheDocument() // 마지막 컬럼은 처음으로 순환
    expect(screen.getAllByRole('link', { name: /컬럼으로 건너뛰기/ })).toHaveLength(5)
  })

  it('셀렉트로 단계를 옮겨 카드가 다른 컬럼으로 가도 포커스가 그 셀렉트에 남는다', async () => {
    await setup()
    const select = screen.getByRole('combobox', { name: '김서준 단계 이동' })
    select.focus()
    await userEvent.selectOptions(select, '면접')
    await waitFor(() => expect(screen.getByRole('region', { name: '면접' })).toHaveTextContent('김서준'))
    await waitFor(() => expect(screen.getByRole('combobox', { name: '김서준 단계 이동' })).toHaveFocus())
  })

  it('모바일 시트에서는 Tab이 시트 안에서 순환한다', async () => {
    setMobile(true)
    await setup()
    await userEvent.click(screen.getByRole('button', { name: '김서준' }))
    const close = screen.getByRole('button', { name: '상세 닫기' })
    expect(close).toHaveFocus()
    await userEvent.tab({ shift: true }) // 첫 요소에서 뒤로 → 마지막 요소
    const dialog = screen.getByRole('dialog', { name: '김서준' })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    expect(document.activeElement).not.toBe(close)
    await userEvent.tab() // 마지막에서 앞으로 → 첫 요소
    expect(close).toHaveFocus()
  })

  it('PC에서는 Tab이 패널 밖으로 나갈 수 있다 (non-modal)', async () => {
    await setup()
    await userEvent.click(screen.getByRole('button', { name: '김서준' }))
    const dialog = screen.getByRole('dialog', { name: '김서준' })
    for (let i = 0; i < 8; i++) await userEvent.tab()
    expect(dialog).not.toContainElement(document.activeElement as HTMLElement)
  })
})

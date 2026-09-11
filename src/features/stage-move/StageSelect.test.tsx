import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { api, type Candidate } from '../../api'
import { candidatesQueryOptions } from '../board/queries'
import { StageSelect } from './StageSelect'

vi.mock('../../api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api')>()
  return { ...mod, api: { fetchCandidates: vi.fn(), moveCandidate: vi.fn() } }
})

const c: Candidate = {
  id: 'c1', name: '김서준', role: 'PM', appliedAt: '2026-08-20', stage: '서류검토',
  email: '', phone: '', memo: '', updatedAt: '',
}
const other: Candidate = { ...c, id: 'c2', name: '이지우', stage: '면접' }

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  client.setQueryData(candidatesQueryOptions.queryKey, [c, other])
  render(
    <QueryClientProvider client={client}>
      <StageSelect candidate={c} />
    </QueryClientProvider>,
  )
  return client
}

describe('StageSelect', () => {
  // 테스트마다 moveCandidate 구현을 명시한다. beforeEach에서 mockReset을 걸면 vitest 5에서
  // 이후 mockImplementation(() => Promise.reject(...))의 거부가 미처리로 잡혀 테스트가 실패한다.
  it('단계를 고르면 moveCandidate를 호출하고, 응답으로 캐시의 그 항목만 교체한다', async () => {
    let resolve!: (v: Candidate) => void
    vi.mocked(api.moveCandidate).mockReturnValue(new Promise((r) => (resolve = r)))
    const client = setup()
    const select = screen.getByRole('combobox', { name: '김서준 단계 이동' })

    await userEvent.selectOptions(select, '면접')
    expect(api.moveCandidate).toHaveBeenCalledWith('c1', '면접')
    await waitFor(() => expect(select).toBeDisabled()) // 진행 중
    // 아직 낙관적 갱신은 없다 — 캐시는 그대로
    expect(client.getQueryData(candidatesQueryOptions.queryKey)?.[0].stage).toBe('서류검토')

    resolve({ ...c, stage: '면접', updatedAt: '2026-09-11T10:00:00.000Z' })
    await waitFor(() => expect(select).toBeEnabled())
    const list = client.getQueryData(candidatesQueryOptions.queryKey)!
    expect(list[0].stage).toBe('면접')
    expect(list[1]).toBe(other) // 다른 항목은 참조 그대로
  })

  it('실패하면 캐시를 건드리지 않고 다시 고를 수 있다', async () => {
    vi.mocked(api.moveCandidate).mockImplementation(() => Promise.reject(new Error('boom')))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const client = setup()
    const select = screen.getByRole('combobox', { name: '김서준 단계 이동' })

    await userEvent.selectOptions(select, '불합격')
    await waitFor(() => expect(select).toBeEnabled())
    expect(client.getQueryData(candidatesQueryOptions.queryKey)?.[0].stage).toBe('서류검토')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

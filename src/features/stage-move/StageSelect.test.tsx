import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, type Candidate } from '../../api'
import { candidatesQueryOptions } from '../board/queries'
import { Toaster } from '../toast/Toaster'
import { useToastStore } from '../toast/toastStore'
import { StageSelect } from './StageSelect'

vi.mock('../../api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api')>()
  return { ...mod, api: { fetchCandidates: vi.fn(), moveCandidate: vi.fn() } }
})

const c: Candidate = {
  id: 'c1', name: '김서준', role: 'PM', appliedAt: '2026-08-20', stage: '서류검토',
  email: '', phone: '', memo: '', updatedAt: '',
}
const other: Candidate = { ...c, id: 'c2', name: '이지우', stage: '서류검토' }
const key = candidatesQueryOptions.queryKey
const stageOf = (client: QueryClient, id: string) => client.getQueryData(key)?.find((x) => x.id === id)?.stage

/** 호출마다 resolve/reject를 밖에서 제어할 수 있는 moveCandidate mock */
function controllable() {
  const calls: Array<{ id: string; to: Candidate['stage']; resolve: (v: Candidate) => void; reject: (e: unknown) => void }> = []
  vi.mocked(api.moveCandidate).mockImplementation(
    (id, to) => new Promise<Candidate>((resolve, reject) => calls.push({ id, to, resolve, reject })),
  )
  return calls
}

function setup(...cards: Candidate[]) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  client.setQueryData(key, cards)
  render(
    <QueryClientProvider client={client}>
      {cards.map((x) => <StageSelect key={x.id} candidate={x} />)}
      <Toaster />
    </QueryClientProvider>,
  )
  return client
}

describe('StageSelect — 낙관적 업데이트', () => {
  // 테스트마다 moveCandidate 구현을 명시한다(beforeEach mockReset은 vitest 5에서 거부 처리와 충돌).
  beforeEach(() => useToastStore.setState({ toasts: [] }))

  it('성공: 고르는 즉시 캐시가 바뀌고, 응답 후 서버값으로 교체된다', async () => {
    const calls = controllable()
    const client = setup(c)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: '김서준 단계 이동' }), '면접')

    expect(stageOf(client, 'c1')).toBe('면접') // 응답 전인데 이미 옮겨짐
    expect(calls).toHaveLength(1)

    calls[0].resolve({ ...c, stage: '면접', updatedAt: '2026-09-11T10:00:00.000Z' })
    await waitFor(() => expect(client.getQueryData(key)?.[0].updatedAt).toBe('2026-09-11T10:00:00.000Z'))
    expect(screen.queryByRole('button', { name: '재시도' })).not.toBeInTheDocument()
  })

  it('실패: 그 카드만 원래 단계로 돌아가고 재시도 토스트가 뜬다', async () => {
    const calls = controllable()
    const client = setup(c)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: '김서준 단계 이동' }), '불합격')
    expect(stageOf(client, 'c1')).toBe('불합격')

    calls[0].reject(new ApiError('NETWORK', 503, true, '네트워크 오류'))
    await waitFor(() => expect(stageOf(client, 'c1')).toBe('서류검토'))
    expect(screen.getByRole('status')).toHaveTextContent('김서준 이동에 실패해 원래 단계로 되돌렸습니다.')

    await userEvent.click(screen.getByRole('button', { name: '재시도' }))
    expect(calls).toHaveLength(2)
    expect(calls[1]).toMatchObject({ id: 'c1', to: '불합격' })
    expect(stageOf(client, 'c1')).toBe('불합격') // 재시도도 낙관적
  })

  it('재시도 불가 에러면 재시도 버튼이 없다', async () => {
    const calls = controllable()
    setup(c)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: '김서준 단계 이동' }), '면접')
    calls[0].reject(new ApiError('NOT_FOUND', 404, false, '없음'))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('실패'))
    expect(screen.queryByRole('button', { name: '재시도' })).not.toBeInTheDocument()
  })

  it('두 장 동시 이동 중 하나가 실패해도 다른 장의 이동은 남는다', async () => {
    const calls = controllable()
    const client = setup(c, other)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: '김서준 단계 이동' }), '면접')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: '이지우 단계 이동' }), '처우협의')
    expect(stageOf(client, 'c1')).toBe('면접')
    expect(stageOf(client, 'c2')).toBe('처우협의')

    calls[0].reject(new ApiError('NETWORK', 503, true, '네트워크 오류')) // 김서준 실패
    await waitFor(() => expect(stageOf(client, 'c1')).toBe('서류검토'))
    expect(stageOf(client, 'c2')).toBe('처우협의') // 이지우는 그대로 진행 중

    calls[1].resolve({ ...other, stage: '처우협의' })
    await waitFor(() => expect(screen.getByRole('combobox', { name: '이지우 단계 이동' })).toBeEnabled())
    expect(stageOf(client, 'c2')).toBe('처우협의')
  })

  it('같은 카드를 빠르게 두 번 옮기고 두 번째가 실패하면, 서버가 확정한 첫 번째 결과로 돌아간다', async () => {
    const calls = controllable()
    const client = setup(c) // 서류검토
    const select = screen.getByRole('combobox', { name: '김서준 단계 이동' })

    await userEvent.selectOptions(select, '면접') // 1차: 서류검토 → 면접 (진행 중)
    expect(stageOf(client, 'c1')).toBe('면접')

    // 2차: 면접 → 처우협의. 1차가 아직 안 끝났다.
    // 카드 셀렉트는 진행 중 disabled지만, 상세 패널의 셀렉트로 같은 카드를 또 옮길 수 있다 — 그 경로를 흉내 낸다
    ;(select as HTMLSelectElement).disabled = false
    await userEvent.selectOptions(select, '처우협의')
    expect(stageOf(client, 'c1')).toBe('처우협의')

    // 1차 성공(서버: 면접) → 그 뒤에야 2차가 나간다(카드별 직렬화)
    calls[0].resolve({ ...c, stage: '면접', updatedAt: '2026-09-11T10:00:00.000Z' })
    await waitFor(() => expect(calls.length).toBe(2))
    calls[1].reject(new ApiError('NETWORK', 503, true, '네트워크 오류'))
    await waitFor(() => expect(select).toBeEnabled()) // 두 요청 모두 정산된 뒤에 확인

    expect(stageOf(client, 'c1')).toBe('면접') // 서버가 확정한 값
  })

  it('같은 카드 두 번 이동 중 둘 다 실패하면 원래 단계(서류검토)로 돌아간다', async () => {
    const calls = controllable()
    const client = setup(c)
    const select = screen.getByRole('combobox', { name: '김서준 단계 이동' })

    await userEvent.selectOptions(select, '면접')
    ;(select as HTMLSelectElement).disabled = false
    await userEvent.selectOptions(select, '처우협의')
    expect(stageOf(client, 'c1')).toBe('처우협의')

    calls[0].reject(new ApiError('NETWORK', 503, true, '1차 실패'))
    await waitFor(() => expect(calls.length).toBe(2))
    calls[1].reject(new ApiError('NETWORK', 503, true, '2차 실패'))
    await waitFor(() => expect(select).toBeEnabled()) // 두 요청 모두 정산된 뒤에 확인

    // 직렬화 전에는 2차의 "이전 단계"가 1차의 낙관적 값(면접)이라 서버(서류검토)와 어긋났다
    expect(stageOf(client, 'c1')).toBe('서류검토')
  })
})

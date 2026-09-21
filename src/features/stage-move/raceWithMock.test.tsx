import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY } from '../../api/mock/createMockApi'
import type { Candidate } from '../../api/types'
import { candidatesQueryOptions } from '../board/queries'
import { StageSelect } from './StageSelect'

// vi.mock 팩토리는 호이스팅되므로 공유 상태는 vi.hoisted로
const h = vi.hoisted(() => {
  const memory = new Map<string, string>()
  const state = { plan: [] as boolean[], cursor: 0 }
  return {
    memory,
    state,
    storage: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => void memory.set(k, v),
      removeItem: (k: string) => void memory.delete(k),
    },
    // random()은 요청당 두 번: [지연, 실패 판정]. 지연은 0, 실패 판정은 plan대로 (0.9=성공, 0.1=실패, failRate 0.5 기준)
    random: () => (state.cursor++ % 2 === 0 ? 0 : state.plan.shift() === false ? 0.1 : 0.9),
  }
})

vi.mock('../../api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api')>()
  const { createMockApi } = await import('../../api/mock/createMockApi')
  return {
    ...mod,
    api: createMockApi({ delayMs: { min: 0, max: 0 }, failRate: { read: 0, write: 0.5 }, random: h.random, storage: h.storage, seed: () => [] }),
  }
})
const { memory, state } = h

const c: Candidate = { id: 'c1', name: '김서준', role: 'PM', appliedAt: '2026-08-20', stage: '서류검토', email: '', phone: '', memo: '', updatedAt: '' }
const stored = () => (JSON.parse(memory.get(STORAGE_KEY)!) as Candidate[])[0].stage

async function run(pattern: boolean[]) {
  memory.set(STORAGE_KEY, JSON.stringify([c]))
  state.plan = [...pattern]; state.cursor = 0
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  client.setQueryData(candidatesQueryOptions.queryKey, [c])
  const r = render(<QueryClientProvider client={client}><StageSelect candidate={c} /></QueryClientProvider>)
  const select = screen.getByRole('combobox') as HTMLSelectElement
  for (const to of ['면접', '처우협의', '최종합격'] as const) {
    select.disabled = false
    await userEvent.selectOptions(select, to)
  }
  await waitFor(() => expect(select).toBeEnabled(), { timeout: 3000 })
  await new Promise((res) => setTimeout(res, 20))
  const shown = client.getQueryData(candidatesQueryOptions.queryKey)![0].stage
  r.unmount()
  return { shown, stored: stored() }
}

describe('같은 카드 3연속 이동 — 실제 mock으로 성공/실패 조합', () => {
  it.each([
    [[true, true, true], '최종합격'],
    [[true, false, false], '면접'],
    [[false, false, false], '서류검토'],
    [[false, true, false], '처우협의'],
    [[true, false, true], '최종합격'],
    [[false, false, true], '최종합격'],
  ])('%j → 화면=저장소=%s', async (pattern, expected) => {
    const { shown, stored } = await run(pattern as boolean[])
    expect(stored).toBe(expected)
    expect(shown).toBe(stored)
  })
})

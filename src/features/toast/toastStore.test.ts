import { beforeEach, describe, expect, it } from 'vitest'
import { toast, useToastStore } from './toastStore'

describe('toastStore', () => {
  beforeEach(() => useToastStore.setState({ toasts: [] }))

  it('같은 key의 이전 토스트는 새 토스트가 뜰 때 정리된다', () => {
    toast.error('1차 실패', undefined, 'card-a')
    toast.error('2차 실패', undefined, 'card-a')
    toast.error('다른 카드', undefined, 'card-b')
    const msgs = useToastStore.getState().toasts.map((t) => t.message)
    expect(msgs).toEqual(['2차 실패', '다른 카드'])
  })

  it('key가 없으면 쌓인다', () => {
    toast.error('a')
    toast.error('b')
    expect(useToastStore.getState().toasts).toHaveLength(2)
  })
})

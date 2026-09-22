import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INFO_TOAST_MS, toast, useToastStore } from './toastStore'

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

  describe('자동 닫힘', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('info 토스트는 INFO_TOAST_MS 뒤에 사라지고, error 토스트는 남는다', () => {
      toast.info('옮겼습니다')
      toast.error('실패했습니다')
      expect(useToastStore.getState().toasts).toHaveLength(2)
      vi.advanceTimersByTime(INFO_TOAST_MS - 1)
      expect(useToastStore.getState().toasts).toHaveLength(2)
      vi.advanceTimersByTime(1)
      expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual(['실패했습니다'])
    })
  })
})

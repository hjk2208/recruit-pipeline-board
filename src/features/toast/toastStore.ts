import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  tone: 'error' | 'info'
  /** 같은 key의 이전 토스트는 새 토스트가 뜰 때 정리한다 (예: 같은 카드의 연속 실패) */
  key?: string
  /** ms. 지나면 자동으로 닫힌다. 없으면 사용자가 닫을 때까지 남는다 */
  duration?: number
  action?: { label: string; onClick: () => void }
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++
    set((s) => ({
      toasts: [...s.toasts.filter((t) => !toast.key || t.key !== toast.key), { ...toast, id }],
    }))
    if (toast.duration) setTimeout(() => useToastStore.getState().dismiss(id), toast.duration)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** 컴포넌트 밖(훅 콜백)에서 쓰는 진입점 */
/** 성공 알림은 자동으로 닫힌다. 되돌리기 버튼을 누를 여유는 주되 쌓이지 않게 */
export const INFO_TOAST_MS = 5000

export const toast = {
  error: (message: string, action?: Toast['action'], key?: string) =>
    useToastStore.getState().push({ message, tone: 'error', action, key }),
  info: (message: string, action?: Toast['action'], key?: string) =>
    useToastStore.getState().push({ message, tone: 'info', action, key, duration: INFO_TOAST_MS }),
}

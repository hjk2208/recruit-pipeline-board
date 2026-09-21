import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  tone: 'error' | 'info'
  /** 같은 key의 이전 토스트는 새 토스트가 뜰 때 정리한다 (예: 같은 카드의 연속 실패) */
  key?: string
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
  push: (toast) =>
    set((s) => ({
      toasts: [...s.toasts.filter((t) => !toast.key || t.key !== toast.key), { ...toast, id: nextId++ }],
    })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** 컴포넌트 밖(훅 콜백)에서 쓰는 진입점 */
export const toast = {
  error: (message: string, action?: Toast['action'], key?: string) =>
    useToastStore.getState().push({ message, tone: 'error', action, key }),
}

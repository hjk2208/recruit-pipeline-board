import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  tone: 'error' | 'info'
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
  push: (toast) => set((s) => ({ toasts: [...s.toasts, { ...toast, id: nextId++ }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** 컴포넌트 밖(훅 콜백)에서 쓰는 진입점 */
export const toast = {
  error: (message: string, action?: Toast['action']) =>
    useToastStore.getState().push({ message, tone: 'error', action }),
}

import { create } from 'zustand'

interface DetailState {
  /** 열린 카드의 id. 서버 데이터는 두지 않는다 — 패널이 캐시에서 찾아 최신값을 본다 */
  selectedId: string | null
  /** 패널을 연 요소. 닫을 때 포커스를 돌려준다 */
  opener: HTMLElement | null
  open: (id: string, opener: HTMLElement | null) => void
  close: () => void
}

export const useDetailStore = create<DetailState>((set, get) => ({
  selectedId: null,
  opener: null,
  open: (id, opener) =>
    // 이미 열린 채로 다른 카드를 누르면 내용만 바뀌고, 최초 opener는 유지한다
    set((s) => ({ selectedId: id, opener: s.selectedId ? s.opener : opener })),
  close: () => {
    const { opener } = get()
    set({ selectedId: null, opener: null })
    opener?.focus()
  },
}))

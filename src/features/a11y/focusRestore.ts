/**
 * 마운트 시점에 포커스를 되찾아야 하는 요소를 기억한다.
 * - select: 셀렉트로 단계를 옮기면 카드가 다른 컬럼으로 리마운트되어 포커스가 body로 떨어진다
 * - name:   가상 스크롤에서 ↑/↓·←/→ 목표 카드가 아직 DOM에 없을 때, scrollToIndex 후 마운트되면 포커스
 */
type Slot = 'select' | 'name'
const pending: Record<Slot, string | null> = { select: null, name: null }

export function rememberFocus(id: string, slot: Slot = 'select') {
  pending[slot] = id
}

export function claimFocus(id: string, el: HTMLElement | null, slot: Slot = 'select') {
  if (pending[slot] !== id || !el) return
  pending[slot] = null
  el.focus()
}

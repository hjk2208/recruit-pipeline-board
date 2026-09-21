/**
 * 셀렉트로 단계를 옮기면 카드가 다른 컬럼으로 리마운트되어 포커스가 body로 떨어진다.
 * 이동 직전에 id를 기억해 두고, 같은 id의 셀렉트가 다시 마운트되면 포커스를 돌려준다.
 */
let pendingId: string | null = null

export function rememberFocus(id: string) {
  pendingId = id
}

export function claimFocus(id: string, el: HTMLElement | null) {
  if (pendingId !== id || !el) return
  pendingId = null
  el.focus()
}

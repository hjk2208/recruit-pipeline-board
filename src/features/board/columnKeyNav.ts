import { STAGES, type Stage } from '../../api'

export interface NavTarget {
  stage: Stage
  index: number
}

/**
 * 카드 이름 버튼에서 화살표를 눌렀을 때 갈 곳. DOM이 아니라 목록(인덱스)으로 계산한다 —
 * 가상 스크롤에선 목표 카드가 아직 DOM에 없을 수 있기 때문.
 * ↑/↓ 같은 컬럼 순환, ←/→ 옆 컬럼 같은 순번(없으면 첫 카드), 빈 컬럼은 건너뜀.
 */
export function nextTarget(
  key: string,
  from: NavTarget,
  lengthOf: (stage: Stage) => number,
): NavTarget | null {
  const len = lengthOf(from.stage)
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    if (len === 0) return null
    const d = key === 'ArrowDown' ? 1 : -1
    return { stage: from.stage, index: (from.index + d + len) % len }
  }
  if (key === 'ArrowRight' || key === 'ArrowLeft') {
    const d = key === 'ArrowRight' ? 1 : -1
    let idx = STAGES.indexOf(from.stage)
    for (let step = 0; step < STAGES.length - 1; step++) {
      idx = (idx + d + STAGES.length) % STAGES.length
      const n = lengthOf(STAGES[idx])
      if (n > 0) return { stage: STAGES[idx], index: Math.min(from.index, n - 1) }
    }
    return null
  }
  return null
}

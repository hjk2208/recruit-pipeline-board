import type { KeyboardEvent, ReactNode } from 'react'
import { STAGES, type Stage } from '../../api'

interface Props {
  stage: Stage
  count: number
  children?: ReactNode
}

const CARD_FOCUS = 'li > div > button[aria-haspopup]'

/**
 * 카드 이름 버튼에서 ↑/↓는 같은 컬럼 안 순환, ←/→는 옆 컬럼의 같은 순번(없으면 첫 카드)으로.
 * Tab으로 250장을 지나지 않게 하는 주 경로. 건너뛰기 링크는 보조.
 */
function onArrow(e: KeyboardEvent<HTMLUListElement>, stage: Stage) {
  const vertical = e.key === 'ArrowDown' || e.key === 'ArrowUp'
  const horizontal = e.key === 'ArrowRight' || e.key === 'ArrowLeft'
  if (!vertical && !horizontal) return
  const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>(CARD_FOCUS))
  const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
  if (i === -1) return
  e.preventDefault()
  if (vertical) {
    buttons[(i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus()
    return
  }
  // 빈 컬럼은 건너뛰고 카드가 있는 가장 가까운 옆 컬럼으로
  const dir = e.key === 'ArrowRight' ? 1 : -1
  let idx = STAGES.indexOf(stage)
  for (let step = 0; step < STAGES.length - 1; step++) {
    idx = (idx + dir + STAGES.length) % STAGES.length
    const siblings = Array.from(
      document.querySelectorAll<HTMLButtonElement>(`#column-section-${STAGES[idx]} ${CARD_FOCUS}`),
    )
    if (siblings.length > 0) {
      ;(siblings[i] ?? siblings[0]).focus()
      return
    }
  }
}

export function BoardColumn({ stage, count, children }: Props) {
  const next = STAGES[(STAGES.indexOf(stage) + 1) % STAGES.length]
  return (
    <section
      id={`column-section-${stage}`}
      tabIndex={-1}
      aria-labelledby={`column-${stage}`}
      className="flex min-h-0 min-w-72 snap-start flex-col rounded-md border border-border bg-surface md:min-w-0"
    >
      <header className="relative flex items-center justify-between border-b border-border px-3 py-2">
        <h2 id={`column-${stage}`} className="text-sm font-semibold">
          {stage}
        </h2>
        <span className="rounded-full bg-surface-muted px-2 text-xs font-medium tabular-nums text-text-muted">
          {count}
        </span>
        <a
          href={`#column-section-${next}`}
          className="sr-only absolute top-full left-2 z-10 mt-1 rounded bg-primary px-2 py-1 text-xs text-white focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {next} 컬럼으로 건너뛰기
        </a>
      </header>
      <ul onKeyDown={(e) => onArrow(e, stage)} className="flex min-h-40 flex-1 flex-col gap-2 overflow-y-auto p-2">
        {children}
      </ul>
    </section>
  )
}

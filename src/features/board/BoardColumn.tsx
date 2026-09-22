import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef, type KeyboardEvent } from 'react'
import { STAGES, type Candidate, type Stage } from '../../api'
import { rememberFocus } from '../a11y/focusRestore'
import { CandidateCard } from '../candidate-card/CandidateCard'
import { EmptyState } from '../status/EmptyState'
import { nextTarget } from './columnKeyNav'
import { columnRegistry } from './columnRegistry'

interface Props {
  stage: Stage
  items: readonly Candidate[]
  emptyMessage: string
}

/** 카드 높이 추정치(px). 실제 높이는 measureElement가 잰다 — 직무 길이에 따라 2~3줄 */
const ESTIMATED_CARD_HEIGHT = 96
const GAP = 8

export function BoardColumn({ stage, items, emptyMessage }: Props) {
  const listRef = useRef<HTMLUListElement>(null)
  const ids = useMemo(() => items.map((c) => c.id), [items])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ESTIMATED_CARD_HEIGHT + GAP,
    overscan: 6,
    getItemKey: (i) => ids[i],
    // jsdom처럼 크기를 못 재는 환경에서의 초기값
    initialRect: { width: 280, height: 600 },
  })

  // 키보드 탐색이 옆 컬럼의 목록과 스크롤에 닿도록 등록
  useEffect(() => {
    columnRegistry.set(stage, { ids, scrollToIndex: (i) => virtualizer.scrollToIndex(i, { align: 'auto' }) })
    return () => columnRegistry.delete(stage)
  }, [stage, ids, virtualizer])

  /**
   * ↑/↓ 같은 컬럼, ←/→ 옆 컬럼. 목표를 인덱스로 계산한 뒤 — 가상 스크롤이라 DOM에 없을 수 있으므로 —
   * 이미 마운트돼 있으면 바로 포커스, 아니면 포커스를 예약하고 scrollToIndex로 마운트시킨다.
   */
  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    const fromId = (document.activeElement as HTMLElement | null)?.dataset.cardId
    if (!fromId) return
    const fromIndex = ids.indexOf(fromId)
    if (fromIndex === -1) return
    const target = nextTarget(e.key, { stage, index: fromIndex }, (s) => columnRegistry.get(s)?.ids.length ?? 0)
    if (!target) return
    e.preventDefault()
    const handle = columnRegistry.get(target.stage)
    if (!handle) return
    const id = handle.ids[target.index]
    const mounted = document.querySelector<HTMLButtonElement>(`button[data-card-id="${id}"]`)
    if (mounted) {
      mounted.focus()
      return
    }
    rememberFocus(id, 'name')
    handle.scrollToIndex(target.index)
  }

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
          {items.length}
        </span>
        <a
          href={`#column-section-${next}`}
          className="sr-only absolute top-full left-2 z-10 mt-1 rounded bg-primary px-2 py-1 text-xs text-white focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {next} 컬럼으로 건너뛰기
        </a>
      </header>
      <ul ref={listRef} onKeyDown={onKeyDown} className="relative min-h-40 flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <li className="list-none">
            <EmptyState compact message={emptyMessage} />
          </li>
        ) : (
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => (
              <li
                key={row.key}
                data-index={row.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full list-none pb-2"
                style={{ transform: `translateY(${row.start}px)` }}
              >
                <CandidateCard candidate={items[row.index]} />
              </li>
            ))}
          </div>
        )}
      </ul>
    </section>
  )
}

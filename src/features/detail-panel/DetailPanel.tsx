import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { candidatesQueryOptions } from '../board/queries'
import { StageBadge } from '../candidate-card/StageBadge'
import { StageSelect } from '../stage-move/StageSelect'
import { useDetailStore } from './detailStore'

/**
 * 모바일: 전체 화면 시트 / md~xl: 백드롭 + 오른쪽 오버레이(보드를 밀면 1024px에서 컬럼이 118px로 눌림)
 * / xl(1280) 이상: 보드 옆에 나란히, 폭 트랜지션. 같은 컴포넌트가 뷰포트에 따라 형태만 바꾼다.
 * 트랜지션: 모바일은 아래에서 슬라이드 업, md~xl은 오른쪽에서 슬라이드 인(+백드롭 페이드), xl은 폭 0→320.
 * 그래서 닫혀 있어도 마운트는 유지한다.
 */
export function DetailPanel() {
  const selectedId = useDetailStore((s) => s.selectedId)
  const close = useDetailStore((s) => s.close)
  const queryClient = useQueryClient()
  const candidate = queryClient.getQueryData(candidatesQueryOptions.queryKey)?.find((c) => c.id === selectedId)
  const closeRef = useRef<HTMLButtonElement>(null)
  const asideRef = useRef<HTMLElement>(null)
  const isOpen = Boolean(candidate)
  // 모바일 전체 화면 시트는 모달로 알린다(포커스 트랩과 짝). md 이상은 보드를 계속 조작할 수 있어 non-modal
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches

  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close()
      // 모바일 전체 화면 시트는 뒤가 안 보이므로 포커스를 안에 가둔다. md 이상은 non-modal
      if (e.key !== 'Tab' || window.matchMedia('(min-width: 768px)').matches) return
      const root = asideRef.current
      if (!root) return
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>('button, a[href], select, input, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute('disabled'))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  return (
    <>
      {/* 백드롭: md~xl 오버레이일 때만. 모바일은 시트가 전체 화면이라 불필요, xl 이상은 옆으로 밀리므로 불필요 */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-10 hidden bg-text/30 transition-opacity duration-200 motion-reduce:transition-none md:block xl:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal={isOpen && !isDesktop ? "true" : "false"}
        aria-labelledby="detail-title"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-20 flex flex-col overflow-y-auto bg-surface p-5 transition-[translate,width,opacity] duration-200 ease-out motion-reduce:transition-none
          md:inset-y-4 md:left-auto md:right-4 md:w-80 md:rounded-md md:border md:border-border md:shadow-lg
          xl:static xl:inset-auto xl:shrink-0 xl:shadow-none xl:overflow-hidden xl:translate-none
          ${
            isOpen
              ? 'translate-y-0 md:translate-x-0 xl:w-80 xl:opacity-100'
              : 'translate-y-full md:translate-x-[calc(100%+1rem)] md:translate-y-0 xl:w-0 xl:border-0 xl:p-0 xl:opacity-0'
          }`}
      >
        {candidate && (
          <div className="xl:w-70">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 id="detail-title" className="text-lg font-semibold">
                  {candidate.name}
                </h2>
                <p className="text-sm text-text-muted">{candidate.role}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="상세 닫기"
                className="rounded px-2 py-1 text-text-muted transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
              >
                ✕
              </button>
            </header>

            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-text-muted">단계</dt>
              <dd className="flex items-center gap-2">
                <StageBadge stage={candidate.stage} />
                <StageSelect candidate={candidate} />
              </dd>
              <dt className="text-text-muted">지원일</dt>
              <dd><time dateTime={candidate.appliedAt}>{candidate.appliedAt}</time></dd>
              <dt className="text-text-muted">이메일</dt>
              <dd><a href={`mailto:${candidate.email}`} className="text-primary hover:underline">{candidate.email}</a></dd>
              <dt className="text-text-muted">전화</dt>
              <dd><a href={`tel:${candidate.phone}`} className="text-primary hover:underline">{candidate.phone}</a></dd>
              <dt className="text-text-muted">메모</dt>
              <dd className="text-text">{candidate.memo}</dd>
            </dl>
          </div>
        )}
      </aside>
    </>
  )
}

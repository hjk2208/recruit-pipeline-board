import { useToastStore } from './toastStore'

/** aria-live 영역은 항상 DOM에 있어야 스크린리더가 변화를 읽는다 — 비어 있어도 렌더한다 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  return (
    <div role="status" aria-live="polite" className="fixed right-4 bottom-4 z-10 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between gap-3 rounded-md border border-danger/30 bg-surface px-3 py-2 text-sm shadow-md"
        >
          <p className="text-text">{t.message}</p>
          <div className="flex shrink-0 items-center gap-1">
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick()
                  dismiss(t.id)
                }}
                className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="알림 닫기"
              onClick={() => dismiss(t.id)}
              className="rounded px-2 py-1 text-xs text-text-muted hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

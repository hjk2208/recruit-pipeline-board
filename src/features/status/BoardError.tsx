import { isApiError } from '../../api'

interface Props {
  error: Error
  onRetry: () => void
}

export function BoardError({ error, onRetry }: Props) {
  const message = isApiError(error) ? error.message : '지원자 목록을 불러오지 못했습니다.'
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 rounded-md border border-danger/30 bg-surface p-8 text-center">
      <p className="text-sm text-text">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        다시 시도
      </button>
    </div>
  )
}

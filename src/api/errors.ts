export type ApiErrorCode = 'NETWORK' | 'NOT_FOUND'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  /** true면 같은 요청을 다시 보내도 된다는 뜻 — 토스트의 재시도 버튼 노출 기준 */
  readonly retryable: boolean

  constructor(code: ApiErrorCode, status: number, retryable: boolean, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.retryable = retryable
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError
}

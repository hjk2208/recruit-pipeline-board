import { Component, type ReactNode } from 'react'

interface Props {
  fallback: (error: Error, reset: () => void) => ReactNode
  /** 재시도 시 상위(쿼리 캐시 등)도 함께 리셋할 때 */
  onReset?: () => void
  children: ReactNode
}
interface State {
  error: Error | null
}

/** 렌더 중 throw된 에러(useSuspenseQuery 실패 포함)를 잡아 폴백을 그린다 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => {
    this.props.onReset?.()
    this.setState({ error: null })
  }

  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.reset) : this.props.children
  }
}

import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { Board } from '../features/board/Board'
import { BoardSkeleton } from '../features/board/BoardSkeleton'
import { DetailPanel } from '../features/detail-panel/DetailPanel'
import { Toaster } from '../features/toast/Toaster'
import { queryClient } from './queryClient'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex h-screen flex-col gap-6 bg-surface-muted p-6 text-text">
        <h1 className="text-xl font-semibold">채용 파이프라인 보드</h1>
        <div className="flex min-h-0 flex-1 gap-4">
          <Suspense fallback={<BoardSkeleton />}>
            <Board />
            <DetailPanel />
          </Suspense>
        </div>
        <Toaster />
      </main>
    </QueryClientProvider>
  )
}

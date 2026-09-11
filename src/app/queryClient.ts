import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // mock 실패(15%)가 라이브러리 재시도에 가려지면 롤백을 눈으로 확인할 수 없다.
      // 재시도는 사용자가 누르는 버튼으로 한다.
      retry: false,
      staleTime: 60_000,
    },
    mutations: { retry: false },
  },
})

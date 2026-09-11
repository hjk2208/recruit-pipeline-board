import { queryOptions } from '@tanstack/react-query'
import { api } from '../../api'

/** 목록 쿼리의 key·fetch를 한 곳에. 이동 후 무효화·낙관적 갱신도 이 key를 쓴다 */
export const candidatesQueryOptions = queryOptions({
  queryKey: ['candidates'] as const,
  queryFn: () => api.fetchCandidates(),
})

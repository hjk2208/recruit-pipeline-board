import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type Candidate, type Stage } from '../../api'
import { candidatesQueryOptions } from '../board/queries'

export interface MoveInput {
  id: string
  to: Stage
}

/**
 * 단계 이동. 이 단위에서는 응답이 온 뒤에 캐시를 갱신한다(낙관적 업데이트는 6번 단위).
 * 서버가 갱신된 지원자 하나를 돌려주므로 목록 전체를 다시 받지 않고 그 항목만 교체한다.
 */
export function useMoveCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, to }: MoveInput) => api.moveCandidate(id, to),
    onSuccess: (updated) => {
      queryClient.setQueryData(candidatesQueryOptions.queryKey, (list: Candidate[] | undefined) =>
        list?.map((c) => (c.id === updated.id ? updated : c)),
      )
    },
    onError: (error, { id, to }) => {
      console.error(`단계 이동 실패: ${id} → ${to}`, error)
    },
  })
}

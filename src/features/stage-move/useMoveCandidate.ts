import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, isApiError, type Candidate, type Stage } from '../../api'
import { candidatesQueryOptions } from '../board/queries'
import { toast } from '../toast/toastStore'
import { applyStage, rollbackStage } from './optimistic'

export interface MoveInput {
  id: string
  to: Stage
}

const key = candidatesQueryOptions.queryKey

/**
 * 낙관적 단계 이동.
 * onMutate: 캐시에서 그 항목만 즉시 바꾸고 이전 단계를 컨텍스트로 보관
 * onError:  그 항목만 이전 단계로 되돌리고 토스트(재시도)
 * onSuccess: 서버가 돌려준 항목으로 교체(updatedAt 등 서버값 반영)
 * 목록 전체 스냅샷을 쓰지 않는 이유는 optimistic.ts 참조.
 */
export function useMoveCandidate() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, to }: MoveInput) => api.moveCandidate(id, to),

    onMutate: async ({ id, to }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const current = queryClient.getQueryData(key) ?? []
      const { list, previous } = applyStage(current, id, to)
      queryClient.setQueryData(key, list)
      return { previous }
    },

    onError: (error, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, (list: Candidate[] | undefined) =>
          list ? rollbackStage(list, vars.id, context.previous!) : list,
        )
      }
      const name = queryClient.getQueryData(key)?.find((c) => c.id === vars.id)?.name ?? '지원자'
      const retryable = !isApiError(error) || error.retryable
      toast.error(
        `${name} 이동에 실패해 원래 단계로 되돌렸습니다.`,
        retryable ? { label: '재시도', onClick: () => mutation.mutate(vars) } : undefined,
        vars.id,
      )
    },

    onSuccess: (updated) => {
      queryClient.setQueryData(key, (list: Candidate[] | undefined) =>
        list?.map((c) => (c.id === updated.id ? updated : c)),
      )
    },
  })
  return mutation
}

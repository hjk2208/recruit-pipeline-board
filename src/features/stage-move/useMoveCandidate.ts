import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api, isApiError, type Candidate, type Stage } from '../../api'
import { candidatesQueryOptions } from '../board/queries'
import { toast } from '../toast/toastStore'
import { applyStage, rollbackStage } from './optimistic'

export interface MoveInput {
  id: string
  to: Stage
  /** 되돌리기로 발생한 이동이면 true — 성공해도 되돌리기 토스트를 다시 띄우지 않는다 */
  isUndo?: boolean
}

const key = candidatesQueryOptions.queryKey

/**
 * 카드별 진행 상황. 같은 카드를 연달아 옮길 때 롤백 기준을 "서버가 마지막으로 확정한 단계"로 유지한다.
 * - 첫 요청이 시작될 때 그 시점의 단계를 확정값으로 잡는다 (아직 낙관적 값이 섞이기 전)
 * - 성공하면 서버가 돌려준 단계로 확정값을 갱신한다
 * - 실패하면 확정값으로 되돌린다 — mutate 시점의 캐시(앞 요청의 낙관적 값)가 아니라
 * - 모든 요청이 끝나면 지운다
 */
type InFlight = Map<string, { count: number; confirmed: Stage }>
// QueryClient 단위로 격리 — 앱에선 하나, 테스트에선 클라이언트마다 새로
const trackers = new WeakMap<QueryClient, InFlight>()
function trackerOf(client: QueryClient): InFlight {
  let t = trackers.get(client)
  if (!t) trackers.set(client, (t = new Map()))
  return t
}

/**
 * 낙관적 단계 이동.
 * onMutate: 캐시에서 그 항목만 즉시 바꾼다
 * onError:  그 항목만 확정값으로 되돌리고 토스트(재시도)
 * onSuccess: 서버가 돌려준 항목으로 교체 — 단, 같은 카드의 뒤 요청이 진행 중이면 그쪽 낙관적 값을 유지
 * scope: 같은 카드의 요청은 순서대로 나간다(뒤 요청이 앞 요청을 추월하지 않게). 다른 카드는 병렬.
 * 목록 전체 스냅샷을 쓰지 않는 이유는 optimistic.ts 참조.
 */
/** 카드별 mutation 키. 진행 여부를 컴포넌트 밖(useIsMutating)에서 읽을 때 쓴다 */
export const moveMutationKey = (candidateId: string) => ['move', candidateId] as const

export function useMoveCandidate(candidateId: string) {
  const queryClient = useQueryClient()
  const inFlight = trackerOf(queryClient)
  const mutation = useMutation({
    mutationKey: moveMutationKey(candidateId),
    scope: { id: `move-${candidateId}` },
    mutationFn: ({ id, to }: MoveInput) => api.moveCandidate(id, to),

    onMutate: async ({ id, to }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const current = queryClient.getQueryData(key) ?? []
      const { list, previous } = applyStage(current, id, to)
      queryClient.setQueryData(key, list)
      const entry = inFlight.get(id)
      if (entry) entry.count += 1
      else if (previous) inFlight.set(id, { count: 1, confirmed: previous })
      // 되돌리기의 목적지 = 이 이동 직전 단계. 연속 이동 중이면 앞 이동의 낙관적 값이지만, 그게 사용자가 "방금 전"으로 인식하는 상태다
      return { previous }
    },

    onSuccess: (updated, vars, context) => {
      const entry = inFlight.get(updated.id)
      if (entry) entry.confirmed = updated.stage
      if (!vars.isUndo && context?.previous) {
        const previous = context.previous
        toast.info(
          `${updated.name}을(를) ${updated.stage}(으)로 옮겼습니다.`,
          { label: '되돌리기', onClick: () => mutation.mutate({ id: updated.id, to: previous, isUndo: true }) },
          `undo-${updated.id}`,
        )
      }
      // 뒤 요청이 진행 중이면 그 낙관적 값을 덮어쓰지 않는다 — 서버값은 확정값에만 반영
      if (entry && entry.count > 1) return
      queryClient.setQueryData(key, (list: Candidate[] | undefined) =>
        list?.map((c) => (c.id === updated.id ? updated : c)),
      )
    },

    onError: (error, vars) => {
      const entry = inFlight.get(vars.id)
      if (entry) {
        queryClient.setQueryData(key, (list: Candidate[] | undefined) =>
          list ? rollbackStage(list, vars.id, entry.confirmed) : list,
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

    onSettled: (_data, _error, vars) => {
      const entry = inFlight.get(vars.id)
      if (!entry) return
      entry.count -= 1
      if (entry.count === 0) inFlight.delete(vars.id)
    },
  })
  return mutation
}

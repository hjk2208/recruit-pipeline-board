import { useSuspenseQuery } from '@tanstack/react-query'
import { candidatesQueryOptions } from './queries'

export function useCandidates() {
  return useSuspenseQuery(candidatesQueryOptions).data
}

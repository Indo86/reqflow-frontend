import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/api/request-query-keys'
import {
  assignFulfillment,
  cancelFulfillment,
  completeFulfillment,
  getAssignmentCandidates,
  getFulfillment,
  getFulfillments,
  startFulfillment,
} from '../api/fulfillment-api'
import { fulfillmentKeys, type FulfillmentListFilters } from '../api/fulfillment-query-keys'

// `enabled` lets the request detail page ask only once it knows the request is APPROVED.
export function useFulfillmentQuery(requestId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.forRequest(requestId ?? ''),
    queryFn: () => getFulfillment(requestId as string),
    enabled: enabled && requestId !== undefined,
  })
}

export function useAssignmentCandidatesQuery(requestId: string, enabled: boolean) {
  return useQuery({
    queryKey: fulfillmentKeys.candidates(requestId),
    queryFn: () => getAssignmentCandidates(requestId),
    enabled,
  })
}

export function useFulfillmentsQuery(filters: FulfillmentListFilters) {
  return useQuery({ queryKey: fulfillmentKeys.list(filters), queryFn: () => getFulfillments(filters) })
}

// After any change, refresh this request's fulfillment, the task lists, and the
// request detail (its audit timeline is a child of it) so every view agrees. A
// failed action refreshes too: the usual reason is that someone else changed it.
function useInvalidateAfterChange(requestId: string) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: fulfillmentKeys.forRequest(requestId) })
    void queryClient.invalidateQueries({ queryKey: fulfillmentKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: fulfillmentKeys.candidates(requestId) })
    void queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) })
    void queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
  }
}

export function useStartFulfillmentMutation(requestId: string) {
  const invalidate = useInvalidateAfterChange(requestId)
  return useMutation({ mutationFn: () => startFulfillment(requestId), onSuccess: invalidate, onError: invalidate })
}

export function useCompleteFulfillmentMutation(requestId: string) {
  const invalidate = useInvalidateAfterChange(requestId)
  return useMutation({
    mutationFn: (note: string) => completeFulfillment(requestId, note),
    onSuccess: invalidate,
    onError: invalidate,
  })
}

export function useCancelFulfillmentMutation(requestId: string) {
  const invalidate = useInvalidateAfterChange(requestId)
  return useMutation({
    mutationFn: (reason: string) => cancelFulfillment(requestId, reason),
    onSuccess: invalidate,
    onError: invalidate,
  })
}

export function useAssignFulfillmentMutation(requestId: string) {
  const invalidate = useInvalidateAfterChange(requestId)
  return useMutation({
    mutationFn: (input: { assigneeId: string; reason?: string }) => assignFulfillment(requestId, input),
    onSuccess: invalidate,
    onError: invalidate,
  })
}

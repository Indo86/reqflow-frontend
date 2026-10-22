export interface FulfillmentListFilters {
  page: number
  pageSize: number
  view: 'assigned' | 'unassigned' | 'all'
  state: 'open' | 'closed' | 'all'
}

// Feature-owned keys. Per-request keys are invalidated together with the request
// detail after any change (see hooks/use-fulfillment.ts) so every view agrees.
export const fulfillmentKeys = {
  all: ['fulfillment'] as const,
  lists: () => [...fulfillmentKeys.all, 'list'] as const,
  list: (filters: FulfillmentListFilters) => [...fulfillmentKeys.lists(), filters] as const,
  forRequest: (requestId: string) => [...fulfillmentKeys.all, 'request', requestId] as const,
  candidates: (requestId: string) => [...fulfillmentKeys.all, 'candidates', requestId] as const,
}

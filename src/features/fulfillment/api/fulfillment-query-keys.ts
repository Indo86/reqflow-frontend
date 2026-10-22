export interface FulfillmentListFilters {
  page: number
  pageSize: number
  view: 'assigned' | 'unassigned' | 'all'
  state: 'open' | 'closed' | 'all'
}

// Menyusun kunci cache untuk data fulfillment.
export const fulfillmentKeys = {
  all: ['fulfillment'] as const,
  lists: () => [...fulfillmentKeys.all, 'list'] as const,
  list: (filters: FulfillmentListFilters) => [...fulfillmentKeys.lists(), filters] as const,
  forRequest: (requestId: string) => [...fulfillmentKeys.all, 'request', requestId] as const,
  candidates: (requestId: string) => [...fulfillmentKeys.all, 'candidates', requestId] as const,
}

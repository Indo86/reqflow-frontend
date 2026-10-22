import { apiClient } from '@/lib/api'
import {
  assignmentCandidatesResponseSchema,
  fulfillmentListResponseSchema,
  fulfillmentResponseSchema,
} from '../schemas/fulfillment.schema'
import type { FulfillmentListFilters } from './fulfillment-query-keys'

const base = (requestId: string) => `/requests/${requestId}/fulfillment`

// GET /requests/:id/fulfillment: readable by whoever can read the request.
export async function getFulfillment(requestId: string) {
  return fulfillmentResponseSchema.parse(await apiClient(base(requestId))).data
}

// Every action below is re-authorized by the server (assignee-only for start and
// complete, Admin-only for cancel and assign); a hidden button is only a courtesy.
export async function startFulfillment(requestId: string) {
  return fulfillmentResponseSchema.parse(await apiClient(`${base(requestId)}/start`, { method: 'POST' })).data
}

export async function completeFulfillment(requestId: string, note: string) {
  const response = await apiClient(`${base(requestId)}/complete`, { method: 'POST', json: { note: note.trim() } })
  return fulfillmentResponseSchema.parse(response).data
}

export async function cancelFulfillment(requestId: string, reason: string) {
  const response = await apiClient(`${base(requestId)}/cancel`, { method: 'POST', json: { reason: reason.trim() } })
  return fulfillmentResponseSchema.parse(response).data
}

export async function assignFulfillment(requestId: string, input: { assigneeId: string; reason?: string }) {
  const reason = input.reason?.trim()
  const response = await apiClient(`${base(requestId)}/assign`, {
    method: 'POST',
    json: { assigneeId: input.assigneeId, ...(reason ? { reason } : {}) },
  })
  return fulfillmentResponseSchema.parse(response).data
}

export async function getAssignmentCandidates(requestId: string) {
  return assignmentCandidatesResponseSchema.parse(await apiClient(`${base(requestId)}/candidates`)).data
}

export async function getFulfillments(filters: FulfillmentListFilters) {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    view: filters.view,
    state: filters.state,
  })
  return fulfillmentListResponseSchema.parse(await apiClient(`/fulfillments?${params.toString()}`))
}

import { apiClient } from '@/lib/api'
import { requestSingleResponseSchema } from '../schemas/request.schema'
import { mapRequestResponse, type Request, type RequestType } from '../types/request'

// PATCH /requests/:id — PATCH semantics, every field optional; only rejected
// by the backend (409 REQUEST_NOT_EDITABLE) once the request has left
// DRAFT/REVISION_REQUIRED. The frontend uses EDITABLE_STATUSES only to
// decide whether to show the Edit control — this call is the actual
// authority.
export interface UpdateRequestInput {
  type?: RequestType
  title?: string
  description?: string
  amount?: number
}

export async function updateRequest(id: string, input: UpdateRequestInput): Promise<Request> {
  const response = await apiClient(`/requests/${id}`, { method: 'PATCH', json: input })
  return mapRequestResponse(requestSingleResponseSchema.parse(response).data)
}

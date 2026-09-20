import { apiClient } from '@/lib/api'
import { requestSingleResponseSchema } from '../schemas/request.schema'
import { mapRequestResponse, type Request, type RequestType } from '../types/request'

// POST /requests body — `amount` is a plain JS number here, matching the
// backend's createRequestSchema exactly (never a string, never parsed with
// Number()/parseFloat() from a formatted display value — see
// RequestForm, which keeps the raw numeric value separate from its
// formatted display text throughout).
export interface CreateRequestInput {
  type: RequestType
  title: string
  description: string
  amount?: number
}

// Always creates in DRAFT — the backend controls this, the frontend never
// sends or picks a status.
export async function createRequest(input: CreateRequestInput): Promise<Request> {
  const response = await apiClient('/requests', { method: 'POST', json: input })
  return mapRequestResponse(requestSingleResponseSchema.parse(response).data)
}

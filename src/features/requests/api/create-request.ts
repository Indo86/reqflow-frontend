import { apiClient } from '@/lib/api'
import { requestSingleResponseSchema } from '../schemas/request.schema'
import { mapRequestResponse, type Request, type RequestType } from '../types/request'

// Mengirim data ke /requests.
export interface CreateRequestInput {
  type: RequestType
  title: string
  description: string
  amount?: number
}

// Membuat data melalui createRequest.
export async function createRequest(input: CreateRequestInput): Promise<Request> {
  const response = await apiClient('/requests', { method: 'POST', json: input })
  return mapRequestResponse(requestSingleResponseSchema.parse(response).data)
}

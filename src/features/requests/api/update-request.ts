import { apiClient } from '@/lib/api'
import { requestSingleResponseSchema } from '../schemas/request.schema'
import { mapRequestResponse, type Request, type RequestType } from '../types/request'

// Memperbarui data melalui /requests/:id.
export interface UpdateRequestInput {
  type?: RequestType
  title?: string
  description?: string
  // Nilai null menghapus nominal yang tersimpan.
  amount?: number | null
}

export async function updateRequest(id: string, input: UpdateRequestInput): Promise<Request> {
  const response = await apiClient(`/requests/${id}`, { method: 'PATCH', json: input })
  return mapRequestResponse(requestSingleResponseSchema.parse(response).data)
}

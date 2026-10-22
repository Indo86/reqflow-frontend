import { apiClient } from '@/lib/api'
import { requestDetailResponseSchema } from '../schemas/request.schema'
import { mapRequestDetailResponse, type RequestDetail } from '../types/request'

// Mengambil data dari /requests/:id.
export async function getRequest(id: string): Promise<RequestDetail> {
  const response = await apiClient(`/requests/${id}`)
  const parsed = requestDetailResponseSchema.parse(response)
  return mapRequestDetailResponse(parsed.data)
}

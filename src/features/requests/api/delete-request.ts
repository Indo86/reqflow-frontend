import { apiClient } from '@/lib/api'

// Menghapus data melalui /requests/:id.
export async function deleteRequest(id: string): Promise<void> {
  await apiClient<void>(`/requests/${id}`, { method: 'DELETE' })
}

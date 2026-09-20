import { apiClient } from '@/lib/api'

// DELETE /requests/:id — 204 No Content. Restricted to DRAFT status only;
// the backend returns 409 REQUEST_NOT_EDITABLE otherwise.
export async function deleteRequest(id: string): Promise<void> {
  await apiClient<void>(`/requests/${id}`, { method: 'DELETE' })
}

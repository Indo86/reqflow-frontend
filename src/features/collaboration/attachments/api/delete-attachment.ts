import { apiClient } from '@/lib/api'

// Menghapus data melalui /attachments/:id.
export async function deleteAttachment(attachmentId: string): Promise<void> {
  await apiClient<void>(`/attachments/${attachmentId}`, { method: 'DELETE' })
}

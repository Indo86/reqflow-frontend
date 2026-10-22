import { apiClient } from '@/lib/api'

// Menghapus data melalui /comments/:id.
export async function deleteComment(commentId: string): Promise<void> {
  await apiClient<void>(`/comments/${commentId}`, { method: 'DELETE' })
}

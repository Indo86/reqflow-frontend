import { apiClient } from '@/lib/api'

// DELETE /comments/:id — 204. Author-only regardless of role (403
// otherwise), and blocked once the request is terminal (409
// COMMENT_NOT_EDITABLE) — enforced entirely by the backend.
export async function deleteComment(commentId: string): Promise<void> {
  await apiClient<void>(`/comments/${commentId}`, { method: 'DELETE' })
}

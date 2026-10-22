import { apiClient } from '@/lib/api'
import { commentSingleResponseSchema } from '../schemas/comment.schema'
import { mapCommentResponse, type Comment } from '../types/comment'

// Mengirim data ke /requests/:id/comments.
export async function createComment(requestId: string, content: string): Promise<Comment> {
  const response = await apiClient(`/requests/${requestId}/comments`, {
    method: 'POST',
    json: { content },
  })
  return mapCommentResponse(commentSingleResponseSchema.parse(response).data)
}

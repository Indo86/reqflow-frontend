import { apiClient } from '@/lib/api'
import { commentSingleResponseSchema } from '../schemas/comment.schema'
import { mapCommentResponse, type Comment } from '../types/comment'

// POST /requests/:id/comments — write authorization is
// getWritableRequestForCollaboration on the backend: the request's owner,
// or the current active (PENDING-step) approver — never admin just for
// being admin, and never on a terminal (APPROVED/REJECTED/CANCELLED)
// request (409 REQUEST_COLLABORATION_CLOSED).
export async function createComment(requestId: string, content: string): Promise<Comment> {
  const response = await apiClient(`/requests/${requestId}/comments`, {
    method: 'POST',
    json: { content },
  })
  return mapCommentResponse(commentSingleResponseSchema.parse(response).data)
}

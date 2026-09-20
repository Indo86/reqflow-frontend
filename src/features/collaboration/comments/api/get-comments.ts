import { apiClient } from '@/lib/api'
import { commentListResponseSchema } from '../schemas/comment.schema'
import { mapCommentListResponse, type CommentListResult } from '../types/comment'

// GET /requests/:id/comments — view authorization is
// getViewableRequestForCollaboration on the backend (owner, any past/
// current approver, or admin; DRAFT is owner-only) — never re-implemented
// here. pageSize matches the backend's own default/max (1-100).
export async function getComments(requestId: string, page = 1, pageSize = 50): Promise<CommentListResult> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))

  const response = await apiClient(`/requests/${requestId}/comments?${params.toString()}`)
  return mapCommentListResponse(commentListResponseSchema.parse(response))
}

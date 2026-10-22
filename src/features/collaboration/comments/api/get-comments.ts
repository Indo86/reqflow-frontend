import { apiClient } from '@/lib/api'
import { commentListResponseSchema } from '../schemas/comment.schema'
import { mapCommentListResponse, type CommentListResult } from '../types/comment'

// Mengambil data dari /requests/:id/comments.
export async function getComments(requestId: string, page = 1, pageSize = 50): Promise<CommentListResult> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))

  const response = await apiClient(`/requests/${requestId}/comments?${params.toString()}`)
  return mapCommentListResponse(commentListResponseSchema.parse(response))
}

import type { z } from 'zod'
import type { commentListResponseSchema, commentResponseSchema } from '../schemas/comment.schema'

export interface Comment {
  id: string
  content: string
  author: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export function mapCommentResponse(dto: z.infer<typeof commentResponseSchema>): Comment {
  return dto
}

export interface CommentListMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface CommentListResult {
  items: Comment[]
  meta: CommentListMeta
}

export function mapCommentListResponse(dto: z.infer<typeof commentListResponseSchema>): CommentListResult {
  return { items: dto.data.map(mapCommentResponse), meta: dto.meta }
}

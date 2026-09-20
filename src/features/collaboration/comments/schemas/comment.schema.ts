import { z } from 'zod'

// Mirrors reqFlow-backend's comment.schema.ts / comment.service.ts exactly
// (verified by direct backend inspection): content is required, trimmed,
// max 5000 chars — the same rule the backend applies to both create and
// update. Update is not modeled here: F4 only implements list/create/
// delete (the backend also exposes PATCH /comments/:id, intentionally out
// of this milestone's scope).
export const commentContentSchema = z
  .string()
  .trim()
  .min(1, 'Content is required.')
  .max(5000, 'Content must be at most 5000 characters.')

const authorSchema = z.object({ id: z.string(), name: z.string() })

export const commentResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: authorSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const commentListResponseSchema = z.object({
  data: z.array(commentResponseSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export const commentSingleResponseSchema = z.object({
  data: commentResponseSchema,
})

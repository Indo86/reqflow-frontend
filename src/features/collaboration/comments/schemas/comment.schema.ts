import { z } from 'zod'

// Memvalidasi isi komentar sesuai kontrak API.
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

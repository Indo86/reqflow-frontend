import { z } from 'zod'

// Menangani lampiran pada request.
const uploaderSchema = z.object({ id: z.string(), name: z.string() })

export const attachmentResponseSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  uploadedBy: uploaderSchema,
  createdAt: z.string(),
})

export const attachmentListResponseSchema = z.object({
  data: z.array(attachmentResponseSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export const attachmentSingleResponseSchema = z.object({
  data: attachmentResponseSchema,
})

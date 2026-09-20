import { z } from 'zod'

// Mirrors reqFlow-backend's attachment.service.ts AttachmentResponse
// exactly (verified by direct backend inspection) — note there is no
// `storageKey` in this shape; the backend never returns it to any client.
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

import type { z } from 'zod'
import type { attachmentListResponseSchema, attachmentResponseSchema } from '../schemas/attachment.schema'

export interface Attachment {
  id: string
  originalName: string
  mimeType: string
  size: number
  uploadedBy: { id: string; name: string }
  createdAt: string
}

export function mapAttachmentResponse(dto: z.infer<typeof attachmentResponseSchema>): Attachment {
  return dto
}

export interface AttachmentListMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface AttachmentListResult {
  items: Attachment[]
  meta: AttachmentListMeta
}

export function mapAttachmentListResponse(
  dto: z.infer<typeof attachmentListResponseSchema>
): AttachmentListResult {
  return { items: dto.data.map(mapAttachmentResponse), meta: dto.meta }
}

// Mirrors config/constants.ts exactly (verified by direct backend
// inspection) — UX hint only; the backend re-validates both authoritatively
// on every upload (413 ATTACHMENT_TOO_LARGE / 415
// UNSUPPORTED_ATTACHMENT_TYPE) regardless of what the client checked.
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const

export const ALLOWED_ATTACHMENT_EXTENSIONS_HINT =
  '.pdf, .jpg, .png, .webp, .txt, .csv, .docx, .xlsx'

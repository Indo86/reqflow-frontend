import { apiClient } from '@/lib/api'
import { attachmentListResponseSchema } from '../schemas/attachment.schema'
import { mapAttachmentListResponse, type AttachmentListResult } from '../types/attachment'

// GET /requests/:id/attachments — same view authorization as comments
// (getViewableRequestForCollaboration): owner, any past/current approver,
// or admin; DRAFT is owner-only.
export async function getAttachments(requestId: string, page = 1, pageSize = 50): Promise<AttachmentListResult> {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))

  const response = await apiClient(`/requests/${requestId}/attachments?${params.toString()}`)
  return mapAttachmentListResponse(attachmentListResponseSchema.parse(response))
}

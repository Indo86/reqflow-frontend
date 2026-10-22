import { apiClient } from '@/lib/api'
import { attachmentSingleResponseSchema } from '../schemas/attachment.schema'
import { mapAttachmentResponse, type Attachment } from '../types/attachment'

// Mengirim data ke /requests/:id/attachments.
export async function uploadAttachment(requestId: string, file: File): Promise<Attachment> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient(`/requests/${requestId}/attachments`, {
    method: 'POST',
    body: formData,
  })
  return mapAttachmentResponse(attachmentSingleResponseSchema.parse(response).data)
}

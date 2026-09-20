import { apiClient } from '@/lib/api'
import { attachmentSingleResponseSchema } from '../schemas/attachment.schema'
import { mapAttachmentResponse, type Attachment } from '../types/attachment'

// POST /requests/:id/attachments — multipart/form-data, field name "file"
// (multer's `.single('file')` on the backend — verified by direct
// inspection, never guessed). FormData is passed as `body`, never `json`,
// so apiClient never sets a Content-Type header and the browser generates
// the correct multipart boundary itself — see apiClient's json/body
// branching in src/lib/api/index.ts. Write authorization is
// getWritableRequestForCollaboration (owner or current active approver);
// size/MIME are re-validated authoritatively by the backend regardless of
// any client-side check.
export async function uploadAttachment(requestId: string, file: File): Promise<Attachment> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient(`/requests/${requestId}/attachments`, {
    method: 'POST',
    body: formData,
  })
  return mapAttachmentResponse(attachmentSingleResponseSchema.parse(response).data)
}

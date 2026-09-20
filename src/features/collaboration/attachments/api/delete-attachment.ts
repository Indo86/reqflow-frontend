import { apiClient } from '@/lib/api'

// DELETE /attachments/:id — 204. Uploader-only regardless of role,
// including the request's own owner (403 otherwise), and blocked once the
// request is terminal (409 ATTACHMENT_NOT_DELETABLE). Physical file cleanup
// (M7.1) happens entirely server-side, best-effort, after the DB row is
// gone — this call never touches storage directly and the DTO never
// exposes a storageKey to do so with.
export async function deleteAttachment(attachmentId: string): Promise<void> {
  await apiClient<void>(`/attachments/${attachmentId}`, { method: 'DELETE' })
}

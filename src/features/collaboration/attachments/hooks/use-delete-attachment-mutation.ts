import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAttachment } from '../api/delete-attachment'
import { attachmentKeys } from '../api/attachment-query-keys'

export function useDeleteAttachmentMutation(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(attachmentId),
    // Menyegarkan daftar lampiran setelah penghapusan berhasil.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: attachmentKeys.request(requestId) })
    },
  })
}

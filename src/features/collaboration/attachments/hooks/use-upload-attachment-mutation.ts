import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadAttachment } from '../api/upload-attachment'
import { attachmentKeys } from '../api/attachment-query-keys'

// No optimistic update — the list only ever shows an attachment once the
// backend has confirmed storage succeeded (F4 "upload mutation").
export function useUploadAttachmentMutation(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadAttachment(requestId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attachmentKeys.request(requestId) })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAttachment } from '../api/delete-attachment'
import { attachmentKeys } from '../api/attachment-query-keys'

export function useDeleteAttachmentMutation(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(attachmentId),
    // On failure, the attachment is left in place until an authoritative
    // refetch — invalidate here regardless of outcome so a genuine
    // conflict (e.g. request became terminal mid-click) is reflected
    // immediately rather than trusting the optimistic "it's still there".
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: attachmentKeys.request(requestId) })
    },
  })
}

import { useQuery } from '@tanstack/react-query'
import { getAttachments } from '../api/get-attachments'
import { attachmentKeys } from '../api/attachment-query-keys'

export function useAttachmentsQuery(requestId: string) {
  return useQuery({
    queryKey: attachmentKeys.request(requestId),
    queryFn: () => getAttachments(requestId),
  })
}

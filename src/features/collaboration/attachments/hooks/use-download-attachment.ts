import { useMutation } from '@tanstack/react-query'
import { downloadAttachment } from '../api/download-attachment'

// Modeled as a mutation purely for its pending/error state (a download
// isn't cached server state) — disables the trigger while in flight and
// surfaces backend errors through the same ApiError path as everything
// else. Revokes the temporary object URL immediately after the browser has
// had a chance to start the download, so it's never held onto/leaked.
export function useDownloadAttachment() {
  return useMutation({
    mutationFn: async ({ attachmentId, fallbackFilename }: { attachmentId: string; fallbackFilename: string }) => {
      const { blob, filename } = await downloadAttachment(attachmentId, fallbackFilename)
      const objectUrl = URL.createObjectURL(blob)
      try {
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    },
  })
}

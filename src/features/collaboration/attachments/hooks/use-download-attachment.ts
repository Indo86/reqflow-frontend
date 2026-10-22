import { useMutation } from '@tanstack/react-query'
import { downloadAttachment } from '../api/download-attachment'

// Menyediakan hook useDownloadAttachment.
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

import { useMutation } from '@tanstack/react-query'
import { exportRequestReportCsv } from '../api/export-request-report-csv'
import type { RequestReportFilters } from '../types/report'

// Modeled directly on F4's useDownloadAttachment — a mutation purely for
// pending/error state (a download isn't cached server state), disabling
// the trigger while in flight, revoking the temporary object URL right
// after the browser has started the download so it's never held onto.
export function useExportRequestReportCsv() {
  return useMutation({
    mutationFn: async (filters: RequestReportFilters) => {
      const { blob, filename } = await exportRequestReportCsv(filters)
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

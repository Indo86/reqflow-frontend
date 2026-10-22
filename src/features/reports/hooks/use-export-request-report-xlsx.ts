import { useMutation } from '@tanstack/react-query'
import { exportRequestReportXlsx } from '../api/export-request-report-xlsx'
import { saveBlob } from '../lib/save-blob'
import type { RequestReportFilters } from '../types/report'

// Modeled directly on F4's useDownloadAttachment — a mutation purely for
// pending/error state (a download isn't cached server state), disabling
// the trigger while in flight.
export function useExportRequestReportXlsx() {
  return useMutation({
    mutationFn: async (filters: RequestReportFilters) => {
      const { blob, filename } = await exportRequestReportXlsx(filters)
      saveBlob(blob, filename)
    },
  })
}

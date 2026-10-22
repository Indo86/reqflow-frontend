import { useMutation } from '@tanstack/react-query'
import { exportRequestReportXlsx } from '../api/export-request-report-xlsx'
import { saveBlob } from '../lib/save-blob'
import type { RequestReportFilters } from '../types/report'

// Mengunduh berkas dari backend.
export function useExportRequestReportXlsx() {
  return useMutation({
    mutationFn: async (filters: RequestReportFilters) => {
      const { blob, filename } = await exportRequestReportXlsx(filters)
      saveBlob(blob, filename)
    },
  })
}

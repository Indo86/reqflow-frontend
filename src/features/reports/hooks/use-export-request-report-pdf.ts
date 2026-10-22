import { useMutation } from '@tanstack/react-query'
import { exportRequestReportPdf } from '../api/export-request-report-pdf'
import { saveBlob } from '../lib/save-blob'
import type { RequestReportFilters } from '../types/report'

// Mengekspor data laporan ke berkas.
export function useExportRequestReportPdf() {
  return useMutation({
    mutationFn: async (filters: RequestReportFilters) => {
      const { blob, filename } = await exportRequestReportPdf(filters)
      saveBlob(blob, filename)
    },
  })
}

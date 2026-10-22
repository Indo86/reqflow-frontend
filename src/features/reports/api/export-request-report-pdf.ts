import type { RequestReportFilters } from '../types/report'
import { downloadReportFile, type DownloadedReportFile } from './download-report-file'

// Mengambil data dari /reports/requests/export/pdf.
export function exportRequestReportPdf(filters: RequestReportFilters): Promise<DownloadedReportFile> {
  return downloadReportFile('reports/requests/export/pdf', filters, 'reqflow-report.pdf')
}

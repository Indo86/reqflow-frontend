import type { RequestReportFilters } from '../types/report'
import { downloadReportFile, type DownloadedReportFile } from './download-report-file'

// GET /reports/requests/export/pdf — same filters and same visibility as the
// JSON report and the Excel export; the backend renders the summary page plus
// the detail list. See download-report-file.ts for why this bypasses
// apiClient.
export function exportRequestReportPdf(filters: RequestReportFilters): Promise<DownloadedReportFile> {
  return downloadReportFile('reports/requests/export/pdf', filters, 'reqflow-report.pdf')
}

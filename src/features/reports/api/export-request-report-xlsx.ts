import type { RequestReportFilters } from '../types/report'
import { downloadReportFile, type DownloadedReportFile } from './download-report-file'

// GET /reports/requests/export/xlsx — same filters and visibility as the JSON
// report; the backend builds a formatted workbook (Summary + Requests sheets).
// See download-report-file.ts for why this bypasses apiClient.
export function exportRequestReportXlsx(filters: RequestReportFilters): Promise<DownloadedReportFile> {
  return downloadReportFile('reports/requests/export/xlsx', filters, 'reqflow-report.xlsx')
}

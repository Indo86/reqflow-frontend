import type { RequestReportFilters } from '../types/report'
import { downloadReportFile, type DownloadedReportFile } from './download-report-file'

// Mengambil data dari /reports/requests/export/xlsx.
export function exportRequestReportXlsx(filters: RequestReportFilters): Promise<DownloadedReportFile> {
  return downloadReportFile('reports/requests/export/xlsx', filters, 'reqflow-report.xlsx')
}

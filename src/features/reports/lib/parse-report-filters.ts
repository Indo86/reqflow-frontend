import { requestStatusLabels, requestTypeLabels, type RequestStatus, type RequestType } from '@/features/requests/types/request'
import type { RequestReportFilters } from '../types/report'

function isRequestStatus(value: string): value is RequestStatus {
  return value in requestStatusLabels
}

function isRequestType(value: string): value is RequestType {
  return value in requestTypeLabels
}

export interface ReportUrlFilters {
  status?: RequestStatus
  type?: RequestType
  // ID departemen diteruskan langsung sebagai filter API.
  departmentId?: string
  // Tanggal disimpan dalam format YYYY-MM-DD dari input native.
  fromDate?: string
  toDate?: string
}

// Mengubah batas tanggal menjadi waktu ISO untuk API.
function toIsoBoundary(dateOnly: string | undefined): string | undefined {
  if (!dateOnly) return undefined
  const date = new Date(`${dateOnly}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function parseReportUrlFilters(searchParams: URLSearchParams): ReportUrlFilters {
  const rawStatus = searchParams.get('status')
  const status = rawStatus && isRequestStatus(rawStatus) ? rawStatus : undefined

  const rawType = searchParams.get('type')
  const type = rawType && isRequestType(rawType) ? rawType : undefined

  return {
    status,
    type,
    departmentId: searchParams.get('departmentId') ?? undefined,
    fromDate: searchParams.get('from') ?? undefined,
    toDate: searchParams.get('to') ?? undefined,
  }
}

export function toRequestReportFilters(urlFilters: ReportUrlFilters): RequestReportFilters {
  return {
    status: urlFilters.status,
    type: urlFilters.type,
    departmentId: urlFilters.departmentId,
    from: toIsoBoundary(urlFilters.fromDate),
    to: toIsoBoundary(urlFilters.toDate),
  }
}

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
  // Not re-validated against the real department list here — same as the
  // backend itself (report.schema.ts: "an id that matches nothing simply
  // produces an empty/zeroed report, the same way an unmatched filter does
  // on any list endpoint"). The <select> only ever offers ids GET
  // /departments actually returned, so a mismatch only happens via a
  // stale/hand-edited URL, which the backend already handles safely.
  departmentId?: string
  // Raw YYYY-MM-DD — exactly what a native <input type="date"> reads/writes,
  // kept separate from the ISO instant the API needs.
  fromDate?: string
  toDate?: string
}

// A YYYY-MM-DD date-only value becomes the UTC-midnight ISO instant the
// backend expects — never end-of-day adjusted. `to` stays exclusive exactly
// as the backend contract defines it (report.schema.ts: "No implicit
// end-of-day adjustment happens anywhere in this module"); the Reports page
// labels the `to` field accordingly rather than silently reinterpreting it.
// Returns undefined for anything that doesn't parse as a valid date, so a
// stale/hand-edited URL never reaches the backend as garbage (F6 "Invalid
// filters").
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

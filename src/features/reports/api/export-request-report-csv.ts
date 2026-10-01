import { ApiError, normalizeHttpError } from '@/lib/api'
import { env } from '@/lib/env'
import type { RequestReportFilters } from '../types/report'

export interface DownloadedCsvExport {
  blob: Blob
  filename: string
}

// GET /reports/requests/export — same filters as GET /reports/requests,
// same visibility/authorization (report.service.ts's exportRequestReportCsv
// reuses the identical predicate). Deliberately does NOT go through
// apiClient: apiClient always calls response.text() and JSON.parses it,
// which would corrupt this endpoint's text/csv body — same reasoning as F4's
// downloadAttachment. credentials are still explicitly included, and
// non-OK responses are normalized through the same ApiError/
// normalizeHttpError used everywhere else.
export async function exportRequestReportCsv(filters: RequestReportFilters): Promise<DownloadedCsvExport> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.type) params.set('type', filters.type)
  if (filters.departmentId) params.set('departmentId', filters.departmentId)
  if (filters.createdById) params.set('createdById', filters.createdById)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)

  const base = new URL(`${env.apiBaseUrl}/`)
  const url = new URL(`reports/requests/export?${params.toString()}`, base)

  let response: Response
  try {
    response = await fetch(url, { credentials: 'include' })
  } catch (cause) {
    throw new ApiError('Unable to connect. Please check your connection and try again.', {
      status: 0,
      code: 'NETWORK_ERROR',
      cause,
    })
  }

  if (!response.ok) {
    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      payload = undefined
    }
    throw normalizeHttpError(response, payload)
  }

  const blob = await response.blob()
  const filename = parseFilenameFromContentDisposition(response.headers.get('Content-Disposition')) ?? 'reqflow-requests.csv'
  return { blob, filename }
}

// Same parsing as F4's downloadAttachment (duplicated rather than shared —
// this is the only other Content-Disposition-driven download in the app,
// and the two call sites are otherwise unrelated features).
function parseFilenameFromContentDisposition(header: string | null): string | undefined {
  if (!header) return undefined
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      // fall through to the ASCII fallback below
    }
  }
  const asciiMatch = /filename="([^"]*)"/i.exec(header)
  return asciiMatch?.[1]
}

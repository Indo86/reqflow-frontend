import { ApiError, normalizeHttpError } from '@/lib/api'
import { env } from '@/lib/env'
import type { RequestReportFilters } from '../types/report'

export interface DownloadedReportFile {
  blob: Blob
  filename: string
}

// Shared by the Excel and PDF exports — both are the same filtered,
// authorized read as GET /reports/requests, just a different representation,
// so they take the same query string and the same visibility. Deliberately
// does NOT go through apiClient: apiClient always calls response.text() and
// JSON.parses it, which would corrupt a binary body — same reasoning as F4's
// downloadAttachment. credentials are still explicitly included, and non-OK
// responses are normalized through the same ApiError/normalizeHttpError used
// everywhere else.
export async function downloadReportFile(
  path: string,
  filters: RequestReportFilters,
  fallbackFilename: string
): Promise<DownloadedReportFile> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.type) params.set('type', filters.type)
  if (filters.departmentId) params.set('departmentId', filters.departmentId)
  if (filters.createdById) params.set('createdById', filters.createdById)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)

  const base = new URL(`${env.apiBaseUrl}/`)
  const url = new URL(`${path}?${params.toString()}`, base)

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
  const filename = parseFilenameFromContentDisposition(response.headers.get('Content-Disposition')) ?? fallbackFilename
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

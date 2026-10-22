import { ApiError, normalizeHttpError } from '@/lib/api'
import { env } from '@/lib/env'
import type { RequestReportFilters } from '../types/report'

export interface DownloadedReportFile {
  blob: Blob
  filename: string
}

// Mengambil data dari /reports/requests.
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

// Mengambil nama berkas UTF-8 dari header respons jika tersedia.
function parseFilenameFromContentDisposition(header: string | null): string | undefined {
  if (!header) return undefined
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      // Menyediakan nilai cadangan untuk menjaga keamanan tipe.
    }
  }
  const asciiMatch = /filename="([^"]*)"/i.exec(header)
  return asciiMatch?.[1]
}

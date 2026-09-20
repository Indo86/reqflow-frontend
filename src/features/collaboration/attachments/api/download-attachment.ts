import { ApiError, normalizeHttpError } from '@/lib/api'
import { env } from '@/lib/env'

export interface DownloadedAttachment {
  blob: Blob
  filename: string
}

// GET /attachments/:id/download — streams the raw file with
// Content-Disposition: attachment (always a download, never inline —
// buildContentDisposition on the backend never emits "inline"). This
// deliberately does NOT go through apiClient: apiClient always calls
// response.text() and JSON.parses it, which would corrupt a binary
// response body. credentials are still explicitly included (same as
// apiClient), and non-OK responses are normalized through the same
// ApiError/normalizeHttpError used everywhere else, so error handling
// stays consistent even though the success path can't reuse apiClient.
export async function downloadAttachment(attachmentId: string, fallbackFilename: string): Promise<DownloadedAttachment> {
  const base = new URL(`${env.apiBaseUrl}/`)
  const url = new URL(`attachments/${attachmentId}/download`, base)

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

// The backend sends both an ASCII fallback and an RFC 5987 filename* (see
// buildContentDisposition) — prefer the UTF-8 one when present.
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

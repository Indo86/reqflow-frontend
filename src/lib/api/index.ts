import { env } from '@/lib/env'
import { ApiError, normalizeHttpError } from './api-error'
export { ApiError, normalizeHttpError } from './api-error'
export type ApiClientOptions = Omit<RequestInit, 'body' | 'credentials'> & {
  body?: BodyInit | null
  json?: unknown
}
/** Paths are relative to the configured API base, including any base path prefix.
 * TResponse describes the expected DTO; features validate payloads when needed.
 * Empty successful responses resolve to undefined (use apiClient<void>).
 */
export async function apiClient<TResponse = unknown>(
  path: string,
  options: ApiClientOptions = {}
): Promise<TResponse> {
  if (
    /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path) ||
    path.includes('\\') ||
    /(?:^|\/)\.\.(?:\/|$)/.test(path)
  )
    throw new TypeError('API paths must be relative to VITE_API_BASE_URL')
  const base = new URL(`${env.apiBaseUrl}/`)
  const url = new URL(path.replace(/^\/+/, ''), base)
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname))
    throw new TypeError('API paths must stay within VITE_API_BASE_URL')
  const { json, body, ...init } = options
  if (json !== undefined && body !== undefined)
    throw new TypeError('Provide either json or body, not both')
  const headers = new Headers(init.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (json !== undefined && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json')
  let response: Response
  let text: string
  try {
    response = await fetch(url, {
      ...init,
      headers,
      body: json === undefined ? body : JSON.stringify(json),
      credentials: 'include',
    })
    text = await response.text()
  } catch (cause) {
    if (
      init.signal?.aborted ||
      (typeof cause === 'object' &&
        cause !== null &&
        'name' in cause &&
        cause.name === 'AbortError')
    )
      throw cause
    throw new ApiError('Unable to connect. Please check your connection and try again.', {
      status: 0,
      code: 'NETWORK_ERROR',
      cause,
    })
  }
  let payload: unknown
  if (text.trim()) {
    try {
      payload = JSON.parse(text) as unknown
    } catch (cause) {
      if (response.ok)
        throw new ApiError('The server returned an unexpected response.', {
          status: response.status,
          code: 'INVALID_RESPONSE',
          requestId: response.headers.get('X-Request-Id') ?? undefined,
          cause,
        })
    }
  }
  if (!response.ok) throw normalizeHttpError(response, payload)
  return payload as TResponse
}

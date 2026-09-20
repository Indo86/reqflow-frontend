import { vi } from 'vitest'

export function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'test-request-id', ...headers },
  })
}

export function errorResponse(status: number, code: string, message: string): Response {
  return jsonResponse(status, { error: { code, message, requestId: 'test-request-id' } })
}

type FetchHandler = (url: URL, init: RequestInit | undefined) => Response | Promise<Response>

// Mocks the HTTP boundary (global fetch) rather than the auth hooks
// themselves, per F1's testing strategy — apiClient always calls the real
// `fetch`, so stubbing it exercises the actual request URL/method/body and
// the actual response-parsing path in api-error.ts.
export function stubFetch(handler: FetchHandler) {
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    return handler(new URL(href), init)
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

function unhandled(url: URL): never {
  throw new Error(`Unhandled fetch in test: ${url.pathname}`)
}

export function stubUnauthenticatedSession() {
  return stubFetch((url) => {
    if (url.pathname === '/users/me') return errorResponse(401, 'UNAUTHENTICATED', 'Authentication required.')
    return unhandled(url)
  })
}

export function stubAuthenticatedSession(profile: unknown) {
  return stubFetch((url) => {
    if (url.pathname === '/users/me') return jsonResponse(200, { data: profile })
    return unhandled(url)
  })
}

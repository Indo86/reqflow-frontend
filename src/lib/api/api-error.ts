export interface ApiErrorOptions {
  status: number
  code?: string
  requestId?: string
  details?: unknown
  cause?: unknown
}
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly requestId?: string
  // Diagnostics only. UI should display message, never arbitrary details/cause.
  readonly details?: unknown
  constructor(message: string, options: ApiErrorOptions) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.requestId = options.requestId
    this.details = options.details
  }
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}
export function normalizeHttpError(response: Response, payload: unknown): ApiError {
  const envelope = isRecord(payload) ? payload : undefined
  const error = isRecord(envelope?.error) ? envelope.error : envelope
  const code = stringValue(error?.code)
  // Only the backend's normalized envelope supplies user-facing 4xx messages.
  const message =
    response.status < 500 && isRecord(envelope?.error) && code
      ? stringValue(error?.message)
      : undefined
  return new ApiError(message ?? 'The request could not be completed. Please try again.', {
    status: response.status,
    code,
    requestId:
      response.headers.get('X-Request-Id') ??
      response.headers.get('X-Correlation-Id') ??
      stringValue(error?.requestId) ??
      stringValue(envelope?.requestId),
    details: error?.details,
  })
}

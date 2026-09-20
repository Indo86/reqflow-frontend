import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, ApiError } from './index'
const fetchMock = vi.fn<typeof fetch>()
beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
describe('API client boundary', () => {
  it('uses the API base URL, includes cookies, and resolves JSON', async () => {
    fetchMock.mockResolvedValue(Response.json({ ready: true }))
    await expect(apiClient<{ ready: boolean }>('/probe')).resolves.toEqual({ ready: true })
    const [url, options] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('http://localhost:3000/probe')
    expect(options?.credentials).toBe('include')
    expect(new Headers(options?.headers).get('Accept')).toBe('application/json')
  })
  it('serializes explicit JSON and forwards method, headers, and AbortSignal', async () => {
    const controller = new AbortController()
    fetchMock.mockResolvedValue(Response.json({}))
    await apiClient('/probe', {
      method: 'PATCH',
      json: { value: 1 },
      signal: controller.signal,
      headers: { 'X-Test': 'example' },
    })
    const options = fetchMock.mock.calls[0][1]
    expect(options?.method).toBe('PATCH')
    expect(options?.body).toBe('{"value":1}')
    expect(options?.signal).toBe(controller.signal)
    expect(new Headers(options?.headers).get('Content-Type')).toBe('application/json')
    expect(new Headers(options?.headers).get('X-Test')).toBe('example')
  })
  it.each([204, 200])('handles empty successful responses (%s)', async (status) => {
    fetchMock.mockResolvedValue(new Response(null, { status }))
    await expect(apiClient<void>('/probe')).resolves.toBeUndefined()
  })
  it('normalizes the actual backend error envelope and preserves its request ID', async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input.',
            requestId: 'body-id',
            details: { field: 'value' },
          },
        },
        { status: 400 }
      )
    )
    const error = await apiClient('/probe').catch((error: unknown) => error)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input.',
      requestId: 'body-id',
      details: { field: 'value' },
    })
  })
  it('prefers the response request ID header', async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { error: { code: 'FAILURE', requestId: 'body-id' } },
        { status: 500, headers: { 'X-Request-Id': 'header-id' } }
      )
    )
    await expect(apiClient('/probe')).rejects.toMatchObject({ requestId: 'header-id', status: 500 })
  })
  it.each(['', '<html>private stack trace</html>', '{"error":', 'null', '{"error":123}'])(
    'handles unexpected HTTP error bodies safely (%s)',
    async (body) => {
      fetchMock.mockResolvedValue(
        new Response(body, { status: 502, headers: { 'X-Request-Id': 'safe-id' } })
      )
      await expect(apiClient('/probe')).rejects.toMatchObject({
        status: 502,
        requestId: 'safe-id',
        message: 'The request could not be completed. Please try again.',
      })
    }
  )
  it('does not display raw server error messages', async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { error: { code: 'INTERNAL_SERVER_ERROR', message: 'private database detail' } },
        { status: 500 }
      )
    )
    await expect(apiClient('/probe')).rejects.toMatchObject({
      message: 'The request could not be completed. Please try again.',
    })
  })
  it('rejects malformed successful JSON with a safe error and request ID', async () => {
    fetchMock.mockResolvedValue(
      new Response('invalid json', { headers: { 'X-Request-Id': 'parse-id' } })
    )
    await expect(apiClient('/probe')).rejects.toMatchObject({
      status: 200,
      code: 'INVALID_RESPONSE',
      requestId: 'parse-id',
    })
  })
  it('normalizes network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('private network detail'))
    await expect(apiClient('/probe')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect. Please check your connection and try again.',
    })
  })
  it('preserves cancellation', async () => {
    const cause = new DOMException('Cancelled', 'AbortError')
    fetchMock.mockRejectedValue(cause)
    await expect(apiClient('/probe')).rejects.toBe(cause)
  })
  it('forwards FormData without forcing JSON Content-Type', async () => {
    const body = new FormData()
    body.append('example', 'value')
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
    await apiClient<void>('/probe', { method: 'POST', body })
    const options = fetchMock.mock.calls[0][1]
    expect(options?.body).toBe(body)
    expect(new Headers(options?.headers).has('Content-Type')).toBe(false)
  })
  it.each(['https://external.example/probe', '//external.example/probe', '../probe'])(
    'rejects paths outside the configured API base (%s)',
    async (path) => {
      await expect(apiClient(path)).rejects.toBeInstanceOf(TypeError)
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )
  it('rejects ambiguous body options', async () => {
    await expect(apiClient('/probe', { json: {}, body: 'raw' })).rejects.toBeInstanceOf(TypeError)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

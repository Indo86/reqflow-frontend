import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { sampleAttachment } from '@/test/fixtures/collaboration'
import { getAttachments } from './get-attachments'
import { uploadAttachment } from './upload-attachment'
import { deleteAttachment } from './delete-attachment'
import { downloadAttachment } from './download-attachment'

describe('attachment API layer', () => {
  it('getAttachments calls GET /requests/:id/attachments with credentials included', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/requests/req-1/attachments'
        ? jsonResponse(200, { data: [sampleAttachment], meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getAttachments('req-1')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/requests/req-1/attachments' }),
      expect.objectContaining({ credentials: 'include' })
    )
    expect(result.items[0].originalName).toBe('vendor-quote.pdf')
  })

  it('uploadAttachment sends FormData under field name "file", never a manually-set multipart Content-Type', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/requests/req-1/attachments'
        ? jsonResponse(201, { data: sampleAttachment })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const file = new File(['hello'], 'quote.pdf', { type: 'application/pdf' })
    const result = await uploadAttachment('req-1', file)

    const [, init] = fetchSpy.mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(init?.credentials).toBe('include')
    expect(init?.body).toBeInstanceOf(FormData)
    const formData = init!.body as FormData
    expect(formData.get('file')).toBe(file)
    // The browser must generate the multipart boundary itself — apiClient
    // must never set Content-Type when the body is FormData (only when
    // using its `json` option).
    const headers = new Headers(init?.headers)
    expect(headers.has('Content-Type')).toBe(false)
    expect(result.id).toBe(sampleAttachment.id)
  })

  it('deleteAttachment sends DELETE /attachments/:id', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/attachments/attachment-1' ? new Response(null, { status: 204 }) : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    await deleteAttachment('attachment-1')

    const [, init] = fetchSpy.mock.calls[0]
    expect(init).toMatchObject({ method: 'DELETE', credentials: 'include' })
  })

  it('downloadAttachment fetches GET /attachments/:id/download with credentials and returns a Blob', async () => {
    const fetchSpy = vi.fn(async () =>
      new Response(new Blob(['file bytes']), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="quote.pdf"; filename*=UTF-8\'\'quote.pdf',
        },
      })
    )
    vi.stubGlobal('fetch', fetchSpy)

    const result = await downloadAttachment('attachment-1', 'fallback.pdf')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/attachments/attachment-1/download' }),
      expect.objectContaining({ credentials: 'include' })
    )
    expect(result.blob).toBeInstanceOf(Blob)
    expect(result.filename).toBe('quote.pdf')
  })

  it('normalizes attachment errors (413/415/403/409) through ApiError, never leaking raw internals', async () => {
    stubFetch(() => errorResponse(415, 'UNSUPPORTED_ATTACHMENT_TYPE', 'This file type is not supported.'))

    const file = new File(['x'], 'virus.exe', { type: 'application/x-msdownload' })
    await expect(uploadAttachment('req-1', file)).rejects.toMatchObject({
      status: 415,
      code: 'UNSUPPORTED_ATTACHMENT_TYPE',
      message: 'This file type is not supported.',
    })
  })

  it('normalizes a download error response instead of returning a corrupt blob', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ error: { code: 'ATTACHMENT_NOT_FOUND', message: 'Attachment not found.', requestId: 'r1' } }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    try {
      await downloadAttachment('missing-id', 'fallback.pdf')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(404)
      expect((error as ApiError).message).toBe('Attachment not found.')
    }
  })
})

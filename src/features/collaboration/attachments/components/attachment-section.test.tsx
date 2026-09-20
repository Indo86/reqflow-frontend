import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { sampleAttachment } from '@/test/fixtures/collaboration'
import { AttachmentSection } from './attachment-section'

function renderSection(canWrite = true) {
  return renderWithProviders(<AttachmentSection requestId="req-1" currentUserId="user-employee" canWrite={canWrite} />)
}

function uploadFile(file: File) {
  const input = document.getElementById('attachment-file-input') as HTMLInputElement
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  fireEvent.change(input)
}

describe('AttachmentSection', () => {
  it('shows a loading state while fetching', () => {
    stubFetch(() => new Promise(() => {}))
    renderSection()
    expect(screen.getByRole('status', { name: 'Loading attachments' })).toBeInTheDocument()
  })

  it('shows a useful empty state rather than treating zero attachments as an error', async () => {
    stubFetch(() => jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } }))
    renderSection()

    expect(await screen.findByText('No attachments yet')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders real attachment rows from the backend', async () => {
    stubFetch(() =>
      jsonResponse(200, { data: [sampleAttachment], meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 } })
    )
    renderSection()

    expect(await screen.findByText('vendor-quote.pdf')).toBeInTheDocument()
    expect(screen.getByText(/240 KB/)).toBeInTheDocument()
  })

  it('rejects an oversized file client-side without ever calling upload', async () => {
    const fetchSpy = stubFetch(() =>
      jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } })
    )
    renderSection()
    await screen.findByText('No attachments yet')

    const oversized = new File([new Uint8Array(11 * 1024 * 1024)], 'huge.pdf', { type: 'application/pdf' })
    uploadFile(oversized)

    expect(await screen.findByText(/exceeds the maximum size/)).toBeInTheDocument()
    expect(fetchSpy.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false)
  })

  it('rejects an unsupported MIME type client-side without ever calling upload', async () => {
    const fetchSpy = stubFetch(() =>
      jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } })
    )
    renderSection()
    await screen.findByText('No attachments yet')

    const badFile = new File(['x'], 'virus.exe', { type: 'application/x-msdownload' })
    uploadFile(badFile)

    expect(await screen.findByText(/isn't supported/)).toBeInTheDocument()
    expect(fetchSpy.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false)
  })

  it('disables Upload while pending, preventing duplicate submission, then refreshes the list', async () => {
    let uploaded = false
    let resolveUpload!: (value: Response) => void
    const pendingUpload = new Promise<Response>((resolve) => {
      resolveUpload = resolve
    })

    stubFetch((url, init) => {
      if (url.pathname === '/requests/req-1/attachments' && init?.method === 'POST') return pendingUpload
      if (url.pathname === '/requests/req-1/attachments') {
        return jsonResponse(200, {
          data: uploaded ? [sampleAttachment] : [],
          meta: { page: 1, pageSize: 50, total: uploaded ? 1 : 0, totalPages: 1 },
        })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderSection()
    await screen.findByText('No attachments yet')

    const validFile = new File(['hello'], 'quote.pdf', { type: 'application/pdf' })
    uploadFile(validFile)
    fireEvent.click(await screen.findByRole('button', { name: 'Upload' }))

    expect(await screen.findByRole('button', { name: 'Uploading…' })).toBeDisabled()

    uploaded = true
    resolveUpload(jsonResponse(201, { data: sampleAttachment }))

    await waitFor(() => expect(screen.getByText('vendor-quote.pdf')).toBeInTheDocument())
  })

  it('does not fake success when upload fails', async () => {
    stubFetch((url, init) => {
      if (url.pathname === '/requests/req-1/attachments' && init?.method === 'POST') {
        return errorResponse(415, 'UNSUPPORTED_ATTACHMENT_TYPE', 'This file type is not supported.')
      }
      return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } })
    })

    renderSection()
    await screen.findByText('No attachments yet')

    const file = new File(['hello'], 'quote.pdf', { type: 'application/pdf' })
    uploadFile(file)
    fireEvent.click(await screen.findByRole('button', { name: 'Upload' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('This file type is not supported.')
    expect(screen.getByText('No attachments yet')).toBeInTheDocument()
  })

  it('shows the delete action only for the current user\'s own upload', async () => {
    const otherUsersUpload = {
      ...sampleAttachment,
      id: 'attachment-2',
      originalName: 'manager-notes.docx',
      uploadedBy: { id: 'user-manager', name: 'Mona Manager' },
    }
    stubFetch(() =>
      jsonResponse(200, {
        data: [sampleAttachment, otherUsersUpload],
        meta: { page: 1, pageSize: 50, total: 2, totalPages: 1 },
      })
    )
    renderSection()

    await screen.findByText('vendor-quote.pdf')
    await screen.findByText('manager-notes.docx')
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1)
  })

  it('deleting refreshes the list on success', async () => {
    let deleted = false
    stubFetch((url, init) => {
      if (url.pathname === '/attachments/attachment-1' && init?.method === 'DELETE') {
        deleted = true
        return new Response(null, { status: 204 })
      }
      if (url.pathname === '/requests/req-1/attachments') {
        return jsonResponse(200, {
          data: deleted ? [] : [sampleAttachment],
          meta: { page: 1, pageSize: 50, total: deleted ? 0 : 1, totalPages: 1 },
        })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderSection()
    await screen.findByText('vendor-quote.pdf')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Attachment' }))

    await waitFor(() => expect(screen.getByText('No attachments yet')).toBeInTheDocument())
  })

  it('on delete failure, refetches and preserves the attachment rather than assuming success', async () => {
    stubFetch((url, init) => {
      if (url.pathname === '/attachments/attachment-1' && init?.method === 'DELETE') {
        return errorResponse(409, 'ATTACHMENT_NOT_DELETABLE', 'Attachments cannot be deleted on a closed request.')
      }
      return jsonResponse(200, { data: [sampleAttachment], meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 } })
    })

    renderSection()
    await screen.findByText('vendor-quote.pdf')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Attachment' }))

    expect(await screen.findByText('Attachments cannot be deleted on a closed request.')).toBeInTheDocument()
    expect(screen.getByText('vendor-quote.pdf')).toBeInTheDocument()
  })

  it('does not render the upload control when the caller says the user cannot currently write', async () => {
    stubFetch(() => jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } }))
    renderSection(false)

    await screen.findByText('No attachments yet')
    expect(document.getElementById('attachment-file-input')).not.toBeInTheDocument()
  })
})

// Guard against a real regression: no dangerouslySetInnerHTML anywhere in
// this component's source, and the original filename renders as plain
// text (React escapes it), never interpreted as markup.
describe('AttachmentSection security', () => {
  it('renders a filename containing HTML-like characters as inert text', async () => {
    const maliciousName = { ...sampleAttachment, originalName: '<img src=x onerror=alert(1)>.pdf' }
    stubFetch(() =>
      jsonResponse(200, { data: [maliciousName], meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 } })
    )
    renderSection()

    expect(await screen.findByText('<img src=x onerror=alert(1)>.pdf')).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).not.toBeInTheDocument()
  })
})

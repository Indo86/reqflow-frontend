import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { ownCommentByEmployee, sampleComment } from '@/test/fixtures/collaboration'
import { CommentSection } from './comment-section'

function renderSection(canWrite = true) {
  return renderWithProviders(
    <CommentSection requestId="req-1" currentUserId="user-employee" currentUserInitials="EE" canWrite={canWrite} />
  )
}

describe('CommentSection', () => {
  it('shows a loading state while fetching', () => {
    stubFetch(() => new Promise(() => {}))
    renderSection()
    expect(screen.getByRole('status', { name: 'Loading comments' })).toBeInTheDocument()
  })

  it('shows a useful empty state rather than treating zero comments as an error', async () => {
    stubFetch(() => jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } }))
    renderSection()

    expect(await screen.findByText('No comments yet')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders real comments from the backend', async () => {
    stubFetch(() =>
      jsonResponse(200, { data: [sampleComment], meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 } })
    )
    renderSection()

    expect(await screen.findByText(sampleComment.content)).toBeInTheDocument()
    expect(screen.getByText('Mona Manager')).toBeInTheDocument()
  })

  it('posting a comment clears the draft and refetches the list on success', async () => {
    let created = false
    stubFetch((url, init) => {
      if (url.pathname === '/requests/req-1/comments' && init?.method === 'POST') {
        created = true
        return jsonResponse(201, { data: ownCommentByEmployee })
      }
      if (url.pathname === '/requests/req-1/comments') {
        return jsonResponse(200, {
          data: created ? [sampleComment, ownCommentByEmployee] : [sampleComment],
          meta: { page: 1, pageSize: 50, total: created ? 2 : 1, totalPages: 1 },
        })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderSection()
    await screen.findByText(sampleComment.content)

    const textarea = screen.getByLabelText('Add a comment')
    fireEvent.change(textarea, { target: { value: 'Quote attached below.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Post Comment' }))

    await waitFor(() => expect(screen.getByText('Quote attached below.')).toBeInTheDocument())
    expect(textarea).toHaveValue('')
  })

  it('preserves the draft when posting fails, instead of erasing it', async () => {
    stubFetch((url, init) => {
      if (url.pathname === '/requests/req-1/comments' && init?.method === 'POST') {
        return errorResponse(409, 'REQUEST_COLLABORATION_CLOSED', 'This request is closed and no longer accepts new comments or attachments.')
      }
      if (url.pathname === '/requests/req-1/comments') {
        return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderSection()
    const textarea = await screen.findByLabelText('Add a comment')
    fireEvent.change(textarea, { target: { value: 'My draft text' } })
    fireEvent.click(screen.getByRole('button', { name: 'Post Comment' }))

    expect(await screen.findByText('This request is closed and no longer accepts new comments or attachments.')).toBeInTheDocument()
    expect(textarea).toHaveValue('My draft text')
  })

  it('shows the delete action only for the current user\'s own comment', async () => {
    stubFetch(() =>
      jsonResponse(200, {
        data: [sampleComment, ownCommentByEmployee],
        meta: { page: 1, pageSize: 50, total: 2, totalPages: 1 },
      })
    )
    renderSection()

    await screen.findByText(sampleComment.content)
    // Only one delete button — for ownCommentByEmployee (author id matches
    // currentUserId="user-employee"), not for sampleComment (a different
    // author). Never inferred from role.
    expect(screen.getAllByRole('button', { name: 'Delete comment' })).toHaveLength(1)
  })

  it('does not render the comment form when the caller says the user cannot currently write', async () => {
    stubFetch(() => jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } }))
    renderSection(false)

    await screen.findByText('No comments yet')
    expect(screen.queryByLabelText('Add a comment')).not.toBeInTheDocument()
  })
})

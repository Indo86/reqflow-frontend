import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { sampleComment } from '@/test/fixtures/collaboration'
import { getComments } from './get-comments'
import { createComment } from './create-comment'
import { deleteComment } from './delete-comment'

describe('comment API layer', () => {
  it('getComments calls GET /requests/:id/comments with credentials included', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/requests/req-1/comments'
        ? jsonResponse(200, { data: [sampleComment], meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getComments('req-1')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/requests/req-1/comments' }),
      expect.objectContaining({ credentials: 'include' })
    )
    expect(result.items).toHaveLength(1)
    expect(result.items[0].content).toBe(sampleComment.content)
  })

  it('createComment sends POST /requests/:id/comments with the trimmed content', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/requests/req-1/comments'
        ? jsonResponse(201, { data: sampleComment })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await createComment('req-1', '  a new comment  ')

    const [, init] = fetchSpy.mock.calls[0]
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(JSON.parse(init!.body as string)).toEqual({ content: '  a new comment  ' })
    expect(result.id).toBe(sampleComment.id)
  })

  it('deleteComment sends DELETE /comments/:id', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/comments/comment-1' ? new Response(null, { status: 204 }) : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    await deleteComment('comment-1')

    const [, init] = fetchSpy.mock.calls[0]
    expect(init).toMatchObject({ method: 'DELETE', credentials: 'include' })
  })

  it('normalizes a 403 (not the comment author) into an ApiError with the backend message', async () => {
    stubFetch(() => errorResponse(403, 'FORBIDDEN', 'You can only edit or delete your own comments.'))

    await expect(deleteComment('comment-1')).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
      message: 'You can only edit or delete your own comments.',
    })
  })

  it('normalizes a 409 (terminal request) into an ApiError, never a raw error', async () => {
    stubFetch(() => errorResponse(409, 'REQUEST_COLLABORATION_CLOSED', 'This request is closed and no longer accepts new comments or attachments.'))

    try {
      await createComment('req-1', 'too late')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(409)
    }
  })
})

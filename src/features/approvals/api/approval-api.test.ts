import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { inboxItemForManager } from '@/test/fixtures/approvals'
import { getApprovalInbox } from './get-approval-inbox'
import { approveRequest } from './approve-request'
import { rejectRequest } from './reject-request'
import { requestRevision } from './request-revision'

describe('approval API layer', () => {
  it('getApprovalInbox calls GET /approvals/inbox with credentials included', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/approvals/inbox'
        ? jsonResponse(200, { data: [inboxItemForManager], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getApprovalInbox({ page: 1, pageSize: 20 })

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/approvals/inbox', search: '?page=1&pageSize=20' }),
      expect.objectContaining({ credentials: 'include' })
    )
    expect(result.items).toHaveLength(1)
    expect(result.items[0].request.requestNumber).toBe('REQ-2026-000001')
  })

  it('approveRequest sends POST /approvals/:id/approve with an empty body when no comment is given', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/approvals/approval-1/approve'
        ? jsonResponse(200, { data: { approvalId: 'approval-1', requestId: 'req-1', approvalStatus: 'APPROVED', requestStatus: 'APPROVED' } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await approveRequest('approval-1')

    const [, init] = fetchSpy.mock.calls[0]
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(JSON.parse(init!.body as string)).toEqual({})
    expect(result.approvalStatus).toBe('APPROVED')
  })

  it('approveRequest sends a trimmed comment when provided', async () => {
    const fetchSpy = stubFetch(() =>
      jsonResponse(200, { data: { approvalId: 'approval-1', requestId: 'req-1', approvalStatus: 'APPROVED', requestStatus: 'IN_REVIEW' } })
    )

    await approveRequest('approval-1', '  looks fine  ')

    const [, init] = fetchSpy.mock.calls[0]
    expect(JSON.parse(init!.body as string)).toEqual({ comment: 'looks fine' })
  })

  it('rejectRequest sends POST /approvals/:id/reject with the required comment', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/approvals/approval-1/reject'
        ? jsonResponse(200, { data: { approvalId: 'approval-1', requestId: 'req-1', approvalStatus: 'REJECTED', requestStatus: 'REJECTED' } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await rejectRequest('approval-1', 'Budget exceeded')

    const [, init] = fetchSpy.mock.calls[0]
    expect(init).toMatchObject({ method: 'POST' })
    expect(JSON.parse(init!.body as string)).toEqual({ comment: 'Budget exceeded' })
    expect(result.requestStatus).toBe('REJECTED')
  })

  it('requestRevision sends POST /approvals/:id/request-revision with the required comment', async () => {
    stubFetch((url) =>
      url.pathname === '/approvals/approval-1/request-revision'
        ? jsonResponse(200, {
            data: { approvalId: 'approval-1', requestId: 'req-1', approvalStatus: 'REVISION_REQUESTED', requestStatus: 'REVISION_REQUIRED' },
          })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await requestRevision('approval-1', 'Please add a quote')
    expect(result.requestStatus).toBe('REVISION_REQUIRED')
  })

  it('normalizes a 409 conflict response into an ApiError with the backend message', async () => {
    stubFetch(() => errorResponse(409, 'APPROVAL_ALREADY_DECIDED', 'This approval has already been decided.'))

    await expect(approveRequest('approval-1')).rejects.toMatchObject({
      status: 409,
      code: 'APPROVAL_ALREADY_DECIDED',
      message: 'This approval has already been decided.',
    })
  })

  it('rethrows as ApiError, never a raw fetch/JSON error', async () => {
    stubFetch(() => errorResponse(403, 'FORBIDDEN', 'You do not have permission to perform this action.'))

    try {
      await rejectRequest('approval-1', 'x')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
    }
  })
})

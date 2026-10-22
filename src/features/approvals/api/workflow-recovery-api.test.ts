import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { cancelRequest } from '@/features/requests/api/cancel-request'
import { approvalCycleStatusSchema } from '../schemas/approval.schema'
import { notificationTypeSchema } from '@/features/notifications/schemas/notification.schema'
import { getNotificationLink } from '@/features/notifications/lib/get-notification-link'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { reassignApproval } from './reassign-approval'

describe('M1 workflow recovery contracts', () => {
  it('reassignApproval POSTs the new approver and a trimmed reason', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/approvals/approval-1/reassign'
        ? jsonResponse(200, {
            data: { approvalId: 'approval-1', requestId: 'req-1', status: 'PENDING', approver: { id: 'user-2', name: 'Nadia' } },
          })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await reassignApproval('approval-1', { approverId: 'user-2', reason: '  Manager left.  ' })

    const [, init] = fetchSpy.mock.calls[0]
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(JSON.parse(init!.body as string)).toEqual({ approverId: 'user-2', reason: 'Manager left.' })
    expect(result.approver.id).toBe('user-2')
  })

  it('reassignApproval surfaces the backend business error', async () => {
    stubFetch(() => errorResponse(409, 'APPROVER_NOT_ELIGIBLE', 'The selected user cannot hold this approval step.'))
    await expect(reassignApproval('approval-1', { approverId: 'x', reason: 'r' })).rejects.toMatchObject({
      status: 409,
      code: 'APPROVER_NOT_ELIGIBLE',
    })
    await expect(reassignApproval('approval-1', { approverId: 'x', reason: 'r' })).rejects.toBeInstanceOf(ApiError)
  })

  it('cancelRequest sends no body for a draft and a trimmed reason for a withdrawal', async () => {
    const fetchSpy = stubFetch(() => jsonResponse(200, { data: { id: 'req-1', requestNumber: 'REQ-1', status: 'CANCELLED' } }))

    await cancelRequest('req-1')
    await cancelRequest('req-1', '  Wrong item.  ')

    expect(fetchSpy.mock.calls[0][1]!.body).toBeUndefined()
    expect(JSON.parse(fetchSpy.mock.calls[1][1]!.body as string)).toEqual({ reason: 'Wrong item.' })
  })

  it('accepts the new enum values the backend can now send, so responses still parse', () => {
    expect(approvalCycleStatusSchema.parse('CANCELLED')).toBe('CANCELLED')
    expect(notificationTypeSchema.parse('REQUEST_WITHDRAWN')).toBe('REQUEST_WITHDRAWN')
    expect(notificationTypeSchema.parse('APPROVAL_REASSIGNED')).toBe('APPROVAL_REASSIGNED')
  })

  it('links a withdrawal notification to the approval (an approver cannot open the request) and never links a reassignment', () => {
    expect(getNotificationLink({ type: 'REQUEST_WITHDRAWN', requestId: 'req-1', approvalId: 'approval-1' })).toBe('/approvals/approval-1')
    expect(getNotificationLink({ type: 'REQUEST_WITHDRAWN', requestId: 'req-1', approvalId: null })).toBeUndefined()
    expect(getNotificationLink({ type: 'APPROVAL_REASSIGNED', requestId: 'req-1', approvalId: null })).toBeUndefined()
  })
})

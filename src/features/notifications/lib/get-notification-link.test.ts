import { describe, expect, it } from 'vitest'
import { getNotificationLink } from './get-notification-link'

describe('getNotificationLink', () => {
  it('APPROVAL_ASSIGNED with an approvalId links to the exact approval', () => {
    expect(getNotificationLink({ type: 'APPROVAL_ASSIGNED', requestId: 'req-1', approvalId: 'approval-1' })).toBe(
      '/approvals/approval-1'
    )
  })

  it('APPROVAL_ASSIGNED without an approvalId falls back to the approvals inbox', () => {
    expect(getNotificationLink({ type: 'APPROVAL_ASSIGNED', requestId: 'req-1', approvalId: null })).toBe(
      '/approvals'
    )
  })

  it('APPROVAL_ASSIGNED without an approvalId or a requestId constructs no link at all', () => {
    expect(getNotificationLink({ type: 'APPROVAL_ASSIGNED', requestId: null, approvalId: null })).toBeUndefined()
  })

  it('REQUEST_APPROVED links straight to the request', () => {
    expect(getNotificationLink({ type: 'REQUEST_APPROVED', requestId: 'req-2', approvalId: null })).toBe(
      '/requests/req-2'
    )
  })

  it('REQUEST_REJECTED links straight to the request', () => {
    expect(getNotificationLink({ type: 'REQUEST_REJECTED', requestId: 'req-3', approvalId: null })).toBe(
      '/requests/req-3'
    )
  })

  it('REQUEST_REVISION_REQUIRED links straight to the request', () => {
    expect(getNotificationLink({ type: 'REQUEST_REVISION_REQUIRED', requestId: 'req-4', approvalId: null })).toBe(
      '/requests/req-4'
    )
  })

  it('a missing requestId on an owner notification type constructs no link, never a broken /requests/null', () => {
    expect(getNotificationLink({ type: 'REQUEST_APPROVED', requestId: null, approvalId: null })).toBeUndefined()
  })

  it('an approvalId present on a non-APPROVAL_ASSIGNED type is ignored — still routes by requestId', () => {
    // Defensive: today only APPROVAL_ASSIGNED ever carries a non-null
    // approvalId, but this proves the function never blindly prefers
    // approvalId regardless of type.
    expect(
      getNotificationLink({
        type: 'REQUEST_APPROVED',
        requestId: 'req-5',
        approvalId: 'approval-should-be-ignored',
      })
    ).toBe('/requests/req-5')
  })
})

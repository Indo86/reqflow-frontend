import type { Notification } from '../types/notification'

// A destination is only safe to construct where the backend's own notify*
// functions guarantee who the recipient is:
//
// - APPROVAL_ASSIGNED is sent to the assigned approver for that step
//   (notification.service.ts notifyApprovalAssigned), who reviews via
//   /approvals/:approvalId. Post-F6-contract-completion, approvalId is
//   populated for every newly-created APPROVAL_ASSIGNED notification, so
//   this links directly to the specific approval. A notification created
//   before that field existed (approvalId: null — a legacy row, never
//   backfilled) falls back to the approver's own inbox, same as before —
//   still safe and always accessible, just less specific.
// - REQUEST_APPROVED / REQUEST_REJECTED / REQUEST_REVISION_REQUIRED are
//   always sent to the request's owner (notifyRequestApproved,
//   notifyRequestRejected, notifyRevisionRequired), who can read
//   /requests/:requestId directly.
//
// Returns undefined when neither requestId nor approvalId is available to
// build a link from (e.g. requestId null because the Request was deleted,
// for a non-APPROVAL_ASSIGNED type) — callers must not construct a link in
// that case. See F5 "Deep-link navigation" / "DEEP_LINK_LIMITED_BY_BACKEND_CONTRACT".
export function getNotificationLink(
  notification: Pick<Notification, 'type' | 'requestId' | 'approvalId'>
): string | undefined {
  if (notification.type === 'APPROVAL_ASSIGNED') {
    if (notification.approvalId) return `/approvals/${notification.approvalId}`
    return notification.requestId ? '/approvals' : undefined
  }

  // M1: both are sent to an approver, never the owner, so /requests/:id would
  // 404 for them. A withdrawn request's approval stays readable to its assigned
  // approver; a reassigned-away approver can no longer open anything.
  if (notification.type === 'REQUEST_WITHDRAWN') {
    return notification.approvalId ? `/approvals/${notification.approvalId}` : undefined
  }
  if (notification.type === 'APPROVAL_REASSIGNED') return undefined

  // M4. The assignee, the Admins and the requester can all read the request
  // (the read policy admits an executor), so each opens the request itself.
  // The previous assignee loses access on reassignment, so theirs has no link.
  if (notification.type === 'FULFILLMENT_REASSIGNED') return undefined

  return notification.requestId ? `/requests/${notification.requestId}` : undefined
}

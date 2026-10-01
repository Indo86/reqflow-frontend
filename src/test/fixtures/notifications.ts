// Sample Notification DTOs matching notification.service.ts's
// NotificationResponse shape exactly (id, type, title, message, requestId,
// approvalId, readAt, createdAt — no isRead boolean). See F5/F6-contract-
// completion "backend contract".
export const unreadApprovalAssignedNotification = {
  id: 'notif-1',
  type: 'APPROVAL_ASSIGNED',
  title: 'Approval required',
  message: 'REQ-2026-000124 requires your approval.',
  requestId: 'req-124',
  approvalId: 'approval-1',
  readAt: null,
  createdAt: '2026-09-24T08:00:00.000Z',
}

// A notification created before the approvalId field existed (or any other
// APPROVAL_ASSIGNED row that somehow never got one) — approvalId stays
// null forever; never backfilled.
export const unreadApprovalAssignedNotificationLegacy = {
  id: 'notif-1-legacy',
  type: 'APPROVAL_ASSIGNED',
  title: 'Approval required',
  message: 'REQ-2026-000099 requires your approval.',
  requestId: 'req-099',
  approvalId: null,
  readAt: null,
  createdAt: '2026-09-20T08:00:00.000Z',
}

export const readRequestApprovedNotification = {
  id: 'notif-2',
  type: 'REQUEST_APPROVED',
  title: 'Request approved',
  message: 'REQ-2026-000119 was approved.',
  requestId: 'req-119',
  approvalId: null,
  readAt: '2026-09-24T09:00:00.000Z',
  createdAt: '2026-09-24T07:00:00.000Z',
}

export const unreadRevisionRequiredNotification = {
  id: 'notif-3',
  type: 'REQUEST_REVISION_REQUIRED',
  title: 'Revision required',
  message: 'REQ-2026-000118 needs changes.',
  requestId: 'req-118',
  approvalId: null,
  readAt: null,
  createdAt: '2026-09-23T12:00:00.000Z',
}

export const unreadRejectedNotificationWithDeletedRequest = {
  id: 'notif-4',
  type: 'REQUEST_REJECTED',
  title: 'Request rejected',
  message: 'A request you submitted was rejected.',
  requestId: null,
  approvalId: null,
  readAt: null,
  createdAt: '2026-09-22T12:00:00.000Z',
}

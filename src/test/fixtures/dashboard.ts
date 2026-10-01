// Sample M10 DTOs matching dashboard.service.ts's response shapes exactly
// (zero-filled byStatus/byType, Decimal-as-string amounts, no isRead-style
// booleans) — verified by direct backend inspection. See F6 "backend
// contract".
const zeroByStatus = {
  DRAFT: 0,
  SUBMITTED: 0,
  IN_REVIEW: 0,
  REVISION_REQUIRED: 0,
  APPROVED: 0,
  REJECTED: 0,
  CANCELLED: 0,
}

const zeroByType = {
  PURCHASE: 0,
  EQUIPMENT: 0,
  REIMBURSEMENT: 0,
  LEAVE: 0,
  GENERAL: 0,
}

export const dashboardSummaryFixture = {
  requests: {
    total: 6,
    byStatus: { ...zeroByStatus, SUBMITTED: 2, IN_REVIEW: 1, APPROVED: 2, REJECTED: 1 },
    byType: { ...zeroByType, PURCHASE: 4, EQUIPMENT: 2 },
  },
  approvals: { pendingForCurrentUser: 3 },
  notifications: { unreadForCurrentUser: 2 },
  amounts: { count: 6, total: '48000000.50' },
}

export const emptyDashboardSummaryFixture = {
  requests: { total: 0, byStatus: zeroByStatus, byType: zeroByType },
  approvals: { pendingForCurrentUser: 0 },
  notifications: { unreadForCurrentUser: 0 },
  amounts: { count: 0, total: null },
}

export const requestsOverTimeFixture = {
  bucket: 'month' as const,
  from: '2026-04-01T00:00:00.000Z',
  to: '2026-09-24T00:00:00.000Z',
  points: [
    { periodStart: '2026-07-01T00:00:00.000Z', count: 4 },
    { periodStart: '2026-08-01T00:00:00.000Z', count: 7 },
    { periodStart: '2026-09-01T00:00:00.000Z', count: 3 },
  ],
}

export const recentActivityFixture = [
  {
    id: 'audit-2',
    action: 'APPROVAL_STEP_APPROVED',
    entityType: 'APPROVAL',
    entityId: 'approval-1',
    requestId: 'req-1',
    actorId: 'user-manager',
    createdAt: '2026-09-24T09:00:00.000Z',
    metadata: { isFinalStep: false },
  },
  {
    id: 'audit-1',
    action: 'REQUEST_SUBMITTED',
    entityType: 'REQUEST',
    entityId: 'req-1',
    requestId: 'req-1',
    actorId: 'user-employee',
    createdAt: '2026-09-24T08:00:00.000Z',
    metadata: null,
  },
]

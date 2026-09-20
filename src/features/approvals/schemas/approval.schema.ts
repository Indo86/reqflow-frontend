import { z } from 'zod'

// Mirrors reqFlow-backend's Approval* enums (prisma/schema.prisma) and
// approval.service.ts's InboxItem/ApprovalDetail/ApprovalCycleHistoryItem
// shapes — verified by direct backend inspection. Self-contained (does not
// import from features/requests/schemas) so this file and request.schema.ts
// can reference each other's exported schemas in one direction only
// (requests -> approvals, for the approvalCycles field embedded in Request
// detail) without a circular module dependency.
export const approvalStepTypeSchema = z.enum(['MANAGER', 'FINANCE', 'DIRECTOR'])
export const approvalStatusSchema = z.enum([
  'WAITING',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'REVISION_REQUESTED',
  'SKIPPED',
])
export const approvalCycleStatusSchema = z.enum(['ACTIVE', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'])
export const approvalPolicySchema = z.enum(['MANAGER_ONLY', 'MANAGER_FINANCE', 'MANAGER_FINANCE_DIRECTOR'])

const approverSchema = z.object({ id: z.string(), name: z.string() })

export const approvalHistoryItemSchema = z.object({
  id: z.string(),
  stepOrder: z.number(),
  stepType: approvalStepTypeSchema,
  status: approvalStatusSchema,
  decisionComment: z.string().nullable(),
  approver: approverSchema,
  createdAt: z.string(),
  decidedAt: z.string().nullable(),
})

// Embedded in GET /requests/:id's response (request.service.ts
// requestDetailSelect) — there is no separate "approval context" endpoint;
// the request detail response IS the approval context. See request.schema.ts.
export const approvalCycleHistoryItemSchema = z.object({
  cycleNumber: z.number(),
  policy: approvalPolicySchema,
  status: approvalCycleStatusSchema,
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  approvals: z.array(approvalHistoryItemSchema),
})

// Local, minimal copies of the request type/status enums — intentionally not
// imported from features/requests/schemas to keep the dependency one-way
// (see file header). RequestSummary in the backend never includes every
// Request field, only these — see approval.service.ts requestSummarySelect.
const inboxRequestTypeSchema = z.enum(['PURCHASE', 'EQUIPMENT', 'REIMBURSEMENT', 'LEAVE', 'GENERAL'])
const inboxRequestStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
])

const inboxRequestSummarySchema = z.object({
  id: z.string(),
  requestNumber: z.string(),
  type: inboxRequestTypeSchema,
  title: z.string(),
  amount: z.string().nullable(),
  status: inboxRequestStatusSchema,
  createdBy: approverSchema,
  department: z.object({ id: z.string(), name: z.string() }).nullable(),
})

// GET /approvals/inbox — only the signed-in user's own PENDING steps
// (approval.service.ts listInbox: `approverId: user.id, status: PENDING`).
// No `createdAt`/submitted-date field exists on this row — see
// listInbox's Prisma select — so it is never rendered as if it did.
export const inboxItemSchema = z.object({
  id: z.string(),
  cycleNumber: z.number(),
  stepOrder: z.number(),
  stepType: approvalStepTypeSchema,
  status: approvalStatusSchema,
  request: inboxRequestSummarySchema,
})

export const approvalInboxResponseSchema = z.object({
  data: z.array(inboxItemSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// GET /approvals/:id — approval.service.ts getApprovalDetail. Authorizes
// the assigned approver, the request's owner, or an org admin (read only —
// decision authority is checked separately by the decide endpoints). This
// is deliberately NOT the same shape as GET /requests/:id's response: it
// carries only RequestSummary (no description, no full approvalCycles
// history) plus this one approval's own fields. See
// features/requests/pages/request-detail-page.tsx's header comment and F3
// "known limitations" for why an approver reviews here rather than on the
// Request Detail page — GET /requests/:id is owner/admin-only.
export const approvalDetailResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    cycleNumber: z.number(),
    stepOrder: z.number(),
    stepType: approvalStepTypeSchema,
    status: approvalStatusSchema,
    decisionComment: z.string().nullable(),
    createdAt: z.string(),
    decidedAt: z.string().nullable(),
    approver: approverSchema,
    cyclePolicy: approvalPolicySchema,
    request: inboxRequestSummarySchema,
  }),
})

// POST /approvals/:id/{approve,reject,request-revision} — all three share
// this response shape (ApprovalDecisionResult in approval.service.ts).
export const approvalDecisionResponseSchema = z.object({
  data: z.object({
    approvalId: z.string(),
    requestId: z.string(),
    approvalStatus: approvalStatusSchema,
    requestStatus: inboxRequestStatusSchema,
  }),
})

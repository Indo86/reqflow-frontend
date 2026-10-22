import { z } from 'zod'

// Memvalidasi bentuk data sesuai kontrak API.
export const approvalStepTypeSchema = z.enum(['MANAGER', 'FINANCE', 'DIRECTOR'])
export const approvalStatusSchema = z.enum([
  'WAITING',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'REVISION_REQUESTED',
  'SKIPPED',
])
// Memvalidasi status siklus persetujuan.
export const approvalCycleStatusSchema = z.enum(['ACTIVE', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'CANCELLED'])
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

// Memvalidasi riwayat approval pada detail request.
export const approvalCycleHistoryItemSchema = z.object({
  cycleNumber: z.number(),
  policy: approvalPolicySchema,
  status: approvalCycleStatusSchema,
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  approvals: z.array(approvalHistoryItemSchema),
})

// Memvalidasi bentuk data sesuai kontrak API.
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

// Mengambil data dari /approvals/inbox.
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

// Memvalidasi detail approval dari /approvals/:id.
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

// Memvalidasi respons aksi keputusan approval.
export const approvalDecisionResponseSchema = z.object({
  data: z.object({
    approvalId: z.string(),
    requestId: z.string(),
    approvalStatus: approvalStatusSchema,
    requestStatus: inboxRequestStatusSchema,
  }),
})

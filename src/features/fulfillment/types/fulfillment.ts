import type { z } from 'zod'
import type { BadgeVariant } from '@/components/shared/badge'
import type { RequestType } from '@/features/requests/types/request'
import type {
  assignmentCandidatesResponseSchema,
  fulfillmentApplicabilitySchema,
  fulfillmentListResponseSchema,
  fulfillmentResponseSchema,
  fulfillmentStatusSchema,
} from '../schemas/fulfillment.schema'

export type FulfillmentStatus = z.infer<typeof fulfillmentStatusSchema>
export type FulfillmentApplicability = z.infer<typeof fulfillmentApplicabilitySchema>
export type FulfillmentView = z.infer<typeof fulfillmentResponseSchema>['data']
export type FulfillmentRecord = NonNullable<FulfillmentView['fulfillment']>
export type FulfillmentPermissions = FulfillmentView['permissions']
export type AssignmentCandidate = z.infer<typeof assignmentCandidatesResponseSchema>['data'][number]
export type FulfillmentList = z.infer<typeof fulfillmentListResponseSchema>
export type FulfillmentListItem = FulfillmentList['data'][number]

export const fulfillmentStatusLabels: Record<FulfillmentStatus, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const fulfillmentStatusVariants: Record<FulfillmentStatus, BadgeVariant> = {
  NOT_STARTED: 'amber',
  IN_PROGRESS: 'accent',
  COMPLETED: 'green',
  CANCELLED: 'muted',
}

// Menyimpan petunjuk penyelesaian untuk setiap jenis request.
export const completionPrompts: Record<RequestType, { label: string; description: string }> = {
  PURCHASE: {
    label: 'Purchase or receipt confirmation',
    description: 'Record what was bought or received: vendor, date, and an order or invoice reference.',
  },
  REIMBURSEMENT: {
    label: 'Internal payment confirmation',
    description:
      'Record that the claim was paid: date and channel or reference. This is an internal note, not bank verification.',
  },
  EQUIPMENT: {
    label: 'Handover confirmation',
    description: 'Record the handover: asset description or tag, who received it, and the date. This is not an inventory record.',
  },
  GENERAL: {
    label: 'What was done',
    description: 'Describe what was carried out and when.',
  },
  LEAVE: { label: 'Completion note', description: 'Leave requests are not fulfilled in ReqFlow.' },
}

export const MIN_NOTE_LENGTH = 10

export function formatDateTime(value: string | null): string {
  return value ? new Date(value).toLocaleString() : '—'
}

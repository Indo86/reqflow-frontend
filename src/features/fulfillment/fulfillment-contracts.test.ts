import { describe, expect, it } from 'vitest'
import { describeAuditEntry } from '@/features/requests/audit/describe-audit-entry'
import { describeViewer } from '@/features/requests/lib/describe-viewer'
import { requestDetailResponseSchema, requestListResponseSchema } from '@/features/requests/schemas/request.schema'
import { notificationSchema } from '@/features/notifications/schemas/notification.schema'
import { getNotificationLink } from '@/features/notifications/lib/get-notification-link'
import { getNotificationPresentation } from '@/features/notifications/lib/notification-presentation'
import { notificationTypeLabels } from '@/features/notifications/types/notification'
import { fulfillmentResponseSchema, fulfillmentSummarySchema } from './schemas/fulfillment.schema'
import { productionNavigationByRole } from '@/lib/mock/navigation'

const baseRequest = {
  id: 'r1', requestNumber: 'REQ-1', type: 'PURCHASE', title: 'Laptops', description: 'text', amount: '4999999.99',
  status: 'APPROVED', createdAt: '2026-10-22T08:00:00.000Z', updatedAt: '2026-10-22T08:00:00.000Z',
  createdBy: { id: 'u1', name: 'Andi' }, department: { id: 'd1', name: 'Engineering' },
  viewer: { relationship: 'OWNER', approval: null },
}
const meta = { page: 1, pageSize: 20, total: 1, totalPages: 1 }

describe('fulfillment data contracts', () => {
  it('parses request responses with and without the M4 summary (older server compatibility)', () => {
    const detail = { ...baseRequest, approvalCycles: [], commentsCount: 0, attachmentsCount: 0 }
    expect(requestDetailResponseSchema.parse({ data: detail }).data.fulfillment).toBeUndefined()
    const withSummary = { ...detail, fulfillment: { applicability: 'TRACKED', status: 'NOT_STARTED', assignee: { id: 'u2', name: 'Fiona' } } }
    expect(requestDetailResponseSchema.parse({ data: withSummary }).data.fulfillment?.status).toBe('NOT_STARTED')
    expect(requestListResponseSchema.parse({ data: [baseRequest], meta }).data).toHaveLength(1)
  })

  it('accepts the executor relationship and describes it as a role, not as extra rights', () => {
    const parsed = requestListResponseSchema.parse({ data: [{ ...baseRequest, viewer: { relationship: 'EXECUTOR', approval: null } }], meta })
    expect(describeViewer(parsed.data[0].viewer)).toEqual({ label: 'You fulfil this', variant: 'accent' })
  })

  it('knows every applicability and status, and rejects an unknown status', () => {
    for (const applicability of ['NOT_APPROVED', 'NOT_REQUIRED', 'TRACKED', 'NOT_TRACKED']) {
      expect(fulfillmentSummarySchema.parse({ applicability, status: null, assignee: null }).applicability).toBe(applicability)
    }
    expect(() => fulfillmentSummarySchema.parse({ applicability: 'TRACKED', status: 'PAID', assignee: null })).toThrow()
  })

  it('parses the full fulfillment response including server-computed permissions', () => {
    const parsed = fulfillmentResponseSchema.parse({
      data: {
        requestId: 'r1', applicability: 'TRACKED',
        fulfillment: { id: 'f1', status: 'CANCELLED', assignee: null, startedAt: null, closedAt: 'x', closedBy: { id: 'a', name: 'Admin' }, closingNote: 'why', createdAt: 'x', updatedAt: 'x' },
        permissions: { canStart: false, canComplete: false, canCancel: false, canAssign: false, canComment: false, canAddEvidence: false },
      },
    })
    expect(parsed.data.fulfillment?.status).toBe('CANCELLED')
  })
})

describe('fulfillment presentation', () => {
  it('describes each fulfillment audit action in plain words', () => {
    const entry = (action: string, metadata: Record<string, unknown> | null) =>
      describeAuditEntry({ id: 'e', action, entityType: 'FULFILLMENT', actor: null, metadata, createdAt: 'x' })
    expect(entry('FULFILLMENT_CREATED', { assigneeName: 'Fiona' }).title).toBe('Fulfillment opened and assigned to Fiona')
    expect(entry('FULFILLMENT_CREATED', { assigneeName: null }).title).toBe('Fulfillment opened with nobody assigned')
    expect(entry('FULFILLMENT_ASSIGNED', { previousAssigneeName: 'A', newAssigneeName: 'B', reason: 'Away' })).toEqual({
      title: 'Fulfillment reassigned from A to B', detail: 'Reason: Away',
    })
    expect(entry('FULFILLMENT_STARTED', {}).title).toBe('Fulfillment started')
    expect(entry('FULFILLMENT_COMPLETED', { note: 'Paid, ref 12' })).toEqual({ title: 'Fulfillment recorded as completed', detail: 'Paid, ref 12' })
    expect(entry('FULFILLMENT_CANCELLED', { reason: 'Gone' })).toEqual({ title: 'Fulfillment cancelled', detail: 'Reason: Gone' })
  })

  it('parses and presents every new notification type, and links only where the recipient can read the request', () => {
    const types = ['FULFILLMENT_ASSIGNED', 'FULFILLMENT_REASSIGNED', 'FULFILLMENT_NEEDS_OWNER', 'FULFILLMENT_COMPLETED', 'FULFILLMENT_CANCELLED'] as const
    for (const type of types) {
      const parsed = notificationSchema.parse({ id: 'n', type, title: 't', message: 'm', requestId: 'r1', approvalId: null, readAt: null, createdAt: 'x' })
      expect(notificationTypeLabels[parsed.type]).toBeTruthy()
      expect(getNotificationPresentation(type).icon).toBeTruthy()
      expect(getNotificationLink({ type, requestId: 'r1', approvalId: null })).toBe(type === 'FULFILLMENT_REASSIGNED' ? undefined : '/requests/r1')
    }
  })

  it('offers the Fulfillment page to every role', () => {
    for (const items of Object.values(productionNavigationByRole)) {
      expect(items.find((item) => item.key === 'fulfillment')?.href).toBe('/fulfillment')
    }
  })
})

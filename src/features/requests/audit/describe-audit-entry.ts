import type { AuditEntry } from './audit.schema'

const STEP_LABEL: Record<string, string> = { MANAGER: 'Manager', FINANCE: 'Finance', DIRECTOR: 'Director' }
const POLICY_LABEL: Record<string, string> = {
  MANAGER_ONLY: 'Manager',
  MANAGER_FINANCE: 'Manager, then Finance',
  MANAGER_FINANCE_DIRECTOR: 'Manager, Finance, then Director',
}

export interface AuditDescription {
  title: string
  // Menangani komentar pada request.
  detail?: string
}

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined

const withReason = (value: unknown): string | undefined => {
  const reason = text(value)
  return reason ? `Reason: ${reason}` : undefined
}

// Menyiapkan data untuk ditampilkan di antarmuka.
export function describeAuditEntry(entry: AuditEntry): AuditDescription {
  const meta = entry.metadata ?? {}
  const step = STEP_LABEL[String(meta.stepType)] ?? 'Approver'

  switch (entry.action) {
    case 'REQUEST_CREATED':
      return { title: 'Request created as a draft' }
    case 'REQUEST_UPDATED': {
      const fields = Array.isArray(meta.changedFields) ? meta.changedFields.filter((f) => typeof f === 'string') : []
      return { title: 'Request edited', detail: fields.length ? `Changed: ${fields.join(', ')}` : undefined }
    }
    case 'REQUEST_DELETED':
      return { title: 'Draft deleted' }
    case 'REQUEST_SUBMITTED':
      return { title: 'Submitted for approval' }
    case 'REQUEST_RESUBMITTED':
      return { title: 'Resubmitted for approval' }
    case 'REQUEST_CANCELLED':
      return meta.fromStatus === 'IN_REVIEW'
        ? { title: 'Withdrawn by its owner while in review', detail: withReason(meta.reason) }
        : { title: 'Cancelled by its owner', detail: withReason(meta.reason) }
    case 'APPROVAL_CYCLE_STARTED': {
      const round = typeof meta.cycleNumber === 'number' ? ` ${meta.cycleNumber}` : ''
      const policy = POLICY_LABEL[String(meta.policy)]
      return { title: `Approval round${round} started`, detail: policy ? `Route: ${policy}` : undefined }
    }
    case 'APPROVAL_STEP_APPROVED':
      return { title: meta.isFinalStep === true ? `${step} approved. Request fully approved` : `${step} approved` }
    case 'APPROVAL_STEP_REJECTED':
      return { title: `${step} rejected the request`, detail: text(meta.decisionComment) }
    case 'APPROVAL_STEP_REVISION_REQUESTED':
      return { title: `${step} asked for a revision`, detail: text(meta.decisionComment) }
    case 'APPROVAL_REASSIGNED': {
      const from = text(meta.previousApproverName)
      const to = text(meta.newApproverName)
      return {
        title: `${step} approval reassigned${from && to ? ` from ${from} to ${to}` : ''}`,
        detail: withReason(meta.reason),
      }
    }
    case 'COMMENT_CREATED':
      return { title: 'Comment added' }
    case 'COMMENT_UPDATED':
      return { title: 'Comment edited' }
    case 'COMMENT_DELETED':
      return { title: 'Comment removed' }
    case 'ATTACHMENT_ADDED':
      return { title: 'Attachment added', detail: text(meta.originalName) }
    case 'ATTACHMENT_DELETED':
      return { title: 'Attachment removed' }
    case 'FULFILLMENT_CREATED': {
      const to = text(meta.assigneeName)
      return {
        title: to ? `Fulfillment opened and assigned to ${to}` : 'Fulfillment opened with nobody assigned',
      }
    }
    case 'FULFILLMENT_ASSIGNED': {
      const from = text(meta.previousAssigneeName)
      const to = text(meta.newAssigneeName)
      return {
        title: from && to ? `Fulfillment reassigned from ${from} to ${to}` : `Fulfillment assigned${to ? ` to ${to}` : ''}`,
        detail: withReason(meta.reason),
      }
    }
    case 'FULFILLMENT_STARTED':
      return { title: 'Fulfillment started' }
    case 'FULFILLMENT_COMPLETED':
      return { title: 'Fulfillment recorded as completed', detail: text(meta.note) }
    case 'FULFILLMENT_CANCELLED':
      return { title: 'Fulfillment cancelled', detail: withReason(meta.reason) }
    default:
      return { title: 'Activity recorded' }
  }
}

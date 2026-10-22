import { useState } from 'react'
import { Badge } from '@/components/shared/badge'
import { ApiError } from '@/lib/api'
import { ApprovalDecisionDialog } from '@/features/approvals/components/approval-decision-dialog'
import { describeAuditEntry } from '@/features/requests/audit/describe-audit-entry'
import { useRequestAuditLogQuery } from '@/features/requests/audit/use-request-audit-log-query'
import type { RequestType } from '@/features/requests/types/request'
import {
  useCancelFulfillmentMutation,
  useCompleteFulfillmentMutation,
  useFulfillmentQuery,
  useStartFulfillmentMutation,
} from '../hooks/use-fulfillment'
import {
  completionPrompts,
  fulfillmentStatusLabels,
  fulfillmentStatusVariants,
  formatDateTime,
  MIN_NOTE_LENGTH,
  type FulfillmentRecord,
} from '../types/fulfillment'
import { AssignFulfillmentDialog } from './assign-fulfillment-dialog'

interface FulfillmentSectionProps {
  requestId: string
  requestType: RequestType
}

const messageOf = (error: unknown, fallback: string) => (error instanceof ApiError ? error.message : fallback)

// Execution after approval. Approval says a request is permitted; this says
// whether someone carried it out. Everything shown comes from the server,
// including which controls the signed-in user may use: the UI never decides
// authority itself, and the server re-checks every action. Completion is an
// internal record written by the executor; it is never described as verified.
export function FulfillmentSection({ requestId, requestType }: FulfillmentSectionProps) {
  const query = useFulfillmentQuery(requestId)
  const startMutation = useStartFulfillmentMutation(requestId)
  const completeMutation = useCompleteFulfillmentMutation(requestId)
  const cancelMutation = useCancelFulfillmentMutation(requestId)
  const [dialog, setDialog] = useState<'complete' | 'cancel' | 'assign' | null>(null)
  const [dialogError, setDialogError] = useState<string | undefined>(undefined)
  const [actionError, setActionError] = useState<string | undefined>(undefined)

  if (query.isPending) return <p className="body-text">Loading fulfillment…</p>
  if (query.isError) {
    return (
      <div>
        <p className="body-text" role="alert">
          {messageOf(query.error, 'Fulfillment could not be loaded.')}
        </p>
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => void query.refetch()}>
          Retry
        </button>
      </div>
    )
  }

  const { applicability, fulfillment, permissions } = query.data

  if (applicability === 'NOT_REQUIRED') {
    return <p className="body-text">No fulfillment is required for this type of request. Its approval is final.</p>
  }
  if (applicability === 'NOT_TRACKED') {
    return (
      <p className="body-text">
        Approved before fulfillment tracking. Whether this request was carried out was not recorded, so it is not shown as
        completed or pending.
      </p>
    )
  }
  if (applicability !== 'TRACKED' || !fulfillment) return null

  const prompt = completionPrompts[requestType]
  const isOpen = fulfillment.status === 'NOT_STARTED' || fulfillment.status === 'IN_PROGRESS'

  function openDialog(next: 'complete' | 'cancel' | 'assign') {
    setDialogError(undefined)
    setDialog(next)
  }

  function runStart() {
    setActionError(undefined)
    startMutation.mutate(undefined, { onError: (e) => setActionError(messageOf(e, 'Could not start this fulfillment.')) })
  }

  function runComplete(note: string) {
    if (note.length < MIN_NOTE_LENGTH) return setDialogError(`The note must be at least ${MIN_NOTE_LENGTH} characters.`)
    setDialogError(undefined)
    completeMutation.mutate(note, {
      onSuccess: () => setDialog(null),
      onError: (e) => setDialogError(messageOf(e, 'Could not record completion.')),
    })
  }

  function runCancel(reason: string) {
    if (reason.length < MIN_NOTE_LENGTH) return setDialogError(`The reason must be at least ${MIN_NOTE_LENGTH} characters.`)
    setDialogError(undefined)
    cancelMutation.mutate(reason, {
      onSuccess: () => setDialog(null),
      onError: (e) => setDialogError(messageOf(e, 'Could not cancel this fulfillment.')),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge variant={fulfillmentStatusVariants[fulfillment.status]}>{fulfillmentStatusLabels[fulfillment.status]}</Badge>
        <span className="body-text">{assigneeSentence(fulfillment)}</span>
      </div>

      {isOpen && !fulfillment.assignee ? (
        <p className="body-text" role="note">
          Approved, but nobody is responsible for carrying it out yet.
          {permissions.canAssign ? ' Assign someone below.' : ' An administrator needs to assign someone.'}
        </p>
      ) : null}

      {fulfillment.startedAt ? (
        <div className="approval-step-meta">Started {formatDateTime(fulfillment.startedAt)}</div>
      ) : null}

      {fulfillment.status === 'COMPLETED' ? (
        <div>
          <p className="body-text" style={{ fontWeight: 600 }}>
            Recorded as completed by {fulfillment.closedBy?.name ?? 'the executor'} on {formatDateTime(fulfillment.closedAt)}
          </p>
          <p className="body-text">{fulfillment.closingNote}</p>
          <p className="approval-step-meta">Recorded internally by the executor. It is not independently verified.</p>
        </div>
      ) : null}

      {fulfillment.status === 'CANCELLED' ? (
        <div>
          <p className="body-text" style={{ fontWeight: 600 }}>
            Cancelled by {fulfillment.closedBy?.name ?? 'an administrator'} on {formatDateTime(fulfillment.closedAt)}
          </p>
          <p className="body-text">Reason: {fulfillment.closingNote}</p>
          <p className="approval-step-meta">The approval itself is unchanged.</p>
        </div>
      ) : null}

      {actionError ? (
        <div role="alert" className="body-text" style={{ color: 'var(--red-text)' }}>
          {actionError}
        </div>
      ) : null}

      {permissions.canStart || permissions.canComplete || permissions.canAssign || permissions.canCancel ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {permissions.canStart ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={runStart} disabled={startMutation.isPending}>
              {startMutation.isPending ? 'Starting…' : 'Start'}
            </button>
          ) : null}
          {permissions.canComplete ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openDialog('complete')}>
              Complete
            </button>
          ) : null}
          {permissions.canAssign ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => openDialog('assign')}>
              {fulfillment.assignee ? 'Reassign' : 'Assign'}
            </button>
          ) : null}
          {permissions.canCancel ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => openDialog('cancel')}>
              Cancel fulfillment
            </button>
          ) : null}
        </div>
      ) : null}

      <FulfillmentHistory requestId={requestId} />

      {/* Mounted only while open: the shared decision dialog uses fixed element ids and a closed
          dialog stays in the DOM, so two always-mounted copies would share one textarea id. */}
      {dialog === 'complete' ? (
        <ApprovalDecisionDialog
          open
          title="Record completion"
          description={`${prompt.description} Completion is recorded by you and is not verified by ReqFlow.`}
          commentLabel={prompt.label}
          commentRequired
          confirmLabel="Record completion"
          isSubmitting={completeMutation.isPending}
          errorMessage={dialogError}
          onCancel={() => setDialog(null)}
          onConfirm={runComplete}
        />
      ) : null}
      {dialog === 'cancel' ? (
        <ApprovalDecisionDialog
          open
          title="Cancel this fulfillment?"
          description="Nobody will carry this request out through ReqFlow. The request stays approved and its approval history is unchanged. This cannot be undone."
          commentLabel="Reason for cancelling"
          commentRequired
          confirmLabel="Confirm cancellation"
          isSubmitting={cancelMutation.isPending}
          errorMessage={dialogError}
          onCancel={() => setDialog(null)}
          onConfirm={runCancel}
        />
      ) : null}
      <AssignFulfillmentDialog
        open={dialog === 'assign'}
        requestId={requestId}
        currentAssigneeName={fulfillment.assignee?.name ?? null}
        onClose={() => setDialog(null)}
      />
    </div>
  )
}

function assigneeSentence(fulfillment: FulfillmentRecord): string {
  if (fulfillment.assignee) return `Assigned to ${fulfillment.assignee.name}`
  return fulfillment.status === 'CANCELLED' || fulfillment.status === 'COMPLETED' ? 'No assignee recorded' : 'Unassigned'
}

// Read-only, from the append-only audit log: who did what and why. Visible to
// anyone who can read the request; the server decides what each reader receives.
function FulfillmentHistory({ requestId }: { requestId: string }) {
  const query = useRequestAuditLogQuery(requestId)
  if (query.isPending || query.isError) return null
  const entries = query.data.data.filter((entry) => entry.entityType === 'FULFILLMENT')
  if (entries.length === 0) return null
  return (
    <div>
      <div className="field-label" style={{ marginBottom: 6 }}>
        Fulfillment history
      </div>
      <ol
        aria-label="Fulfillment history"
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {entries.map((entry) => {
          const { title, detail } = describeAuditEntry(entry)
          return (
            <li key={entry.id}>
              <div className="body-text" style={{ fontWeight: 600 }}>
                {title}
              </div>
              <div className="approval-step-meta">
                {entry.actor?.name ?? 'System'} · {new Date(entry.createdAt).toLocaleString()}
              </div>
              {detail ? <p className="body-text">{detail}</p> : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

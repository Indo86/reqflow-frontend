import { Check, CircleSlash, Clock, RotateCcw, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ApprovalCycleHistoryItem, ApprovalHistoryItem, ApprovalStatus } from '../types/approval'
import { approvalStepTypeLabels } from '../types/approval'

const STATUS_STYLE: Record<ApprovalStatus, { icon: LucideIcon; background: string; color: string }> = {
  WAITING: { icon: Clock, background: 'var(--muted-bg)', color: 'var(--muted-text)' },
  PENDING: { icon: Clock, background: 'var(--amber-bg)', color: 'var(--amber-text)' },
  APPROVED: { icon: Check, background: 'var(--green-bg)', color: 'var(--green-text)' },
  REJECTED: { icon: X, background: 'var(--red-bg)', color: 'var(--red-text)' },
  REVISION_REQUESTED: { icon: RotateCcw, background: 'var(--orange-bg)', color: 'var(--orange-text)' },
  SKIPPED: { icon: CircleSlash, background: 'var(--muted-bg)', color: 'var(--muted-text)' },
}

function stepMeta(step: ApprovalHistoryItem): string {
  if (step.status === 'WAITING') return 'Not started'
  if (step.status === 'PENDING') return 'Awaiting decision'
  if (step.status === 'SKIPPED') return 'Skipped'
  // APPROVED / REJECTED / REVISION_REQUESTED all carry a real decision + date.
  const date = step.decidedAt ? new Date(step.decidedAt).toLocaleDateString() : ''
  return date ? `${step.approver.name} · ${date}` : step.approver.name
}

function ApprovalStep({ step, isLast }: { step: ApprovalHistoryItem; isLast: boolean }) {
  const { icon: Icon, background, color } = STATUS_STYLE[step.status]

  return (
    <div className="approval-step">
      <div className="approval-step-rail">
        <div className="approval-step-icon" style={{ background, color }}>
          <Icon className="icon" width={15} height={15} strokeWidth={2} />
        </div>
        {!isLast ? <div className="approval-step-line" /> : null}
      </div>
      <div className="approval-step-body">
        <span className="approval-step-role">{approvalStepTypeLabels[step.stepType]}</span>
        <span className="approval-step-meta">{stepMeta(step)}</span>
        {step.decisionComment ? <p className="body-text" style={{ marginTop: 2 }}>{step.decisionComment}</p> : null}
      </div>
    </div>
  )
}

// Renders every real approval cycle for a Request (real data, F3) — never
// hardcodes Manager -> Finance -> Director; each cycle's own `approvals`
// array (already ordered by stepOrder by the backend) is rendered exactly
// as returned. A Request only ever has more than one cycle after a
// revision-requested resubmission, so most requests show a single cycle.
export function ApprovalHistory({ cycles }: { cycles: ApprovalCycleHistoryItem[] }) {
  if (cycles.length === 0) {
    return <p className="body-text">This request has not entered an approval cycle yet.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {cycles.map((cycle) => (
        <div key={cycle.cycleNumber}>
          {cycles.length > 1 ? (
            <div className="card-title-sub" style={{ marginBottom: 8 }}>
              Cycle {cycle.cycleNumber}
            </div>
          ) : null}
          <div>
            {cycle.approvals.map((step, index) => (
              <ApprovalStep key={step.id} step={step} isLast={index === cycle.approvals.length - 1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

import { Check, Circle, Clock } from 'lucide-react'
import type { ApprovalStepInfo } from '@/types/domain'

const stepStyle: Record<ApprovalStepInfo['status'], { background: string; color: string }> = {
  completed: { background: 'var(--green-bg)', color: 'var(--green-text)' },
  current: { background: 'var(--amber-bg)', color: 'var(--amber-text)' },
  'not-started': { background: 'var(--muted-bg)', color: 'var(--muted-text)' },
}

function stepMeta(step: ApprovalStepInfo): string {
  if (step.status === 'completed') return `${step.approver} · ${step.decidedAt}`
  if (step.status === 'current') return 'Awaiting review'
  return 'Not started'
}

export function ApprovalTimeline({ steps }: { steps: ApprovalStepInfo[] }) {
  return (
    <div>
      {steps.map((step, index) => {
        const Icon = step.status === 'completed' ? Check : step.status === 'current' ? Clock : Circle
        const isLast = index === steps.length - 1
        return (
          <div className="approval-step" key={step.role}>
            <div className="approval-step-rail">
              <div className="approval-step-icon" style={stepStyle[step.status]}>
                <Icon className="icon" width={15} height={15} strokeWidth={2} />
              </div>
              {!isLast ? <div className="approval-step-line" /> : null}
            </div>
            <div className="approval-step-body">
              <span className="approval-step-role">{step.role}</span>
              <span className="approval-step-meta">{stepMeta(step)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

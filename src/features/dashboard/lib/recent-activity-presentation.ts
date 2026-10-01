import {
  Activity,
  CheckCircle2,
  FilePlus,
  FileX,
  MessageSquare,
  Paperclip,
  RotateCcw,
  Send,
  Trash2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

interface ActivityPresentation {
  label: string
  icon: LucideIcon
}

// Every AuditAction value that exists today (prisma/schema.prisma enum
// AuditAction, verified by direct backend inspection) — see F6 "Recent
// activity". recent-activity entries carry no actor name (only actorId) and
// no human sentence (dashboard.service.ts: "structured, presentation-neutral
// — never formatted into a UI sentence... that is the frontend's job"), so
// this only labels the action itself; it never fabricates a "who did it"
// clause the backend doesn't provide.
const presentationByAction: Record<string, ActivityPresentation> = {
  REQUEST_CREATED: { label: 'Request created', icon: FilePlus },
  REQUEST_UPDATED: { label: 'Request updated', icon: FilePlus },
  REQUEST_DELETED: { label: 'Request deleted', icon: FileX },
  REQUEST_SUBMITTED: { label: 'Request submitted', icon: Send },
  REQUEST_RESUBMITTED: { label: 'Request resubmitted', icon: Send },
  REQUEST_CANCELLED: { label: 'Request cancelled', icon: FileX },
  APPROVAL_CYCLE_STARTED: { label: 'Approval cycle started', icon: Send },
  APPROVAL_STEP_APPROVED: { label: 'Approval step approved', icon: CheckCircle2 },
  APPROVAL_STEP_REJECTED: { label: 'Approval step rejected', icon: XCircle },
  APPROVAL_STEP_REVISION_REQUESTED: { label: 'Revision requested', icon: RotateCcw },
  COMMENT_CREATED: { label: 'Comment added', icon: MessageSquare },
  COMMENT_UPDATED: { label: 'Comment updated', icon: MessageSquare },
  COMMENT_DELETED: { label: 'Comment deleted', icon: Trash2 },
  ATTACHMENT_ADDED: { label: 'Attachment added', icon: Paperclip },
  ATTACHMENT_DELETED: { label: 'Attachment removed', icon: Trash2 },
}

const fallbackPresentation: ActivityPresentation = { label: 'Activity', icon: Activity }

// A future backend action this build doesn't know about renders a safe,
// generic fallback rather than crashing — never a lookup-map KeyError.
export function getActivityPresentation(action: string): ActivityPresentation {
  return presentationByAction[action] ?? fallbackPresentation
}

// Generic, not a lookup map — safe for any current or future
// AuditEntityType value without needing to enumerate them (REQUEST,
// APPROVAL_CYCLE, APPROVAL, COMMENT, ATTACHMENT today).
export function humanizeEntityType(entityType: string): string {
  return entityType
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

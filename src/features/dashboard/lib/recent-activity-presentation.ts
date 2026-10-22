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

// Memvalidasi bentuk data sesuai kontrak API.
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
  APPROVAL_REASSIGNED: { label: 'Approval reassigned', icon: Send },
  COMMENT_CREATED: { label: 'Comment added', icon: MessageSquare },
  COMMENT_UPDATED: { label: 'Comment updated', icon: MessageSquare },
  COMMENT_DELETED: { label: 'Comment deleted', icon: Trash2 },
  ATTACHMENT_ADDED: { label: 'Attachment added', icon: Paperclip },
  ATTACHMENT_DELETED: { label: 'Attachment removed', icon: Trash2 },
  FULFILLMENT_CREATED: { label: 'Fulfillment opened', icon: CheckCircle2 },
  FULFILLMENT_ASSIGNED: { label: 'Fulfillment assigned', icon: Send },
  FULFILLMENT_STARTED: { label: 'Fulfillment started', icon: Send },
  FULFILLMENT_COMPLETED: { label: 'Fulfillment completed', icon: CheckCircle2 },
  FULFILLMENT_CANCELLED: { label: 'Fulfillment cancelled', icon: XCircle },
}

const fallbackPresentation: ActivityPresentation = { label: 'Activity', icon: Activity }

// Menyiapkan data untuk ditampilkan di antarmuka.
export function getActivityPresentation(action: string): ActivityPresentation {
  return presentationByAction[action] ?? fallbackPresentation
}

// Menampilkan riwayat perubahan request.
export function humanizeEntityType(entityType: string): string {
  return entityType
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

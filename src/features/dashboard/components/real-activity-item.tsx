import { Link } from 'react-router-dom'
import { formatRelativeTime } from '@/lib/utils/format-relative-time'
import { formatDateTime } from '@/lib/utils/format-date'
import { getActivityPresentation, humanizeEntityType } from '../lib/recent-activity-presentation'
import type { RecentActivityEntry } from '../types/dashboard'

interface RealActivityItemProps {
  entry: RecentActivityEntry
  isLast?: boolean
}

// Real-data counterpart to components/shared/activity-item.tsx. No actor
// name is shown — the backend only exposes actorId, never a resolved name
// (see F6 "Recent activity"). A requestId link is always safe: recent
// activity is already scoped to requests this viewer can read (their own,
// or org-wide for Admin — the same rule GET /requests itself uses), unlike
// Notifications' APPROVAL_ASSIGNED case which has no such guarantee.
export function RealActivityItem({ entry, isLast }: RealActivityItemProps) {
  const { icon: Icon, label } = getActivityPresentation(entry.action)
  const absoluteTime = formatDateTime(entry.createdAt)

  return (
    <div className="timeline-item">
      <div className="timeline-rail">
        <div className="timeline-dot" style={{ background: 'var(--rf-accent-subtle)', color: 'var(--rf-accent)' }}>
          <Icon className="icon" width={13} height={13} strokeWidth={2} />
        </div>
        {!isLast ? <div className="timeline-line" /> : null}
      </div>
      <div className="timeline-content">
        <div className="timeline-title">{label}</div>
        <div className="timeline-desc">
          {humanizeEntityType(entry.entityType)}
          {entry.requestId ? (
            <>
              {' · '}
              <Link to={`/requests/${entry.requestId}`}>View request</Link>
            </>
          ) : null}
        </div>
        <div className="timeline-time" title={absoluteTime}>
          {formatRelativeTime(entry.createdAt)}
        </div>
      </div>
    </div>
  )
}

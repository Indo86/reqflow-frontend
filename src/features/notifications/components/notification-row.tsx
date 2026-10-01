import { Link } from 'react-router-dom'
import { formatDateTime } from '@/lib/utils/format-date'
import { formatRelativeTime } from '@/lib/utils/format-relative-time'
import { getNotificationLink } from '../lib/get-notification-link'
import { getNotificationPresentation } from '../lib/notification-presentation'
import type { Notification } from '../types/notification'

interface NotificationRowProps {
  notification: Notification
  onOpen: (notificationId: string) => void
  onMarkRead: (notificationId: string) => void
}

// Title/message are server-originated business text — rendered through
// normal React interpolation only, never dangerouslySetInnerHTML, so any
// markup-like content in them shows up as plain text rather than executing
// (F5 "HTML / XSS safety").
export function NotificationRow({ notification, onOpen, onMarkRead }: NotificationRowProps) {
  const { icon: Icon, background, color } = getNotificationPresentation(notification.type)
  const unread = notification.readAt === null
  const link = getNotificationLink(notification)
  const absoluteTime = formatDateTime(notification.createdAt)

  const body = (
    <>
      <div className="notif-icon-wrap" style={{ background, color }}>
        <Icon className="icon" width={16} height={16} strokeWidth={2} />
      </div>
      <div className="notif-body">
        <div className="notif-top-row">
          <span className="notif-title">{notification.title}</span>
          <span className="notif-time" title={absoluteTime}>
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="notif-desc">{notification.message}</p>
      </div>
      {unread ? <div className="unread-dot" aria-hidden="true" /> : <div style={{ width: 8 }} />}
    </>
  )

  if (link) {
    return (
      <Link to={link} className="notif-item" onClick={() => onOpen(notification.id)}>
        {body}
      </Link>
    )
  }

  return (
    <div className="notif-item">
      {body}
      {unread ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ marginLeft: 8 }}
          onClick={() => onMarkRead(notification.id)}
        >
          Mark as read
        </button>
      ) : null}
    </div>
  )
}

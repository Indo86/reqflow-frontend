import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { employeeProfile } from '@/test/fixtures/session'
import {
  readRequestApprovedNotification,
  unreadApprovalAssignedNotification,
  unreadApprovalAssignedNotificationLegacy,
  unreadRejectedNotificationWithDeletedRequest,
} from '@/test/fixtures/notifications'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { mapUserProfileResponse } from '@/features/auth/types/session'
import { userProfileResponseSchema } from '@/features/auth/schemas/session.schema'
import { NotificationsPage } from './notifications-page'

const shellUser = toAppShellUser(mapUserProfileResponse(userProfileResponseSchema.parse(employeeProfile)))
const navItems = productionNavigationByRole.Employee

function renderPage(initialEntries = ['/notifications']) {
  return renderWithProviders(<NotificationsPage user={shellUser} navItems={navItems} />, { initialEntries })
}

function stubList(items: unknown[], overrides: { unreadCount?: number } = {}) {
  return stubFetch((url) => {
    if (url.pathname === '/notifications') {
      const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
      const filtered = unreadOnly ? items.filter((item) => (item as { readAt: string | null }).readAt === null) : items
      return jsonResponse(200, { data: filtered, meta: { page: 1, pageSize: 20, total: filtered.length, totalPages: 1 } })
    }
    if (url.pathname === '/notifications/unread-count') {
      const count = overrides.unreadCount ?? items.filter((item) => (item as { readAt: string | null }).readAt === null).length
      return jsonResponse(200, { data: { count } })
    }
    return errorResponse(404, 'NOT_FOUND', 'not found')
  })
}

describe('NotificationsPage', () => {
  it('shows a loading state while fetching', () => {
    stubFetch(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status', { name: 'Loading notifications…' })).toBeInTheDocument()
  })

  it('renders real backend notifications, never mock data', async () => {
    stubList([unreadApprovalAssignedNotification, readRequestApprovedNotification])
    renderPage()

    expect(await screen.findByText('Approval required')).toBeInTheDocument()
    expect(screen.getByText('REQ-2026-000124 requires your approval.')).toBeInTheDocument()
    expect(screen.getByText('Request approved')).toBeInTheDocument()
    // Real unread count from the dedicated endpoint, not a client-guessed number.
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
  })

  it('shows the All-caught-up empty state on the Unread tab without treating it as an error', async () => {
    stubList([readRequestApprovedNotification], { unreadCount: 0 })
    renderPage(['/notifications?filter=unread'])

    expect(await screen.findByText("You're all caught up.")).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the empty state for a brand new account with no notifications', async () => {
    stubList([])
    renderPage()

    expect(await screen.findByText('No notifications yet.')).toBeInTheDocument()
  })

  it('shows a controlled error state on backend failure', async () => {
    stubFetch(() => errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.'))
    renderPage()

    expect(await screen.findByText("Couldn't load notifications")).toBeInTheDocument()
  })

  it('links an APPROVAL_ASSIGNED notification with a real approvalId straight to that approval', async () => {
    stubList([unreadApprovalAssignedNotification])
    renderPage()

    const link = await screen.findByRole('link', { name: /Approval required/ })
    expect(link).toHaveAttribute('href', '/approvals/approval-1')
  })

  it('falls back to the approvals inbox for a legacy APPROVAL_ASSIGNED notification with no approvalId', async () => {
    stubList([unreadApprovalAssignedNotificationLegacy])
    renderPage()

    const link = await screen.findByRole('link', { name: /Approval required/ })
    expect(link).toHaveAttribute('href', '/approvals')
  })

  it('links a REQUEST_APPROVED notification straight to the request the owner can read', async () => {
    stubList([{ ...readRequestApprovedNotification, readAt: null }])
    renderPage()

    const link = await screen.findByRole('link', { name: /Request approved/ })
    expect(link).toHaveAttribute('href', '/requests/req-119')
  })

  it('does not construct a broken link when the referenced request no longer exists', async () => {
    stubList([unreadRejectedNotificationWithDeletedRequest])
    renderPage()

    expect(await screen.findByText('Request rejected')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Request rejected/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark as read' })).toBeInTheDocument()
  })

  it('marks a notification read via PATCH and refetches the real unread count, not a client guess', async () => {
    let readAt: string | null = null
    stubFetch((url) => {
      if (url.pathname === '/notifications') {
        return jsonResponse(200, {
          data: [{ ...unreadRejectedNotificationWithDeletedRequest, readAt }],
          meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
        })
      }
      if (url.pathname === '/notifications/unread-count') {
        return jsonResponse(200, { data: { count: readAt ? 0 : 1 } })
      }
      if (url.pathname === '/notifications/notif-4/read') {
        readAt = '2026-09-24T10:00:00.000Z'
        return jsonResponse(200, { data: { ...unreadRejectedNotificationWithDeletedRequest, readAt } })
      }
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Unread/ }).textContent).toContain('1')
    })

    const markReadButton = await screen.findByRole('button', { name: 'Mark as read' })
    fireEvent.click(markReadButton)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: /Unread/ }).textContent).toContain('0')
  })

  it('marks all notifications read via POST /notifications/read-all and refetches the real unread count', async () => {
    let allRead = false
    stubFetch((url) => {
      if (url.pathname === '/notifications') {
        const items = [unreadApprovalAssignedNotification, unreadRejectedNotificationWithDeletedRequest].map(
          (item) => (allRead ? { ...item, readAt: '2026-09-24T10:00:00.000Z' } : item)
        )
        return jsonResponse(200, { data: items, meta: { page: 1, pageSize: 20, total: items.length, totalPages: 1 } })
      }
      if (url.pathname === '/notifications/unread-count') {
        return jsonResponse(200, { data: { count: allRead ? 0 : 2 } })
      }
      if (url.pathname === '/notifications/read-all') {
        allRead = true
        return jsonResponse(200, { data: { updated: 2 } })
      }
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderPage()

    const markAllButton = await screen.findByRole('button', { name: 'Mark all as read' })
    await waitFor(() => {
      expect(markAllButton).toBeEnabled()
    })
    fireEvent.click(markAllButton)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Unread/ }).textContent).toContain('0')
    })
    expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument()
  })

  it('renders markup-like notification content as plain text, never as HTML', async () => {
    stubList([{ ...unreadApprovalAssignedNotification, message: '<img src=x onerror=alert(1)>' }])
    renderPage()

    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).not.toBeInTheDocument()
  })
})

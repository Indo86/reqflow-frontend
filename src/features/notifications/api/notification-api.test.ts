import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { unreadApprovalAssignedNotification } from '@/test/fixtures/notifications'
import { getNotifications } from './get-notifications'
import { getUnreadCount } from './get-unread-count'
import { markNotificationRead } from './mark-notification-read'
import { markAllNotificationsRead } from './mark-all-read'

describe('notification API layer', () => {
  it('getNotifications calls GET /notifications with page/pageSize/unreadOnly and credentials included', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/notifications'
        ? jsonResponse(200, { data: [unreadApprovalAssignedNotification], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getNotifications({ page: 1, pageSize: 20, unreadOnly: false })

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/notifications', search: '?page=1&pageSize=20&unreadOnly=false' }),
      expect.objectContaining({ credentials: 'include' })
    )
    expect(result.items).toHaveLength(1)
    expect(result.items[0].requestId).toBe('req-124')
    expect(result.items[0].approvalId).toBe('approval-1')
  })

  it('sends unreadOnly=true as an explicit string, never relying on truthiness', async () => {
    const fetchSpy = stubFetch(() => jsonResponse(200, { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }))

    await getNotifications({ page: 1, pageSize: 20, unreadOnly: true })

    const [urlArg] = fetchSpy.mock.calls[0]
    expect((urlArg as URL).search).toBe('?page=1&pageSize=20&unreadOnly=true')
  })

  it('getUnreadCount calls GET /notifications/unread-count', async () => {
    stubFetch((url) =>
      url.pathname === '/notifications/unread-count'
        ? jsonResponse(200, { data: { count: 3 } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getUnreadCount()
    expect(result.count).toBe(3)
  })

  it('markNotificationRead sends PATCH /notifications/:id/read with no body', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/notifications/notif-1/read'
        ? jsonResponse(200, { data: { ...unreadApprovalAssignedNotification, readAt: '2026-09-24T09:00:00.000Z' } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await markNotificationRead('notif-1')

    const [, init] = fetchSpy.mock.calls[0]
    expect(init).toMatchObject({ method: 'PATCH', credentials: 'include' })
    expect(init!.body).toBeUndefined()
    expect(result.readAt).toBe('2026-09-24T09:00:00.000Z')
  })

  it('markAllNotificationsRead sends POST /notifications/read-all with no body', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/notifications/read-all' ? jsonResponse(200, { data: { updated: 4 } }) : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await markAllNotificationsRead()

    const [, init] = fetchSpy.mock.calls[0]
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(init!.body).toBeUndefined()
    expect(result.updated).toBe(4)
  })

  it('a 404 on mark-read (wrong id or another user\'s notification) normalizes to ApiError, never a generic throw', async () => {
    stubFetch(() => errorResponse(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found.'))

    await expect(markNotificationRead('someone-elses-notification')).rejects.toMatchObject({
      status: 404,
      code: 'NOTIFICATION_NOT_FOUND',
    })
  })

  it('rethrows as ApiError, never a raw fetch/JSON error', async () => {
    stubFetch(() => errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.'))

    try {
      await getNotifications({ page: 1, pageSize: 20, unreadOnly: false })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
    }
  })
})

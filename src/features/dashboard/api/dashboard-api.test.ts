import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { dashboardSummaryFixture, recentActivityFixture, requestsOverTimeFixture } from '@/test/fixtures/dashboard'
import { getDashboardSummary } from './get-dashboard-summary'
import { getRequestsOverTime } from './get-requests-over-time'
import { getRecentActivity } from './get-recent-activity'

describe('dashboard API layer', () => {
  it('getDashboardSummary calls GET /dashboard/summary with credentials included and no query params', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/dashboard/summary' ? jsonResponse(200, { data: dashboardSummaryFixture }) : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getDashboardSummary()

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/dashboard/summary', search: '' }),
      expect.objectContaining({ credentials: 'include' })
    )
    // Decimal total stays a string end to end — never Number(...)'d here.
    expect(result.amounts.total).toBe('48000000.50')
    expect(typeof result.amounts.total).toBe('string')
    expect(result.requests.byStatus.DRAFT).toBe(0)
  })

  it('getRequestsOverTime serializes from/to/bucket exactly as given, never adjusting the boundary', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/dashboard/requests-over-time' ? jsonResponse(200, { data: requestsOverTimeFixture }) : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getRequestsOverTime({ from: '2026-04-01T00:00:00.000Z', to: '2026-09-24T00:00:00.000Z', bucket: 'month' })

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/dashboard/requests-over-time',
        search: '?from=2026-04-01T00%3A00%3A00.000Z&to=2026-09-24T00%3A00%3A00.000Z&bucket=month',
      }),
      expect.anything()
    )
    // Real points preserved in the backend-returned order — never
    // reordered or zero-filled by this layer.
    expect(result.points.map((point) => point.count)).toEqual([4, 7, 3])
  })

  it('getRecentActivity sends the limit param and preserves newest-first backend order', async () => {
    stubFetch((url) =>
      url.pathname === '/dashboard/recent-activity' ? jsonResponse(200, { data: recentActivityFixture }) : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getRecentActivity({ limit: 8 })

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('audit-2')
    expect(result[1].id).toBe('audit-1')
  })

  it('recent activity never exposes an actor name field — only actorId', async () => {
    stubFetch(() => jsonResponse(200, { data: recentActivityFixture }))

    const result = await getRecentActivity({ limit: 8 })

    expect(result[0]).not.toHaveProperty('actorName')
    expect(result[0].actorId).toBe('user-manager')
  })

  it('rethrows as ApiError, never a raw fetch/JSON error', async () => {
    stubFetch(() => errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.'))

    await expect(getDashboardSummary()).rejects.toBeInstanceOf(ApiError)
  })
})

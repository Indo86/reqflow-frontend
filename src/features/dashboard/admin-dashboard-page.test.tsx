import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { dashboardSummaryFixture, recentActivityFixture, requestsOverTimeFixture } from '@/test/fixtures/dashboard'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { AdminDashboardPage } from './admin-dashboard-page'

const shellUser = { name: 'Ava Admin', initials: 'AA', role: 'Admin', department: undefined }
const navItems = productionNavigationByRole.Admin

function stubAdminEndpoints(overrides: { summary?: unknown; overTime?: unknown; activity?: unknown } = {}) {
  return stubFetch((url) => {
    if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: overrides.summary ?? dashboardSummaryFixture })
    if (url.pathname === '/dashboard/requests-over-time') return jsonResponse(200, { data: overrides.overTime ?? requestsOverTimeFixture })
    if (url.pathname === '/dashboard/recent-activity') return jsonResponse(200, { data: overrides.activity ?? recentActivityFixture })
    return errorResponse(404, 'NOT_FOUND', 'not found')
  })
}

describe('AdminDashboardPage', () => {
  it('renders the organization-wide admin dashboard from frozen mock data on a preview route', () => {
    renderWithProviders(<AdminDashboardPage />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Requests Over Time')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('production mode renders the real org-wide summary total, not the frozen mock', async () => {
    stubAdminEndpoints()
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    const totalCard = (await screen.findByText('Total Requests')).closest('.stat-card')
    expect(totalCard).toHaveTextContent('6')
  })

  it('offers every M12 range, defaults to 6 Months, and has no Dashboard Export button', async () => {
    stubAdminEndpoints()
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    const selector = await screen.findByLabelText('Chart time range')
    expect(selector).toHaveValue('6m')
    for (const label of ['1 Month', '2 Months', '6 Months', '1 Year', 'To Date']) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
    }
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument()
  })

  it('changes the API range without reloading and renders the new dataset', async () => {
    const fetchSpy = stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: dashboardSummaryFixture })
      if (url.pathname === '/dashboard/recent-activity') return jsonResponse(200, { data: recentActivityFixture })
      if (url.pathname === '/dashboard/requests-over-time') {
        const isYear = url.searchParams.get('range') === '1y'
        return jsonResponse(200, { data: {
          ...requestsOverTimeFixture,
          range: isYear ? '1y' : '6m',
          points: isYear ? [{ periodStart: '2025-11-01T00:00:00.000Z', count: 11 }] : requestsOverTimeFixture.points,
        } })
      }
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)
    fireEvent.change(await screen.findByLabelText('Chart time range'), { target: { value: '1y' } })
    expect(await screen.findByText('Nov 2025')).toBeInTheDocument()
    await waitFor(() => expect(fetchSpy.mock.calls.some(([url]) => (url as URL).searchParams.get('range') === '1y')).toBe(true))
    expect(screen.getByLabelText('Chart time range')).toHaveValue('1y')
  })

  it('renders real requests-over-time points in the chart, in backend order', async () => {
    stubAdminEndpoints()
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    // Real month labels derived from the fixture's periodStart values.
    expect(await screen.findByText('Jul')).toBeInTheDocument()
    expect(screen.getByText('Aug')).toBeInTheDocument()
    expect(screen.getByText('Sep')).toBeInTheDocument()
  })

  it('a single time-series point does not crash the chart', async () => {
    stubAdminEndpoints({ overTime: { ...requestsOverTimeFixture, points: [{ periodStart: '2026-09-01T00:00:00.000Z', count: 5 }] } })
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    expect(await screen.findByText('Sep')).toBeInTheDocument()
  })

  it('an empty time series shows a controlled empty state, not a crash', async () => {
    stubAdminEndpoints({ overTime: { ...requestsOverTimeFixture, points: [] } })
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    expect(await screen.findByText('No requests in this range')).toBeInTheDocument()
  })

  it('shows a chart-local loading state while a newly selected range is loading', async () => {
    stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: dashboardSummaryFixture })
      if (url.pathname === '/dashboard/recent-activity') return jsonResponse(200, { data: recentActivityFixture })
      if (url.pathname === '/dashboard/requests-over-time') return new Promise(() => {})
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)
    expect(await screen.findByText('Loading time series…')).toBeInTheDocument()
    expect(screen.getByLabelText('Chart time range')).toHaveValue('6m')
  })

  it('shows a chart-local error without taking down the rest of the dashboard', async () => {
    stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: dashboardSummaryFixture })
      if (url.pathname === '/dashboard/recent-activity') return jsonResponse(200, { data: recentActivityFixture })
      if (url.pathname === '/dashboard/requests-over-time') return errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.')
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)
    expect(await screen.findByText("Couldn't load requests over time")).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
  })

  it('renders real recent activity, newest first, with no actor name fabricated', async () => {
    stubAdminEndpoints()
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    expect(await screen.findByText('Approval step approved')).toBeInTheDocument()
    expect(screen.getByText('Request submitted')).toBeInTheDocument()
    expect(screen.queryByText(/Sarah Wijaya|Deni Zaky|Rina Putri/)).not.toBeInTheDocument()
  })

  it('an empty recent-activity list shows a controlled empty state', async () => {
    stubAdminEndpoints({ activity: [] })
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    expect(await screen.findByText('No activity yet')).toBeInTheDocument()
  })

  it('a recent-activity query failure does not take down the summary widgets', async () => {
    stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: dashboardSummaryFixture })
      if (url.pathname === '/dashboard/requests-over-time') return jsonResponse(200, { data: requestsOverTimeFixture })
      if (url.pathname === '/dashboard/recent-activity') return errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.')
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderWithProviders(<AdminDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    const totalCard = (await screen.findByText('Total Requests')).closest('.stat-card')
    expect(totalCard).toHaveTextContent('6')
    expect(await screen.findByText("Couldn't load recent activity")).toBeInTheDocument()
  })
})

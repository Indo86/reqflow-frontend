import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { dashboardSummaryFixture, emptyDashboardSummaryFixture } from '@/test/fixtures/dashboard'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { OwnerDashboardPage } from './owner-dashboard-page'

const shellUser = { name: 'Eddie Employee', initials: 'EE', role: 'Employee', department: 'Engineering' }
const navItems = productionNavigationByRole.Employee

describe('OwnerDashboardPage', () => {
  it('renders the request owner dashboard from frozen mock data on a preview route (no onLogout, no real fetch)', () => {
    renderWithProviders(<OwnerDashboardPage />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('My Open Requests')).toBeInTheDocument()
    expect(screen.getByText('My Recent Requests')).toBeInTheDocument()
  })

  it('production mode renders real backend summary data, not the frozen mock', async () => {
    stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: dashboardSummaryFixture })
      if (url.pathname === '/requests') return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 } })
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })

    renderWithProviders(<OwnerDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    // Real Approved count (2) from the fixture's byStatus, not the mock's "12".
    expect(await screen.findByText('Approved Requests')).toBeInTheDocument()
    const approvedCard = screen.getByText('Approved Requests').closest('.stat-card')
    expect(approvedCard).toHaveTextContent('2')
  })

  it('renders zero-value counts correctly rather than as an error or blank state', async () => {
    stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: emptyDashboardSummaryFixture })
      if (url.pathname === '/requests') return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 } })
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })

    renderWithProviders(<OwnerDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    expect(await screen.findByText('No requests yet')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('a summary query failure shows a controlled error, not a crash or the mock fallback', async () => {
    stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.')
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })

    renderWithProviders(<OwnerDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    expect(await screen.findByText("Couldn't load dashboard summary")).toBeInTheDocument()
  })
})

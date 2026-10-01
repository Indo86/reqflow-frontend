import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { dashboardSummaryFixture } from '@/test/fixtures/dashboard'
import { inboxItemForManager } from '@/test/fixtures/approvals'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { ManagerDashboardPage } from './manager-dashboard-page'

const shellUser = { name: 'Mona Manager', initials: 'MM', role: 'Manager', department: 'Engineering' }
const navItems = productionNavigationByRole.Manager

describe('ManagerDashboardPage', () => {
  it('renders the manager dashboard from frozen mock data on a preview route', () => {
    renderWithProviders(<ManagerDashboardPage />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Pending My Approval')).toBeInTheDocument()
    expect(screen.getByText('Approvals Requiring My Attention')).toBeInTheDocument()
  })

  it('production mode renders the real assigned-approval count and inbox rows, each linking to its own approval', async () => {
    stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: dashboardSummaryFixture })
      if (url.pathname === '/approvals/inbox')
        return jsonResponse(200, { data: [inboxItemForManager], meta: { page: 1, pageSize: 5, total: 1, totalPages: 1 } })
      if (url.pathname === '/requests') return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 } })
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })

    renderWithProviders(<ManagerDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    const pendingCard = (await screen.findByText('Pending My Approval')).closest('.stat-card')
    expect(pendingCard).toHaveTextContent('3')

    const reviewLink = await screen.findByRole('link', { name: 'Review' })
    expect(reviewLink).toHaveAttribute('href', '/approvals/approval-1')
  })

  it('an empty inbox shows a controlled empty state, not an error', async () => {
    stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: dashboardSummaryFixture })
      if (url.pathname === '/approvals/inbox') return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 } })
      if (url.pathname === '/requests') return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 } })
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })

    renderWithProviders(<ManagerDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    expect(await screen.findByText('Nothing needs your attention')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

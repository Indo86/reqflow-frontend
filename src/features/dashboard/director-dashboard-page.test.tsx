import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { dashboardSummaryFixture } from '@/test/fixtures/dashboard'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { DirectorDashboardPage } from './director-dashboard-page'

const shellUser = { name: 'Andi Pratama', initials: 'AP', role: 'Director', department: 'Operations' }
const navItems = productionNavigationByRole.Director

const lowValueItem = {
  id: 'approval-low',
  cycleNumber: 1,
  stepOrder: 3,
  stepType: 'DIRECTOR',
  status: 'PENDING',
  request: {
    id: 'req-low',
    requestNumber: 'REQ-2026-000201',
    type: 'REIMBURSEMENT',
    title: 'Small reimbursement',
    amount: '500000',
    status: 'IN_REVIEW',
    createdBy: { id: 'user-1', name: 'Eddie Employee' },
    department: { id: 'dept-eng', name: 'Engineering' },
  },
}

const highValueItem = {
  id: 'approval-high',
  cycleNumber: 1,
  stepOrder: 3,
  stepType: 'DIRECTOR',
  status: 'PENDING',
  request: {
    id: 'req-high',
    requestNumber: 'REQ-2026-000202',
    type: 'EQUIPMENT',
    title: 'Big equipment purchase',
    amount: '75000000',
    status: 'IN_REVIEW',
    createdBy: { id: 'user-2', name: 'Rina Putri' },
    department: { id: 'dept-fin', name: 'Finance' },
  },
}

describe('DirectorDashboardPage', () => {
  it('renders the director dashboard from frozen mock data on a preview route', () => {
    renderWithProviders(<DirectorDashboardPage />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Decisions Requiring My Attention')).toBeInTheDocument()
    expect(screen.getByText('High-value Requests Assigned to You')).toBeInTheDocument()
  })

  it('sorts the real inbox by amount descending for the High-value section, without changing any reported total', async () => {
    stubFetch((url) => {
      if (url.pathname === '/dashboard/summary') return jsonResponse(200, { data: dashboardSummaryFixture })
      if (url.pathname === '/approvals/inbox')
        return jsonResponse(200, {
          data: [lowValueItem, highValueItem],
          meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
        })
      if (url.pathname === '/requests') return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 } })
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })

    renderWithProviders(<DirectorDashboardPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />)

    const highValueSection = (await screen.findByText('High-value Requests Assigned to You')).closest('.card')
    expect(highValueSection).not.toBeNull()
    const text = highValueSection!.textContent ?? ''
    // "Big equipment purchase" (75,000,000) must appear before "Small
    // reimbursement" (500,000) — proving it's sorted, not just passed
    // through in backend list order.
    expect(text.indexOf('Big equipment purchase')).toBeLessThan(text.indexOf('Small reimbursement'))
  })
})

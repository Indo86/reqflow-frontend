import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { AdminDashboardPage } from './admin-dashboard-page'

describe('AdminDashboardPage', () => {
  it('renders the organization-wide admin dashboard', () => {
    renderWithProviders(<AdminDashboardPage />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Requests Over Time')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })
})

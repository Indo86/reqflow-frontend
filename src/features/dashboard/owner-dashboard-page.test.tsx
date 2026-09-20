import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { OwnerDashboardPage } from './owner-dashboard-page'

describe('OwnerDashboardPage', () => {
  it('renders the request owner dashboard', () => {
    renderWithProviders(<OwnerDashboardPage />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('My Open Requests')).toBeInTheDocument()
    expect(screen.getByText('My Recent Requests')).toBeInTheDocument()
  })
})

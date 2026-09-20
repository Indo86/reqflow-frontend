import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { ReportsPage } from './reports-page'

describe('ReportsPage', () => {
  it('renders organization-wide report insights', () => {
    renderWithProviders(<ReportsPage />)
    expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Requests by Department')).toBeInTheDocument()
    expect(screen.getByText('Workflow Duration by Step')).toBeInTheDocument()
  })
})

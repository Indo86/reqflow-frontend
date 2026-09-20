import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { ApprovalsInboxPage } from './approvals-inbox-page'

describe('ApprovalsInboxPage', () => {
  it('renders the manager approval inbox scoped to requests assigned to the manager', () => {
    renderWithProviders(<ApprovalsInboxPage persona="manager" />)
    expect(screen.getByRole('heading', { name: 'Pending My Approval' })).toBeInTheDocument()
    expect(screen.getByText(/assigned to you at the Manager step/)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Review' }).length).toBeGreaterThan(0)
  })

  it('renders the finance approval inbox with finance-specific rows', () => {
    renderWithProviders(<ApprovalsInboxPage persona="finance" />)
    expect(screen.getByText(/assigned to you at the Finance step/)).toBeInTheDocument()
  })
})

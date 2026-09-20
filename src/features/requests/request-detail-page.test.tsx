import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { RequestDetailPage } from './request-detail-page'
import {
  adminViewOnlyDetail,
  currentApproverDetail,
  nonCurrentDetail,
  ownerDraftDetail,
} from '@/lib/mock/request-details'

function expectNoApprovalActions() {
  expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
}

describe('RequestDetailPage relationship variants', () => {
  it('does not show approval actions for the request owner', () => {
    renderWithProviders(<RequestDetailPage detail={ownerDraftDetail} variant="owner-draft" />)
    expect(screen.getByText(ownerDraftDetail.id)).toBeInTheDocument()
    expectNoApprovalActions()
  })

  it('shows approval actions for the current authorized approver', () => {
    renderWithProviders(<RequestDetailPage detail={currentApproverDetail} variant="current-approver" />)
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  })

  it('does not show approval actions for a role user who is not the current approver', () => {
    renderWithProviders(<RequestDetailPage detail={nonCurrentDetail} variant="non-current" />)
    expect(screen.getByText(/not the current authorized approver/)).toBeInTheDocument()
    expectNoApprovalActions()
  })

  it('does not show approval actions for an admin viewer', () => {
    renderWithProviders(<RequestDetailPage detail={adminViewOnlyDetail} variant="admin-view-only" />)
    expect(screen.getByText('Viewing — not an approver')).toBeInTheDocument()
    expectNoApprovalActions()
  })
})

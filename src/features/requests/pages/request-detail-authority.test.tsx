import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import {
  adminProfile,
  employeeProfile,
  financeProfile,
  managerProfile,
  requestPendingOnFinance,
  requestPendingOnManager,
} from '@/test/fixtures/approvals'
import { RequestDetailPage } from './request-detail-page'

function renderDetail(sessionProfile: unknown, requestFixture: unknown) {
  stubFetch((url) => {
    if (url.pathname === '/users/me') return jsonResponse(200, { data: sessionProfile })
    if (url.pathname === `/requests/${(requestFixture as { id: string }).id}`) {
      return jsonResponse(200, { data: requestFixture })
    }
    throw new Error(`Unhandled fetch: ${url.pathname}`)
  })

  return renderWithProviders(undefined, {
    initialEntries: [`/requests/${(requestFixture as { id: string }).id}`],
    routes: [{ path: '/requests/:requestId', element: <RequestDetailPage /> }],
  })
}

describe('RequestDetailPage approval authority', () => {
  it('shows approval actions to the current authorized approver', async () => {
    renderDetail(managerProfile, requestPendingOnManager)
    expect(await screen.findByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Request Revision' })).toBeInTheDocument()
  })

  it('does not show approval actions to a role user who is not the current approver', async () => {
    // Mona Manager's own step is already APPROVED on this request — Finance
    // is now the actionable step. A Manager viewing it (e.g. via a stale
    // link) must not see Approve/Reject even though Manager IS an approver
    // role in general.
    renderDetail(managerProfile, requestPendingOnFinance)
    await screen.findByText('REQ-2026-000002')
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
  })

  it('does not grant approval actions from Manager role alone', async () => {
    // Same request, different Manager (not the assigned approver at all).
    const otherManager = { ...managerProfile, id: 'user-manager-2', name: 'Mike Manager' }
    renderDetail(otherManager, requestPendingOnManager)
    await screen.findByText('REQ-2026-000001')
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })

  it('does not grant approval actions from Finance role alone', async () => {
    const otherFinance = { ...financeProfile, id: 'user-finance-2', name: 'Fred Finance' }
    renderDetail(otherFinance, requestPendingOnFinance)
    await screen.findByText('REQ-2026-000002')
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })

  it('does not grant approval actions to an Admin viewer', async () => {
    renderDetail(adminProfile, requestPendingOnManager)
    await screen.findByText('REQ-2026-000001')
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
  })

  it('shows owner actions, not approver actions, for the request owner', async () => {
    renderDetail(employeeProfile, requestPendingOnManager)
    await screen.findByText('REQ-2026-000001')
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    // Owner sees no write actions once IN_REVIEW (not editable/cancellable
    // from that status per EDITABLE/CANCELLABLE_STATUSES) — just confirms
    // no approval action leaks through for the owner either.
  })
})

describe('RequestDetailPage approval decisions', () => {
  it('disables the button while a decision is pending, preventing duplicate submits, then refreshes on success', async () => {
    let decided = false
    let resolveApprove!: (value: Response) => void
    const pendingApprove = new Promise<Response>((resolve) => {
      resolveApprove = resolve
    })

    stubFetch((url, init) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: managerProfile })
      if (url.pathname === '/requests/req-1') {
        return jsonResponse(200, {
          data: decided
            ? {
                ...requestPendingOnManager,
                status: 'APPROVED',
                approvalCycles: [
                  {
                    ...requestPendingOnManager.approvalCycles[0],
                    status: 'APPROVED',
                    approvals: [
                      {
                        ...requestPendingOnManager.approvalCycles[0].approvals[0],
                        status: 'APPROVED',
                        decidedAt: '2026-09-04T00:00:00.000Z',
                      },
                    ],
                  },
                ],
              }
            : requestPendingOnManager,
        })
      }
      if (url.pathname === '/approvals/approval-1/approve' && init?.method === 'POST') {
        return pendingApprove
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, {
      initialEntries: ['/requests/req-1'],
      routes: [{ path: '/requests/:requestId', element: <RequestDetailPage /> }],
    })

    const approveButton = await screen.findByRole('button', { name: 'Approve' })
    fireEvent.click(approveButton)
    // A second click while pending must not be able to fire a duplicate
    // request — the button is already disabled, not just relabeled.
    expect(await screen.findByRole('button', { name: 'Approving…' })).toBeDisabled()

    decided = true
    resolveApprove(
      jsonResponse(200, {
        data: { approvalId: 'approval-1', requestId: 'req-1', approvalStatus: 'APPROVED', requestStatus: 'APPROVED' },
      })
    )

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument())
  })

  it('shows a controlled message and refetches on a stale/conflicting decision', async () => {
    stubFetch((url, init) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: managerProfile })
      if (url.pathname === '/requests/req-1') return jsonResponse(200, { data: requestPendingOnManager })
      if (url.pathname === '/approvals/approval-1/approve' && init?.method === 'POST') {
        return errorResponse(409, 'APPROVAL_ALREADY_DECIDED', 'This approval has already been decided.')
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, {
      initialEntries: ['/requests/req-1'],
      routes: [{ path: '/requests/:requestId', element: <RequestDetailPage /> }],
    })

    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }))

    expect(await screen.findByText('This approval has already been decided.')).toBeInTheDocument()
    // The attempted decision is never assumed to have succeeded — the
    // approval step still renders as PENDING/awaiting after the conflict.
    expect(screen.getByText('Awaiting decision')).toBeInTheDocument()
  })
})

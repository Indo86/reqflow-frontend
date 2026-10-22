import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { jsonResponse, stubFetch } from '@/test/mock-fetch'
import {
  adminProfile,
  financeProfile,
  inboxItemForManager,
  managerProfile,
  requestPendingOnFinance,
} from '@/test/fixtures/approvals'
import { ApprovalReviewPage } from '@/features/approvals/pages/approval-review-page'
import { describeAuditEntry } from './audit/describe-audit-entry'
import { describeViewer } from './lib/describe-viewer'
import { RequestsRoute } from '@/app/router/requests-route'
import { RequestDetailPage } from './pages/request-detail-page'

const entry = (action: string, metadata: Record<string, unknown> | null = null) => ({
  id: `${action}-1`,
  action,
  entityType: 'REQUEST',
  actor: { id: 'u1', name: 'Mona Manager' },
  metadata,
  createdAt: '2026-09-03T00:00:00.000Z',
})

describe('M2 audit entry wording', () => {
  it('describes withdrawal and reassignment with their reasons', () => {
    expect(describeAuditEntry(entry('REQUEST_CANCELLED', { fromStatus: 'IN_REVIEW', reason: 'Raised by mistake.' }))).toEqual({
      title: 'Withdrawn by its owner while in review',
      detail: 'Reason: Raised by mistake.',
    })
    expect(
      describeAuditEntry(
        entry('APPROVAL_REASSIGNED', {
          stepType: 'MANAGER',
          previousApproverName: 'Rina',
          newApproverName: 'Nadia',
          reason: 'Rina is on leave.',
        })
      )
    ).toEqual({ title: 'Manager approval reassigned from Rina to Nadia', detail: 'Reason: Rina is on leave.' })
  })

  it('never renders unexpected metadata, and degrades safely for unknown actions', () => {
    const leaky = describeAuditEntry(entry('REQUEST_UPDATED', { changedFields: ['amount'], before: { amount: 'SECRET' } }))
    expect(JSON.stringify(leaky)).not.toContain('SECRET')
    expect(leaky.detail).toBe('Changed: amount')
    expect(describeAuditEntry(entry('SOMETHING_NEW', { password: 'x' }))).toEqual({ title: 'Activity recorded' })
  })

  it('labels a viewer as view-only unless they own, or must decide, the request', () => {
    expect(describeViewer({ relationship: 'OVERSIGHT', approval: null })?.label).toBe('View only')
    expect(describeViewer({ relationship: 'OWNER', approval: null })?.label).toBe('Yours')
    expect(describeViewer({ relationship: 'APPROVER', approval: 'AWAITING_DECISION' })?.label).toBe('Needs your decision')
    expect(describeViewer({ relationship: 'APPROVER', approval: 'DECIDED' })?.label).toBe('Decided by you')
  })
})

const listRow = (id: string, number: string, title: string, viewer: object, createdBy: object) => ({
  id,
  requestNumber: number,
  type: 'PURCHASE',
  title,
  description: 'x',
  amount: '8000000',
  status: 'IN_REVIEW',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  createdBy,
  department: { id: 'dept-eng', name: 'Engineering' },
  viewer,
})

describe('M2 scoped requests list', () => {
  function renderList(profile: unknown, onList?: (url: URL) => void) {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: profile })
      if (url.pathname === '/requests') {
        onList?.(url)
        return jsonResponse(200, {
          data: [
            listRow('r1', 'REQ-1', 'Team laptops', { relationship: 'OVERSIGHT', approval: null }, { id: 'u-eddie', name: 'Eddie Employee' }),
            listRow('r2', 'REQ-2', 'Server upgrade', { relationship: 'APPROVER', approval: 'AWAITING_DECISION' }, { id: 'u-dimas', name: 'Dimas' }),
          ],
          meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
        })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })
    return renderWithProviders(undefined, {
      initialEntries: ['/requests'],
      routes: [{ path: '/requests', element: <RequestsRoute /> }],
    })
  }

  it('gives a Manager a department-scoped list with an honest empty-of-own-requests state', async () => {
    renderList(managerProfile)
    expect(await screen.findByText('Team laptops')).toBeInTheDocument()
    expect(screen.getByText(/Submitted requests from your department/)).toBeInTheDocument()
    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(screen.getByText('View only')).toBeInTheDocument()
    expect(screen.getByText('Needs your decision')).toBeInTheDocument()
    expect(screen.getByText('Eddie Employee')).toBeInTheDocument()
  })

  it('describes the Finance scope as purchase and reimbursement requests only', async () => {
    renderList(financeProfile)
    expect(await screen.findByText('Team laptops')).toBeInTheDocument()
    expect(screen.getByText(/Purchase and reimbursement requests across the organization/)).toBeInTheDocument()
  })

  it('narrows with the "Assigned to me" tab by sending view=assigned, never by filtering client-side', async () => {
    const seen: string[] = []
    renderList(managerProfile, (url) => seen.push(url.search))
    await screen.findByText('Team laptops')
    fireEvent.click(screen.getByRole('tab', { name: 'Assigned to me' }))
    await waitFor(() => expect(seen.some((search) => search.includes('view=assigned'))).toBe(true))
    expect(seen[0]).not.toContain('view=')
  })

  it('keeps the Employee on their own "My Requests" page', async () => {
    renderList({ ...managerProfile, role: 'EMPLOYEE', id: 'u-eddie' })
    expect(await screen.findByText('Requests you\'ve created')).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Assigned to me' })).not.toBeInTheDocument()
  })
})

describe('M2 request detail as a read-only viewer', () => {
  it('shows an Admin the history and a view-only note, with no action buttons', async () => {
    const detail = { ...requestPendingOnFinance, viewer: { relationship: 'OVERSIGHT', approval: null } }
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: adminProfile })
      if (url.pathname === `/requests/${detail.id}`) return jsonResponse(200, { data: detail })
      if (url.pathname === `/requests/${detail.id}/audit-log`) {
        return jsonResponse(200, {
          data: [
            entry('REQUEST_SUBMITTED'),
            entry('APPROVAL_REASSIGNED', { stepType: 'FINANCE', previousApproverName: 'Fred', newApproverName: 'Fiona', reason: 'Fred left.' }),
          ],
          meta: { page: 1, pageSize: 100, total: 2, totalPages: 1 },
        })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })
    renderWithProviders(undefined, {
      initialEntries: [`/requests/${detail.id}`],
      routes: [{ path: '/requests/:requestId', element: <RequestDetailPage /> }],
    })

    expect(await screen.findByText(/View only\. You can see this request because of your role/)).toBeInTheDocument()
    const history = await screen.findByRole('list', { name: 'Request history' })
    expect(within(history).getByText('Submitted for approval')).toBeInTheDocument()
    expect(within(history).getByText('Finance approval reassigned from Fred to Fiona')).toBeInTheDocument()
    expect(within(history).getByText('Reason: Fred left.')).toBeInTheDocument()
    for (const name of ['Approve', 'Reject', 'Request Revision', 'Edit', 'Submit', 'Cancel', 'Withdraw']) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
    }
  })
})

describe('M2 approval review shows previous decisions', () => {
  it('lets the assigned approver read the earlier decision comment and the pending step', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: financeProfile })
      if (url.pathname === '/approvals/approval-2b') {
        return jsonResponse(200, {
          data: {
            id: 'approval-2b',
            cycleNumber: 1,
            stepOrder: 2,
            stepType: 'FINANCE',
            status: 'PENDING',
            decisionComment: null,
            createdAt: '2026-09-02T00:00:00.000Z',
            decidedAt: null,
            approver: { id: 'user-finance', name: 'Fiona Finance' },
            cyclePolicy: 'MANAGER_FINANCE',
            request: { ...inboxItemForManager.request, id: 'req-2', requestNumber: 'REQ-2026-000002' },
          },
        })
      }
      if (url.pathname === '/requests/req-2') {
        return jsonResponse(200, { data: { ...requestPendingOnFinance, viewer: { relationship: 'APPROVER', approval: 'AWAITING_DECISION' } } })
      }
      if (url.pathname.endsWith('/audit-log')) {
        return jsonResponse(200, { data: [entry('APPROVAL_STEP_APPROVED', { stepType: 'MANAGER' })], meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 } })
      }
      return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 } })
    })
    renderWithProviders(undefined, {
      initialEntries: ['/approvals/approval-2b'],
      routes: [{ path: '/approvals/:approvalId', element: <ApprovalReviewPage /> }],
    })

    expect(await screen.findByText('Looks good.')).toBeInTheDocument() // Komentar keputusan Manager.
    expect(screen.getByText('Awaiting decision')).toBeInTheDocument() // Tahap masih menunggu keputusan.
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument() // Approver yang ditugaskan tetap dapat bertindak.
  })

  it('is just a read-only view for someone who is not the assigned approver', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: adminProfile })
      if (url.pathname === '/approvals/approval-2b') {
        return jsonResponse(200, {
          data: {
            id: 'approval-2b', cycleNumber: 1, stepOrder: 2, stepType: 'FINANCE', status: 'PENDING', decisionComment: null,
            createdAt: '2026-09-02T00:00:00.000Z', decidedAt: null, approver: { id: 'user-finance', name: 'Fiona Finance' },
            cyclePolicy: 'MANAGER_FINANCE', request: { ...inboxItemForManager.request, id: 'req-2', requestNumber: 'REQ-2026-000002' },
          },
        })
      }
      if (url.pathname === '/requests/req-2') {
        return jsonResponse(200, { data: { ...requestPendingOnFinance, viewer: { relationship: 'OVERSIGHT', approval: null } } })
      }
      return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 } })
    })
    renderWithProviders(undefined, {
      initialEntries: ['/approvals/approval-2b'],
      routes: [{ path: '/approvals/:approvalId', element: <ApprovalReviewPage /> }],
    })
    expect(await screen.findByText('Looks good.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })
})

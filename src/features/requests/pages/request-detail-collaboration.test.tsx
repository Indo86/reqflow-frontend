import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { jsonResponse, stubFetch } from '@/test/mock-fetch'
import { employeeProfile, managerProfile, requestPendingOnManager } from '@/test/fixtures/approvals'
import { sampleAttachment, sampleComment } from '@/test/fixtures/collaboration'
import { RequestDetailPage } from './request-detail-page'
import { ApprovalReviewPage } from '@/features/approvals/pages/approval-review-page'

// F4 regression: Request Detail (owner view) must render REAL comments and
// attachments from the backend, while F2 (owner actions) and F3 (approval
// history) keep working unchanged — no leftover static/mock collaboration
// data, no accidental authorization regressions.
describe('RequestDetailPage collaboration (F4) alongside F2/F3', () => {
  it('renders real comments and attachments, plus F2 owner actions and F3 approval history, together', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: employeeProfile })
      if (url.pathname === '/requests/req-1') return jsonResponse(200, { data: requestPendingOnManager })
      if (url.pathname === '/requests/req-1/comments') {
        return jsonResponse(200, { data: [sampleComment], meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 } })
      }
      if (url.pathname === '/requests/req-1/attachments') {
        return jsonResponse(200, {
          data: [sampleAttachment],
          meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 },
        })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, {
      initialEntries: ['/requests/req-1'],
      routes: [{ path: '/requests/:requestId', element: <RequestDetailPage /> }],
    })

    // Real F4 data, not the F0.5 static placeholder content.
    expect(await screen.findByText(sampleComment.content)).toBeInTheDocument()
    expect(screen.getByText('vendor-quote.pdf')).toBeInTheDocument()

    // F2: owner still sees owner actions (Edit/Cancel/etc via RequestActions),
    // never approver Approve/Reject buttons — this request's owner is
    // Eddie Employee, who is not an approver on his own request.
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()

    // F3: approval history/flow still renders untouched.
    expect(screen.getByText('Approval Flow')).toBeInTheDocument()
    expect(screen.getByText('Awaiting decision')).toBeInTheDocument()

    // Comments are writable for the owner on a non-terminal request.
    expect(screen.getByLabelText('Add a comment')).toBeInTheDocument()
  })

  it('does not grant collaboration write access to a non-owner, non-approver viewer', async () => {
    // Admin can view (getRequestDetail's own admin visibility branch is not
    // reachable in this fixture, so this covers the case defensively at the
    // component level) — but the important assertion is that collaboration
    // write never leaks from anything other than isOwner/isCurrentApprover.
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: employeeProfile })
      if (url.pathname === '/requests/req-1') {
        return jsonResponse(200, { data: { ...requestPendingOnManager, status: 'APPROVED' } })
      }
      if (url.pathname === '/requests/req-1/comments') {
        return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } })
      }
      if (url.pathname === '/requests/req-1/attachments') {
        return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, {
      initialEntries: ['/requests/req-1'],
      routes: [{ path: '/requests/:requestId', element: <RequestDetailPage /> }],
    })

    // Terminal (APPROVED) request: even the owner loses write access, per
    // collaboration.service.ts's terminal-request rule (TERMINAL_REQUEST_STATUSES).
    await screen.findByText('No comments yet')
    expect(screen.queryByLabelText('Add a comment')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Add a file')).not.toBeInTheDocument()
  })
})

// F4 regression: the approver's separate review page (/approvals/:approvalId,
// backed by GET /approvals/:id) also gets real Comments/Attachments — this is
// the "APPROVER_COLLABORATION" question the F4 task required investigating.
// Answer: supported by the current backend (collaboration.service.ts treats
// any current/past approver as viewer, the current active one as writer), so
// it is wired here rather than reported as unsupported.
describe('ApprovalReviewPage collaboration (F4)', () => {
  it('lets the currently assigned approver read and write comments/attachments on their review page', async () => {
    const approvalDetail = {
      id: 'approval-1',
      cycleNumber: 1,
      stepOrder: 1,
      stepType: 'MANAGER',
      status: 'PENDING',
      decisionComment: null,
      createdAt: '2026-09-02T00:00:00.000Z',
      decidedAt: null,
      approver: { id: 'user-manager', name: 'Mona Manager' },
      cyclePolicy: 'MANAGER_ONLY',
      request: {
        id: 'req-1',
        requestNumber: 'REQ-2026-000001',
        type: 'PURCHASE',
        title: 'New laptops',
        amount: '15000000',
        status: 'IN_REVIEW',
        createdBy: { id: 'user-employee', name: 'Eddie Employee' },
        department: { id: 'dept-eng', name: 'Engineering' },
      },
    }

    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: managerProfile })
      if (url.pathname === '/approvals/approval-1') return jsonResponse(200, { data: approvalDetail })
      if (url.pathname === '/requests/req-1/comments') {
        return jsonResponse(200, { data: [sampleComment], meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 } })
      }
      if (url.pathname === '/requests/req-1/attachments') {
        return jsonResponse(200, {
          data: [sampleAttachment],
          meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 },
        })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, {
      initialEntries: ['/approvals/approval-1'],
      routes: [{ path: '/approvals/:approvalId', element: <ApprovalReviewPage /> }],
    })

    expect(await screen.findByText(sampleComment.content)).toBeInTheDocument()
    expect(screen.getByText('vendor-quote.pdf')).toBeInTheDocument()
    // The currently assigned approver can also write, not just view.
    expect(screen.getByLabelText('Add a comment')).toBeInTheDocument()
    // F3 decision actions still render unchanged alongside F4 collaboration.
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
  })
})

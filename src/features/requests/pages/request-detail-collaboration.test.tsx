import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { jsonResponse, stubFetch } from '@/test/mock-fetch'
import { employeeProfile, managerProfile, requestPendingOnManager } from '@/test/fixtures/approvals'
import { sampleAttachment, sampleComment } from '@/test/fixtures/collaboration'
import { RequestDetailPage } from './request-detail-page'
import { ApprovalReviewPage } from '@/features/approvals/pages/approval-review-page'

// Menjaga agar perilaku ini tidak mengalami regresi.
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

    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(await screen.findByText(sampleComment.content)).toBeInTheDocument()
    expect(screen.getByText('vendor-quote.pdf')).toBeInTheDocument()

    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()

    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(screen.getByText('Approval Flow')).toBeInTheDocument()
    expect(screen.getByText('Awaiting decision')).toBeInTheDocument()

    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(screen.getByLabelText('Add a comment')).toBeInTheDocument()
  })

  it('does not grant collaboration write access to a non-owner, non-approver viewer', async () => {
    // Menyiapkan data tiruan untuk skenario pengujian ini.
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

    // Menjelaskan kondisi yang diuji pada skenario ini.
    await screen.findByText('No comments yet')
    expect(screen.queryByLabelText('Add a comment')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Add a file')).not.toBeInTheDocument()
  })
})

// Mengambil data dari /approvals/:id.
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
    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(screen.getByLabelText('Add a comment')).toBeInTheDocument()
    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
  })
})

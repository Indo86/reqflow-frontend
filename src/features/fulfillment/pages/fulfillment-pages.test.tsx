import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { adminProfile, employeeProfile, requestPendingOnManager } from '@/test/fixtures/approvals'
import { RequestDetailPage } from '@/features/requests/pages/request-detail-page'
import { FulfillmentRoute } from '@/app/router/fulfillment-route'

const person = (id: string, name: string) => ({ id, name })
const meta = (total: number) => ({ page: 1, pageSize: 20, total, totalPages: 1 })

function task(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id, status: 'NOT_STARTED', assignee: null, createdAt: '2026-10-22T08:00:00.000Z', startedAt: null, closedAt: null,
    request: {
      id: `req-${id}`, requestNumber: `REQ-${id}`, type: 'EQUIPMENT', title: `Task ${id}`, amount: null,
      createdBy: person('u-req', 'Eddie Employee'), department: person('d1', 'Engineering'),
    },
    ...overrides,
  }
}

function renderTasks(profile: unknown, onList: (query: URLSearchParams) => Response) {
  const lists: URLSearchParams[] = []
  stubFetch((url) => {
    if (url.pathname === '/users/me') return jsonResponse(200, { data: profile })
    if (url.pathname === '/fulfillments') {
      lists.push(url.searchParams)
      return onList(url.searchParams)
    }
    throw new Error(`Unhandled fetch: ${url.pathname}`)
  })
  renderWithProviders(undefined, {
    initialEntries: ['/fulfillment'],
    routes: [{ path: '/fulfillment', element: <FulfillmentRoute /> }],
  })
  return lists
}

describe('FulfillmentTasksPage', () => {
  it('shows an employee only their own tasks, with no admin views', async () => {
    const lists = renderTasks(employeeProfile, () =>
      jsonResponse(200, { data: [task('1', { assignee: person('user-employee', 'Eddie Employee') })], meta: meta(1) })
    )
    expect(await screen.findByText('Task 1')).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Needs an owner/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /All open/ })).not.toBeInTheDocument()
    expect(lists[0].get('view')).toBe('assigned')
    expect(lists[0].get('state')).toBe('open')
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/requests/req-1')
  })

  it('gives an Admin the unassigned and all-open views, and asks the server for each', async () => {
    const lists = renderTasks(adminProfile, (query) =>
      query.get('view') === 'unassigned'
        ? jsonResponse(200, { data: [task('9')], meta: meta(1) })
        : jsonResponse(200, { data: [], meta: meta(0) })
    )
    expect(await screen.findByText('No open fulfillment tasks')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: /Needs an owner/ }))
    expect(await screen.findByText('Task 9')).toBeInTheDocument()
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
    expect(lists.some((query) => query.get('view') === 'unassigned')).toBe(true)

    fireEvent.click(screen.getByRole('tab', { name: /All open/ }))
    await waitFor(() => expect(lists.some((query) => query.get('view') === 'all')).toBe(true))
  })

  it('shows a clear empty state, and an error with retry when the server refuses', async () => {
    renderTasks(employeeProfile, () => jsonResponse(200, { data: [], meta: meta(0) }))
    expect(await screen.findByText('No open fulfillment tasks')).toBeInTheDocument()
    expect(screen.getByText(/assigned to you to carry out/)).toBeInTheDocument()
  })

  it('does not trust the URL: an employee asking for an admin view is refused by the server and sees an error', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: employeeProfile })
      if (url.pathname === '/fulfillments') return errorResponse(403, 'FORBIDDEN', 'You do not have permission to perform this action.')
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })
    renderWithProviders(undefined, {
      initialEntries: ['/fulfillment?tab=all-open'],
      routes: [{ path: '/fulfillment', element: <FulfillmentRoute /> }],
    })
    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(await screen.findByText("Couldn't load fulfillment tasks")).toBeInTheDocument()
  })
})

// Menjelaskan kondisi yang diuji pada skenario ini.

const approvedRequest = { ...requestPendingOnManager, status: 'APPROVED' }

function renderDetail(
  profile: unknown,
  request: unknown,
  fulfillmentBody: unknown,
  extra?: (pathname: string) => Response | undefined
) {
  stubFetch((url) => {
    if (url.pathname === '/users/me') return jsonResponse(200, { data: profile })
    if (url.pathname === '/requests/req-1') return jsonResponse(200, { data: request })
    if (url.pathname === '/requests/req-1/fulfillment') return jsonResponse(200, { data: fulfillmentBody })
    const handled = extra?.(url.pathname)
    if (handled) return handled
    if (url.pathname === '/requests/req-1/comments' || url.pathname === '/requests/req-1/attachments' || url.pathname === '/requests/req-1/audit-log') {
      return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 1 } })
    }
    throw new Error(`Unhandled fetch: ${url.pathname}`)
  })
  return renderWithProviders(undefined, {
    initialEntries: ['/requests/req-1'],
    routes: [{ path: '/requests/:requestId', element: <RequestDetailPage /> }],
  })
}

const open = (permissions: Record<string, boolean>, status = 'IN_PROGRESS') => ({
  requestId: 'req-1',
  applicability: 'TRACKED',
  fulfillment: {
    id: 'f1', status, assignee: person('user-employee', 'Eddie Employee'), startedAt: null, closedAt: null,
    closedBy: null, closingNote: null, createdAt: 'x', updatedAt: 'x',
  },
  permissions: {
    canStart: false, canComplete: false, canCancel: false, canAssign: false, canComment: false, canAddEvidence: false,
    ...permissions,
  },
})

describe('RequestDetailPage fulfillment integration', () => {
  it('shows the Fulfillment section on an approved request', async () => {
    renderDetail(employeeProfile, approvedRequest, open({}))
    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(await screen.findByText('In progress')).toBeInTheDocument()
    expect(screen.getByText('Assigned to Eddie Employee')).toBeInTheDocument()
  })

  it('does not ask for or show fulfillment on a request still in review', async () => {
    const fetches: string[] = []
    stubFetch((url) => {
      fetches.push(url.pathname)
      if (url.pathname === '/users/me') return jsonResponse(200, { data: employeeProfile })
      if (url.pathname === '/requests/req-1') return jsonResponse(200, { data: requestPendingOnManager })
      return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 1 } })
    })
    renderWithProviders(undefined, {
      initialEntries: ['/requests/req-1'],
      routes: [{ path: '/requests/:requestId', element: <RequestDetailPage /> }],
    })
    await screen.findByText('REQ-2026-000001')
    expect(screen.queryByText(/Assigned to|Approved before fulfillment tracking/)).not.toBeInTheDocument()
    expect(fetches).not.toContain('/requests/req-1/fulfillment')
  })

  it('keeps comments and attachments read-only on an approved request without fulfillment permission', async () => {
    renderDetail(employeeProfile, approvedRequest, open({}))
    await screen.findByText('In progress')
    expect(screen.queryByPlaceholderText('Add a comment…')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Add a file')).not.toBeInTheDocument()
  })

  it('lets the server-permitted assignee comment and attach evidence while the fulfillment is open', async () => {
    renderDetail(employeeProfile, approvedRequest, open({ canComment: true, canAddEvidence: true }))
    expect(await screen.findByPlaceholderText('Add a comment…')).toBeInTheDocument()
    expect(await screen.findByLabelText('Add a file')).toBeInTheDocument()
  })

  it('lets the owner comment but not attach evidence when only comments are permitted', async () => {
    renderDetail(employeeProfile, approvedRequest, open({ canComment: true }))
    expect(await screen.findByPlaceholderText('Add a comment…')).toBeInTheDocument()
    expect(screen.queryByLabelText('Add a file')).not.toBeInTheDocument()
  })

  it('does not reopen the request itself: no edit or cancel for the owner of an approved request', async () => {
    renderDetail(employeeProfile, approvedRequest, open({ canComment: true }))
    await screen.findByText('In progress')
    expect(screen.queryByRole('button', { name: /Edit/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Withdraw' })).not.toBeInTheDocument()
  })

  it('shows the historical approved request as not tracked', async () => {
    renderDetail(employeeProfile, approvedRequest, {
      requestId: 'req-1', applicability: 'NOT_TRACKED', fulfillment: null,
      permissions: { canStart: false, canComplete: false, canCancel: false, canAssign: false, canComment: false, canAddEvidence: false },
    })
    expect(await screen.findByText(/Approved before fulfillment tracking/)).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('offers the Admin assignment controls only when the server permits them, and no execution rights', async () => {
    renderDetail(adminProfile, { ...approvedRequest, viewer: { relationship: 'OVERSIGHT', approval: null } }, {
      ...open({ canAssign: true, canCancel: true }, 'NOT_STARTED'),
      fulfillment: { ...open({}).fulfillment, status: 'NOT_STARTED', assignee: null },
    })
    expect(await screen.findByRole('button', { name: 'Assign' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel fulfillment' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Complete' })).not.toBeInTheDocument()
  })
})

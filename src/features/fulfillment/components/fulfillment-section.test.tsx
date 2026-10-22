import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { FulfillmentSection } from './fulfillment-section'

const none = { canStart: false, canComplete: false, canCancel: false, canAssign: false, canComment: false, canAddEvidence: false }
const person = (id: string, name: string) => ({ id, name })

function record(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ful-1',
    status: 'NOT_STARTED',
    assignee: person('u-fin', 'Fiona Finance'),
    startedAt: null,
    closedAt: null,
    closedBy: null,
    closingNote: null,
    createdAt: '2026-10-22T08:00:00.000Z',
    updatedAt: '2026-10-22T08:00:00.000Z',
    ...overrides,
  }
}

function view(applicability: string, fulfillment: unknown, permissions: Partial<typeof none> = {}) {
  return { requestId: 'req-1', applicability, fulfillment, permissions: { ...none, ...permissions } }
}

interface Recorded {
  method: string
  path: string
  body: unknown
}

// Mengambil data dari /requests/req-1/fulfillment.
function setup(state: { current: ReturnType<typeof view> }, type: 'PURCHASE' | 'REIMBURSEMENT' | 'EQUIPMENT' = 'PURCHASE') {
  const calls: Recorded[] = []
  const writes: Record<string, (body: unknown) => Response> = {}
  stubFetch((url, init) => {
    const method = init?.method ?? 'GET'
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    if (method !== 'GET') calls.push({ method, path: url.pathname, body })
    if (url.pathname === '/requests/req-1/fulfillment') return jsonResponse(200, { data: state.current })
    if (url.pathname === '/requests/req-1/audit-log') {
      return jsonResponse(200, {
        data: [
          {
            id: 'a1', action: 'FULFILLMENT_CREATED', entityType: 'FULFILLMENT', actor: person('u-mgr', 'Mona Manager'),
            metadata: { assigneeName: 'Fiona Finance', assignment: 'DEFAULT', requestType: 'PURCHASE' }, createdAt: '2026-10-22T08:00:00.000Z',
          },
          { id: 'a2', action: 'COMMENT_CREATED', entityType: 'COMMENT', actor: null, metadata: null, createdAt: '2026-10-22T08:05:00.000Z' },
        ],
        meta: { page: 1, pageSize: 100, total: 2, totalPages: 1 },
      })
    }
    if (url.pathname === '/requests/req-1/fulfillment/candidates') {
      return jsonResponse(200, {
        data: [{ id: 'u-new', name: 'Nadia New', email: 'nadia@example.com', role: 'FINANCE' }],
      })
    }
    const write = writes[url.pathname]
    if (method === 'POST' && write) return write(body)
    throw new Error(`Unhandled fetch: ${method} ${url.pathname}`)
  })
  renderWithProviders(undefined, {
    initialEntries: ['/x'],
    routes: [{ path: '/x', element: <FulfillmentSection requestId="req-1" requestType={type} /> }],
  })
  return { calls, writes }
}

describe('FulfillmentSection states', () => {
  it('shows a loading state, then the record with its status and assignee', async () => {
    setup({ current: view('TRACKED', record()) })
    expect(screen.getByText('Loading fulfillment…')).toBeInTheDocument()
    expect(await screen.findByText('Not started')).toBeInTheDocument()
    expect(screen.getByText('Assigned to Fiona Finance')).toBeInTheDocument()
  })

  it('shows an error with a retry when the fulfillment cannot be loaded', async () => {
    let fail = true
    stubFetch((url) => {
      if (url.pathname === '/requests/req-1/fulfillment') {
        return fail ? errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.') : jsonResponse(200, { data: view('TRACKED', record()) })
      }
      return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 1 } })
    })
    renderWithProviders(undefined, { initialEntries: ['/x'], routes: [{ path: '/x', element: <FulfillmentSection requestId="req-1" requestType="PURCHASE" /> }] })
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    fail = false
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('Not started')).toBeInTheDocument()
  })

  it('says a request approved before tracking is not tracked, and never calls it completed or pending', async () => {
    setup({ current: view('NOT_TRACKED', null) })
    expect(await screen.findByText(/Approved before fulfillment tracking/)).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Not started')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('says no fulfillment is needed for leave', async () => {
    setup({ current: view('NOT_REQUIRED', null) })
    expect(await screen.findByText(/No fulfillment is required/)).toBeInTheDocument()
  })

  it('renders nothing for a request that is not approved', async () => {
    const { calls } = setup({ current: view('NOT_APPROVED', null) })
    await waitFor(() => expect(screen.queryByText('Loading fulfillment…')).not.toBeInTheDocument())
    expect(calls).toHaveLength(0)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('explains an unassigned fulfillment differently to Admin and to everyone else', async () => {
    setup({ current: view('TRACKED', record({ assignee: null }), { canAssign: true, canCancel: true }) })
    expect(await screen.findByText('Unassigned')).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent('Assign someone below')
    expect(screen.getByRole('button', { name: 'Assign' })).toBeInTheDocument()
  })

  it('tells a non-Admin that an administrator must assign someone, and offers no controls', async () => {
    setup({ current: view('TRACKED', record({ assignee: null })) })
    expect(await screen.findByRole('note')).toHaveTextContent('An administrator needs to assign someone')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows a completed fulfillment as internally recorded, not verified', async () => {
    setup({
      current: view('TRACKED', record({
        status: 'COMPLETED', startedAt: '2026-10-22T09:00:00.000Z', closedAt: '2026-10-22T10:00:00.000Z',
        closedBy: person('u-fin', 'Fiona Finance'), closingNote: 'Paid by internal transfer, reference 1142.',
      })),
    })
    expect(await screen.findByText(/Recorded as completed by Fiona Finance/)).toBeInTheDocument()
    expect(screen.getByText('Paid by internal transfer, reference 1142.')).toBeInTheDocument()
    expect(screen.getByText(/not independently verified/)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows a cancelled fulfillment with its reason and leaves the approval alone', async () => {
    setup({
      current: view('TRACKED', record({
        status: 'CANCELLED', closedAt: '2026-10-22T10:00:00.000Z', closedBy: person('u-adm', 'Ava Admin'),
        closingNote: 'The vendor no longer supplies this item.',
      }), { canCancel: false, canAssign: false }),
    })
    expect(await screen.findByText(/Cancelled by Ava Admin/)).toBeInTheDocument()
    expect(screen.getByText('Reason: The vendor no longer supplies this item.')).toBeInTheDocument()
    expect(screen.getByText('The approval itself is unchanged.')).toBeInTheDocument()
  })

  it('lists only fulfillment events in the read-only history', async () => {
    setup({ current: view('TRACKED', record()) })
    const history = await screen.findByRole('list', { name: 'Fulfillment history' })
    expect(history).toHaveTextContent('Fulfillment opened and assigned to Fiona Finance')
    expect(history).not.toHaveTextContent('Comment added')
  })
})

describe('FulfillmentSection controls come from server permissions', () => {
  it('shows nothing actionable to a reader without permissions, even on an open record', async () => {
    setup({ current: view('TRACKED', record({ status: 'IN_PROGRESS', startedAt: '2026-10-22T09:00:00.000Z' })) })
    await screen.findByText('In progress')
    for (const name of ['Start', 'Complete', 'Assign', 'Reassign', 'Cancel fulfillment']) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
    }
  })

  it('lets the assignee start, which posts to the start endpoint', async () => {
    const state = { current: view('TRACKED', record(), { canStart: true }) }
    const { calls, writes } = setup(state)
    writes['/requests/req-1/fulfillment/start'] = () => {
      state.current = view('TRACKED', record({ status: 'IN_PROGRESS', startedAt: '2026-10-22T09:00:00.000Z' }), { canComplete: true })
      return jsonResponse(200, { data: state.current })
    }
    fireEvent.click(await screen.findByRole('button', { name: 'Start' }))
    expect(await screen.findByText('In progress')).toBeInTheDocument()
    expect(calls).toEqual([{ method: 'POST', path: '/requests/req-1/fulfillment/start', body: undefined }])
    expect(await screen.findByRole('button', { name: 'Complete' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
  })

  it('shows a refused start as an error and keeps the controls consistent with the server', async () => {
    const { writes } = setup({ current: view('TRACKED', record(), { canStart: true }) })
    writes['/requests/req-1/fulfillment/start'] = () => errorResponse(409, 'FULFILLMENT_ALREADY_STARTED', 'This fulfillment has already been started.')
    fireEvent.click(await screen.findByRole('button', { name: 'Start' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('This fulfillment has already been started.')
  })

  it('requires a meaningful completion note before anything is sent', async () => {
    const { calls } = setup({ current: view('TRACKED', record({ status: 'IN_PROGRESS', startedAt: '2026-10-22T09:00:00.000Z' }), { canComplete: true }) }, 'REIMBURSEMENT')
    fireEvent.click(await screen.findByRole('button', { name: 'Complete' }))
    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(screen.getByLabelText('Internal payment confirmation')).toBeInTheDocument()
    expect(screen.getByText(/not bank verification/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Record completion' }))
    expect(await screen.findByText('A comment is required.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Internal payment confirmation'), { target: { value: 'too short' } })
    fireEvent.click(screen.getByRole('button', { name: 'Record completion' }))
    expect(await screen.findByText('The note must be at least 10 characters.')).toBeInTheDocument()
    expect(calls).toHaveLength(0)
  })

  it('sends the trimmed note on completion and closes the dialog', async () => {
    const state = { current: view('TRACKED', record({ status: 'IN_PROGRESS', startedAt: '2026-10-22T09:00:00.000Z' }), { canComplete: true }) }
    const { calls, writes } = setup(state, 'EQUIPMENT')
    writes['/requests/req-1/fulfillment/complete'] = () => {
      state.current = view('TRACKED', record({ status: 'COMPLETED', closedAt: '2026-10-22T10:00:00.000Z', closedBy: person('u-fin', 'Fiona Finance'), closingNote: 'Laptop tag 0042 handed to Andi.' }))
      return jsonResponse(200, { data: state.current })
    }
    fireEvent.click(await screen.findByRole('button', { name: 'Complete' }))
    expect(screen.getByLabelText('Handover confirmation')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Handover confirmation'), { target: { value: '  Laptop tag 0042 handed to Andi.  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Record completion' }))
    expect(await screen.findByText(/Recorded as completed by Fiona Finance/)).toBeInTheDocument()
    expect(calls).toEqual([{ method: 'POST', path: '/requests/req-1/fulfillment/complete', body: { note: 'Laptop tag 0042 handed to Andi.' } }])
  })

  it('shows the server message when completion is refused', async () => {
    const { writes } = setup({ current: view('TRACKED', record({ status: 'IN_PROGRESS', startedAt: '2026-10-22T09:00:00.000Z' }), { canComplete: true }) })
    writes['/requests/req-1/fulfillment/complete'] = () => errorResponse(404, 'FULFILLMENT_NOT_FOUND', 'Fulfillment not found.')
    fireEvent.click(await screen.findByRole('button', { name: 'Complete' }))
    fireEvent.change(screen.getByLabelText('Purchase or receipt confirmation'), { target: { value: 'Ordered from the vendor today.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Record completion' }))
    expect(await screen.findByText('Fulfillment not found.')).toBeInTheDocument()
  })

  it('lets an Admin cancel only with a reason, and sends it', async () => {
    const state = { current: view('TRACKED', record(), { canCancel: true, canAssign: true }) }
    const { calls, writes } = setup(state)
    writes['/requests/req-1/fulfillment/cancel'] = () => {
      state.current = view('TRACKED', record({ status: 'CANCELLED', closedAt: '2026-10-22T10:00:00.000Z', closedBy: person('u-adm', 'Ava Admin'), closingNote: 'No longer needed by the team.' }))
      return jsonResponse(200, { data: state.current })
    }
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel fulfillment' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }))
    expect(await screen.findByText('A comment is required.')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Reason for cancelling'), { target: { value: 'No longer needed by the team.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }))
    expect(await screen.findByText(/Cancelled by Ava Admin/)).toBeInTheDocument()
    expect(calls).toEqual([{ method: 'POST', path: '/requests/req-1/fulfillment/cancel', body: { reason: 'No longer needed by the team.' } }])
  })

  it('assigns an unassigned fulfillment to a server-provided candidate without needing a reason', async () => {
    const state = { current: view('TRACKED', record({ assignee: null }), { canAssign: true }) }
    const { calls, writes } = setup(state)
    writes['/requests/req-1/fulfillment/assign'] = () => {
      state.current = view('TRACKED', record({ assignee: person('u-new', 'Nadia New') }), { canAssign: true })
      return jsonResponse(200, { data: state.current })
    }
    fireEvent.click(await screen.findByRole('button', { name: 'Assign' }))
    const select = await screen.findByLabelText('Assignee')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Nadia New (nadia@example.com)' })).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Save assignment' }))
    expect(await screen.findByText('Choose who will carry this out.')).toBeInTheDocument()

    fireEvent.change(select, { target: { value: 'u-new' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save assignment' }))
    expect(await screen.findByText('Assigned to Nadia New')).toBeInTheDocument()
    expect(calls).toEqual([{ method: 'POST', path: '/requests/req-1/fulfillment/assign', body: { assigneeId: 'u-new' } }])
  })

  it('requires a reason to reassign an existing assignee', async () => {
    const { calls } = setup({ current: view('TRACKED', record(), { canAssign: true }) })
    fireEvent.click(await screen.findByRole('button', { name: 'Reassign' }))
    const select = await screen.findByLabelText('Assignee')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Nadia New (nadia@example.com)' })).toBeInTheDocument())
    fireEvent.change(select, { target: { value: 'u-new' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save assignment' }))
    expect(await screen.findByText('A reason is required to reassign.')).toBeInTheDocument()
    expect(calls).toHaveLength(0)
  })

  it('shows the server explanation when an assignee is refused', async () => {
    const { writes } = setup({ current: view('TRACKED', record({ assignee: null }), { canAssign: true }) })
    writes['/requests/req-1/fulfillment/assign'] = () =>
      errorResponse(409, 'ASSIGNEE_NOT_ELIGIBLE', 'Only an active Finance user in this organization, other than the requester, can fulfil a reimbursement.')
    fireEvent.click(await screen.findByRole('button', { name: 'Assign' }))
    const select = await screen.findByLabelText('Assignee')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Nadia New (nadia@example.com)' })).toBeInTheDocument())
    fireEvent.change(select, { target: { value: 'u-new' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save assignment' }))
    expect(await screen.findByText(/Only an active Finance user/)).toBeInTheDocument()
  })
})

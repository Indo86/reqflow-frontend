import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { jsonResponse, errorResponse, stubFetch } from '@/test/mock-fetch'
import { adminProfile, employeeProfile } from '@/test/fixtures/session'

const userFixture = {
  id: 'user-1',
  name: 'Alice Manager',
  email: 'alice@test.com',
  role: 'MANAGER',
  department: { id: 'dept-1', name: 'Engineering' },
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const departmentFixture = [
  { id: 'dept-eng', name: 'Engineering', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'dept-fin', name: 'Finance', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'dept-hr', name: 'Human Resources', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'dept-mkt', name: 'Marketing', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'dept-ops', name: 'Operations', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
]

function stubMe(profile: unknown) {
  return (url: URL) => {
    if (url.pathname === '/users/me') return jsonResponse(200, { data: profile })
    return null
  }
}

function getOpenDialog() {
  return screen.getAllByRole('dialog', { hidden: true }).find((dialog) => dialog.hasAttribute('open'))
}

describe('F6.5 Users navigation visibility', () => {
  it('shows the Users nav link for an authenticated Admin', async () => {
    stubFetch((url) => stubMe(adminProfile)(url) ?? errorResponse(404, 'NOT_FOUND', 'unhandled'))

    renderWithProviders(undefined, { initialEntries: ['/dashboard'] })

    expect(await screen.findByText('Ava Admin')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Users/ })).toBeInTheDocument()
  })

  it('does not show the Users nav link for a non-Admin', async () => {
    stubFetch((url) => stubMe(employeeProfile)(url) ?? errorResponse(404, 'NOT_FOUND', 'unhandled'))

    renderWithProviders(undefined, { initialEntries: ['/dashboard'] })

    expect(await screen.findByText('Eddie Employee')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Users/ })).not.toBeInTheDocument()
  })

  it('redirects a non-Admin who navigates directly to /users back to the dashboard', async () => {
    stubFetch((url) => stubMe(employeeProfile)(url) ?? errorResponse(404, 'NOT_FOUND', 'unhandled'))

    const { router } = renderWithProviders(undefined, { initialEntries: ['/users'] })

    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  })
})

describe('F6.5 Users list', () => {
  it('renders real data from GET /users (not mock data), with no organizationId sent', async () => {
    const fetchSpy = stubFetch((url) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/users') return jsonResponse(200, { data: [userFixture], meta: { page: 1, pageSize: 20, total: 1 } })
      if (url.pathname === '/departments') return jsonResponse(200, { data: [] })
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users'] })

    expect(await screen.findByText('Alice Manager')).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()

    const usersCall = fetchSpy.mock.calls.find(([url]) => (url as URL).pathname === '/users')
    expect(usersCall).toBeDefined()
    expect((usersCall![0] as URL).search).not.toContain('organizationId')
  })

  it('shows a safe empty state, not a raw error, for a filtered-empty result', async () => {
    stubFetch((url) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/users') return jsonResponse(200, { data: [], meta: { page: 1, pageSize: 20, total: 0 } })
      if (url.pathname === '/departments') return jsonResponse(200, { data: [] })
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users'] })

    expect(await screen.findByText('No users found')).toBeInTheDocument()
  })

  it('shows No department explicitly when a user is unassigned', async () => {
    stubFetch((url) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/users') {
        return jsonResponse(200, {
          data: [{ ...userFixture, id: 'user-2', department: null }],
          meta: { page: 1, pageSize: 20, total: 1 },
        })
      }
      if (url.pathname === '/departments') return jsonResponse(200, { data: [] })
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users'] })

    expect(await screen.findByText('No department')).toBeInTheDocument()
  })
})

describe('F6.5 Create user', () => {
  it('submits profile fields only and displays the generated temporary password once', async () => {
    const fetchSpy = stubFetch((url, init) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/departments') return jsonResponse(200, { data: departmentFixture })
      if (url.pathname === '/users' && init?.method === 'POST') {
        return jsonResponse(201, { data: { user: userFixture, temporaryPassword: 'Ab7K-xP4m-Q2Nz' } })
      }
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users/new'] })

    expect(await screen.findByRole('heading', { name: 'New User' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Alice Manager' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@test.com' } })
    const departmentSelect = screen.getByLabelText('Department')
    for (const department of departmentFixture) {
      expect(await within(departmentSelect).findByRole('option', { name: department.name })).toBeInTheDocument()
    }
    fireEvent.change(departmentSelect, { target: { value: 'dept-eng' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create User' }))

    expect(await screen.findByText('Ab7K-xP4m-Q2Nz')).toBeInTheDocument()

    const createCall = fetchSpy.mock.calls.find(
      ([url, init]) => (url as URL).pathname === '/users' && (init as RequestInit | undefined)?.method === 'POST'
    )
    expect(createCall).toBeDefined()
    const body = JSON.parse((createCall![1] as RequestInit).body as string) as Record<string, unknown>
    expect(body).not.toHaveProperty('organizationId')
    expect(body.role).toBe('EMPLOYEE')
    expect(body.departmentId).toBe('dept-eng')
    expect(body).not.toHaveProperty('password')
  })

  it('shows a distinct loading state for the Department selector', async () => {
    stubFetch((url) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/departments') return new Promise(() => {})
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users/new'] })

    expect(await screen.findByRole('option', { name: 'Loading departments...' })).toBeInTheDocument()
    expect(screen.getByLabelText('Department')).toBeDisabled()
  })

  it('shows a distinct empty state for the Department selector', async () => {
    stubFetch((url) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/departments') return jsonResponse(200, { data: [] })
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users/new'] })

    expect(await screen.findByRole('option', { name: 'No departments available' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'No department' })).not.toBeInTheDocument()
  })

  it('shows a distinct error state for the Department selector', async () => {
    stubFetch((url) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/departments') return errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed')
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users/new'] })

    expect(await screen.findByRole('option', { name: 'Failed to load departments' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'No department' })).not.toBeInTheDocument()
  })
})

describe('F6.5 Edit user department', () => {
  it('shows the current department and submits a changed departmentId', async () => {
    const fetchSpy = stubFetch((url, init) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/departments') {
        return jsonResponse(200, {
          data: [
            { id: 'dept-1', name: 'Engineering', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
            { id: 'dept-2', name: 'Operations', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
          ],
        })
      }
      if (url.pathname === '/users/user-1/department' && init?.method === 'PATCH') {
        return jsonResponse(200, { data: { ...userFixture, department: { id: 'dept-2', name: 'Operations' } } })
      }
      if (url.pathname === '/users/user-1') return jsonResponse(200, { data: userFixture })
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users/user-1'] })

    const selector = await screen.findByLabelText('Department')
    await screen.findByRole('option', { name: 'Operations' })
    expect(selector).toHaveValue('dept-1')
    fireEvent.change(selector, { target: { value: 'dept-2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Assign' }))

    await waitFor(() => {
      const call = fetchSpy.mock.calls.find(
        ([url, init]) => (url as URL).pathname === '/users/user-1/department' && (init as RequestInit | undefined)?.method === 'PATCH'
      )
      expect(JSON.parse((call?.[1] as RequestInit).body as string)).toEqual({ departmentId: 'dept-2' })
    })
  })
})

describe('F6.5 Deactivate user', () => {
  it('asks for confirmation before deactivating, then calls the backend', async () => {
    let currentlyActive = true
    stubFetch((url, init) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/departments') return jsonResponse(200, { data: [] })
      if (url.pathname === '/users/user-1' && (!init || init.method === undefined)) {
        return jsonResponse(200, { data: { ...userFixture, isActive: currentlyActive } })
      }
      if (url.pathname === '/users/user-1/status' && init?.method === 'PATCH') {
        currentlyActive = false
        return jsonResponse(200, { data: { ...userFixture, isActive: false } })
      }
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users/user-1'] })

    const deactivateButton = await screen.findByRole('button', { name: 'Deactivate User' })
    fireEvent.click(deactivateButton)

    await waitFor(() => expect(getOpenDialog()).toBeDefined())
    const dialog = getOpenDialog()!
    fireEvent.click(within(dialog).getByRole('button', { name: 'Deactivate' }))

    expect(await screen.findByText('Inactive')).toBeInTheDocument()
  })

  it('shows a safe backend conflict message (e.g. pending approvals) instead of a generic error', async () => {
    stubFetch((url, init) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/departments') return jsonResponse(200, { data: [] })
      if (url.pathname === '/users/user-1' && (!init || init.method === undefined)) {
        return jsonResponse(200, { data: userFixture })
      }
      if (url.pathname === '/users/user-1/status' && init?.method === 'PATCH') {
        return errorResponse(409, 'USER_HAS_PENDING_APPROVALS', 'This user has an active approval responsibility.')
      }
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: ['/users/user-1'] })

    fireEvent.click(await screen.findByRole('button', { name: 'Deactivate User' }))
    await waitFor(() => expect(getOpenDialog()).toBeDefined())
    const dialog = getOpenDialog()!
    fireEvent.click(within(dialog).getByRole('button', { name: 'Deactivate' }))

    expect(await screen.findByText('This user has an active approval responsibility.')).toBeInTheDocument()
  })
})

describe('M11 Admin reset password', () => {
  it('confirms the action and displays the one-time temporary password', async () => {
    const fetchSpy = stubFetch((url, init) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/departments') return jsonResponse(200, { data: [] })
      if (url.pathname === '/users/user-1' && (!init || init.method === undefined)) return jsonResponse(200, { data: userFixture })
      if (url.pathname === '/users/user-1/reset-password' && init?.method === 'POST') {
        return jsonResponse(200, { data: { temporaryPassword: 'Ab7K-xP4m-Q2Nz' } })
      }
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })
    renderWithProviders(undefined, { initialEntries: ['/users/user-1'] })
    fireEvent.click(await screen.findByRole('button', { name: 'Reset Password' }))
    await waitFor(() => expect(getOpenDialog()).toBeDefined())
    const dialog = getOpenDialog()!
    expect(within(dialog).getByText(/current password and active sessions will stop working/i)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset Password' }))
    expect(await screen.findByText('Ab7K-xP4m-Q2Nz')).toBeInTheDocument()
    expect(fetchSpy.mock.calls.some(([url]) => (url as URL).pathname === '/users/user-1/reset-password')).toBe(true)
  })
})

describe('F6.5 self-protection UX', () => {
  it('disables deactivate and role change for the signed-in Admin viewing their own user record', async () => {
    const selfAsAdminUser = { ...userFixture, id: adminProfile.id, name: adminProfile.name, email: adminProfile.email, role: 'ADMIN' }
    stubFetch((url) => {
      const me = stubMe(adminProfile)(url)
      if (me) return me
      if (url.pathname === '/departments') return jsonResponse(200, { data: [] })
      if (url.pathname === `/users/${adminProfile.id}`) return jsonResponse(200, { data: selfAsAdminUser })
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })

    renderWithProviders(undefined, { initialEntries: [`/users/${adminProfile.id}`] })

    expect(await screen.findByRole('button', { name: 'Deactivate User' })).toBeDisabled()
    expect(screen.getByText('You cannot deactivate your own account.')).toBeInTheDocument()
    expect(screen.getByText('You cannot change your own role.')).toBeInTheDocument()
  })
})

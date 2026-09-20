import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { jsonResponse, stubFetch } from '@/test/mock-fetch'
import { adminProfile, employeeProfile, managerProfile } from '@/test/fixtures/session'
import { authKeys } from './hooks/use-session'

describe('session bootstrap', () => {
  it('restores the user from an existing authenticated session', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: employeeProfile })
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, { initialEntries: ['/dashboard'] })
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Eddie Employee')).toBeInTheDocument()
  })

  it('leads to the guest login screen for an unauthenticated session', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') {
        return jsonResponse(401, { error: { code: 'UNAUTHENTICATED', message: 'Authentication required.', requestId: 'r1' } })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, { initialEntries: ['/dashboard'] })
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })

  it('waits for the bootstrap check before rendering protected content (no flicker)', async () => {
    let resolveFetch!: (value: Response) => void
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })
    stubFetch((url) => {
      if (url.pathname === '/users/me') return pending
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, { initialEntries: ['/dashboard'] })
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Welcome back' })).not.toBeInTheDocument()

    resolveFetch(jsonResponse(200, { data: employeeProfile }))
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('distinguishes a backend/network failure from a normal logged-out state', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') throw new TypeError('Failed to fetch')
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, { initialEntries: ['/dashboard'] })
    expect(await screen.findByText("We couldn't reach ReqFlow. Check your connection and try again.")).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Welcome back' })).not.toBeInTheDocument()
  })
})

describe('protected and guest routing', () => {
  it('cannot render a protected route while unauthenticated', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') {
        return jsonResponse(401, { error: { code: 'UNAUTHENTICATED', message: 'Authentication required.', requestId: 'r1' } })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    const { router } = renderWithProviders(undefined, { initialEntries: ['/approvals'] })
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('renders the authenticated protected shell once signed in', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: managerProfile })
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, { initialEntries: ['/approvals'] })
    expect(await screen.findByRole('heading', { name: 'Pending My Approval' })).toBeInTheDocument()
  })

  it('redirects an authenticated user away from /login without looping', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: employeeProfile })
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    const { router } = renderWithProviders(undefined, { initialEntries: ['/login'] })
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')
  })
})

describe('AppShell real-user integration', () => {
  it('shows Reports navigation for an authenticated Admin', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: adminProfile })
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, { initialEntries: ['/dashboard'] })
    expect(await screen.findByText('Ava Admin')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Reports/ })).toBeInTheDocument()
  })

  it('does not show organization Reports navigation for a Manager', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: managerProfile })
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(undefined, { initialEntries: ['/dashboard'] })
    expect(await screen.findByText('Mona Manager')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Reports/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Approvals/ })).toBeInTheDocument()
  })
})

describe('logout', () => {
  it('calls the backend, clears session state, and returns to /login', async () => {
    let signedOut = false
    const fetchSpy = stubFetch((url, init) => {
      if (url.pathname === '/users/me') {
        return signedOut
          ? jsonResponse(401, { error: { code: 'UNAUTHENTICATED', message: 'Authentication required.', requestId: 'r1' } })
          : jsonResponse(200, { data: employeeProfile })
      }
      if (url.pathname === '/auth/logout' && init?.method === 'POST') {
        signedOut = true
        return jsonResponse(200, { data: { success: true } })
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    const { client } = renderWithProviders(undefined, { initialEntries: ['/dashboard'] })
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Log out/ }))

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ href: expect.stringContaining('/auth/logout') }),
      expect.objectContaining({ method: 'POST' })
    )
    // queryClient.clear() wipes the previous user's cached profile immediately;
    // GuestOnlyRoute then legitimately re-queries for /login and caches the
    // fresh (now unauthenticated) result — so the assertion is "not the old
    // signed-in profile anymore", not "nothing was ever cached again".
    await waitFor(() => expect(client.getQueryData(authKeys.session())).not.toEqual(employeeProfile))
  })
})

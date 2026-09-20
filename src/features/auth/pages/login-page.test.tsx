import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch, stubUnauthenticatedSession } from '@/test/mock-fetch'
import { employeeProfile } from '@/test/fixtures/session'
import { LoginPage } from './login-page'

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Work email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: /Sign In/ }))
}

describe('LoginPage', () => {
  it('renders the static sign-in form', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByLabelText('Work email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('shows validation errors instead of submitting for an empty/invalid form', async () => {
    const fetchSpy = stubUnauthenticatedSession()
    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Work email'), { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('calls the real login endpoint with credentials included and redirects on success', async () => {
    const fetchSpy = stubFetch((url) => {
      if (url.pathname === '/auth/login') return jsonResponse(200, { data: { id: 'user-1', name: 'Eddie Employee', email: 'eddie@example.com' } })
      if (url.pathname === '/users/me') return jsonResponse(200, { data: employeeProfile })
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(<LoginPage />)
    fillAndSubmit('eddie@example.com', 'Password123!')

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ href: expect.stringContaining('/auth/login') }),
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      )
    })

    const [, loginInit] = fetchSpy.mock.calls.find(([input]) =>
      String((input as URL).href ?? input).includes('/auth/login')
    )!
    expect(JSON.parse(loginInit!.body as string)).toEqual({
      email: 'eddie@example.com',
      password: 'Password123!',
    })
  })

  it('shows a controlled message for invalid credentials without leaking backend internals', async () => {
    stubFetch((url) => {
      if (url.pathname === '/auth/login') {
        return errorResponse(401, 'INVALID_CREDENTIALS', 'Invalid email or password.')
      }
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(<LoginPage />)
    fillAndSubmit('eddie@example.com', 'wrong-password')

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(screen.queryByText(/Request ID/)).not.toBeInTheDocument()
  })

  it('shows a generic message and a request id for an unexpected server error', async () => {
    stubFetch((url) => {
      if (url.pathname === '/auth/login') return errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.')
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(<LoginPage />)
    fillAndSubmit('eddie@example.com', 'Password123!')

    expect(await screen.findByText('The request could not be completed. Please try again.')).toBeInTheDocument()
    expect(screen.getByText('Request ID: test-request-id')).toBeInTheDocument()
  })

  it('shows a safe message when the backend is unreachable', async () => {
    stubFetch((url) => {
      if (url.pathname === '/auth/login') throw new TypeError('Failed to fetch')
      throw new Error(`Unhandled fetch: ${url.pathname}`)
    })

    renderWithProviders(<LoginPage />)
    fillAndSubmit('eddie@example.com', 'Password123!')

    expect(
      await screen.findByText('Unable to connect. Please check your connection and try again.')
    ).toBeInTheDocument()
  })
})

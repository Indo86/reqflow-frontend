import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { adminProfile, employeeProfile } from '@/test/fixtures/session'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { renderWithProviders } from '@/test/render-with-providers'

const forcedProfile = { ...employeeProfile, mustChangePassword: true }

describe('password route guards', () => {
  it('redirects a forced-change user away from business routes', async () => {
    stubFetch((url) => url.pathname === '/users/me'
      ? jsonResponse(200, { data: forcedProfile })
      : errorResponse(404, 'NOT_FOUND', 'unhandled'))

    const { router } = renderWithProviders(undefined, { initialEntries: ['/dashboard'] })

    await waitFor(() => expect(router.state.location.pathname).toBe('/change-password'))
    expect(await screen.findByRole('heading', { name: 'Change Your Password' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Current Password')).not.toBeInTheDocument()
  })

  it('redirects a completed user away from the forced-change page', async () => {
    stubFetch((url) => url.pathname === '/users/me'
      ? jsonResponse(200, { data: employeeProfile })
      : errorResponse(404, 'NOT_FOUND', 'unhandled'))

    const { router } = renderWithProviders(undefined, { initialEntries: ['/change-password'] })
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  })

  it('redirects an already-authenticated forced-change user from login to change-password', async () => {
    stubFetch((url) => url.pathname === '/users/me'
      ? jsonResponse(200, { data: forcedProfile })
      : errorResponse(404, 'NOT_FOUND', 'unhandled'))

    const { router } = renderWithProviders(undefined, { initialEntries: ['/login'] })
    await waitFor(() => expect(router.state.location.pathname).toBe('/change-password'))
  })
})

describe('forced password change', () => {
  it('shows mismatch validation and redirects after a successful API response', async () => {
    let completed = false
    const fetchSpy = stubFetch((url, init) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: completed ? employeeProfile : forcedProfile })
      if (url.pathname === '/auth/complete-password-change' && init?.method === 'POST') {
        completed = true
        return jsonResponse(200, { data: { success: true } })
      }
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })
    const { router } = renderWithProviders(undefined, { initialEntries: ['/change-password'] })
    fireEvent.change(await screen.findByLabelText('New Password'), { target: { value: 'new-password-123' } })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'does-not-match' } })
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }))
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(fetchSpy.mock.calls.some(([url]) => (url as URL).pathname === '/auth/complete-password-change')).toBe(false)

    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'new-password-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  })

  it('shows a backend error without leaving the page', async () => {
    stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: forcedProfile })
      if (url.pathname === '/auth/complete-password-change') return errorResponse(400, 'PASSWORD_UNCHANGED', 'Choose a different password.')
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })
    renderWithProviders(undefined, { initialEntries: ['/change-password'] })
    fireEvent.change(await screen.findByLabelText('New Password'), { target: { value: 'new-password-123' } })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'new-password-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }))
    expect(await screen.findByText('Choose a different password.')).toBeInTheDocument()
  })
})

describe('self-service password change', () => {
  it('requires all three fields and shows success after submitting the expected payload', async () => {
    const fetchSpy = stubFetch((url) => {
      if (url.pathname === '/users/me') return jsonResponse(200, { data: adminProfile })
      if (url.pathname === '/users/me/password') return jsonResponse(200, { data: { success: true } })
      return errorResponse(404, 'NOT_FOUND', 'unhandled')
    })
    renderWithProviders(undefined, { initialEntries: ['/settings/change-password'] })
    expect(await screen.findByLabelText('Current Password')).toBeRequired()
    expect(screen.getByLabelText('New Password')).toBeRequired()
    expect(screen.getByLabelText('Confirm New Password')).toBeRequired()
    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'old-password-123' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'new-password-123' } })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'new-password-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }))
    expect(await screen.findByText('Password changed successfully.')).toBeInTheDocument()
    const call = fetchSpy.mock.calls.find(([url]) => (url as URL).pathname === '/users/me/password')
    expect(JSON.parse((call?.[1] as RequestInit).body as string)).toEqual({
      currentPassword: 'old-password-123', newPassword: 'new-password-123', confirmPassword: 'new-password-123',
    })
  })
})

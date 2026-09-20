import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary'
import { renderWithProviders } from '@/test/render-with-providers'
import { stubAuthenticatedSession, stubUnauthenticatedSession } from '@/test/mock-fetch'
import { employeeProfile } from '@/test/fixtures/session'

describe('application routing', () => {
  it('renders the actual application and lands an unauthenticated visitor on login', async () => {
    stubUnauthenticatedSession()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('redirects the root route to the dashboard, which redirects to login when unauthenticated', async () => {
    stubUnauthenticatedSession()
    renderWithProviders()
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#main-content'
    )
  })

  it('redirects the root route straight to the dashboard when already authenticated', async () => {
    stubAuthenticatedSession(employeeProfile)
    renderWithProviders()
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('resolves unknown routes to the controlled 404 page', async () => {
    stubUnauthenticatedSession()
    const { router } = renderWithProviders(undefined, { initialEntries: ['/does-not-exist'] })
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Return home' }))
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    router.dispose()
  })

  it('contains rendering failures without exposing technical messages', () => {
    function BrokenPage(): never {
      throw new Error('private technical detail')
    }
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { router } = renderWithProviders(undefined, {
      routes: [
        {
          path: '/',
          element: <BrokenPage />,
          errorElement: <RouteErrorBoundary />,
        },
      ],
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.queryByText('private technical detail')).not.toBeInTheDocument()
    router.dispose()
    consoleError.mockRestore()
  })
})

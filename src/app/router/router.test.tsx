import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary'
import { renderWithProviders } from '@/test/render-with-providers'

describe('application routing', () => {
  it('renders the actual application', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('redirects the root route to login', () => {
    renderWithProviders()
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#main-content'
    )
  })

  it('resolves unknown routes to the controlled 404 page', async () => {
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

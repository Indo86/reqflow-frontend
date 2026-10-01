import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { jsonResponse, stubFetch } from '@/test/mock-fetch'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { AppShell } from './app-shell'

const user = { name: 'Eddie Employee', initials: 'EE', role: 'Employee', department: 'Engineering' }

describe('AppShell', () => {
  it('renders real authenticated identity alongside the self-contained NotificationBell', async () => {
    stubFetch(() => jsonResponse(200, { data: { count: 3 } }))

    renderWithProviders(
      <AppShell user={user} navItems={productionNavigationByRole.Employee} activeKey="dashboard">
        <div>Page content</div>
      </AppShell>
    )

    expect(screen.getByText('Eddie Employee')).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(await screen.findByText('3')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Notifications/ })).toHaveAttribute('href', '/notifications')
  })

  it('opens and closes mobile navigation without changing role-based links', async () => {
    stubFetch(() => jsonResponse(200, { data: { count: 0 } }))
    renderWithProviders(
      <AppShell user={user} navItems={productionNavigationByRole.Employee} activeKey="dashboard">
        <div>Page content</div>
      </AppShell>
    )

    const trigger = screen.getByRole('button', { name: 'Open navigation' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Primary navigation' }).closest('aside')).toHaveClass('is-open')
    expect(screen.getByRole('link', { name: 'My Requests' })).toHaveAttribute('href', '/requests')

    fireEvent.click(screen.getByRole('link', { name: 'My Requests' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('dismisses mobile navigation with Escape or the backdrop', () => {
    stubFetch(() => jsonResponse(200, { data: { count: 0 } }))
    renderWithProviders(
      <AppShell user={user} navItems={productionNavigationByRole.Employee} activeKey="dashboard">
        <div>Page content</div>
      </AppShell>
    )

    const trigger = screen.getByRole('button', { name: 'Open navigation' })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    fireEvent.click(screen.getAllByRole('button', { name: 'Close navigation' })[0])
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

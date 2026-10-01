import { screen } from '@testing-library/react'
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
})

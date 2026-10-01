import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { NotificationBell } from './notification-bell'

const notificationsNavItem = productionNavigationByRole.Employee.find((item) => item.key === 'notifications')!

function renderBell() {
  return renderWithProviders(<NotificationBell item={notificationsNavItem} active={false} />)
}

// Component-level tests for the self-contained bell — this is deliberately
// where unread-count behavior is verified, rather than adding
// /notifications/unread-count stubs to unrelated Dashboard/Requests/
// Approvals/Reports page tests (see F5 "Avoid test coupling").
describe('NotificationBell', () => {
  it('renders a numeric badge when the real unread count is greater than zero', async () => {
    stubFetch((url) =>
      url.pathname === '/notifications/unread-count'
        ? jsonResponse(200, { data: { count: 5 } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )
    renderBell()
    expect(await screen.findByText('5')).toBeInTheDocument()
  })

  it('caps the badge at 99+ for large counts', async () => {
    stubFetch(() => jsonResponse(200, { data: { count: 142 } }))
    renderBell()
    expect(await screen.findByText('99+')).toBeInTheDocument()
  })

  it('shows no numeric badge when the real unread count is zero', async () => {
    stubFetch(() => jsonResponse(200, { data: { count: 0 } }))
    renderBell()
    expect(await screen.findByRole('link', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('degrades to no badge, without crashing or surfacing an error, when the unread-count query fails', async () => {
    stubFetch(() => errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.'))
    renderBell()

    const link = await screen.findByRole('link', { name: 'Notifications' })
    expect(link).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('clicking the bell navigates to /notifications', async () => {
    stubFetch(() => jsonResponse(200, { data: { count: 2 } }))
    const { router } = renderWithProviders(undefined, {
      routes: [
        { path: '/', element: <NotificationBell item={notificationsNavItem} active={false} /> },
        { path: '/notifications', element: <div>Notifications page marker</div> },
      ],
    })

    const link = await screen.findByRole('link', { name: /Notifications/ })
    fireEvent.click(link)

    expect(await screen.findByText('Notifications page marker')).toBeInTheDocument()
    router.dispose()
  })
})

import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { inboxItemForManager, managerProfile } from '@/test/fixtures/approvals'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { mapUserProfileResponse } from '@/features/auth/types/session'
import { userProfileResponseSchema } from '@/features/auth/schemas/session.schema'
import { ApprovalInboxPage } from './approval-inbox-page'

const shellUser = toAppShellUser(mapUserProfileResponse(userProfileResponseSchema.parse(managerProfile)))
const navItems = productionNavigationByRole.Manager

function renderInbox() {
  return renderWithProviders(<ApprovalInboxPage user={shellUser} navItems={navItems} />)
}

describe('ApprovalInboxPage', () => {
  it('shows a loading state while the inbox is fetching', () => {
    stubFetch(() => new Promise(() => {}))
    renderInbox()
    expect(screen.getByRole('status', { name: 'Loading approvals…' })).toBeInTheDocument()
  })

  it('renders only the backend-returned assigned approvals — never all organization requests', async () => {
    stubFetch((url) =>
      url.pathname === '/approvals/inbox'
        ? jsonResponse(200, { data: [inboxItemForManager], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )
    renderInbox()

    expect(await screen.findByText('REQ-2026-000001')).toBeInTheDocument()
    expect(screen.getByText('New laptops')).toBeInTheDocument()
    expect(screen.getByText('Eddie Employee')).toBeInTheDocument()
    // Real Pending count from meta.total, not a client-computed number.
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows a useful empty state rather than treating an empty inbox as an error', async () => {
    stubFetch(() => jsonResponse(200, { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }))
    renderInbox()

    expect(await screen.findByText('No approvals require your attention')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a controlled error state on backend failure', async () => {
    stubFetch(() => errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.'))
    renderInbox()

    expect(await screen.findByText("Couldn't load approvals")).toBeInTheDocument()
  })
})

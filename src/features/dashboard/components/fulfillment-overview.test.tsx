import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { FulfillmentOverview } from './fulfillment-overview'

const counts = {
  awaitingOwner: 2,
  notStarted: 4,
  inProgress: 3,
  completed: 5,
  cancelled: 1,
  approvedBeforeTracking: 15,
  assignedToCurrentUser: 0,
}

describe('FulfillmentOverview', () => {
  it('keeps open, fulfilled and pre-tracking counts apart', () => {
    render(
      <MemoryRouter>
        <FulfillmentOverview counts={counts} />
      </MemoryRouter>,
    )
    const summary = screen.getByLabelText('Fulfillment summary')
    expect(summary).toHaveTextContent('Awaiting fulfillment')
    expect(summary).toHaveTextContent('7')
    expect(summary).toHaveTextContent('2 still need an owner')
    expect(summary).toHaveTextContent('Recorded as fulfilled')
    expect(summary).toHaveTextContent('Approved before tracking')
    expect(summary).toHaveTextContent('15')
  })

  it('shows the personal task count when the viewer has assigned work', () => {
    render(
      <MemoryRouter>
        <FulfillmentOverview counts={{ ...counts, assignedToCurrentUser: 2 }} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'My tasks (2)' })).toHaveAttribute('href', '/fulfillment')
  })
})

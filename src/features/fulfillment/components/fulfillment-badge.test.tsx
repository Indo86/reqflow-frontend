import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FulfillmentBadge, type FulfillmentBadgeSummary } from './fulfillment-badge'

const worker = { id: 'u1', name: 'Rina Finance' }

function renderBadge(summary: FulfillmentBadgeSummary | undefined) {
  return render(<FulfillmentBadge summary={summary} />)
}

describe('FulfillmentBadge', () => {
  it('renders nothing when the request has no fulfillment story', () => {
    const { container: a } = renderBadge(undefined)
    const { container: b } = renderBadge({ applicability: 'NOT_REQUIRED', status: null, assignee: null })
    const { container: c } = renderBadge({ applicability: 'NOT_APPROVED', status: null, assignee: null })
    expect(a).toBeEmptyDOMElement()
    expect(b).toBeEmptyDOMElement()
    expect(c).toBeEmptyDOMElement()
  })

  it('never presents an approved-but-unfinished request as fulfilled', () => {
    renderBadge({ applicability: 'TRACKED', status: 'NOT_STARTED', assignee: worker })
    expect(screen.getByText('Awaiting fulfillment')).toBeInTheDocument()
    expect(screen.queryByText('Fulfilled')).not.toBeInTheDocument()
  })

  it.each([
    [{ applicability: 'TRACKED', status: 'NOT_STARTED', assignee: null }, 'Needs an owner'],
    [{ applicability: 'TRACKED', status: 'IN_PROGRESS', assignee: worker }, 'In fulfillment'],
    [{ applicability: 'TRACKED', status: 'COMPLETED', assignee: worker }, 'Fulfilled'],
    [{ applicability: 'TRACKED', status: 'CANCELLED', assignee: null }, 'Fulfillment cancelled'],
    [{ applicability: 'NOT_TRACKED', status: null, assignee: null }, 'Not tracked'],
  ] as const)('labels %j as %s', (summary, label) => {
    renderBadge(summary as FulfillmentBadgeSummary)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})

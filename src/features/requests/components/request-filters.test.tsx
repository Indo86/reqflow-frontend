import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { RequestFilters } from './request-filters'

function renderFilters(initialEntry: string) {
  return renderWithProviders(<RequestFilters searchPlaceholder="Search requests..." />, {
    initialEntries: [initialEntry],
  })
}

describe('RequestFilters', () => {
  it('reflects the initial ?q= from the URL', () => {
    renderFilters('/requests?q=laptop')
    expect(screen.getByPlaceholderText('Search requests...')).toHaveValue('laptop')
  })

  it('debounces typed search into the URL rather than firing per keystroke', async () => {
    const { router } = renderFilters('/requests?page=3')

    fireEvent.change(screen.getByPlaceholderText('Search requests...'), { target: { value: 'chair' } })
    // Not committed yet — still mid-debounce.
    expect(router.state.location.search).not.toContain('q=chair')

    await waitFor(() => expect(router.state.location.search).toContain('q=chair'), { timeout: 1000 })
    // Any filter change resets pagination back to page 1.
    expect(router.state.location.search).not.toContain('page=3')
  })

  it('resets the local draft when the URL changes from outside the component (e.g. browser back)', async () => {
    const { router } = renderFilters('/requests?q=laptop')
    expect(screen.getByPlaceholderText('Search requests...')).toHaveValue('laptop')

    await router.navigate('/requests?q=chair')
    await waitFor(() => expect(screen.getByPlaceholderText('Search requests...')).toHaveValue('chair'))

    await router.navigate('/requests')
    await waitFor(() => expect(screen.getByPlaceholderText('Search requests...')).toHaveValue(''))
  })
})

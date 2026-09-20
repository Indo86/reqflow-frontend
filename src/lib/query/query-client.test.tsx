import { useQueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/api-error'
import { renderWithProviders } from '@/test/render-with-providers'
import { createQueryClient } from './query-client'
describe('query infrastructure', () => {
  it('does not retry HTTP client errors', async () => {
    const client = createQueryClient()
    const queryFn = vi.fn().mockRejectedValue(new ApiError('Invalid input', { status: 400 }))
    await expect(
      client.fetchQuery({ queryKey: ['foundation-test'], queryFn })
    ).rejects.toBeInstanceOf(ApiError)
    expect(queryFn).toHaveBeenCalledTimes(1)
    client.clear()
  })
  it('limits transient retries to two', async () => {
    const client = createQueryClient()
    const queryFn = vi.fn().mockRejectedValue(new ApiError('Unavailable', { status: 503 }))
    await expect(
      client.fetchQuery({ queryKey: ['foundation-test'], queryFn, retryDelay: 0 })
    ).rejects.toBeInstanceOf(ApiError)
    expect(queryFn).toHaveBeenCalledTimes(3)
    client.clear()
  })
  it('does not retry mutations implicitly', async () => {
    const client = createQueryClient()
    const mutationFn = vi.fn().mockRejectedValue(new ApiError('Unavailable', { status: 503 }))
    const mutation = client.getMutationCache().build(client, { mutationFn })
    await expect(mutation.execute(undefined)).rejects.toBeInstanceOf(ApiError)
    expect(mutationFn).toHaveBeenCalledTimes(1)
    client.clear()
  })
  it('uses isolated caches for provider renders', () => {
    function CacheProbe() {
      const client = useQueryClient()
      return <p>{client.getQueryData<string>(['foundation-test']) ?? 'empty cache'}</p>
    }
    const first = renderWithProviders(<CacheProbe />)
    first.client.setQueryData(['foundation-test'], 'private cached value')
    first.unmount()
    first.router.dispose()
    const second = renderWithProviders(<CacheProbe />)
    expect(second.client).not.toBe(first.client)
    expect(screen.getByText('empty cache')).toBeInTheDocument()
    expect(second.client.getQueryData(['foundation-test'])).toBeUndefined()
    first.client.clear()
    second.client.clear()
    second.router.dispose()
  })
})

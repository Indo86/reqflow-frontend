import { QueryClient } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { routes as appRoutes } from '@/app/router/routes'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
}
interface ProviderRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  routes?: RouteObject[]
}
export function renderWithProviders(ui?: ReactElement, options: ProviderRenderOptions = {}) {
  const { initialEntries = ['/'], routes, ...renderOptions } = options
  const client = createTestQueryClient()
  const router = createMemoryRouter(routes ?? (ui ? [{ path: '*', element: ui }] : appRoutes), {
    initialEntries,
  })
  return {
    client,
    router,
    ...render(
      <AppProviders client={client}>
        <RouterProvider router={router} />
      </AppProviders>,
      renderOptions
    ),
  }
}

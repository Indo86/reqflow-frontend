import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { queryClient } from '@/lib/query/query-client'
interface AppProvidersProps {
  children: ReactNode
  client?: QueryClient
}
// The data router is composed separately through RouterProvider.
export function AppProviders({ children, client = queryClient }: AppProvidersProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

import { apiClient } from '@/lib/api'
import { recentActivitySchema } from '../schemas/dashboard.schema'
import { mapRecentActivity, type RecentActivityEntry } from '../types/dashboard'
import type { RecentActivityFilters } from './dashboard-query-keys'

// Mengambil data dari /dashboard/recent-activity?limit=.
export async function getRecentActivity(filters: RecentActivityFilters): Promise<RecentActivityEntry[]> {
  const params = new URLSearchParams()
  params.set('limit', String(filters.limit))

  const response = await apiClient(`/dashboard/recent-activity?${params.toString()}`)
  return mapRecentActivity(recentActivitySchema.parse(response))
}

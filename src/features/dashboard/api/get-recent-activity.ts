import { apiClient } from '@/lib/api'
import { recentActivitySchema } from '../schemas/dashboard.schema'
import { mapRecentActivity, type RecentActivityEntry } from '../types/dashboard'
import type { RecentActivityFilters } from './dashboard-query-keys'

// GET /dashboard/recent-activity?limit= — a bare array under `data`, newest
// first (createdAt desc, id desc tiebreak). Sourced from AuditLog directly,
// not Request/Approval/Comment tables. No offset/cursor pagination exists —
// `limit` (default 20, max 100) is a hard cap via Prisma `take`.
export async function getRecentActivity(filters: RecentActivityFilters): Promise<RecentActivityEntry[]> {
  const params = new URLSearchParams()
  params.set('limit', String(filters.limit))

  const response = await apiClient(`/dashboard/recent-activity?${params.toString()}`)
  return mapRecentActivity(recentActivitySchema.parse(response))
}

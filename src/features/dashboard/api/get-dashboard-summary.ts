import { apiClient } from '@/lib/api'
import { dashboardSummarySchema } from '../schemas/dashboard.schema'
import { mapDashboardSummary, type DashboardSummary } from '../types/dashboard'

// GET /dashboard/summary — a live snapshot, deliberately not date-filterable
// (dashboard.service.ts). Visibility is entirely server-side: ADMIN gets
// organization-wide counts, every other role gets only requests they
// personally created — the same rule GET /requests has used since F2/M3.
// No params to send; no recipientId/organizationId exists to leak scope.
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient('/dashboard/summary')
  return mapDashboardSummary(dashboardSummarySchema.parse(response))
}

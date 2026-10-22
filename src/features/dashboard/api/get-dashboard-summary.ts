import { apiClient } from '@/lib/api'
import { dashboardSummarySchema } from '../schemas/dashboard.schema'
import { mapDashboardSummary, type DashboardSummary } from '../types/dashboard'

// Mengambil data dari /dashboard/summary.
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient('/dashboard/summary')
  return mapDashboardSummary(dashboardSummarySchema.parse(response))
}

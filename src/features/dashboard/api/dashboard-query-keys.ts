export interface RequestsOverTimeFilters {
  range: '1m' | '2m' | '6m' | '1y' | 'all'
}

export interface RecentActivityFilters {
  limit: number
}

// Menyusun kunci cache untuk kueri ini.
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  requestsOverTime: (filters: RequestsOverTimeFilters) => [...dashboardKeys.all, 'requests-over-time', filters] as const,
  recentActivity: (filters: RecentActivityFilters) => [...dashboardKeys.all, 'recent-activity', filters] as const,
}

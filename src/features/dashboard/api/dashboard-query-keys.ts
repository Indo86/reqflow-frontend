export interface RequestsOverTimeFilters {
  range: '1m' | '2m' | '6m' | '1y' | 'all'
}

export interface RecentActivityFilters {
  limit: number
}

// Feature-owned query keys — no global registry (see F3/F5 precedent).
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  requestsOverTime: (filters: RequestsOverTimeFilters) => [...dashboardKeys.all, 'requests-over-time', filters] as const,
  recentActivity: (filters: RecentActivityFilters) => [...dashboardKeys.all, 'recent-activity', filters] as const,
}

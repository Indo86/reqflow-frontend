import type { z } from 'zod'
import type { RequestStatus, RequestType } from '@/features/requests/types/request'
import type {
  bucketSchema,
  dashboardSummarySchema,
  recentActivitySchema,
  requestsOverTimeSchema,
} from '../schemas/dashboard.schema'

export type Bucket = z.infer<typeof bucketSchema>
export type DashboardRange = '1m' | '2m' | '6m' | '1y' | 'all'

export interface DashboardSummary {
  requests: {
    total: number
    byStatus: Record<RequestStatus, number>
    byType: Record<RequestType, number>
  }
  approvals: { pendingForCurrentUser: number }
  notifications: { unreadForCurrentUser: number }
  amounts: { count: number; total: string | null }
}

export function mapDashboardSummary(dto: z.infer<typeof dashboardSummarySchema>): DashboardSummary {
  return dto.data
}

export interface TimeSeriesPoint {
  periodStart: string
  count: number
}

export interface RequestsOverTimeResult {
  bucket: Bucket
  from: string
  to: string
  range?: DashboardRange
  points: TimeSeriesPoint[]
}

export function mapRequestsOverTime(dto: z.infer<typeof requestsOverTimeSchema>): RequestsOverTimeResult {
  return dto.data
}

export interface RecentActivityEntry {
  id: string
  action: string
  entityType: string
  entityId: string | null
  requestId: string | null
  actorId: string | null
  createdAt: string
  metadata: unknown
}

export function mapRecentActivity(dto: z.infer<typeof recentActivitySchema>): RecentActivityEntry[] {
  return dto.data
}

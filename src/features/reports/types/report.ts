import type { z } from 'zod'
import type { RequestStatus, RequestType } from '@/features/requests/types/request'
import type { requestReportSchema, workflowDurationSchema } from '../schemas/report.schema'

export interface RequestReportFilters {
  status?: RequestStatus
  type?: RequestType
  departmentId?: string
  createdById?: string
  from?: string
  to?: string
}

export interface DepartmentBreakdownRow {
  departmentId: string | null
  departmentName: string | null
  count: number
}

export interface RequestReport {
  filters: {
    status: RequestStatus | null
    type: RequestType | null
    departmentId: string | null
    createdById: string | null
    from: string | null
    to: string | null
  }
  totals: { requests: number; withAmount: number; amountTotal: string | null }
  // Zero-filled by the backend — every enum key is always present, unlike
  // workflow-duration's byStatus below, which is genuinely sparse.
  byStatus: Record<RequestStatus, number>
  byType: Record<RequestType, number>
  byDepartment: DepartmentBreakdownRow[]
}

export function mapRequestReport(dto: z.infer<typeof requestReportSchema>): RequestReport {
  return dto.data
}

export interface DurationStatBucket {
  count: number
  averageSeconds: number | null
}

export type WorkflowDurationStatus = 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface WorkflowDurationReport {
  unit: 'seconds'
  overall: DurationStatBucket
  byStatus: Partial<Record<WorkflowDurationStatus, DurationStatBucket>>
  excludedTerminalRequestsWithoutAuditEvidence: number
}

export function mapWorkflowDurationReport(dto: z.infer<typeof workflowDurationSchema>): WorkflowDurationReport {
  return {
    unit: dto.data.unit,
    overall: dto.data.overall,
    byStatus: dto.data.byStatus,
    excludedTerminalRequestsWithoutAuditEvidence: dto.data.excludedTerminalRequestsWithoutAuditEvidence,
  }
}

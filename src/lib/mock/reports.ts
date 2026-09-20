import type { BreakdownRow } from '@/types/domain'
import { departmentBreakdown, statusBreakdown, typeBreakdown } from './dashboards'

export interface ReportStat {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'flat'
  tone: 'accent' | 'amber' | 'green' | 'orange' | 'red'
}

export const reportStats: ReportStat[] = [
  { label: 'Total Requests', value: '428', delta: 'vs 391 last period', trend: 'up', tone: 'accent' },
  { label: 'Total Amount', value: 'Rp 2,84 M', delta: 'vs Rp 2,51 M last period', trend: 'up', tone: 'green' },
  { label: 'Approval Rate', value: '89.6%', delta: '+1.8 pts vs last period', trend: 'up', tone: 'green' },
  { label: 'Avg. Workflow Duration', value: '3.4 days', delta: '-0.6 days vs last period', trend: 'down', tone: 'amber' },
]

export const reportRequestsOverTime = [
  { label: 'Apr', value: 66 },
  { label: 'May', value: 71 },
  { label: 'Jun', value: 78 },
  { label: 'Jul', value: 75 },
  { label: 'Aug', value: 87 },
  { label: 'Sep', value: 91 },
]

export const reportStatusBreakdown: BreakdownRow[] = statusBreakdown
export const reportTypeBreakdown: BreakdownRow[] = typeBreakdown
export const reportDepartmentBreakdown: BreakdownRow[] = departmentBreakdown

export const workflowDurationByStep: BreakdownRow[] = [
  { label: 'Manager Review', value: 0, percent: 35, color: 'var(--rf-accent)' },
  { label: 'Finance Review', value: 0, percent: 41, color: '#6D8BE8' },
  { label: 'Director Review', value: 0, percent: 24, color: '#9AB1EF' },
]

export const workflowDurationLabels: Record<string, string> = {
  'Manager Review': '1.2 days',
  'Finance Review': '1.4 days',
  'Director Review': '0.8 days',
}

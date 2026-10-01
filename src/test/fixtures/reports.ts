const zeroByStatus = {
  DRAFT: 0,
  SUBMITTED: 0,
  IN_REVIEW: 0,
  REVISION_REQUIRED: 0,
  APPROVED: 0,
  REJECTED: 0,
  CANCELLED: 0,
}

const zeroByType = {
  PURCHASE: 0,
  EQUIPMENT: 0,
  REIMBURSEMENT: 0,
  LEAVE: 0,
  GENERAL: 0,
}

// Mirrors report.service.ts's RequestReportResult exactly — verified by
// direct backend inspection. See F6 "backend contract".
export const requestReportFixture = {
  filters: { status: null, type: null, departmentId: null, createdById: null, from: null, to: null },
  totals: { requests: 5, withAmount: 4, amountTotal: '92500000.75' },
  byStatus: { ...zeroByStatus, APPROVED: 3, REJECTED: 1, SUBMITTED: 1 },
  byType: { ...zeroByType, PURCHASE: 3, EQUIPMENT: 2 },
  byDepartment: [
    { departmentId: 'dept-eng', departmentName: 'Engineering', count: 3 },
    { departmentId: null, departmentName: null, count: 2 },
  ],
}

export const emptyRequestReportFixture = {
  filters: { status: null, type: null, departmentId: null, createdById: null, from: null, to: null },
  totals: { requests: 0, withAmount: 0, amountTotal: null },
  byStatus: zeroByStatus,
  byType: zeroByType,
  byDepartment: [],
}

export const workflowDurationFixture = {
  status: 'OK' as const,
  unit: 'seconds' as const,
  overall: { count: 4, averageSeconds: 5400 },
  byStatus: {
    APPROVED: { count: 3, averageSeconds: 3600 },
    REJECTED: { count: 1, averageSeconds: 10800 },
  },
  excludedTerminalRequestsWithoutAuditEvidence: 1,
}

export const emptyWorkflowDurationFixture = {
  status: 'OK' as const,
  unit: 'seconds' as const,
  overall: { count: 0, averageSeconds: null },
  byStatus: {},
  excludedTerminalRequestsWithoutAuditEvidence: 0,
}

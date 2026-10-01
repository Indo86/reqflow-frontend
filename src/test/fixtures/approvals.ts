const organization = { id: 'org-1', name: 'Acme Indonesia', slug: 'acme-indonesia' }

export const managerProfile = {
  id: 'user-manager',
  name: 'Mona Manager',
  email: 'mona@example.com',
  role: 'MANAGER',
  mustChangePassword: false,
  organization,
  department: { id: 'dept-eng', name: 'Engineering' },
}

export const financeProfile = {
  id: 'user-finance',
  name: 'Fiona Finance',
  email: 'fiona@example.com',
  role: 'FINANCE',
  mustChangePassword: false,
  organization,
  department: null,
}

export const adminProfile = {
  id: 'user-admin',
  name: 'Ava Admin',
  email: 'ava@example.com',
  role: 'ADMIN',
  mustChangePassword: false,
  organization,
  department: null,
}

export const employeeProfile = {
  id: 'user-employee',
  name: 'Eddie Employee',
  email: 'eddie@example.com',
  role: 'EMPLOYEE',
  mustChangePassword: false,
  organization,
  department: { id: 'dept-eng', name: 'Engineering' },
}

const baseRequest = {
  id: 'req-1',
  requestNumber: 'REQ-2026-000001',
  type: 'PURCHASE',
  title: 'New laptops',
  description: 'Two new laptops for the team.',
  amount: '15000000',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  createdBy: { id: 'user-employee', name: 'Eddie Employee' },
  department: { id: 'dept-eng', name: 'Engineering' },
  commentsCount: 0,
  attachmentsCount: 0,
}

// A request IN_REVIEW with a single active MANAGER_ONLY cycle, currently
// PENDING on Mona Manager — the shape GET /requests/:id actually returns
// (request.service.ts requestDetailSelect), not a fabrication.
export const requestPendingOnManager = {
  ...baseRequest,
  status: 'IN_REVIEW',
  approvalCycles: [
    {
      cycleNumber: 1,
      policy: 'MANAGER_ONLY',
      status: 'ACTIVE',
      createdAt: '2026-09-02T00:00:00.000Z',
      completedAt: null,
      approvals: [
        {
          id: 'approval-1',
          stepOrder: 1,
          stepType: 'MANAGER',
          status: 'PENDING',
          decisionComment: null,
          approver: { id: 'user-manager', name: 'Mona Manager' },
          createdAt: '2026-09-02T00:00:00.000Z',
          decidedAt: null,
        },
      ],
    },
  ],
}

// Two-step MANAGER_FINANCE cycle: Manager already approved, Finance is now
// the PENDING (actionable) step.
export const requestPendingOnFinance = {
  ...baseRequest,
  id: 'req-2',
  requestNumber: 'REQ-2026-000002',
  status: 'IN_REVIEW',
  approvalCycles: [
    {
      cycleNumber: 1,
      policy: 'MANAGER_FINANCE',
      status: 'ACTIVE',
      createdAt: '2026-09-02T00:00:00.000Z',
      completedAt: null,
      approvals: [
        {
          id: 'approval-2a',
          stepOrder: 1,
          stepType: 'MANAGER',
          status: 'APPROVED',
          decisionComment: 'Looks good.',
          approver: { id: 'user-manager', name: 'Mona Manager' },
          createdAt: '2026-09-02T00:00:00.000Z',
          decidedAt: '2026-09-03T00:00:00.000Z',
        },
        {
          id: 'approval-2b',
          stepOrder: 2,
          stepType: 'FINANCE',
          status: 'PENDING',
          decisionComment: null,
          approver: { id: 'user-finance', name: 'Fiona Finance' },
          createdAt: '2026-09-02T00:00:00.000Z',
          decidedAt: null,
        },
      ],
    },
  ],
}

export const draftRequest = {
  ...baseRequest,
  id: 'req-draft',
  requestNumber: 'REQ-2026-000003',
  status: 'DRAFT',
  approvalCycles: [],
}

export const inboxItemForManager = {
  id: 'approval-1',
  cycleNumber: 1,
  stepOrder: 1,
  stepType: 'MANAGER',
  status: 'PENDING',
  request: {
    id: 'req-1',
    requestNumber: 'REQ-2026-000001',
    type: 'PURCHASE',
    title: 'New laptops',
    amount: '15000000',
    status: 'IN_REVIEW',
    createdBy: { id: 'user-employee', name: 'Eddie Employee' },
    department: { id: 'dept-eng', name: 'Engineering' },
  },
}

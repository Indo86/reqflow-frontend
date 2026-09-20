import type { RouteObject } from 'react-router-dom'
import { OwnerDashboardPage } from '@/features/dashboard/owner-dashboard-page'
import { ManagerDashboardPage } from '@/features/dashboard/manager-dashboard-page'
import { DirectorDashboardPage } from '@/features/dashboard/director-dashboard-page'
import { AdminDashboardPage } from '@/features/dashboard/admin-dashboard-page'
import { MyRequestsPage } from '@/features/requests/my-requests-page'
import { AdminRequestsPage } from '@/features/requests/admin-requests-page'
import { RequestDetailPage } from '@/features/requests/request-detail-page'
import { ApprovalsInboxPage } from '@/features/approvals/approvals-inbox-page'
import { ReportsPage } from '@/features/reports/reports-page'
import {
  adminViewOnlyDetail,
  currentApproverDetail,
  nonCurrentDetail,
  ownerDraftDetail,
} from '@/lib/mock/request-details'

// Design-preview-only routes: reachable at /preview/... so every role and
// relationship variant from the reference design can be inspected directly,
// without needing real authentication or role-switching.
export const previewRoutes: RouteObject[] = [
  { path: 'preview/owner/dashboard', element: <OwnerDashboardPage /> },
  { path: 'preview/owner/requests', element: <MyRequestsPage /> },
  { path: 'preview/owner/request-detail', element: <RequestDetailPage detail={ownerDraftDetail} variant="owner-draft" /> },

  { path: 'preview/manager/dashboard', element: <ManagerDashboardPage /> },
  { path: 'preview/manager/approvals', element: <ApprovalsInboxPage persona="manager" /> },

  { path: 'preview/finance/approvals', element: <ApprovalsInboxPage persona="finance" /> },

  { path: 'preview/director/dashboard', element: <DirectorDashboardPage /> },
  { path: 'preview/director/approvals', element: <ApprovalsInboxPage persona="director" /> },

  { path: 'preview/admin/dashboard', element: <AdminDashboardPage /> },
  { path: 'preview/admin/requests', element: <AdminRequestsPage /> },
  { path: 'preview/admin/reports', element: <ReportsPage /> },

  {
    path: 'preview/request-detail/current-approver',
    element: <RequestDetailPage detail={currentApproverDetail} variant="current-approver" />,
  },
  {
    path: 'preview/request-detail/non-current-approver',
    element: <RequestDetailPage detail={nonCurrentDetail} variant="non-current" />,
  },
  {
    path: 'preview/request-detail/admin-view-only',
    element: <RequestDetailPage detail={adminViewOnlyDetail} variant="admin-view-only" />,
  },
]

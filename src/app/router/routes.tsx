import { Navigate, type RouteObject } from 'react-router-dom'
import { AppLayout } from '@/app/layout/app-layout'
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary'
import { LoginPage } from '@/features/auth/login-page'
import { OwnerDashboardPage } from '@/features/dashboard/owner-dashboard-page'
import { MyRequestsPage } from '@/features/requests/my-requests-page'
import { ApprovalsInboxPage } from '@/features/approvals/approvals-inbox-page'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { ReportsPage } from '@/features/reports/reports-page'
import { RequestDetailRoute } from './request-detail-route'
import { previewRoutes } from './preview-routes'
import { NotFoundPage } from './not-found-page'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'dashboard', element: <OwnerDashboardPage /> },
      { path: 'requests', element: <MyRequestsPage /> },
      { path: 'requests/:requestId', element: <RequestDetailRoute /> },
      { path: 'approvals', element: <ApprovalsInboxPage persona="manager" /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      ...previewRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

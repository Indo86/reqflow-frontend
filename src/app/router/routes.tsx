import { Navigate, type RouteObject } from 'react-router-dom'
import { AppLayout } from '@/app/layout/app-layout'
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary'
import { LoginPage } from '@/features/auth/pages/login-page'
import { GuestOnlyRoute } from '@/features/auth/components/guest-only-route'
import { ProtectedRoute } from '@/features/auth/components/protected-route'
import { DashboardRoute } from './dashboard-route'
import { RequestsRoute } from './requests-route'
import { ApprovalsRoute } from './approvals-route'
import { NotificationsRoute } from './notifications-route'
import { ReportsRoute } from './reports-route'
import { RequestDetailRoute } from './request-detail-route'
import { RequestFormRoute } from './request-form-route'
import { ApprovalReviewRoute } from './approval-review-route'
import { UsersRoute } from './users-route'
import { UserFormRoute } from './user-form-route'
import { UserDetailRoute } from './user-detail-route'
import { previewRoutes } from './preview-routes'
import { NotFoundPage } from './not-found-page'
import { ChangePasswordPage } from '@/features/auth/pages/change-password-page'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'login',
        element: (
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'change-password', element: <ChangePasswordPage /> },
          { path: 'settings/change-password', element: <ChangePasswordPage /> },
          { path: 'dashboard', element: <DashboardRoute /> },
          { path: 'requests', element: <RequestsRoute /> },
          { path: 'requests/new', element: <RequestFormRoute /> },
          { path: 'requests/:requestId', element: <RequestDetailRoute /> },
          { path: 'requests/:requestId/edit', element: <RequestFormRoute /> },
          { path: 'approvals', element: <ApprovalsRoute /> },
          { path: 'approvals/:approvalId', element: <ApprovalReviewRoute /> },
          { path: 'notifications', element: <NotificationsRoute /> },
          { path: 'reports', element: <ReportsRoute /> },
          { path: 'users', element: <UsersRoute /> },
          { path: 'users/new', element: <UserFormRoute /> },
          { path: 'users/:userId', element: <UserDetailRoute /> },
        ],
      },
      // Design-preview routes are intentionally outside the auth boundary —
      // they render fixed mock personas for design QA and never touch real
      // session state. See src/app/router/preview-routes.tsx.
      ...previewRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

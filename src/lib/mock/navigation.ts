import {
  BarChart3,
  Bell,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Users,
  KeyRound,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/types/domain'

export interface NavItemConfig {
  key: string
  label: string
  href: string
  icon: LucideIcon
}

// Used only by the /preview/* design-inspection routes, which render a fixed
// mock persona regardless of who (if anyone) is actually signed in. Kept
// deliberately separate from productionNavigationByRole below so preview
// persona-switching can never influence, or be influenced by, real session
// state — see F1 "Development preview routes".
export const previewNavigationByRole: Record<Role, NavItemConfig[]> = {
  Employee: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'My Requests', href: '/requests', icon: FileText },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Manager: [
    { key: 'dashboard', label: 'Dashboard', href: '/preview/manager/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'My Requests', href: '/requests', icon: FileText },
    { key: 'approvals', label: 'Approvals', href: '/preview/manager/approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Finance: [
    { key: 'dashboard', label: 'Dashboard', href: '/preview/manager/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'My Requests', href: '/requests', icon: FileText },
    { key: 'approvals', label: 'Approvals', href: '/preview/finance/approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Director: [
    { key: 'dashboard', label: 'Dashboard', href: '/preview/director/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'My Requests', href: '/requests', icon: FileText },
    { key: 'approvals', label: 'Approvals', href: '/preview/director/approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Admin: [
    { key: 'dashboard', label: 'Dashboard', href: '/preview/admin/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'Requests', href: '/preview/admin/requests', icon: FileText },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
    { key: 'reports', label: 'Reports', href: '/reports', icon: BarChart3 },
  ],
}

// Used by real authenticated routes once F1 session/role data is available.
// hrefs point at the plain generic routes, which are role-aware (see
// src/app/router/*-route.tsx) and resolve to the same static F0.5 page
// components previewNavigationByRole above points at directly. Mirrors the
// authority model from the F0.5 design: Approvals only for Manager/Finance/
// Director; Reports/org-wide Requests only for Admin. This is top-level
// navigation UX only — the backend remains authoritative for every actual
// request.
export const productionNavigationByRole: Record<Role, NavItemConfig[]> = {
  Employee: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'My Requests', href: '/requests', icon: FileText },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Manager: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'My Requests', href: '/requests', icon: FileText },
    { key: 'approvals', label: 'Approvals', href: '/approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Finance: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'My Requests', href: '/requests', icon: FileText },
    { key: 'approvals', label: 'Approvals', href: '/approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Director: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'My Requests', href: '/requests', icon: FileText },
    { key: 'approvals', label: 'Approvals', href: '/approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Admin: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'Requests', href: '/requests', icon: FileText },
    // F6.5: Admin-only. Not added to previewNavigationByRole above — there
    // is no F0.5 mock Users screen for /preview/* to point at.
    { key: 'users', label: 'Users', href: '/users', icon: Users },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
    { key: 'reports', label: 'Reports', href: '/reports', icon: BarChart3 },
  ],
}

for (const items of Object.values(productionNavigationByRole)) {
  items.push({ key: 'password', label: 'Change Password', href: '/settings/change-password', icon: KeyRound })
}

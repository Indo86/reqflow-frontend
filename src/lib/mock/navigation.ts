import {
  BarChart3,
  Bell,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/types/domain'

export interface NavItemConfig {
  key: string
  label: string
  href: string
  icon: LucideIcon
}

// There is no real session yet, so each role's nav points at the static
// preview route that demonstrates that role — except Employee, which owns
// the plain (non-preview) routes as the default signed-out-preview persona.
export const navigationByRole: Record<Role, NavItemConfig[]> = {
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

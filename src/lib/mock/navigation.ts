import {
  BarChart3,
  Bell,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  ListChecks,
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

// Menggunakan data API di halaman produksi tanpa mengubah halaman preview.
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

// Hak akses tetap divalidasi oleh backend.
export const productionNavigationByRole: Record<Role, NavItemConfig[]> = {
  Employee: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'My Requests', href: '/requests', icon: FileText },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Manager: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'Requests', href: '/requests', icon: FileText },
    { key: 'approvals', label: 'Approvals', href: '/approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Finance: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'Requests', href: '/requests', icon: FileText },
    { key: 'approvals', label: 'Approvals', href: '/approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Director: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'Requests', href: '/requests', icon: FileText },
    { key: 'approvals', label: 'Approvals', href: '/approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  ],
  Admin: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { key: 'requests', label: 'Requests', href: '/requests', icon: FileText },
    // Menggunakan data API di halaman produksi tanpa mengubah halaman preview.
    { key: 'users', label: 'Users', href: '/users', icon: Users },
    { key: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
    { key: 'reports', label: 'Reports', href: '/reports', icon: BarChart3 },
  ],
}

// Menyiapkan data notifikasi untuk pengguna.
for (const items of Object.values(productionNavigationByRole)) {
  const at = items.findIndex((item) => item.key === 'notifications')
  items.splice(at < 0 ? items.length : at, 0, { key: 'fulfillment', label: 'Fulfillment', href: '/fulfillment', icon: ListChecks })
}

for (const items of Object.values(productionNavigationByRole)) {
  items.push({ key: 'password', label: 'Change Password', href: '/settings/change-password', icon: KeyRound })
}

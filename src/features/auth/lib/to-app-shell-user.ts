import type { AppShellUser } from '@/app/layout/app-shell'
import type { SessionUser } from '../types/session'

export function toAppShellUser(user: SessionUser): AppShellUser {
  return {
    name: user.name,
    initials: user.initials,
    role: user.role,
    department: user.department?.name,
  }
}

import type { Role } from '@/types/domain'
import type { UserProfileResponse, BackendRole } from '../schemas/session.schema'

export interface SessionUser {
  id: string
  name: string
  email: string
  initials: string
  role: Role
  organization: { id: string; name: string; slug: string }
  department: { id: string; name: string } | null
}

// Backend Role enum values (auth.types.ts / prisma schema.prisma) are
// SCREAMING_CASE; the frontend's existing Role union (src/types/domain.ts,
// already shared with the F0.5 static pages) is TitleCase. This is the only
// place the two ever need to meet.
const roleLabels: Record<BackendRole, Role> = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  FINANCE: 'Finance',
  DIRECTOR: 'Director',
  ADMIN: 'Admin',
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function mapUserProfileResponse(dto: UserProfileResponse): SessionUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    initials: computeInitials(dto.name),
    role: roleLabels[dto.role],
    organization: dto.organization,
    department: dto.department,
  }
}

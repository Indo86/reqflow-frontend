import { Badge } from '@/components/shared/badge'

export function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? 'green' : 'muted'}>{isActive ? 'Active' : 'Inactive'}</Badge>
}

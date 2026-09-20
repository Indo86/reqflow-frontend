import { cn } from '@/lib/utils'

interface UserAvatarProps {
  initials: string
  size?: number
  className?: string
}

export function UserAvatar({ initials, size = 30, className }: UserAvatarProps) {
  return (
    <div
      className={cn('avatar', className)}
      style={{ width: size, height: size, fontSize: size <= 24 ? 10 : 12 }}
    >
      {initials}
    </div>
  )
}

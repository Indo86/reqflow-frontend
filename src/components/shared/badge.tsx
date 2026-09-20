import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'neutral' | 'amber' | 'green' | 'red' | 'orange' | 'muted' | 'accent'

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      <span className="dot" />
      {children}
    </span>
  )
}

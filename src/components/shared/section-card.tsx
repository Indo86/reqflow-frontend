import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title?: ReactNode
  subtitle?: ReactNode
  headerAction?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  padded?: boolean
}

export function SectionCard({
  title,
  subtitle,
  headerAction,
  children,
  className,
  bodyClassName,
  padded = true,
}: SectionCardProps) {
  return (
    <div className={cn('card', className)}>
      {title ? (
        <div className="card-header">
          <div>
            <div className="card-title">{title}</div>
            {subtitle ? <div className="card-title-sub">{subtitle}</div> : null}
          </div>
          {headerAction}
        </div>
      ) : null}
      <div className={cn(padded ? 'card-body' : undefined, bodyClassName)}>{children}</div>
    </div>
  )
}

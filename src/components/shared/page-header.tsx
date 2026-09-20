import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  showBackLink?: boolean
}

export function PageHeader({ title, subtitle, actions, showBackLink }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <>
      {showBackLink ? (
        <button type="button" className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeft className="icon" width={15} height={15} strokeWidth={2} />
          <span>Back</span>
        </button>
      ) : null}
      <div className="page-header">
        <div className="page-header-text">
          {typeof title === 'string' ? <h1 className="page-title">{title}</h1> : title}
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="page-header-actions">{actions}</div> : null}
      </div>
    </>
  )
}

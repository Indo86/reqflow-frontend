import { forwardRef, type SelectHTMLAttributes } from 'react'
import { useDepartmentsQuery } from '@/features/reports/hooks/use-departments-query'

type DepartmentSelectProps = SelectHTMLAttributes<HTMLSelectElement>

export const DepartmentSelect = forwardRef<HTMLSelectElement, DepartmentSelectProps>(
  function DepartmentSelect({ disabled, ...props }, ref) {
    const query = useDepartmentsQuery()
    const departments = query.data ?? []
    const unavailable = query.isPending || query.isError || departments.length === 0

    return (
      <select
        ref={ref}
        className="text-input"
        disabled={disabled || unavailable}
        aria-busy={query.isPending || undefined}
        {...props}
      >
        {query.isPending ? <option value="">Loading departments...</option> : null}
        {query.isError ? <option value="">Failed to load departments</option> : null}
        {query.isSuccess && departments.length === 0 ? (
          <option value="">No departments available</option>
        ) : null}
        {query.isSuccess && departments.length > 0 ? (
          <>
            <option value="">No department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </>
        ) : null}
      </select>
    )
  }
)

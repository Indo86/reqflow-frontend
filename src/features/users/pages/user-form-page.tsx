import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { ApiError } from '@/lib/api'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { useCreateUserMutation } from '../hooks/use-create-user-mutation'
import { DepartmentSelect } from '../components/department-select'
import { createUserFormSchema, type CreateUserFormValues } from '../schemas/user-form.schema'
import { roleLabels, type BackendRole } from '../types/user'

interface UserFormPageProps {
  user: AppShellUser
  navItems: NavItemConfig[]
  onLogout?: () => void
}

const roleOptions = Object.entries(roleLabels) as [BackendRole, string][]

// POST /users accepts profile fields only. The server generates and hashes a
// temporary password, then returns the plaintext value once in this response.
export function UserFormPage({ user, navItems, onLogout }: UserFormPageProps) {
  const navigate = useNavigate()
  const createMutation = useCreateUserMutation()
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { name: '', email: '', role: 'EMPLOYEE', departmentId: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    const created = await createMutation.mutateAsync({
      name: values.name,
      email: values.email,
      role: values.role,
      departmentId: values.departmentId ? values.departmentId : null,
    })
    setTemporaryPassword(created.temporaryPassword)
  })

  const submitError = createMutation.error
  const safeMessage =
    submitError instanceof ApiError
      ? submitError.message
      : submitError
        ? 'The user could not be created. Please try again.'
        : undefined

  return (
    <AppShell user={user} navItems={navItems} activeKey="users" onLogout={onLogout}>
      <PageHeader showBackLink title="New User" />
      {temporaryPassword ? (
        <SectionCard title="Temporary Password" subtitle="Copy this password and give it securely to the user. It will not be shown again.">
          <p className="cell-mono" style={{ fontSize: 20 }}>{temporaryPassword}</p>
          <button type="button" className="btn btn-secondary" onClick={() => void navigator.clipboard?.writeText(temporaryPassword)}>Copy</button>
        </SectionCard>
      ) : null}
      <SectionCard>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={onSubmit} noValidate>
          {safeMessage ? (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--rf-radius-sm)',
                background: 'var(--red-bg)',
                color: 'var(--red-text)',
                fontSize: 12.5,
              }}
            >
              {safeMessage}
            </div>
          ) : null}

          <div className="field">
            <label className="field-label" htmlFor="user-name">
              Name
            </label>
            <input
              id="user-name"
              type="text"
              className="text-input"
              aria-invalid={errors.name ? true : undefined}
              {...register('name')}
            />
            {errors.name ? <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{errors.name.message}</span> : null}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="user-email">
              Email
            </label>
            <input
              id="user-email"
              type="email"
              className="text-input"
              aria-invalid={errors.email ? true : undefined}
              {...register('email')}
            />
            {errors.email ? <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{errors.email.message}</span> : null}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="user-role">
              Role
            </label>
            <select id="user-role" className="text-input" {...register('role')}>
              {roleOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="user-department">
              Department
            </label>
            <DepartmentSelect id="user-department" {...register('departmentId')} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')} disabled={createMutation.isPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </SectionCard>
    </AppShell>
  )
}

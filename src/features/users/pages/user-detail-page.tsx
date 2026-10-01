import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { ApiError } from '@/lib/api'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { useSession } from '@/features/auth/hooks/use-session'
// Generic, not Request-specific — reused rather than duplicated (see F6.5
// "Users page").
import { ConfirmDialog } from '@/features/requests/components/confirm-dialog'
import { useUserQuery } from '../hooks/use-user-query'
import { useUpdateUserMutation } from '../hooks/use-update-user-mutation'
import { useUpdateUserRoleMutation } from '../hooks/use-update-user-role-mutation'
import { useUpdateUserDepartmentMutation } from '../hooks/use-update-user-department-mutation'
import { useUpdateUserStatusMutation } from '../hooks/use-update-user-status-mutation'
import { UserStatusBadge } from '../components/user-status-badge'
import { DepartmentSelect } from '../components/department-select'
import { useResetPasswordMutation } from '../hooks/use-reset-password-mutation'
import { roleLabels, type BackendRole } from '../types/user'

interface UserDetailPageProps {
  user: AppShellUser
  navItems: NavItemConfig[]
  onLogout?: () => void
}

const roleOptions = Object.entries(roleLabels) as [BackendRole, string][]

const profileFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
})
type ProfileFormValues = z.infer<typeof profileFormSchema>

function ErrorBanner({ error }: { error: unknown }) {
  if (!error) return null
  const message = error instanceof ApiError ? error.message : 'The request could not be completed. Please try again.'
  return (
    <div
      role="alert"
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--rf-radius-sm)',
        background: 'var(--red-bg)',
        color: 'var(--red-text)',
        fontSize: 12.5,
        marginBottom: 12,
      }}
    >
      {message}
    </div>
  )
}

// Deliberately separates profile changes (name/email) from security-
// sensitive changes (role, department, active status) into their own
// sections, each with its own save action and its own backend call — see
// F6.5 "User detail / edit". Every action still calls the backend
// directly; this page never decides on its own whether a change is safe,
// it only renders the backend's own accepted/refused outcome.
export function UserDetailPage({ user: shellUser, navItems, onLogout }: UserDetailPageProps) {
  const { userId } = useParams<{ userId: string }>()
  const session = useSession()
  const query = useUserQuery(userId)

  const updateProfile = useUpdateUserMutation(userId ?? '')
  const updateRole = useUpdateUserRoleMutation(userId ?? '')
  const updateDepartment = useUpdateUserDepartmentMutation(userId ?? '')
  const updateStatus = useUpdateUserStatusMutation(userId ?? '')
  const resetPasswordMutation = useResetPasswordMutation(userId ?? '')

  const [roleDraft, setRoleDraft] = useState<BackendRole | null>(null)
  const [departmentDraft, setDepartmentDraft] = useState<string | null | undefined>(undefined)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema) })

  if (query.isPending) {
    return (
      <AppShell user={shellUser} navItems={navItems} activeKey="users" onLogout={onLogout}>
        <PageHeader showBackLink title="Loading user…" />
      </AppShell>
    )
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404
    return (
      <AppShell user={shellUser} navItems={navItems} activeKey="users" onLogout={onLogout}>
        <PageHeader showBackLink title={notFound ? 'User not found' : 'Something went wrong'} />
        <SectionCard>
          <p className="body-text">
            {notFound
              ? "This user doesn't exist, or you don't have access to it."
              : query.error instanceof ApiError
                ? query.error.message
                : 'Please try again.'}
          </p>
          {!notFound ? (
            <button type="button" className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => void query.refetch()}>
              Retry
            </button>
          ) : null}
        </SectionCard>
      </AppShell>
    )
  }

  const target = query.data
  const isSelf = session.status === 'authenticated' && session.user.id === target.id
  const effectiveRole = roleDraft ?? target.role
  const effectiveDepartmentId = (departmentDraft !== undefined ? departmentDraft : (target.department?.id ?? null)) ?? ''

  return (
    <AppShell user={shellUser} navItems={navItems} activeKey="users" onLogout={onLogout}>
      <PageHeader
        showBackLink
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title" style={{ fontSize: 20 }}>
              {target.name}
            </h1>
            <UserStatusBadge isActive={target.isActive} />
          </div>
        }
      />

      <div className="detail-columns">
        <div className="detail-main">
          <SectionCard title="Profile">
            <ErrorBanner error={updateProfile.error} />
            <ProfileForm
              key={target.id}
              defaultValues={{ name: target.name, email: target.email }}
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
              reset={reset}
              isPending={updateProfile.isPending}
              onSubmit={(values) => updateProfile.mutate(values)}
            />
          </SectionCard>

          <SectionCard title="Role" subtitle="Changing a role affects what this user can do — the backend refuses unsafe changes.">
            <ErrorBanner error={updateRole.error} />
            <div className="inline-field-action">
              <div className="field" style={{ flexGrow: 1 }}>
                <label className="field-label" htmlFor="user-role-select">
                  Role
                </label>
                <select
                  id="user-role-select"
                  className="text-input"
                  value={effectiveRole}
                  disabled={isSelf}
                  onChange={(event) => setRoleDraft(event.target.value as BackendRole)}
                >
                  {roleOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isSelf || updateRole.isPending || effectiveRole === target.role}
                onClick={() => updateRole.mutate(effectiveRole)}
              >
                {updateRole.isPending ? 'Saving…' : 'Change Role'}
              </button>
            </div>
            {isSelf ? <p className="field-hint" style={{ marginTop: 8 }}>You cannot change your own role.</p> : null}
          </SectionCard>

          <SectionCard title="Department">
            <ErrorBanner error={updateDepartment.error} />
            <div className="inline-field-action">
              <div className="field" style={{ flexGrow: 1 }}>
                <label className="field-label" htmlFor="user-department-select">
                  Department
                </label>
                <DepartmentSelect
                  id="user-department-select"
                  value={effectiveDepartmentId}
                  onChange={(event) => setDepartmentDraft(event.target.value || null)}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={updateDepartment.isPending || effectiveDepartmentId === (target.department?.id ?? '')}
                onClick={() => updateDepartment.mutate(effectiveDepartmentId || null)}
              >
                {updateDepartment.isPending ? 'Saving…' : 'Assign'}
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="detail-side">
          <SectionCard title="Access">
            <ErrorBanner error={updateStatus.error} />
            <ErrorBanner error={resetPasswordMutation.error} />
            <p className="body-text" style={{ marginBottom: 12 }}>
              {target.isActive
                ? 'This user can currently sign in and use ReqFlow.'
                : 'This user cannot sign in until reactivated.'}
            </p>
            {target.isActive ? (
              <button
                type="button"
                className="btn btn-danger-ghost"
                disabled={isSelf || updateStatus.isPending}
                onClick={() => setConfirmDeactivate(true)}
              >
                Deactivate User
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate(true)}
              >
                {updateStatus.isPending ? 'Activating…' : 'Activate User'}
              </button>
            )}
            {isSelf ? <p className="field-hint" style={{ marginTop: 8 }}>You cannot deactivate your own account.</p> : null}
            <hr style={{ margin: '16px 0' }} />
            <button type="button" className="btn btn-secondary" disabled={isSelf} onClick={() => setConfirmReset(true)}>Reset Password</button>
            {isSelf ? <p className="field-hint" style={{ marginTop: 8 }}>Use Change Password to update your own password.</p> : null}
            {temporaryPassword ? <div style={{ marginTop: 12 }}><strong>Temporary Password</strong><p className="cell-mono">{temporaryPassword}</p><p className="field-hint">Give this securely to the user. It will not be shown again.</p><button type="button" className="btn btn-secondary btn-sm" onClick={() => void navigator.clipboard?.writeText(temporaryPassword)}>Copy</button></div> : null}
          </SectionCard>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeactivate}
        title="Deactivate this user?"
        description="This user will no longer be able to access ReqFlow. You can reactivate them at any time."
        confirmLabel="Deactivate"
        isConfirming={updateStatus.isPending}
        onCancel={() => setConfirmDeactivate(false)}
        onConfirm={() =>
          updateStatus.mutate(false, {
            onSuccess: () => setConfirmDeactivate(false),
            onError: () => setConfirmDeactivate(false),
          })
        }
      />
      <ConfirmDialog
        open={confirmReset}
        title={`Reset password for ${target.name}?`}
        description="Their current password and active sessions will stop working. A temporary password will be generated and must be changed at next login."
        confirmLabel="Reset Password"
        isConfirming={resetPasswordMutation.isPending}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => resetPasswordMutation.mutate(undefined, {
          onSuccess: (password) => { setTemporaryPassword(password); setConfirmReset(false) },
          onError: () => setConfirmReset(false),
        })}
      />
    </AppShell>
  )
}

// Kept as a small local component (not extracted to its own file) purely to
// avoid re-declaring useForm's generic wiring inline in the page body.
function ProfileForm({
  defaultValues,
  register,
  handleSubmit,
  errors,
  reset,
  isPending,
  onSubmit,
}: {
  defaultValues: ProfileFormValues
  register: ReturnType<typeof useForm<ProfileFormValues>>['register']
  handleSubmit: ReturnType<typeof useForm<ProfileFormValues>>['handleSubmit']
  errors: ReturnType<typeof useForm<ProfileFormValues>>['formState']['errors']
  reset: ReturnType<typeof useForm<ProfileFormValues>>['reset']
  isPending: boolean
  onSubmit: (values: ProfileFormValues) => void
}) {
  useInitializeOnce(defaultValues, reset)

  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="field">
        <label className="field-label" htmlFor="profile-name">
          Name
        </label>
        <input id="profile-name" type="text" className="text-input" aria-invalid={errors.name ? true : undefined} {...register('name')} />
        {errors.name ? <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{errors.name.message}</span> : null}
      </div>
      <div className="field">
        <label className="field-label" htmlFor="profile-email">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          className="text-input"
          aria-invalid={errors.email ? true : undefined}
          {...register('email')}
        />
        {errors.email ? <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{errors.email.message}</span> : null}
      </div>
      <div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}

// Initializes the form exactly once per mount (the page wraps this in
// key={target.id}, so a genuinely different user remounts it) — never on
// every render, so it never clobbers an in-progress edit when the detail
// query silently refetches in the background.
function useInitializeOnce(defaultValues: ProfileFormValues, reset: (values: ProfileFormValues) => void) {
  const [initialized, setInitialized] = useState(false)
  if (!initialized) {
    reset(defaultValues)
    setInitialized(true)
  }
}

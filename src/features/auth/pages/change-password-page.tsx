import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { ApiError } from '@/lib/api'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { useLogout } from '../hooks/use-logout'
import { authKeys, useSession } from '../hooks/use-session'
import { changePassword, completePasswordChange } from '../api/change-password'
import { toAppShellUser } from '../lib/to-app-shell-user'

export function ChangePasswordPage() {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const onLogout = useLogout()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const forced = session.status === 'authenticated' && session.user.mustChangePassword
  const mutation = useMutation({
    mutationFn: () => forced
      ? completePasswordChange({ newPassword, confirmPassword })
      : changePassword({ currentPassword, newPassword, confirmPassword }),
    onSuccess: async () => {
      setSuccess(true)
      await queryClient.invalidateQueries({ queryKey: authKeys.session() })
      if (forced) navigate('/dashboard', { replace: true })
      else { setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }
    },
  })
  if (session.status !== 'authenticated') return null
  const user = session.user
  const error = clientError ?? (mutation.error instanceof ApiError ? mutation.error.message : mutation.error ? 'Password could not be changed.' : null)
  function submit(event: React.FormEvent) {
    event.preventDefault(); setClientError(null); setSuccess(false)
    if (newPassword.length < 8) return setClientError('Password must be at least 8 characters.')
    if (newPassword !== confirmPassword) return setClientError('Passwords do not match.')
    mutation.mutate()
  }
  return <AppShell user={toAppShellUser(user)} navItems={productionNavigationByRole[user.role]} activeKey="password" onLogout={onLogout}>
    <PageHeader title={forced ? 'Change Your Password' : 'Change Password'} />
    <SectionCard subtitle={forced ? 'Set a permanent password before continuing to ReqFlow.' : 'Update your account password.'}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error ? <div role="alert" style={{ color: 'var(--red-text)' }}>{error}</div> : null}
        {success ? <div role="status">Password changed successfully.</div> : null}
        {!forced ? <div className="field"><label className="field-label" htmlFor="current-password">Current Password</label><input id="current-password" type="password" className="text-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div> : null}
        <div className="field"><label className="field-label" htmlFor="new-password">New Password</label><input id="new-password" type="password" className="text-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /><span className="field-hint">At least 8 characters and different from your current password.</span></div>
        <div className="field"><label className="field-label" htmlFor="confirm-password">Confirm New Password</label><input id="confirm-password" type="password" className="text-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
        <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Changing…' : 'Change Password'}</button>
      </form>
    </SectionCard>
  </AppShell>
}

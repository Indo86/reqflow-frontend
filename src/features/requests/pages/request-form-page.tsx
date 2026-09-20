import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/app/layout/app-shell'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { ApiError } from '@/lib/api'
import { useSession } from '@/features/auth/hooks/use-session'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { toAppShellUser } from '@/features/auth/lib/to-app-shell-user'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { useRequestQuery } from '../hooks/use-request-query'
import { useCreateRequestMutation } from '../hooks/use-create-request-mutation'
import { useUpdateRequestMutation } from '../hooks/use-update-request-mutation'
import { RequestForm } from '../components/request-form'
import type { RequestFormValues } from '../schemas/request-form.schema'
import { EDITABLE_STATUSES, requestStatusLabels } from '../types/request'

// Handles both /requests/new and /requests/:requestId/edit — the same real
// create/update contract, just with or without an existing request to
// initialize from. Edit is only offered for DRAFT/REVISION_REQUIRED (UI
// presentation only; the backend's conditional update remains the actual
// authority and returns 409 REQUEST_NOT_EDITABLE otherwise).
export function RequestFormPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const isEdit = requestId !== undefined
  const navigate = useNavigate()
  const session = useSession()
  const onLogout = useLogout()

  const detailQuery = useRequestQuery(requestId)
  const createMutation = useCreateRequestMutation()
  const updateMutation = useUpdateRequestMutation(requestId ?? '')

  if (session.status !== 'authenticated') return null
  const { user } = session
  const shellUser = toAppShellUser(user)
  const navItems = productionNavigationByRole[user.role]

  if (isEdit && detailQuery.isPending) {
    return (
      <AppShell user={shellUser} navItems={navItems} activeKey="requests" onLogout={onLogout}>
        <PageHeader showBackLink title="Loading request…" />
      </AppShell>
    )
  }

  if (isEdit && detailQuery.isError) {
    const notFound = detailQuery.error instanceof ApiError && detailQuery.error.status === 404
    const message =
      detailQuery.error instanceof ApiError ? detailQuery.error.message : 'Please try again.'
    return (
      <AppShell user={shellUser} navItems={navItems} activeKey="requests" onLogout={onLogout}>
        <PageHeader showBackLink title={notFound ? 'Request not found' : 'Something went wrong'} />
        <SectionCard>
          <p className="body-text">
            {notFound ? "This request doesn't exist, or you don't have access to it." : message}
          </p>
        </SectionCard>
      </AppShell>
    )
  }

  const detail = isEdit ? detailQuery.data : undefined

  if (detail && !EDITABLE_STATUSES.includes(detail.status)) {
    return (
      <AppShell user={shellUser} navItems={navItems} activeKey="requests" onLogout={onLogout}>
        <PageHeader showBackLink title="This request can no longer be edited" />
        <SectionCard>
          <p className="body-text">
            Only Draft or Revision Required requests can be edited. This request is currently{' '}
            {requestStatusLabels[detail.status]}.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: 12 }}
            onClick={() => navigate(`/requests/${detail.id}`)}
          >
            View request
          </button>
        </SectionCard>
      </AppShell>
    )
  }

  const mutation = isEdit ? updateMutation : createMutation

  async function handleSubmit(values: RequestFormValues) {
    if (isEdit && requestId) {
      await updateMutation.mutateAsync(values)
      navigate(`/requests/${requestId}`)
    } else {
      const created = await createMutation.mutateAsync(values)
      navigate(`/requests/${created.id}`)
    }
  }

  return (
    <AppShell user={shellUser} navItems={navItems} activeKey="requests" onLogout={onLogout}>
      <PageHeader showBackLink title={isEdit ? 'Edit Request' : 'New Request'} />
      <SectionCard>
        <RequestForm
          key={detail?.id ?? 'create'}
          defaultValues={
            detail
              ? {
                  type: detail.type,
                  title: detail.title,
                  description: detail.description,
                  amount: detail.amount === null ? undefined : Number(detail.amount),
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          submitError={mutation.error}
          onCancel={() => navigate(isEdit ? `/requests/${requestId}` : '/requests')}
        />
      </SectionCard>
    </AppShell>
  )
}

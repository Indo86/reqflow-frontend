import { useParams } from 'react-router-dom'
import { RequestDetailPage } from '@/features/requests/request-detail-page'
import { findRequestDetail } from '@/lib/mock/request-details'

// The generic (non-preview) route always renders from the Request Owner's
// perspective — there is no real session yet, and an owner never approves
// their own request, so this never shows approval actions. The exact
// relationship variants (current approver / non-current / admin) live under
// the dedicated /preview/request-detail/* routes instead.
export function RequestDetailRoute() {
  const { requestId } = useParams<{ requestId: string }>()
  const detail = findRequestDetail(requestId)

  return <RequestDetailPage detail={detail} variant="owner-draft" />
}

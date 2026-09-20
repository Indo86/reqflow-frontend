import { RequestDetailPage } from '@/features/requests/pages/request-detail-page'

// Real data (F2) — RequestDetailPage fetches by :requestId itself via
// useParams + useRequestQuery. The F0.5 mock RequestDetailPage (variant-
// driven, no /pages/ prefix) is untouched and still serves
// /preview/request-detail/* routes.
export function RequestDetailRoute() {
  return <RequestDetailPage />
}

import { RequestFormPage } from '@/features/requests/pages/request-form-page'

// Backs both /requests/new and /requests/:requestId/edit — RequestFormPage
// itself branches on whether :requestId is present.
export function RequestFormRoute() {
  return <RequestFormPage />
}

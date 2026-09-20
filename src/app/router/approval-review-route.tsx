import { ApprovalReviewPage } from '@/features/approvals/pages/approval-review-page'

// Real data (F3) — ApprovalReviewPage fetches by :approvalId itself via
// useParams + useApprovalDetailQuery (GET /approvals/:id), not
// GET /requests/:id — see that page's header comment for why.
export function ApprovalReviewRoute() {
  return <ApprovalReviewPage />
}

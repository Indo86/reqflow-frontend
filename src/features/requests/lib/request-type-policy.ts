import type { RequestType } from '../types/request'

// Display-only mirror of reqFlow-backend's M3 routing matrix
// (src/services/approval-policy.service.ts). The backend decides the real
// route at submit time and snapshots it on the approval cycle; this helper only
// lets the form tell the user, before submitting, what to expect. Thresholds
// are compared as plain numbers purely for that preview.
export const PURCHASE_FINANCE_THRESHOLD = 5_000_000
export const PURCHASE_DIRECTOR_THRESHOLD = 20_000_000

/** Only these types carry money. The backend rejects an amount on every other type. */
export function requestTypeCarriesAmount(type: RequestType): boolean {
  return type === 'PURCHASE' || type === 'REIMBURSEMENT'
}

export const requestTypeDescriptions: Record<RequestType, string> = {
  PURCHASE: 'Purchase new goods or paid services. Requires an amount; larger amounts need Finance and Director approval.',
  EQUIPMENT:
    'Request allocation of equipment already owned by the organization (for example an available laptop or monitor). To buy new equipment, choose Purchase.',
  REIMBURSEMENT:
    'Claim reimbursement for eligible expenses you have already paid. Requires a valid amount; Finance always reviews the claim.',
  LEAVE: 'Request time off. No amount is needed.',
  GENERAL: 'Any other business request that does not involve money or company assets.',
}

export type ApprovalRouteStep = 'Manager' | 'Finance' | 'Director'

export function previewApprovalRoute(type: RequestType, amount: number | undefined): ApprovalRouteStep[] {
  if (type === 'REIMBURSEMENT') return ['Manager', 'Finance']
  if (type === 'PURCHASE' && amount !== undefined && Number.isFinite(amount)) {
    if (amount >= PURCHASE_DIRECTOR_THRESHOLD) return ['Manager', 'Finance', 'Director']
    if (amount >= PURCHASE_FINANCE_THRESHOLD) return ['Manager', 'Finance']
  }
  return ['Manager']
}

export const AMOUNT_NOT_APPLICABLE_NOTICE =
  'Amount does not apply to this request type and will not be saved. To buy new goods, choose Purchase instead.'

import type { RequestType } from '../types/request'

// Menyimpan aturan nominal untuk setiap tipe request.
export const PURCHASE_FINANCE_THRESHOLD = 5_000_000
export const PURCHASE_DIRECTOR_THRESHOLD = 20_000_000

/* Memeriksa apakah tipe request membutuhkan nominal. */
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

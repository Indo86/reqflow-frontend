import { formatRupiah } from '@/lib/utils/format-currency'

// The ONLY place a Request amount is ever converted to a JS number — and
// only for display. `amount` stays a decimal string everywhere else (types,
// forms, API payloads). Number(...) is safe here specifically because this
// domain's amounts are Decimal(14,2) and provably fit within JS's safe
// integer range; this must never be used for arithmetic or comparison.
export function formatRequestAmount(amount: string | null): string {
  if (amount === null) return '—'
  return formatRupiah(Number(amount))
}

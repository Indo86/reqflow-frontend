// UTC-based on purpose: date_trunc buckets on the UTC calendar with no
// per-organization timezone concept anywhere in the backend
// (dashboard.service.ts) — computing the default range in UTC keeps the
// frontend's "last 6 months" aligned with what the backend will actually
// bucket, rather than drifting by the viewer's local offset.
export function lastSixMonthsRange(now: Date = new Date()): { from: string; to: string } {
  const to = now
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1))
  return { from: from.toISOString(), to: to.toISOString() }
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Formats a bucket's periodStart into the short label TrendLineChart expects
// — presentation only, never changes the reported count. Day/week buckets
// fall back to a short date so the label stays unambiguous.
export function formatPeriodLabel(periodStart: string, bucket: 'day' | 'week' | 'month'): string {
  const date = new Date(periodStart)
  if (bucket === 'month') return MONTH_LABELS[date.getUTCMonth()]
  return `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCDate()}`
}

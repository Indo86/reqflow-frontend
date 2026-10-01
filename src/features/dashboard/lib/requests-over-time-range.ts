const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Formats a bucket's periodStart into the short label TrendLineChart expects
// — presentation only, never changes the reported count. Day/week buckets
// fall back to a short date so the label stays unambiguous.
export function formatPeriodLabel(
  periodStart: string,
  bucket: 'day' | 'week' | 'month',
  includeYear = false
): string {
  const date = new Date(periodStart)
  if (bucket === 'month') {
    return includeYear ? `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCFullYear()}` : MONTH_LABELS[date.getUTCMonth()]
  }
  return `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCDate()}`
}

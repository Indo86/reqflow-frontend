const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'seconds' },
  { amount: 60, unit: 'minutes' },
  { amount: 24, unit: 'hours' },
  { amount: 7, unit: 'days' },
  { amount: 4.34524, unit: 'weeks' },
  { amount: 12, unit: 'months' },
  { amount: Number.POSITIVE_INFINITY, unit: 'years' },
]

const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

// Thin wrapper over Intl.RelativeTimeFormat, matching format-date.ts's
// convention (no date library added). Notification timestamps are the only
// current caller — see F5 "Date / time display".
export function formatRelativeTime(isoString: string): string {
  let duration = (new Date(isoString).getTime() - Date.now()) / 1000

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
  return formatter.format(Math.round(duration), 'years')
}

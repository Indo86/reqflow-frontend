// Backend unit is always seconds (report.service.ts, unit: 'seconds') — this
// only ever formats that value; it never recomputes a duration from
// Request timestamps itself (F6 "Workflow duration handling").
export function formatDurationSeconds(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60)

  if (totalMinutes < 60) return `${Math.max(totalMinutes, 1)} min`

  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  if (totalHours < 24) {
    return remainingMinutes > 0 ? `${totalHours} h ${remainingMinutes} min` : `${totalHours} h`
  }

  const days = Math.floor(totalHours / 24)
  const remainingHours = totalHours % 24
  return remainingHours > 0 ? `${days} d ${remainingHours} h` : `${days} d`
}

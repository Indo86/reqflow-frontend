// Thin wrappers over the platform Intl-backed formatters already used
// elsewhere in the app (e.g. MyRequestsPage's inline
// `toLocaleDateString()`) — no date library added. Backend timestamps
// (ISO strings) remain authoritative; these are presentation only.
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

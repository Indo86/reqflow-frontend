// Backend tetap menjadi sumber data dan aturan utama.
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

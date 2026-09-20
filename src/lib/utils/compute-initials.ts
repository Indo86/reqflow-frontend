// Presentation only — the backend never returns initials for a comment
// author or attachment uploader (only {id, name}), so this derives them
// client-side rather than inventing an avatar field the DTO doesn't have.
export function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

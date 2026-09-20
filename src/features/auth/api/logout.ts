import { apiClient } from '@/lib/api'

// POST /auth/logout destroys the server-side session and clears the cookie.
// Idempotent on the backend (200 even with no session cookie present).
export async function logout(): Promise<void> {
  await apiClient('/auth/logout', { method: 'POST' })
}

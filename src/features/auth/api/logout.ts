import { apiClient } from '@/lib/api'

// Mengirim data ke /auth/logout.
export async function logout(): Promise<void> {
  await apiClient('/auth/logout', { method: 'POST' })
}

import { apiClient } from '@/lib/api'
import type { LoginFormValues } from '../schemas/login.schema'

// Mengirim data ke /auth/login.
export async function login(credentials: LoginFormValues): Promise<void> {
  await apiClient('/auth/login', { method: 'POST', json: credentials })
}

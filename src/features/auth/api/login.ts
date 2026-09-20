import { apiClient } from '@/lib/api'
import type { LoginFormValues } from '../schemas/login.schema'

// POST /auth/login sets the reqflow_session cookie (httpOnly) via
// Set-Cookie and returns only {id,name,email} — see auth.controller.ts.
// The full profile (role/organization/department) is fetched separately
// via getSession() once the cookie is set, so the response here is
// intentionally discarded.
export async function login(credentials: LoginFormValues): Promise<void> {
  await apiClient('/auth/login', { method: 'POST', json: credentials })
}

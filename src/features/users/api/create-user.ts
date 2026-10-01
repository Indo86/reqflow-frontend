import { apiClient } from '@/lib/api'
import { adminUserSchema } from '../schemas/user.schema'
import { z } from 'zod'
import { mapAdminUser, type AdminUser, type BackendRole } from '../types/user'

// POST /users sends profile fields only. Tenant scope comes from the Admin
// session; the server generates and returns a temporary password once.
export interface CreateUserInput {
  name: string
  email: string
  role: BackendRole
  departmentId?: string | null
}

export interface CreateUserResult { user: AdminUser; temporaryPassword: string }
const responseSchema = z.object({ data: z.object({ user: adminUserSchema, temporaryPassword: z.string() }) })

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const response = await apiClient('/users', { method: 'POST', json: input })
  const parsed = responseSchema.parse(response).data
  return { user: mapAdminUser(parsed.user), temporaryPassword: parsed.temporaryPassword }
}

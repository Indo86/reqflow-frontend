import { z } from 'zod'

// Memvalidasi bentuk data sesuai kontrak API.
export const backendRoleSchema = z.enum(['EMPLOYEE', 'MANAGER', 'FINANCE', 'DIRECTOR', 'ADMIN'])
export type BackendRole = z.infer<typeof backendRoleSchema>

// Memvalidasi respons sesi dari /users/me.
export const userProfileResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: backendRoleSchema,
  organization: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  department: z.object({ id: z.string(), name: z.string() }).nullable(),
  mustChangePassword: z.boolean(),
})
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>

import { z } from 'zod'

// Mirrors reqFlow-backend's Role enum (prisma/schema.prisma) exactly — do
// not add roles the backend doesn't have.
export const backendRoleSchema = z.enum(['EMPLOYEE', 'MANAGER', 'FINANCE', 'DIRECTOR', 'ADMIN'])
export type BackendRole = z.infer<typeof backendRoleSchema>

// Shape of GET /users/me's `data` (see user.service.ts getUserProfile) —
// deliberately the fuller profile, not GET /auth/me's {id,name,email}-only
// shape, since this is the only endpoint that returns role/organization/
// department.
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

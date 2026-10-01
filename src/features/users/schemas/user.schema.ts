import { z } from 'zod'

// Mirrors reqFlow-backend's Role enum (prisma/schema.prisma) and
// user.service.ts's AdminUserSummary shape exactly — verified by direct
// backend inspection (F6.5). Never passwordHash or any other auth
// internal — the backend DTO itself never includes it.
export const backendRoleSchema = z.enum(['EMPLOYEE', 'MANAGER', 'FINANCE', 'DIRECTOR', 'ADMIN'])

const departmentRefSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .nullable()

export const adminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: backendRoleSchema,
  department: departmentRefSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AdminUserResponse = z.infer<typeof adminUserSchema>

// GET /users — meta has no totalPages (unlike Requests' list meta); see
// types/user.ts's mapper for where that gets derived.
export const userListResponseSchema = z.object({
  data: z.array(adminUserSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
  }),
})

export const userSingleResponseSchema = z.object({
  data: adminUserSchema,
})

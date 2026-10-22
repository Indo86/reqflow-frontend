import { z } from 'zod'

// Memvalidasi bentuk data sesuai kontrak API.
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

// Mengambil data dari /users.
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

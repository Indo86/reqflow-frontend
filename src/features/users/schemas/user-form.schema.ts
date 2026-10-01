import { z } from 'zod'
import { backendRoleSchema } from './user.schema'

// Mirrors reqFlow-backend's createUserSchema (src/schemas/user.schema.ts)
// for client-side UX validation only — the backend re-validates and
// remains authoritative.
export const createUserFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100, 'Name must be at most 100 characters.'),
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  role: backendRoleSchema,
  departmentId: z.string().optional(),
})

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>

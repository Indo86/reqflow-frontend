import { z } from 'zod'
import { backendRoleSchema } from './user.schema'

// Memvalidasi bentuk data sesuai kontrak API.
export const createUserFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100, 'Name must be at most 100 characters.'),
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  role: backendRoleSchema,
  departmentId: z.string().optional(),
})

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>

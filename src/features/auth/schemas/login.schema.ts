import { z } from 'zod'

// Mirrors reqFlow-backend's loginSchema (src/schemas/auth.schema.ts) —
// login validates credential *format*, not the registration password
// policy (min 8 chars), which login never enforces.
export const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>

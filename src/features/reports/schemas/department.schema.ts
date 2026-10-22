import { z } from 'zod'

// Mengambil data dari /departments.
export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const departmentListResponseSchema = z.object({
  data: z.array(departmentSchema),
})

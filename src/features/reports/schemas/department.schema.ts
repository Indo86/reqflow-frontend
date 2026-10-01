import { z } from 'zod'

// Mirrors reqFlow-backend's department.service.ts DepartmentSummary shape
// exactly (GET /departments — requireAuth only, no role gate, scoped to
// user.organizationId server-side, ordered by name ascending) — verified by
// direct backend inspection. This endpoint already existed before F6-
// contract-completion; nothing new was added on the backend for it.
export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const departmentListResponseSchema = z.object({
  data: z.array(departmentSchema),
})

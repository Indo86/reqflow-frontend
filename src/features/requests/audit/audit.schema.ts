import { z } from 'zod'

// Mengambil data dari /requests/:id/audit-log.
export const auditEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  entityType: z.string(),
  actor: z.object({ id: z.string(), name: z.string() }).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(),
})

export const auditLogResponseSchema = z.object({
  data: z.array(auditEntrySchema),
  meta: z.object({ page: z.number(), pageSize: z.number(), total: z.number(), totalPages: z.number() }),
})

export type AuditEntry = z.infer<typeof auditEntrySchema>

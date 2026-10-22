import { z } from 'zod'

// GET /requests/:id/audit-log (audit.service.ts getRequestAuditLog). For
// anyone but the request's owner the server has already reduced `metadata` to
// a per-action allow-list (audit-presentation.ts); the UI additionally reads
// only the specific keys it renders and never dumps metadata wholesale.
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

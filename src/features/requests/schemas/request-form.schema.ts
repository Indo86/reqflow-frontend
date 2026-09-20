import { z } from 'zod'
import { backendRequestTypeSchema } from './request.schema'

// Mirrors reqFlow-backend's createRequestSchema (src/schemas/request.schema.ts)
// for client-side UX validation only — the backend re-validates and remains
// authoritative (e.g. the PURCHASE-requires-amount rule is only enforced by
// the backend at submit time, not here, since a DRAFT PURCHASE may still be
// amount-less). `amount` stays a plain number here because that is exactly
// what the backend's create/update request BODY expects — never a string,
// never parsed with parseFloat from a formatted display value.
export const requestFormSchema = z.object({
  type: backendRequestTypeSchema,
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(150, 'Title must be at most 150 characters.'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required.')
    .max(5000, 'Description must be at most 5000 characters.'),
  amount: z
    .number()
    .finite('Amount must be a valid number.')
    .positive('Amount must be greater than 0.')
    .optional(),
})

export type RequestFormValues = z.infer<typeof requestFormSchema>

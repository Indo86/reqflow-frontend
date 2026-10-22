import { z } from 'zod'
import { backendRequestTypeSchema } from './request.schema'
import { validateDescriptionValue } from '../rich-text/description-format'
import { requestTypeCarriesAmount } from '../lib/request-type-policy'

// Mirrors reqFlow-backend's createRequestSchema (src/schemas/request.schema.ts)
// for client-side UX validation only — the backend re-validates and remains
// authoritative. `amount` stays a plain number here because that is exactly
// what the backend's create/update request BODY expects — never a string,
// never parsed with parseFloat from a formatted display value.
//
// M3: only PURCHASE and REIMBURSEMENT carry money. For those two the form
// requires a valid amount (the backend would otherwise refuse to submit the
// draft); for every other type the amount field is not shown and any leftover
// value is dropped, so a priced EQUIPMENT/LEAVE/GENERAL request cannot be
// produced from this form.
const MAX_AMOUNT = 999_999_999_999.99

export const requestFormSchema = z
  .object({
    type: backendRequestTypeSchema,
    title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(150, 'Title must be at most 150 characters.'),
    description: z.string().superRefine((value, context) => {
      const message = validateDescriptionValue(value)
      if (message) context.addIssue({ code: 'custom', message })
    }),
    amount: z.number().optional(),
  })
  .superRefine((value, context) => {
    if (!requestTypeCarriesAmount(value.type)) return
    const label = value.type === 'PURCHASE' ? 'Purchase' : 'Reimbursement'
    const amount = value.amount
    const fail = (message: string) => context.addIssue({ code: 'custom', path: ['amount'], message })
    if (amount === undefined) return fail(`Amount is required for ${label} requests.`)
    if (!Number.isFinite(amount)) return fail('Amount must be a valid number.')
    if (amount <= 0) return fail('Amount must be greater than 0.')
    if (amount > MAX_AMOUNT) return fail('Amount is too large.')
    if (Math.abs(amount * 100 - Math.round(amount * 100)) >= 1e-6) return fail('Amount can have at most 2 decimal places.')
  })
  .transform((value) => ({
    ...value,
    amount: requestTypeCarriesAmount(value.type) ? value.amount : undefined,
  }))

export type RequestFormValues = z.output<typeof requestFormSchema>
export type RequestFormInput = z.input<typeof requestFormSchema>

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ApiError } from '@/lib/api'
import { requestFormSchema, type RequestFormInput, type RequestFormValues } from '../schemas/request-form.schema'
import {
  AMOUNT_NOT_APPLICABLE_NOTICE,
  previewApprovalRoute,
  requestTypeCarriesAmount,
  requestTypeDescriptions,
} from '../lib/request-type-policy'
import { requestTypeLabels, type RequestType } from '../types/request'
import { RichTextEditor } from './rich-text-editor'

interface RequestFormProps {
  // Nilai awal hanya diberikan saat mengedit request.
  defaultValues?: RequestFormInput
  onSubmit: (values: RequestFormValues) => Promise<void>
  isSubmitting: boolean
  submitError?: unknown
  onCancel: () => void
}

const typeOptions = Object.entries(requestTypeLabels) as [RequestType, string][]

// Menampilkan formulir untuk membuat atau mengedit request.
export function RequestForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitError,
  onCancel,
}: RequestFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormInput, unknown, RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: defaultValues ?? { type: 'GENERAL', title: '', description: '', amount: undefined },
  })

  const selectedType = useWatch({ control, name: 'type' })
  const watchedAmount = useWatch({ control, name: 'amount' })
  const carriesAmount = requestTypeCarriesAmount(selectedType)
  const route = previewApprovalRoute(selectedType, typeof watchedAmount === 'number' ? watchedAmount : undefined)
  // Menandai nominal lama yang tidak lagi sesuai dengan tipe request.
  const hasLegacyAmount = !carriesAmount && defaultValues?.amount !== undefined

  const safeMessage =
    submitError instanceof ApiError
      ? submitError.message
      : submitError
        ? 'The request could not be saved. Please try again.'
        : undefined

  const onFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={onFormSubmit} noValidate>
      {safeMessage ? (
        <div
          role="alert"
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--rf-radius-sm)',
            background: 'var(--red-bg)',
            color: 'var(--red-text)',
            fontSize: 12.5,
          }}
        >
          {safeMessage}
        </div>
      ) : null}

      <div className="field">
        <label className="field-label" htmlFor="request-type">
          Type
        </label>
        <select
          id="request-type"
          className="text-input"
          aria-invalid={errors.type ? true : undefined}
          {...register('type')}
        >
          {typeOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span id="request-type-hint" className="field-hint">
          {requestTypeDescriptions[selectedType]}
        </span>
        {errors.type ? <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{errors.type.message}</span> : null}
        <span id="request-route-preview" className="field-hint" data-testid="approval-route-preview">
          Approval route: {route.join(' → ')}
        </span>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="request-title">
          Title
        </label>
        <input
          id="request-title"
          type="text"
          className="text-input"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? 'request-title-error' : undefined}
          {...register('title')}
        />
        {errors.title ? (
          <span id="request-title-error" style={{ fontSize: 11.5, color: 'var(--red-text)' }}>
            {errors.title.message}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="request-description">
          Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              id="request-description"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={Boolean(errors.description)}
              describedBy={errors.description ? 'request-description-error' : undefined}
            />
          )}
        />
        {errors.description ? (
          <span id="request-description-error" style={{ fontSize: 11.5, color: 'var(--red-text)' }}>
            {errors.description.message}
          </span>
        ) : null}
      </div>

      {carriesAmount ? (
        <div className="field">
          <label className="field-label" htmlFor="request-amount">
            Amount (IDR)
          </label>
          <input
            id="request-amount"
            type="number"
            step="0.01"
            min="0"
            className="text-input"
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby="request-amount-hint"
            {...register('amount', { setValueAs: (value) => (value === '' || value == null ? undefined : Number(value)) })}
          />
          <span id="request-amount-hint" className="field-hint">
            Required for {selectedType === 'PURCHASE' ? 'Purchase' : 'Reimbursement'} requests.
          </span>
          {errors.amount ? (
            <span role="alert" style={{ fontSize: 11.5, color: 'var(--red-text)' }}>
              {errors.amount.message}
            </span>
          ) : null}
        </div>
      ) : hasLegacyAmount ? (
        <div className="field" role="note">
          <span className="field-hint">{AMOUNT_NOT_APPLICABLE_NOTICE}</span>
        </div>
      ) : null}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

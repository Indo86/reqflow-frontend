import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { ApiError } from '@/lib/api'
import { requestFormSchema, type RequestFormValues } from '../schemas/request-form.schema'
import { requestTypeLabels, type RequestType } from '../types/request'
import { RichTextEditor } from './rich-text-editor'

interface RequestFormProps {
  // Present only in edit mode, computed once by the caller from already-
  // fetched Request detail data — this component only ever sees a fully
  // resolved value, so it never has to juggle loading state itself, and
  // RHF's defaultValues (applied once at mount) never gets clobbered by a
  // background refetch of the same request.
  defaultValues?: RequestFormValues
  onSubmit: (values: RequestFormValues) => Promise<void>
  isSubmitting: boolean
  submitError?: unknown
  onCancel: () => void
}

const typeOptions = Object.entries(requestTypeLabels) as [RequestType, string][]

// Shared by both /requests/new and /requests/:requestId/edit — fields come
// only from the backend's real create/update schema (type, title,
// description, amount). Status is never a form field: it is entirely
// domain-controlled (always DRAFT on create; unaffected by edit).
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
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: defaultValues ?? { type: 'GENERAL', title: '', description: '', amount: undefined },
  })

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
        {errors.type ? <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{errors.type.message}</span> : null}
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
          {...register('amount', { setValueAs: (value) => (value === '' ? undefined : Number(value)) })}
        />
        <span id="request-amount-hint" className="field-hint">
          Required before submitting a Purchase request.
        </span>
        {errors.amount ? (
          <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{errors.amount.message}</span>
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
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

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RequestForm } from './request-form'
import { requestFormSchema } from '../schemas/request-form.schema'
import {
  previewApprovalRoute,
  requestTypeCarriesAmount,
  requestTypeDescriptions,
} from '../lib/request-type-policy'

const valid = { title: 'Business request', description: 'A valid description of the request.' }

function renderForm(
  defaults: Partial<{ type: 'PURCHASE' | 'EQUIPMENT' | 'REIMBURSEMENT' | 'LEAVE' | 'GENERAL'; amount: number }> = {}
) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  render(
    <RequestForm
      defaultValues={{ type: 'GENERAL', amount: undefined, ...valid, ...defaults }}
      onSubmit={onSubmit}
      isSubmitting={false}
      onCancel={vi.fn()}
    />
  )
  return { onSubmit }
}

const selectType = (value: string) => fireEvent.change(screen.getByLabelText('Type'), { target: { value } })

describe('request type semantics (M3)', () => {
  it('explains the difference between Purchase and Equipment before submitting', () => {
    renderForm()
    selectType('PURCHASE')
    expect(screen.getByText(/Purchase new goods or paid services/)).toBeInTheDocument()
    selectType('EQUIPMENT')
    expect(screen.getByText(/equipment already owned by the organization/)).toBeInTheDocument()
    expect(screen.getByText(/choose Purchase/)).toBeInTheDocument()
  })

  it('describes every request type', () => {
    for (const type of ['PURCHASE', 'EQUIPMENT', 'REIMBURSEMENT', 'LEAVE', 'GENERAL'] as const) {
      expect(requestTypeDescriptions[type].length).toBeGreaterThan(10)
    }
  })

  it('shows the amount field only for Purchase and Reimbursement', () => {
    renderForm()
    expect(screen.queryByLabelText('Amount (IDR)')).not.toBeInTheDocument()
    selectType('PURCHASE')
    expect(screen.getByLabelText('Amount (IDR)')).toBeInTheDocument()
    selectType('REIMBURSEMENT')
    expect(screen.getByLabelText('Amount (IDR)')).toBeInTheDocument()
    selectType('EQUIPMENT')
    expect(screen.queryByLabelText('Amount (IDR)')).not.toBeInTheDocument()
    selectType('LEAVE')
    expect(screen.queryByLabelText('Amount (IDR)')).not.toBeInTheDocument()
  })

  it('previews the approval route for the selected type and amount', () => {
    renderForm({ type: 'REIMBURSEMENT', amount: 50_000 })
    expect(screen.getByTestId('approval-route-preview')).toHaveTextContent('Approval route: Manager → Finance')
    selectType('EQUIPMENT')
    expect(screen.getByTestId('approval-route-preview')).toHaveTextContent('Approval route: Manager')
    expect(screen.getByTestId('approval-route-preview')).not.toHaveTextContent('Finance')
  })

  it('previews the Director step for a large purchase', () => {
    renderForm({ type: 'PURCHASE', amount: 20_000_000 })
    expect(screen.getByTestId('approval-route-preview')).toHaveTextContent('Manager → Finance → Director')
  })
})

describe('type-specific amount validation (M3)', () => {
  it('requires an amount for a Reimbursement', async () => {
    const { onSubmit } = renderForm({ type: 'REIMBURSEMENT' })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Amount is required for Reimbursement requests.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('requires an amount for a Purchase', async () => {
    const { onSubmit } = renderForm({ type: 'PURCHASE' })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Amount is required for Purchase requests.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it.each([
    ['0', 'Amount must be greater than 0.'],
    ['-5', 'Amount must be greater than 0.'],
    ['10.123', 'Amount can have at most 2 decimal places.'],
    ['1000000000000', 'Amount is too large.'],
  ])('rejects the amount %s', async (value, message) => {
    const { onSubmit } = renderForm({ type: 'REIMBURSEMENT' })
    fireEvent.change(screen.getByLabelText('Amount (IDR)'), { target: { value } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a valid reimbursement amount unchanged', async () => {
    const { onSubmit } = renderForm({ type: 'REIMBURSEMENT' })
    fireEvent.change(screen.getByLabelText('Amount (IDR)'), { target: { value: '150000.5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'REIMBURSEMENT', amount: 150000.5 }))
    )
  })

  it('does not require or send an amount for Equipment, Leave or General', async () => {
    const { onSubmit } = renderForm({ type: 'EQUIPMENT' })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0].amount).toBeUndefined()
  })

  it('tells the user a legacy amount on an Equipment draft will not be saved, and drops it', async () => {
    const { onSubmit } = renderForm({ type: 'EQUIPMENT', amount: 6_500_000 })
    expect(screen.getByRole('note')).toHaveTextContent(/will not be saved/)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0].amount).toBeUndefined()
  })

  it('switching a priced Purchase to Equipment drops the amount from the payload', async () => {
    const { onSubmit } = renderForm({ type: 'PURCHASE', amount: 30_000_000 })
    selectType('EQUIPMENT')
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ type: 'EQUIPMENT', amount: undefined })
  })
})

describe('request form schema contract (M3)', () => {
  const base = { ...valid, amount: undefined }

  it('accepts the boundary amounts the backend accepts', () => {
    for (const amount of [0.01, 4_999_999.99, 5_000_000, 20_000_000, 999_999_999_999.99]) {
      expect(requestFormSchema.safeParse({ ...base, type: 'PURCHASE', amount }).success).toBe(true)
    }
  })

  it('rejects the amounts the backend rejects', () => {
    for (const amount of [0, -1, 1.005, 1_000_000_000_000]) {
      expect(requestFormSchema.safeParse({ ...base, type: 'PURCHASE', amount }).success).toBe(false)
    }
  })

  it('removes an amount from types that cannot carry one', () => {
    for (const type of ['EQUIPMENT', 'LEAVE', 'GENERAL'] as const) {
      const result = requestFormSchema.parse({ ...base, type, amount: 1000 })
      expect(result.amount).toBeUndefined()
    }
  })

  it('mirrors the backend notion of which types carry money', () => {
    expect(requestTypeCarriesAmount('PURCHASE')).toBe(true)
    expect(requestTypeCarriesAmount('REIMBURSEMENT')).toBe(true)
    expect(requestTypeCarriesAmount('EQUIPMENT')).toBe(false)
  })
})

describe('previewApprovalRoute boundaries', () => {
  it.each([
    ['PURCHASE', 4_999_999.99, ['Manager']],
    ['PURCHASE', 5_000_000, ['Manager', 'Finance']],
    ['PURCHASE', 19_999_999.99, ['Manager', 'Finance']],
    ['PURCHASE', 20_000_000, ['Manager', 'Finance', 'Director']],
    ['REIMBURSEMENT', 1, ['Manager', 'Finance']],
    ['REIMBURSEMENT', 90_000_000, ['Manager', 'Finance']],
    ['EQUIPMENT', undefined, ['Manager']],
    ['LEAVE', undefined, ['Manager']],
    ['GENERAL', undefined, ['Manager']],
  ] as const)('%s %s', (type, amount, expected) => {
    expect(previewApprovalRoute(type, amount)).toEqual(expected)
  })
})

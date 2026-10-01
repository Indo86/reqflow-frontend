import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RequestForm } from './request-form'
import { serializeDescription } from '../rich-text/description-format'

const base = { type: 'GENERAL' as const, title: 'Business request', amount: undefined }

describe('RequestForm rich-text integration', () => {
  it('rejects a structurally empty rich-text description', async () => {
    const onSubmit = vi.fn()
    render(<RequestForm defaultValues={{ ...base, description: '' }} onSubmit={onSubmit} isSubmitting={false} onCancel={vi.fn()} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Description is required.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits an existing rich-text value without flattening it', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const description = serializeDescription({ type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Loaded heading' }] }] })
    render(<RequestForm defaultValues={{ ...base, description }} onSubmit={onSubmit} isSubmitting={false} onCancel={vi.fn()} />)
    expect(await screen.findByRole('heading', { level: 2, name: 'Loaded heading' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ description })))
  })

  it('loads and submits a legacy plain-text edit value', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<RequestForm defaultValues={{ ...base, description: 'Line one\nLine two' }} onSubmit={onSubmit} isSubmitting={false} onCancel={vi.fn()} />)
    expect(await screen.findByText('Line one')).toBeInTheDocument()
    expect(screen.getByText('Line two')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ description: 'Line one\nLine two' })))
  })
})

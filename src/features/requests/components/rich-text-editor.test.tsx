import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Editor } from '@tiptap/core'
import { describe, expect, it, vi } from 'vitest'
import { RichTextEditor } from './rich-text-editor'
import { serializeDescription } from '../rich-text/description-format'
import { createRequestDescriptionExtensions } from '../rich-text/rich-text-extensions'

describe('RichTextEditor', () => {
  it('accepts typed content, creates a new paragraph with Enter, and supports undo/redo', () => {
    const editor = new Editor({ extensions: createRequestDescriptionExtensions(), content: '' })
    try {
      editor.commands.insertContent('First paragraph')
      editor.commands.enter()
      editor.commands.insertContent('Second paragraph')
      const completed = editor.getJSON()
      expect(completed.content).toHaveLength(2)
      expect(completed).toMatchObject({
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First paragraph' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second paragraph' }] },
        ],
      })

      expect(editor.commands.undo()).toBe(true)
      expect(editor.getJSON()).not.toEqual(completed)
      expect(editor.commands.redo()).toBe(true)
      expect(editor.getJSON()).toEqual(completed)
    } finally {
      editor.destroy()
    }
  })

  it('renders the compact accessible toolbar and placeholder', async () => {
    render(<RichTextEditor id="description" value="" onChange={vi.fn()} onBlur={vi.fn()} />)
    expect(await screen.findByRole('toolbar', { name: 'Description formatting' })).toBeInTheDocument()
    for (const name of ['Bold', 'Italic', 'Underline', 'Heading 2', 'Heading 3', 'Bullet list', 'Numbered list', 'Blockquote', 'Add link', 'Undo', 'Redo']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(document.querySelector('[data-placeholder="Describe the purpose, context, and details of this request..."]')).toBeInTheDocument()
  })

  it.each(['Bold', 'Italic', 'Underline', 'Heading 2', 'Heading 3', 'Bullet list', 'Numbered list', 'Blockquote'])('toggles %s active state', async (name) => {
    render(<RichTextEditor id="description" value="" onChange={vi.fn()} onBlur={vi.fn()} />)
    const button = await screen.findByRole('button', { name })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('sets and removes only a safe link', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('https://example.com')
    render(<RichTextEditor id="description" value="" onChange={vi.fn()} onBlur={vi.fn()} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Add link' }))
    expect(prompt).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Edit link' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Remove link' }))
    expect(screen.getByRole('button', { name: 'Add link' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('rejects an unsafe link in the UI', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('javascript:alert(1)')
    render(<RichTextEditor id="description" value="" onChange={vi.fn()} onBlur={vi.fn()} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Add link' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Links must use http, https, or mailto.')
  })

  it('updates when the form resets or a legacy edit value loads', async () => {
    const { rerender } = render(<RichTextEditor id="description" value="Legacy first" onChange={vi.fn()} onBlur={vi.fn()} />)
    expect(await screen.findByText('Legacy first')).toBeInTheDocument()
    const replacement = serializeDescription({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Reset value' }] }] })
    rerender(<RichTextEditor id="description" value={replacement} onChange={vi.fn()} onBlur={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('Reset value')).toBeInTheDocument())
  })

  it('updates the editable surface accessibility state after validation', async () => {
    const { rerender } = render(<RichTextEditor id="description" value="" onChange={vi.fn()} onBlur={vi.fn()} invalid={false} />)
    const textbox = await screen.findByRole('textbox', { name: 'Description' })
    expect(textbox).toHaveAttribute('aria-invalid', 'false')
    rerender(<RichTextEditor id="description" value="" onChange={vi.fn()} onBlur={vi.fn()} invalid describedBy="description-error" />)
    await waitFor(() => expect(textbox).toHaveAttribute('aria-invalid', 'true'))
    expect(textbox).toHaveAttribute('aria-describedby', 'description-error')
  })
})

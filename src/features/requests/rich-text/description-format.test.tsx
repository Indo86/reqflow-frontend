import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RichTextRenderer } from '../components/rich-text-renderer'
import {
  RICH_TEXT_PREFIX,
  extractDescriptionText,
  isSafeLinkUrl,
  legacyTextToDocument,
  parseStoredDescription,
  serializeDescription,
  validateDescriptionValue,
} from './description-format'

describe('request description compatibility format', () => {
  it('converts every legacy newline into a separate paragraph without losing blank lines', () => {
    const document = legacyTextToDocument('Line one\n\nLine two')
    expect(document.content).toHaveLength(3)
    expect(document.content?.[0]?.content?.[0]?.text).toBe('Line one')
    expect(document.content?.[1]?.content).toBeUndefined()
    expect(document.content?.[2]?.content?.[0]?.text).toBe('Line two')
  })

  it('round-trips versioned Tiptap JSON and extracts plain text safely', () => {
    const document = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] }] }
    const stored = serializeDescription(document)
    expect(stored.startsWith(RICH_TEXT_PREFIX)).toBe(true)
    expect(parseStoredDescription(stored)).toEqual(document)
    expect(extractDescriptionText(document)).toBe('Hello world')
  })

  it('treats empty rich documents as empty and enforces the text-length policy', () => {
    expect(validateDescriptionValue(serializeDescription({ type: 'doc', content: [{ type: 'paragraph' }] }))).toBe('Description is required.')
    expect(validateDescriptionValue(serializeDescription({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x'.repeat(5001) }] }] }))).toMatch(/at most 5000/)
  })

  it('allows only http, https, and mailto links', () => {
    expect(isSafeLinkUrl('https://example.com')).toBe(true)
    expect(isSafeLinkUrl('mailto:buyer@example.com')).toBe(true)
    expect(isSafeLinkUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeLinkUrl('data:text/html,test')).toBe(false)
  })

  it('strips unsafe link marks during parsing as a rendering safeguard', () => {
    const stored = serializeDescription({ type: 'doc', content: [{ type: 'paragraph', content: [{
      type: 'text', text: 'Not clickable', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
    }] }] })
    render(<RichTextRenderer value={stored} />)
    expect(screen.getByText('Not clickable')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders legacy multiline text as distinct paragraphs', () => {
    const { container } = render(<RichTextRenderer value={'First line\nSecond line'} />)
    const paragraphs = container.querySelectorAll('.tiptap p')
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]).toHaveTextContent('First line')
    expect(paragraphs[1]).toHaveTextContent('Second line')
  })

  it('renders headings, lists, marks, blockquotes, and safe links structurally', () => {
    const stored = serializeDescription({ type: 'doc', content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Business Justification' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Bold', marks: [{ type: 'bold' }] }, { type: 'text', text: ' Italic', marks: [{ type: 'italic' }] }, { type: 'text', text: ' Underline', marks: [{ type: 'underline' }] }] },
      { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet' }] }] }] },
      { type: 'orderedList', attrs: { start: 1 }, content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Numbered' }] }] }] },
      { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quoted' }] }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Example', marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank', rel: 'noopener noreferrer', class: null } }] }] },
    ] })
    const { container } = render(<RichTextRenderer value={stored} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Business Justification' })).toBeInTheDocument()
    expect(container.querySelector('strong')).toHaveTextContent('Bold')
    expect(container.querySelector('em')).toHaveTextContent('Italic')
    expect(container.querySelector('u')).toHaveTextContent('Underline')
    expect(screen.getAllByRole('list')).toHaveLength(2)
    expect(container.querySelector('blockquote')).toHaveTextContent('Quoted')
    expect(screen.getByRole('link', { name: 'Example' })).toHaveAttribute('href', 'https://example.com')
    expect(screen.getByRole('link', { name: 'Example' })).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('updates rendered content when the stored value changes', async () => {
    const { rerender } = render(<RichTextRenderer value="Before" />)
    expect(screen.getByText('Before')).toBeInTheDocument()
    rerender(<RichTextRenderer value="After" />)
    await waitFor(() => expect(screen.getByText('After')).toBeInTheDocument())
    expect(screen.queryByText('Before')).not.toBeInTheDocument()
  })
})

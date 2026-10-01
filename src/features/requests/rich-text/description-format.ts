import type { JSONContent } from '@tiptap/react'

export const RICH_TEXT_PREFIX = 'REQFLOW_RICH_TEXT_V1:'
export const MAX_DESCRIPTION_TEXT_LENGTH = 5000

export function legacyTextToDocument(value: string): JSONContent {
  const lines = value.replace(/\r\n?/g, '\n').split('\n')
  return {
    type: 'doc',
    content: lines.map((line) => ({
      type: 'paragraph',
      ...(line ? { content: [{ type: 'text', text: line }] } : {}),
    })),
  }
}

export function parseStoredDescription(value: string): JSONContent {
  if (!value.startsWith(RICH_TEXT_PREFIX)) return legacyTextToDocument(value)
  try {
    const parsed: unknown = JSON.parse(value.slice(RICH_TEXT_PREFIX.length))
    if (typeof parsed === 'object' && parsed !== null && 'type' in parsed && parsed.type === 'doc') {
      return sanitizeLinks(parsed as JSONContent)
    }
  } catch {
    // A corrupt prefixed value is displayed inertly as legacy text instead
    // of being interpreted as HTML or crashing Request Detail.
  }
  return legacyTextToDocument(value)
}

function sanitizeLinks(node: JSONContent): JSONContent {
  return {
    ...node,
    ...(node.marks ? {
      marks: node.marks.filter((mark) => mark.type !== 'link' ||
        (typeof mark.attrs?.href === 'string' && isSafeLinkUrl(mark.attrs.href))),
    } : {}),
    ...(node.content ? { content: node.content.map(sanitizeLinks) } : {}),
  }
}

export function serializeDescription(document: JSONContent): string {
  return `${RICH_TEXT_PREFIX}${JSON.stringify(document)}`
}

export function extractDescriptionText(document: JSONContent): string {
  if (document.type === 'text') return document.text ?? ''
  if (document.type === 'hardBreak') return '\n'
  return document.content?.map(extractDescriptionText).join('') ?? ''
}

export function validateDescriptionValue(value: string): string | null {
  const text = extractDescriptionText(parseStoredDescription(value)).trim()
  if (!text) return 'Description is required.'
  if (text.length > MAX_DESCRIPTION_TEXT_LENGTH) return `Description must be at most ${MAX_DESCRIPTION_TEXT_LENGTH} characters.`
  return null
}

export function isSafeLinkUrl(value: string): boolean {
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

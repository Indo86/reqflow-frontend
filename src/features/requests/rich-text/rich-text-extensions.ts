import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'

interface RequestDescriptionExtensionOptions {
  openLinks?: boolean
  placeholder?: string
}

export function createRequestDescriptionExtensions({
  openLinks = false,
  placeholder,
}: RequestDescriptionExtensionOptions = {}) {
  return [
    StarterKit.configure({ heading: { levels: [2, 3] }, link: false, underline: false }),
    Underline,
    Link.configure({
      openOnClick: openLinks,
      protocols: ['http', 'https', 'mailto'],
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
    }),
    ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
  ]
}

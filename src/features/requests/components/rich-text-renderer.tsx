import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { parseStoredDescription } from '../rich-text/description-format'
import { createRequestDescriptionExtensions } from '../rich-text/rich-text-extensions'

const extensions = createRequestDescriptionExtensions({ openLinks: true })

export function RichTextRenderer({ value }: { value: string }) {
  const editor = useEditor({
    extensions,
    content: parseStoredDescription(value),
    editable: false,
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor) return
    editor.commands.setContent(parseStoredDescription(value), { emitUpdate: false })
  }, [editor, value])

  if (!editor) return null
  return <EditorContent editor={editor} className="rich-text-renderer" />
}

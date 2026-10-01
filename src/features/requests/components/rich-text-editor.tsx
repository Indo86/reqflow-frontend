import { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { isSafeLinkUrl, parseStoredDescription, serializeDescription } from '../rich-text/description-format'
import { createRequestDescriptionExtensions } from '../rich-text/rich-text-extensions'

interface RichTextEditorProps {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  invalid?: boolean
  describedBy?: string
}

const requestDescriptionEditorExtensions = createRequestDescriptionExtensions({
  placeholder: 'Describe the purpose, context, and details of this request...',
})

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`rich-text-toolbar-button${active ? ' is-active' : ''}`}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export function RichTextEditor({ id, value, onChange, onBlur, invalid, describedBy }: RichTextEditorProps) {
  const [linkError, setLinkError] = useState<string | null>(null)
  const editor = useEditor({
    extensions: requestDescriptionEditorExtensions,
    content: parseStoredDescription(value),
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        id,
        'aria-label': 'Description',
        'aria-invalid': invalid ? 'true' : 'false',
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      },
    },
    onUpdate: ({ editor: current }) => onChange(serializeDescription(current.getJSON())),
    onBlur,
  })

  useEffect(() => {
    if (!editor) return
    if (serializeDescription(editor.getJSON()) !== value) {
      editor.commands.setContent(parseStoredDescription(value), { emitUpdate: false })
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor) return
    editor.setOptions({
      editorProps: {
        attributes: {
          id,
          'aria-label': 'Description',
          'aria-invalid': invalid ? 'true' : 'false',
          ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        },
      },
    })
  }, [describedBy, editor, id, invalid])

  if (!editor) return <div className="rich-text-editor rich-text-editor-loading">Loading editor...</div>

  function editLink() {
    const previous = editor?.getAttributes('link').href as string | undefined
    const next = window.prompt('Link URL (http, https, or mailto)', previous ?? 'https://')
    if (next === null) return
    if (!next.trim()) {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      setLinkError(null)
      return
    }
    if (!isSafeLinkUrl(next.trim())) {
      setLinkError('Links must use http, https, or mailto.')
      return
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: next.trim(), target: '_blank', rel: 'noopener noreferrer' }).run()
    setLinkError(null)
  }

  return (
    <div className={`rich-text-editor${invalid ? ' is-invalid' : ''}`}>
      <div className="rich-text-toolbar" role="toolbar" aria-label="Description formatting">
        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton label={editor.isActive('link') ? 'Edit link' : 'Add link'} active={editor.isActive('link')} onClick={editLink} />
        {editor.isActive('link') ? <ToolbarButton label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()} /> : null}
        <ToolbarButton label="Undo" disabled={!editor.can().chain().focus().undo().run()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton label="Redo" disabled={!editor.can().chain().focus().redo().run()} onClick={() => editor.chain().focus().redo().run()} />
      </div>
      <EditorContent editor={editor} />
      {linkError ? <span role="alert" className="field-error">{linkError}</span> : null}
    </div>
  )
}

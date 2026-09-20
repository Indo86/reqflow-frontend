import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AlertCircle, Loader2, MessageSquare, Trash2 } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { EmptyState } from '@/components/shared/empty-state'
import { CommentItem } from '@/components/shared/comment-item'
import { UserAvatar } from '@/components/shared/user-avatar'
import { computeInitials } from '@/lib/utils/compute-initials'
import { formatDateTime } from '@/lib/utils/format-date'
import { ConfirmDialog } from '@/features/requests/components/confirm-dialog'
import { useCommentsQuery } from '../hooks/use-comments-query'
import { useCreateCommentMutation } from '../hooks/use-create-comment-mutation'
import { useDeleteCommentMutation } from '../hooks/use-delete-comment-mutation'
import { commentContentSchema } from '../schemas/comment.schema'

const formSchema = z.object({ content: commentContentSchema })
type FormValues = z.infer<typeof formSchema>

interface CommentSectionProps {
  requestId: string
  currentUserId: string
  currentUserInitials: string
  // Whether the signed-in user is currently allowed to *write* a new
  // comment (owner, or the request's current active approver — see
  // collaboration.service.ts getWritableRequestForCollaboration). This is
  // UX only: the backend re-checks on every submit and is the actual
  // authority, including the "request just became terminal" race.
  canWrite: boolean
}

// Real Request Comments (F4) — distinct from an Approval's own
// decisionComment (F3), which belongs to the approval history, not here.
export function CommentSection({ requestId, currentUserId, currentUserInitials, canWrite }: CommentSectionProps) {
  const query = useCommentsQuery(requestId)
  const createMutation = useCreateCommentMutation(requestId)
  const deleteMutation = useDeleteCommentMutation(requestId)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values.content)
      reset()
    } catch {
      // Surfaced below via createMutation.error; the draft is intentionally
      // NOT cleared (reset() only runs on success) so a failed submit never
      // loses what the user typed.
    }
  })

  const submitError = createMutation.error
  const safeSubmitMessage =
    submitError instanceof ApiError
      ? submitError.message
      : submitError
        ? 'The comment could not be posted. Please try again.'
        : undefined

  if (query.isPending) {
    return (
      <div className="empty-state" role="status" aria-label="Loading comments">
        <div className="empty-state-icon">
          <Loader2 className="icon" width={18} height={18} strokeWidth={2} />
        </div>
        <div className="empty-state-title">Loading comments…</div>
      </div>
    )
  }

  if (query.isError) {
    const requestIdHint = query.error instanceof ApiError ? query.error.requestId : undefined
    const message =
      query.error instanceof ApiError ? query.error.message : 'Something went wrong loading comments.'
    return (
      <div className="empty-state" role="alert">
        <div className="empty-state-icon">
          <AlertCircle className="icon" width={18} height={18} strokeWidth={2} />
        </div>
        <div className="empty-state-title">Couldn't load comments</div>
        <div className="empty-state-body">
          {message}
          {requestIdHint ? ` (Request ID: ${requestIdHint})` : ''}
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginTop: 12 }}
          onClick={() => void query.refetch()}
        >
          Retry
        </button>
      </div>
    )
  }

  const comments = query.data.items

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {deleteError ? (
        <div role="alert" className="body-text" style={{ color: 'var(--red-text)' }}>
          {deleteError}
        </div>
      ) : null}

      {comments.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No comments yet" body="Be the first to add one." />
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            author={comment.author.name}
            initials={computeInitials(comment.author.name)}
            timestamp={formatDateTime(comment.createdAt)}
            text={comment.content}
            actions={
              comment.author.id === currentUserId ? (
                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: 24, height: 24, marginLeft: 'auto' }}
                  aria-label="Delete comment"
                  onClick={() => setPendingDeleteId(comment.id)}
                >
                  <Trash2 className="icon" width={13} height={13} strokeWidth={2} />
                </button>
              ) : undefined
            }
          />
        ))
      )}

      {canWrite ? (
        <form onSubmit={onSubmit} noValidate style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <UserAvatar initials={currentUserInitials} />
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="sr-only" htmlFor="new-comment-content">
              Add a comment
            </label>
            <textarea
              id="new-comment-content"
              className="text-input"
              placeholder="Add a comment…"
              style={{ height: 'auto', minHeight: 60, padding: '10px 12px', resize: 'vertical' }}
              aria-invalid={errors.content ? true : undefined}
              disabled={isSubmitting || createMutation.isPending}
              {...register('content')}
            />
            {errors.content ? (
              <span style={{ fontSize: 11.5, color: 'var(--red-text)' }}>{errors.content.message}</span>
            ) : null}
            {safeSubmitMessage ? (
              <span role="alert" style={{ fontSize: 11.5, color: 'var(--red-text)' }}>
                {safeSubmitMessage}
              </span>
            ) : null}
            <div>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting || createMutation.isPending}
              >
                {createMutation.isPending ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this comment?"
        description="This cannot be undone."
        confirmLabel="Delete Comment"
        isConfirming={deleteMutation.isPending}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (!pendingDeleteId) return
          deleteMutation.mutate(pendingDeleteId, {
            onSuccess: () => {
              setPendingDeleteId(null)
              setDeleteError(null)
            },
            onError: (error) => {
              setPendingDeleteId(null)
              setDeleteError(
                error instanceof ApiError ? error.message : 'This comment could not be deleted. Please try again.'
              )
            },
          })
        }}
      />
    </div>
  )
}

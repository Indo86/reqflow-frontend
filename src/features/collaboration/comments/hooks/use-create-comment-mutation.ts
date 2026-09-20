import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createComment } from '../api/create-comment'
import { commentKeys } from '../api/comment-query-keys'

// Invalidates only this request's comments (feature-scoped, per F4 "query
// invalidation") — never queryClient.clear(), never Dashboard/Notification
// data. Request/Approval caches are untouched: adding a comment does not
// change Request or Approval state.
export function useCreateCommentMutation(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => createComment(requestId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentKeys.request(requestId) })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteComment } from '../api/delete-comment'
import { commentKeys } from '../api/comment-query-keys'

export function useDeleteCommentMutation(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentKeys.request(requestId) })
    },
  })
}

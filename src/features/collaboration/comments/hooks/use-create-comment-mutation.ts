import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createComment } from '../api/create-comment'
import { commentKeys } from '../api/comment-query-keys'

// Membuat komentar lalu menyegarkan daftar komentar.
export function useCreateCommentMutation(requestId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => createComment(requestId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentKeys.request(requestId) })
    },
  })
}

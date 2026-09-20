import { useQuery } from '@tanstack/react-query'
import { getComments } from '../api/get-comments'
import { commentKeys } from '../api/comment-query-keys'

export function useCommentsQuery(requestId: string) {
  return useQuery({
    queryKey: commentKeys.request(requestId),
    queryFn: () => getComments(requestId),
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser, type UpdateUserInput } from '../api/update-user'
import { userKeys } from '../api/user-query-keys'
import { authKeys, useSession } from '@/features/auth/hooks/use-session'

// If the Admin edits their OWN profile, F1's session query is invalidated
// too — TanStack Query's session cache stays the single source of truth
// for "who am I" rather than a second, independently-updated copy. See F6.5
// "Auth session interaction".
export function useUpdateUserMutation(id: string) {
  const queryClient = useQueryClient()
  const session = useSession()
  const isSelf = session.status === 'authenticated' && session.user.id === id

  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      if (isSelf) void queryClient.invalidateQueries({ queryKey: authKeys.session() })
    },
  })
}

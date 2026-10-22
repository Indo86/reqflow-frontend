import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser, type UpdateUserInput } from '../api/update-user'
import { userKeys } from '../api/user-query-keys'
import { authKeys, useSession } from '@/features/auth/hooks/use-session'

// Memperbarui profil pengguna lalu menyegarkan cache.
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

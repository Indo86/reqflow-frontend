import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserRole } from '../api/update-user-role'
import { userKeys } from '../api/user-query-keys'
import { authKeys, useSession } from '@/features/auth/hooks/use-session'
import type { BackendRole } from '../types/user'

export function useUpdateUserRoleMutation(id: string) {
  const queryClient = useQueryClient()
  const session = useSession()
  const isSelf = session.status === 'authenticated' && session.user.id === id

  return useMutation({
    mutationFn: (role: BackendRole) => updateUserRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      if (isSelf) void queryClient.invalidateQueries({ queryKey: authKeys.session() })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserDepartment } from '../api/update-user-department'
import { userKeys } from '../api/user-query-keys'
import { authKeys, useSession } from '@/features/auth/hooks/use-session'

export function useUpdateUserDepartmentMutation(id: string) {
  const queryClient = useQueryClient()
  const session = useSession()
  const isSelf = session.status === 'authenticated' && session.user.id === id

  return useMutation({
    mutationFn: (departmentId: string | null) => updateUserDepartment(id, departmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      if (isSelf) void queryClient.invalidateQueries({ queryKey: authKeys.session() })
    },
  })
}

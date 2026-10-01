import { useMutation } from '@tanstack/react-query'
import { resetPassword } from '../api/reset-password'
export function useResetPasswordMutation(userId: string) {
  return useMutation({ mutationFn: () => resetPassword(userId) })
}

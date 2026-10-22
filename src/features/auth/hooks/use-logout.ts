import { useNavigate } from 'react-router-dom'
import { useLogoutMutation } from './use-logout-mutation'

// Menyediakan hook useLogout.
export function useLogout(): () => void {
  const navigate = useNavigate()
  const mutation = useLogoutMutation()

  return () => {
    mutation.mutate(undefined, {
      onSettled: () => navigate('/login', { replace: true }),
    })
  }
}

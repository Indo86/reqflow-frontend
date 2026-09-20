import { useNavigate } from 'react-router-dom'
import { useLogoutMutation } from './use-logout-mutation'

// Convenience wrapper: fires the logout mutation (which clears the query
// cache once it settles — see use-logout-mutation.ts) and always lands the
// user back on /login afterward, even if the backend call itself failed.
export function useLogout(): () => void {
  const navigate = useNavigate()
  const mutation = useLogoutMutation()

  return () => {
    mutation.mutate(undefined, {
      onSettled: () => navigate('/login', { replace: true }),
    })
  }
}

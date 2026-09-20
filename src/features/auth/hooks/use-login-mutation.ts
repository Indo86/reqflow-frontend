import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login } from '../api/login'
import { authKeys } from './use-session'

// The login response only carries {id,name,email} (see login.ts), so a
// successful login invalidates+refetches the session query rather than
// seeding the cache from the response — that's the only way to get
// role/organization/department into state. onSuccess's returned promise is
// awaited by the mutation itself, so callers that `await mutateAsync(...)`
// see the *new* session already resolved before they navigate, avoiding a
// flash of stale/guest UI.
export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.session() }),
  })
}

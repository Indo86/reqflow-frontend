import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '../api/logout'

// No business queries exist yet in F1 (F2+ will add them), so clearing the
// *entire* query cache on logout is exactly as targeted as clearing "just
// the session" today, while establishing the safe pattern before there's
// anything user-specific to leak across the next sign-in. Runs even if the
// backend call fails (network down, already-expired session) — the user
// asked to sign out; the client-side state should reflect that regardless.
export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => queryClient.clear(),
  })
}

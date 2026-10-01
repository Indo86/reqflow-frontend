import { apiClient } from '@/lib/api'
import { z } from 'zod'

const responseSchema = z.object({ data: z.object({ temporaryPassword: z.string() }) })
export async function resetPassword(userId: string): Promise<string> {
  const response = await apiClient(`/users/${userId}/reset-password`, { method: 'POST' })
  return responseSchema.parse(response).data.temporaryPassword
}

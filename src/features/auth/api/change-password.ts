import { apiClient } from '@/lib/api'

export interface NewPasswordInput { newPassword: string; confirmPassword: string }
export interface ChangePasswordInput extends NewPasswordInput { currentPassword: string }

export async function completePasswordChange(input: NewPasswordInput): Promise<void> {
  await apiClient('/auth/complete-password-change', { method: 'POST', json: input })
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient('/users/me/password', { method: 'PATCH', json: input })
}

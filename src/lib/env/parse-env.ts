import { z } from 'zod'
const envSchema = z.object({
  VITE_API_BASE_URL: z.url().refine((value) => {
    try {
      const url = new URL(value)
      return (
        ['http:', 'https:'].includes(url.protocol) &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash
      )
    } catch {
      return false
    }
  }, 'Use an absolute HTTP(S) API base URL without credentials, query, or fragment'),
})
export function parseEnv(input: unknown) {
  const result = envSchema.safeParse(input)
  if (!result.success)
    throw new Error(
      'Invalid frontend configuration: VITE_API_BASE_URL must be an absolute HTTP(S) URL without credentials, query, or fragment. Check .env.example.'
    )
  return { apiBaseUrl: result.data.VITE_API_BASE_URL.replace(/\/+$/, '') }
}

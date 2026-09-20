import { zodResolver } from '@hookform/resolvers/zod'
import { expect, it } from 'vitest'
import { z } from 'zod'
it('integrates Zod with the React Hook Form resolver', async () => {
  const resolver = zodResolver(z.object({ value: z.string().min(1) }))
  const options = { fields: {}, shouldUseNativeValidation: false }
  const valid = await resolver({ value: 'example' }, undefined, options)
  expect(valid.errors).toEqual({})
  const invalid = await resolver({ value: '' }, undefined, options)
  expect(invalid.errors.value?.type).toBe('too_small')
})

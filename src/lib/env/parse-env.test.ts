import { describe, expect, it } from 'vitest'
import { parseEnv } from './parse-env'
describe('frontend environment', () => {
  it('accepts an absolute API URL and normalizes trailing slashes', () => {
    expect(parseEnv({ VITE_API_BASE_URL: 'https://api.example.test/api/' })).toEqual({
      apiBaseUrl: 'https://api.example.test/api',
    })
  })
  it.each([
    undefined,
    '',
    '/api',
    'not-a-url',
    'ftp://example.test',
    'https://user:pass@example.test',
    'https://example.test?x=1',
    'https://example.test#fragment',
  ])('rejects invalid or missing configuration: %s', (value) => {
    expect(() => parseEnv({ VITE_API_BASE_URL: value })).toThrow('Invalid frontend configuration')
  })
})

import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { getDepartments } from './get-departments'

const departmentFixture = [
  { id: 'dept-eng', name: 'Engineering', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'dept-fin', name: 'Finance', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
]

describe('department API layer', () => {
  it('getDepartments calls GET /departments with credentials included and no query params', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/departments' ? jsonResponse(200, { data: departmentFixture }) : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getDepartments()

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/departments', search: '' }),
      expect.objectContaining({ credentials: 'include' })
    )
    expect(result).toEqual([
      { id: 'dept-eng', name: 'Engineering', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'dept-fin', name: 'Finance', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    ])
  })

  it('never sends an organizationId param — scope is derived from the session server-side', async () => {
    const fetchSpy = stubFetch(() => jsonResponse(200, { data: [] }))

    await getDepartments()

    const [urlArg] = fetchSpy.mock.calls[0]
    expect((urlArg as URL).search).not.toContain('organizationId')
  })

  it('rethrows as ApiError, never a raw fetch/JSON error', async () => {
    stubFetch(() => errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.'))

    await expect(getDepartments()).rejects.toBeInstanceOf(ApiError)
  })
})

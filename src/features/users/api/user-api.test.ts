import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { getUsers } from './get-users'
import { getUser } from './get-user'
import { createUser } from './create-user'
import { updateUser } from './update-user'
import { updateUserStatus } from './update-user-status'
import { updateUserRole } from './update-user-role'
import { updateUserDepartment } from './update-user-department'

const userFixture = {
  id: 'user-1',
  name: 'Alice Manager',
  email: 'alice@test.com',
  role: 'MANAGER',
  department: { id: 'dept-1', name: 'Engineering' },
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('users API layer', () => {
  it('getUsers calls GET /users with filters as query params and derives totalPages', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/users'
        ? jsonResponse(200, { data: [userFixture], meta: { page: 1, pageSize: 20, total: 45 } })
        : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getUsers({ page: 1, pageSize: 20, q: 'alice', role: 'MANAGER', isActive: true })

    const [urlArg] = fetchSpy.mock.calls[0]
    const search = (urlArg as URL).searchParams
    expect(search.get('q')).toBe('alice')
    expect(search.get('role')).toBe('MANAGER')
    expect(search.get('isActive')).toBe('true')
    expect(search.get('page')).toBe('1')
    expect(search.get('pageSize')).toBe('20')

    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 45, totalPages: 3 })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).not.toHaveProperty('passwordHash')
  })

  it('never sends an organizationId param — scope is derived from the session server-side', async () => {
    const fetchSpy = stubFetch(() => jsonResponse(200, { data: [], meta: { page: 1, pageSize: 20, total: 0 } }))

    await getUsers({ page: 1, pageSize: 20 })

    const [urlArg] = fetchSpy.mock.calls[0]
    expect((urlArg as URL).search).not.toContain('organizationId')
  })

  it('getUser calls GET /users/:id', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/users/user-1' ? jsonResponse(200, { data: userFixture }) : errorResponse(404, 'NOT_FOUND', 'x')
    )

    const result = await getUser('user-1')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/users/user-1' }),
      expect.objectContaining({ credentials: 'include' })
    )
    expect(result.id).toBe('user-1')
  })

  it('strips unexpected fields (e.g. a malformed fixture accidentally including passwordHash)', async () => {
    stubFetch(() =>
      jsonResponse(200, { data: { ...userFixture, passwordHash: '$argon2id$leaked' } })
    )

    const result = await getUser('user-1')

    expect(result).not.toHaveProperty('passwordHash')
    expect(JSON.stringify(result)).not.toContain('argon2')
  })

  it('createUser POSTs profile fields only and returns the one-time temporary password', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/users'
        ? jsonResponse(201, { data: { user: userFixture, temporaryPassword: 'Ab7K-xP4m-Q2Nz' } })
        : errorResponse(404, 'NOT_FOUND', 'x')
    )

    const result = await createUser({ name: 'Alice', email: 'alice@test.com', role: 'MANAGER', departmentId: 'dept-1' })

    const [, init] = fetchSpy.mock.calls[0]
    const body = JSON.parse((init as RequestInit).body as string) as Record<string, unknown>
    expect(body).toEqual({
      name: 'Alice',
      email: 'alice@test.com',
      role: 'MANAGER',
      departmentId: 'dept-1',
    })
    expect(body).not.toHaveProperty('organizationId')
    expect(body).not.toHaveProperty('password')
    expect(result.temporaryPassword).toBe('Ab7K-xP4m-Q2Nz')
  })

  it('updateUser PATCHes only the provided profile fields', async () => {
    const fetchSpy = stubFetch(() => jsonResponse(200, { data: userFixture }))

    await updateUser('user-1', { name: 'New Name' })

    const [urlArg, init] = fetchSpy.mock.calls[0]
    expect((urlArg as URL).pathname).toBe('/users/user-1')
    expect((init as RequestInit).method).toBe('PATCH')
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ name: 'New Name' })
  })

  it('updateUserStatus PATCHes /users/:id/status with {isActive}', async () => {
    const fetchSpy = stubFetch(() => jsonResponse(200, { data: { ...userFixture, isActive: false } }))

    await updateUserStatus('user-1', false)

    const [urlArg, init] = fetchSpy.mock.calls[0]
    expect((urlArg as URL).pathname).toBe('/users/user-1/status')
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ isActive: false })
  })

  it('updateUserRole PATCHes /users/:id/role with {role}', async () => {
    const fetchSpy = stubFetch(() => jsonResponse(200, { data: { ...userFixture, role: 'EMPLOYEE' } }))

    await updateUserRole('user-1', 'EMPLOYEE')

    const [urlArg, init] = fetchSpy.mock.calls[0]
    expect((urlArg as URL).pathname).toBe('/users/user-1/role')
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ role: 'EMPLOYEE' })
  })

  it('updateUserDepartment PATCHes /users/:id/department with {departmentId: null} to unassign', async () => {
    const fetchSpy = stubFetch(() => jsonResponse(200, { data: { ...userFixture, department: null } }))

    await updateUserDepartment('user-1', null)

    const [urlArg, init] = fetchSpy.mock.calls[0]
    expect((urlArg as URL).pathname).toBe('/users/user-1/department')
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ departmentId: null })
  })

  it('surfaces a 409 conflict (e.g. USER_HAS_PENDING_APPROVALS) as an ApiError with the backend message', async () => {
    stubFetch(() => errorResponse(409, 'USER_HAS_PENDING_APPROVALS', 'This user has pending approval responsibilities.'))

    await expect(updateUserStatus('user-1', false)).rejects.toMatchObject({
      status: 409,
      code: 'USER_HAS_PENDING_APPROVALS',
    })
  })

  it('surfaces a 409 LAST_ACTIVE_ADMIN_REQUIRED conflict', async () => {
    stubFetch(() => errorResponse(409, 'LAST_ACTIVE_ADMIN_REQUIRED', 'This organization must always have at least one active Admin.'))

    await expect(updateUserRole('user-1', 'EMPLOYEE')).rejects.toBeInstanceOf(ApiError)
  })
})

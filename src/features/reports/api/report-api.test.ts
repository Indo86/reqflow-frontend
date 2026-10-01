import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { requestReportFixture, workflowDurationFixture } from '@/test/fixtures/reports'
import { getRequestReport } from './get-request-report'
import { getWorkflowDurationReport } from './get-workflow-duration-report'

describe('report API layer', () => {
  it('getRequestReport calls GET /reports/requests with only the filters actually set', async () => {
    const fetchSpy = stubFetch((url) =>
      url.pathname === '/reports/requests' ? jsonResponse(200, { data: requestReportFixture }) : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getRequestReport({ status: 'APPROVED', from: '2026-04-01T00:00:00.000Z' })

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/reports/requests', search: '?status=APPROVED&from=2026-04-01T00%3A00%3A00.000Z' }),
      expect.objectContaining({ credentials: 'include' })
    )
    // Decimal total is a string, never coerced to a number here.
    expect(result.totals.amountTotal).toBe('92500000.75')
    expect(typeof result.totals.amountTotal).toBe('string')
  })

  it('getRequestReport with no filters sends an empty query string, never garbage params', async () => {
    const fetchSpy = stubFetch(() => jsonResponse(200, { data: requestReportFixture }))

    await getRequestReport({})

    expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({ search: '' }), expect.anything())
  })

  it('byDepartment includes the null-department group rather than dropping it', async () => {
    stubFetch(() => jsonResponse(200, { data: requestReportFixture }))

    const result = await getRequestReport({})

    const nullGroup = result.byDepartment.find((row) => row.departmentId === null)
    expect(nullGroup).toEqual({ departmentId: null, departmentName: null, count: 2 })
  })

  it('getWorkflowDurationReport reports seconds and a sparse byStatus, never a fabricated CANCELLED entry', async () => {
    stubFetch((url) =>
      url.pathname === '/reports/workflow-duration' ? jsonResponse(200, { data: workflowDurationFixture }) : errorResponse(404, 'NOT_FOUND', 'not found')
    )

    const result = await getWorkflowDurationReport({})

    expect(result.unit).toBe('seconds')
    expect(result.byStatus.APPROVED?.averageSeconds).toBe(3600)
    expect(result.byStatus.CANCELLED).toBeUndefined()
    expect(result.excludedTerminalRequestsWithoutAuditEvidence).toBe(1)
  })

  it('rethrows as ApiError, never a raw fetch/JSON error', async () => {
    stubFetch(() => errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.'))

    await expect(getRequestReport({})).rejects.toBeInstanceOf(ApiError)
  })
})

import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { stubFetch } from '@/test/mock-fetch'
import { exportRequestReportCsv } from './export-request-report-csv'

const BOM = String.fromCharCode(0xfeff)
const CSV_BODY = `${BOM}Request Number,Title\r\nREQ-1,Example\r\n`

function csvResponse(headers: Record<string, string> = {}): Response {
  return new Response(CSV_BODY, {
    status: 200,
    headers: { 'Content-Type': 'text/csv; charset=utf-8', ...headers },
  })
}

describe('export-request-report-csv API layer', () => {
  it('calls GET /reports/requests/export with credentials included and no filters when none are set', async () => {
    const fetchSpy = stubFetch(() =>
      csvResponse({ 'Content-Disposition': 'attachment; filename="reqflow-requests-2026-09-24.csv"' })
    )

    const result = await exportRequestReportCsv({})

    const [urlArg, initArg] = fetchSpy.mock.calls[0]
    expect((urlArg as URL).pathname).toBe('/reports/requests/export')
    expect((urlArg as URL).search).toBe('')
    expect(initArg).toMatchObject({ credentials: 'include' })
    expect(result.filename).toBe('reqflow-requests-2026-09-24.csv')
    // Blob.text() strips a leading BOM per the Encoding Standard's UTF-8
    // decode — this just confirms the body round-trips through the Blob,
    // not a claim about BOM presence (buildCsv's BOM is a backend-side,
    // server-test concern — see reqFlow-backend's csv.test.ts).
    expect(await result.blob.text()).toBe(CSV_BODY.slice(BOM.length))
  })

  it('serializes status/type/departmentId/from/to filters into the query string', async () => {
    const fetchSpy = stubFetch(() => csvResponse())

    await exportRequestReportCsv({
      status: 'APPROVED',
      type: 'PURCHASE',
      departmentId: 'dept-eng',
      from: '2026-04-01T00:00:00.000Z',
      to: '2026-09-01T00:00:00.000Z',
    })

    const [urlArg] = fetchSpy.mock.calls[0]
    const search = (urlArg as URL).searchParams
    expect(search.get('status')).toBe('APPROVED')
    expect(search.get('type')).toBe('PURCHASE')
    expect(search.get('departmentId')).toBe('dept-eng')
    expect(search.get('from')).toBe('2026-04-01T00:00:00.000Z')
    expect(search.get('to')).toBe('2026-09-01T00:00:00.000Z')
  })

  it('falls back to a safe default filename when Content-Disposition is missing', async () => {
    stubFetch(() => csvResponse())

    const result = await exportRequestReportCsv({})
    expect(result.filename).toBe('reqflow-requests.csv')
  })

  it('normalizes a non-OK response (e.g. 413 export-too-large) into an ApiError, never a corrupt blob', async () => {
    stubFetch(
      () =>
        new Response(JSON.stringify({ error: { code: 'EXPORT_TOO_LARGE', message: 'Too many rows.' } }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        })
    )

    await expect(exportRequestReportCsv({})).rejects.toMatchObject({
      status: 413,
      code: 'EXPORT_TOO_LARGE',
    })
    await expect(exportRequestReportCsv({})).rejects.toBeInstanceOf(ApiError)
  })

  it('normalizes a network failure into an ApiError', async () => {
    stubFetch(() => {
      throw new TypeError('Failed to fetch')
    })

    await expect(exportRequestReportCsv({})).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })
})

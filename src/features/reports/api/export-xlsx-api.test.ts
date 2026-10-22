import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { stubFetch } from '@/test/mock-fetch'
import { exportRequestReportXlsx } from './export-request-report-xlsx'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const XLSX_BYTES = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0xff])

function xlsxResponse(headers: Record<string, string> = {}): Response {
  return new Response(XLSX_BYTES, {
    status: 200,
    headers: { 'Content-Type': XLSX_MIME, ...headers },
  })
}

describe('export-request-report-xlsx API layer', () => {
  it('calls GET /reports/requests/export/xlsx with credentials included and no filters when none are set', async () => {
    const fetchSpy = stubFetch(() =>
      xlsxResponse({ 'Content-Disposition': 'attachment; filename="reqflow-report-2026-09-24.xlsx"' })
    )

    const result = await exportRequestReportXlsx({})

    const [urlArg, initArg] = fetchSpy.mock.calls[0]
    expect((urlArg as URL).pathname).toBe('/reports/requests/export/xlsx')
    expect((urlArg as URL).search).toBe('')
    expect(initArg).toMatchObject({ credentials: 'include' })
    expect(result.filename).toBe('reqflow-report-2026-09-24.xlsx')
    // Binary body must round-trip byte for byte — never decoded as text or JSON.
    expect(new Uint8Array(await result.blob.arrayBuffer())).toEqual(XLSX_BYTES)
  })

  it('serializes status/type/departmentId/from/to filters into the query string', async () => {
    const fetchSpy = stubFetch(() => xlsxResponse())

    await exportRequestReportXlsx({
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
    stubFetch(() => xlsxResponse())

    const result = await exportRequestReportXlsx({})
    expect(result.filename).toBe('reqflow-report.xlsx')
  })

  it('normalizes a non-OK response (e.g. 413 export-too-large) into an ApiError, never a corrupt blob', async () => {
    stubFetch(
      () =>
        new Response(JSON.stringify({ error: { code: 'EXPORT_TOO_LARGE', message: 'Too many rows.' } }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        })
    )

    await expect(exportRequestReportXlsx({})).rejects.toMatchObject({
      status: 413,
      code: 'EXPORT_TOO_LARGE',
    })
    await expect(exportRequestReportXlsx({})).rejects.toBeInstanceOf(ApiError)
  })

  it('normalizes a network failure into an ApiError', async () => {
    stubFetch(() => {
      throw new TypeError('Failed to fetch')
    })

    await expect(exportRequestReportXlsx({})).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })
})

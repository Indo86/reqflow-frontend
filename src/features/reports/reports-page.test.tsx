import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
import { errorResponse, jsonResponse, stubFetch } from '@/test/mock-fetch'
import { emptyRequestReportFixture, emptyWorkflowDurationFixture, requestReportFixture, workflowDurationFixture } from '@/test/fixtures/reports'
import { productionNavigationByRole } from '@/lib/mock/navigation'
import { formatRequestAmount } from '@/features/requests/lib/format-request-amount'
import { ReportsPage } from './reports-page'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const shellUser = { name: 'Ava Admin', initials: 'AA', role: 'Admin', department: undefined }
const navItems = productionNavigationByRole.Admin

const departmentFixture = [
  { id: 'dept-eng', name: 'Engineering', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'dept-fin', name: 'Finance', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
]

function stubReportEndpoints(
  overrides: { report?: unknown; duration?: unknown; departments?: 'ok' | 'error' } = {}
) {
  return stubFetch((url) => {
    if (url.pathname === '/reports/requests') return jsonResponse(200, { data: overrides.report ?? requestReportFixture })
    if (url.pathname === '/reports/workflow-duration') return jsonResponse(200, { data: overrides.duration ?? workflowDurationFixture })
    if (url.pathname === '/departments') {
      return overrides.departments === 'error'
        ? errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.')
        : jsonResponse(200, { data: departmentFixture })
    }
    return errorResponse(404, 'NOT_FOUND', 'not found')
  })
}

function renderPage(initialEntries = ['/reports']) {
  return renderWithProviders(<ReportsPage user={shellUser} navItems={navItems} onLogout={vi.fn()} />, { initialEntries })
}

describe('ReportsPage', () => {
  it('renders organization-wide report insights from frozen mock data on a preview route', () => {
    renderWithProviders(<ReportsPage />)
    expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Requests by Department')).toBeInTheDocument()
    expect(screen.getByText('Workflow Duration by Step')).toBeInTheDocument()
  })

  it('shows a loading state while the report is fetching', () => {
    stubFetch(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status', { name: 'Loading report…' })).toBeInTheDocument()
  })

  it('production mode renders real totals, with the Decimal amount total displayed exactly', async () => {
    stubReportEndpoints()
    renderPage()

    const totalCard = (await screen.findByText('Total Requests')).closest('.stat-card')
    expect(totalCard).toHaveTextContent('5')
    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(screen.getByText(formatRequestAmount('92500000.75'))).toBeInTheDocument()
  })

  it('renders real status/type/department breakdown sections, including the null-department group', async () => {
    stubReportEndpoints()
    renderPage()

    // Menjelaskan kondisi yang diuji pada skenario ini.
    expect(await screen.findByText('No department')).toBeInTheDocument()
    expect(screen.getAllByText('Engineering').length).toBeGreaterThan(0)
    expect(screen.getByRole('option', { name: 'Approved' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Purchase' })).toBeInTheDocument()
  })

  it('changing a status filter updates the URL search params', async () => {
    stubReportEndpoints()
    const { router } = renderPage()

    await screen.findByText('Total Requests')
    const statusSelect = screen.getByLabelText('Status')
    fireEvent.change(statusSelect, { target: { value: 'APPROVED' } })

    expect(router.state.location.search).toContain('status=APPROVED')
  })

  it('changing the from date updates the URL as a plain YYYY-MM-DD value', async () => {
    stubReportEndpoints()
    const { router } = renderPage()

    await screen.findByText('Total Requests')
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-04-01' } })

    expect(router.state.location.search).toContain('from=2026-04-01')
  })

  it('an empty range renders a useful empty state, not an error', async () => {
    stubReportEndpoints({ report: emptyRequestReportFixture, duration: emptyWorkflowDurationFixture })
    renderPage()

    expect(await screen.findByText('No status data in range')).toBeInTheDocument()
    expect(screen.getByText('No completed requests in range')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders real workflow duration by outcome, formatted from seconds', async () => {
    stubReportEndpoints()
    renderPage()

    expect(await screen.findByText('1 h')).toBeInTheDocument() // APPROVED: 3.600 detik.
    expect(screen.getByText('3 h')).toBeInTheDocument() // REJECTED: 10.800 detik.
  })

  it('surfaces the excludedTerminalRequestsWithoutAuditEvidence caveat when nonzero', async () => {
    stubReportEndpoints()
    renderPage()

    expect(await screen.findByText(/could not be measured/)).toBeInTheDocument()
  })

  it('does not show the caveat when nothing was excluded', async () => {
    stubReportEndpoints({ duration: { ...workflowDurationFixture, excludedTerminalRequestsWithoutAuditEvidence: 0 } })
    renderPage()

    await screen.findByText('1 h')
    expect(screen.queryByText(/could not be measured/)).not.toBeInTheDocument()
  })

  it('populates the Department filter from the real GET /departments endpoint', async () => {
    stubReportEndpoints()
    renderPage()

    await screen.findByText('Total Requests')
    const departmentSelect = await screen.findByLabelText('Department')
    expect(screen.getByRole('option', { name: 'Engineering' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Finance' })).toBeInTheDocument()
    expect(departmentSelect).toBeEnabled()
  })

  it('selecting a Department updates the URL, and Clear filters removes it again', async () => {
    stubReportEndpoints()
    const { router } = renderPage()

    await screen.findByText('Total Requests')
    const departmentSelect = await screen.findByLabelText('Department')
    fireEvent.change(departmentSelect, { target: { value: 'dept-eng' } })
    expect(router.state.location.search).toContain('departmentId=dept-eng')

    fireEvent.click(await screen.findByRole('button', { name: 'Clear filters' }))
    expect(router.state.location.search).not.toContain('departmentId')
  })

  it('a Department lookup failure degrades the filter alone — the rest of Reports stays usable', async () => {
    stubReportEndpoints({ departments: 'error' })
    renderPage()

    expect(await screen.findByText('Total Requests')).toBeInTheDocument()
    expect(await screen.findByText('Failed to load departments')).toBeInTheDocument()
    expect(screen.queryByLabelText('Department')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('Export Excel sends the current filters, includes credentials, and triggers a download', async () => {
    // Menjelaskan kondisi yang diuji pada skenario ini.
    const objectUrlSpy = vi.fn(() => 'blob:mock-url')
    const revokeSpy = vi.fn()
    URL.createObjectURL = objectUrlSpy
    URL.revokeObjectURL = revokeSpy
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    let exportInit: RequestInit | undefined
    stubFetch((url, init) => {
      if (url.pathname === '/reports/requests') return jsonResponse(200, { data: requestReportFixture })
      if (url.pathname === '/reports/workflow-duration') return jsonResponse(200, { data: workflowDurationFixture })
      if (url.pathname === '/departments') return jsonResponse(200, { data: departmentFixture })
      if (url.pathname === '/reports/requests/export/xlsx') {
        exportInit = init
        return new Response('Request Number,Title\r\nREQ-1,Example\r\n', {
          status: 200,
          headers: { 'Content-Type': XLSX_MIME, 'Content-Disposition': 'attachment; filename="reqflow-report.xlsx"' },
        })
      }
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    const { router } = renderPage(['/reports?status=APPROVED'])

    await screen.findByText('Total Requests')
    expect(router.state.location.search).toContain('status=APPROVED')

    const exportButton = screen.getByRole('button', { name: 'Export Excel' })
    fireEvent.click(exportButton)

    await waitFor(() => expect(clickSpy).toHaveBeenCalled())
    expect(exportInit).toMatchObject({ credentials: 'include' })
    expect(objectUrlSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-url')

    clickSpy.mockRestore()
  })

  it('disables Export Excel while a previous export is still pending, so a duplicate click is prevented', async () => {
    let resolveExport: (() => void) | undefined
    const exportPromise = new Promise<void>((resolve) => {
      resolveExport = resolve
    })
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    stubFetch(async (url) => {
      if (url.pathname === '/reports/requests') return jsonResponse(200, { data: requestReportFixture })
      if (url.pathname === '/reports/workflow-duration') return jsonResponse(200, { data: workflowDurationFixture })
      if (url.pathname === '/departments') return jsonResponse(200, { data: departmentFixture })
      if (url.pathname === '/reports/requests/export/xlsx') {
        await exportPromise
        return new Response('xlsx', { status: 200, headers: { 'Content-Type': XLSX_MIME } })
      }
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderPage()

    await screen.findByText('Total Requests')
    const exportButton = screen.getByRole('button', { name: 'Export Excel' })
    fireEvent.click(exportButton)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Exporting…' })).toBeDisabled())

    resolveExport?.()
    await waitFor(() => expect(clickSpy).toHaveBeenCalled())
    clickSpy.mockRestore()
  })

  it('a failed export renders a controlled error message, not a silent failure', async () => {
    stubFetch((url) => {
      if (url.pathname === '/reports/requests') return jsonResponse(200, { data: requestReportFixture })
      if (url.pathname === '/reports/workflow-duration') return jsonResponse(200, { data: workflowDurationFixture })
      if (url.pathname === '/departments') return jsonResponse(200, { data: departmentFixture })
      if (url.pathname === '/reports/requests/export/xlsx') return errorResponse(413, 'EXPORT_TOO_LARGE', 'Too many rows.')
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderPage()

    await screen.findByText('Total Requests')
    fireEvent.click(screen.getByRole('button', { name: 'Export Excel' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many rows.')
  })

  it('Export PDF sends the current filters to the PDF endpoint and triggers a download', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    let pdfUrl: URL | undefined
    let pdfInit: RequestInit | undefined
    stubFetch((url, init) => {
      if (url.pathname === '/reports/requests') return jsonResponse(200, { data: requestReportFixture })
      if (url.pathname === '/reports/workflow-duration') return jsonResponse(200, { data: workflowDurationFixture })
      if (url.pathname === '/departments') return jsonResponse(200, { data: departmentFixture })
      if (url.pathname === '/reports/requests/export/pdf') {
        pdfUrl = url
        pdfInit = init
        return new Response('%PDF-1.3', {
          status: 200,
          headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="reqflow-report.pdf"' },
        })
      }
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderPage(['/reports?status=APPROVED'])

    await screen.findByText('Total Requests')
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }))

    await waitFor(() => expect(clickSpy).toHaveBeenCalled())
    expect(pdfUrl?.searchParams.get('status')).toBe('APPROVED')
    expect(pdfInit).toMatchObject({ credentials: 'include' })

    clickSpy.mockRestore()
  })

  it('disables both export buttons while a PDF is being generated', async () => {
    let resolveExport: (() => void) | undefined
    const exportPromise = new Promise<void>((resolve) => {
      resolveExport = resolve
    })
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    stubFetch(async (url) => {
      if (url.pathname === '/reports/requests') return jsonResponse(200, { data: requestReportFixture })
      if (url.pathname === '/reports/workflow-duration') return jsonResponse(200, { data: workflowDurationFixture })
      if (url.pathname === '/departments') return jsonResponse(200, { data: departmentFixture })
      if (url.pathname === '/reports/requests/export/pdf') {
        await exportPromise
        return new Response('%PDF-1.3', { status: 200, headers: { 'Content-Type': 'application/pdf' } })
      }
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderPage()

    await screen.findByText('Total Requests')
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Generating PDF…' })).toBeDisabled())
    expect(screen.getByRole('button', { name: 'Export Excel' })).toBeDisabled()

    resolveExport?.()
    await waitFor(() => expect(clickSpy).toHaveBeenCalled())
    clickSpy.mockRestore()
  })

  it('a failed PDF export renders a controlled error message', async () => {
    stubFetch((url) => {
      if (url.pathname === '/reports/requests') return jsonResponse(200, { data: requestReportFixture })
      if (url.pathname === '/reports/workflow-duration') return jsonResponse(200, { data: workflowDurationFixture })
      if (url.pathname === '/departments') return jsonResponse(200, { data: departmentFixture })
      if (url.pathname === '/reports/requests/export/pdf') return errorResponse(413, 'EXPORT_TOO_LARGE', 'Too many requests for a PDF.')
      return errorResponse(404, 'NOT_FOUND', 'not found')
    })
    renderPage()

    await screen.findByText('Total Requests')
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests for a PDF.')
  })
})

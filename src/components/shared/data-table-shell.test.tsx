import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataTableShell } from './data-table-shell'

describe('DataTableShell responsive mode', () => {
  it('keeps table semantics while exposing labels for the mobile card layout', () => {
    render(
      <DataTableShell mobileCards>
        <thead><tr><th>Title</th><th>Status</th></tr></thead>
        <tbody><tr><td data-label="Title">Laptop request</td><td data-label="Status">Pending</td></tr></tbody>
      </DataTableShell>
    )

    expect(screen.getByRole('table')).toHaveClass('responsive-data-table')
    expect(screen.getByRole('cell', { name: 'Laptop request' })).toHaveAttribute('data-label', 'Title')
    expect(screen.getByRole('cell', { name: 'Pending' })).toHaveAttribute('data-label', 'Status')
  })
})

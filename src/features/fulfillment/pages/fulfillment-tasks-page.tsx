import { Link, useSearchParams } from 'react-router-dom'
import { AppShell, type AppShellUser } from '@/app/layout/app-shell'
import { Badge } from '@/components/shared/badge'
import { DataTableShell } from '@/components/shared/data-table-shell'
import { PageHeader } from '@/components/shared/page-header'
import type { NavItemConfig } from '@/lib/mock/navigation'
import { RequestTableStatus } from '@/features/requests/components/request-table-status'
import { formatRequestAmount } from '@/features/requests/lib/format-request-amount'
import { requestTypeLabels } from '@/features/requests/types/request'
import { useFulfillmentsQuery } from '../hooks/use-fulfillment'
import { fulfillmentStatusLabels, fulfillmentStatusVariants } from '../types/fulfillment'
import type { FulfillmentListFilters } from '../api/fulfillment-query-keys'

interface FulfillmentTasksPageProps {
  user: AppShellUser
  navItems: NavItemConfig[]
  onLogout?: () => void
}

const PAGE_SIZE = 20
const COLUMN_COUNT = 7

type TabKey = 'mine' | 'needs-owner' | 'all-open'

const TABS: Record<TabKey, { label: string; filters: Pick<FulfillmentListFilters, 'view' | 'state'>; adminOnly: boolean }> = {
  mine: { label: 'My tasks', filters: { view: 'assigned', state: 'open' }, adminOnly: false },
  'needs-owner': { label: 'Needs an owner', filters: { view: 'unassigned', state: 'open' }, adminOnly: true },
  'all-open': { label: 'All open', filters: { view: 'all', state: 'open' }, adminOnly: true },
}

// Work waiting to be carried out after approval. Everyone sees their own tasks;
// an Admin additionally sees what has no owner yet and everything still open.
// The tab choice is only navigation: the server refuses the Admin views to
// anyone else, so a hand-edited URL shows an error, never someone else's tasks.
export function FulfillmentTasksPage({ user, navItems, onLogout }: FulfillmentTasksPageProps) {
  const isAdmin = user.role === 'Admin'
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('tab') as TabKey | null
  const tab: TabKey = requested && requested in TABS && (isAdmin || !TABS[requested].adminOnly) ? requested : 'mine'
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const query = useFulfillmentsQuery({ page, pageSize: PAGE_SIZE, ...TABS[tab].filters })
  const visibleTabs = (Object.keys(TABS) as TabKey[]).filter((key) => isAdmin || !TABS[key].adminOnly)

  return (
    <AppShell user={user} navItems={navItems} activeKey="fulfillment" onLogout={onLogout}>
      <PageHeader
        title="Fulfillment"
        subtitle="Approved requests waiting to be carried out. Approval says a request is allowed; fulfillment records that someone did it."
      />

      {visibleTabs.length > 1 ? (
        <div className="tabs" role="tablist" aria-label="Fulfillment views">
          {visibleTabs.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={key === tab}
              className={`tab${key === tab ? ' active' : ''}`}
              onClick={() => setSearchParams(key === 'mine' ? {} : { tab: key })}
            >
              <span>{TABS[key].label}</span>
              {key === tab && query.data ? <span className="tab-count">{query.data.meta.total}</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      <DataTableShell mobileCards>
        <thead>
          <tr>
            <th>Request #</th>
            <th>Request</th>
            <th>Requester</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <RequestTableStatus
            colSpan={COLUMN_COUNT}
            isLoading={query.isPending}
            isError={query.isError}
            error={query.error}
            onRetry={() => void query.refetch()}
            isEmpty={query.isSuccess && query.data.data.length === 0}
            loadingLabel="Loading fulfillment tasks…"
            errorTitle="Couldn't load fulfillment tasks"
            genericErrorMessage="Something went wrong loading fulfillment tasks."
            emptyTitle={tab === 'needs-owner' ? 'Nothing is waiting for an owner' : 'No open fulfillment tasks'}
            emptyBody={
              tab === 'mine'
                ? 'Approved requests assigned to you to carry out will show up here.'
                : 'Approved requests that still have to be carried out will show up here.'
            }
          />
          {query.data?.data.map((item) => (
            <tr key={item.id}>
              <td className="cell-mono" data-label="Request #">{item.request.requestNumber}</td>
              <td className="cell-primary" data-label="Request">{item.request.title}</td>
              <td className="cell-secondary" data-label="Requester">{item.request.createdBy.name}</td>
              <td className="cell-secondary" data-label="Type">{requestTypeLabels[item.request.type]}</td>
              <td className="cell-primary" data-label="Amount">{formatRequestAmount(item.request.amount)}</td>
              <td data-label="Status">
                <Badge variant={fulfillmentStatusVariants[item.status]}>{fulfillmentStatusLabels[item.status]}</Badge>
                <div className="approval-step-meta">{item.assignee ? item.assignee.name : 'Unassigned'}</div>
              </td>
              <td data-label="Action">
                <div className="row-action">
                  <Link to={`/requests/${item.request.id}`} className="btn btn-primary btn-sm">
                    Open
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTableShell>
    </AppShell>
  )
}

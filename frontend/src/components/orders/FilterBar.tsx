import { Search } from 'lucide-react'
import { ORDER_STATUS_META, ORDER_STATUSES, type OrderListFilters } from '@/types/order'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  filters: OrderListFilters
  counts: Partial<Record<OrderListFilters['status'], number>>
  onStatusChange: (status: OrderListFilters['status']) => void
  onQueryChange: (query: string) => void
}

const TABS: { key: OrderListFilters['status']; label: string }[] = [
  { key: 'all', label: 'Усі' },
  ...ORDER_STATUSES.map((status) => ({ key: status, label: ORDER_STATUS_META[status].label })),
]

export function FilterBar({ filters, counts, onStatusChange, onQueryChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0" role="tablist" aria-label="Фільтр за статусом">
        {TABS.map((tab) => {
          const active = filters.status === tab.key
          const count = counts[tab.key]
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStatusChange(tab.key)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-ink text-surface'
                  : 'text-ink-soft hover:bg-paper',
              )}
            >
              {tab.label}
              {typeof count === 'number' && (
                <span className={cn('ml-1.5 tabular-nums', active ? 'text-surface/70' : 'text-ink-faint')}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <label className="relative w-full sm:w-72">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Номер замовлення, компанія, контакт"
          className="w-full rounded-lg border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-action focus:bg-surface focus:outline-none"
          aria-label="Пошук за замовленнями"
        />
      </label>
    </div>
  )
}

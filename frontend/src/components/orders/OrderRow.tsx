import { RotateCcw } from 'lucide-react'
import type { Order } from '@/types/order'
import { StatusBadge } from './StatusBadge'
import { formatMoney, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface OrderRowProps {
  order: Order
  isSelected: boolean
  onOpen: (orderId: string) => void
}

export function OrderRow({ order, isSelected, onOpen }: OrderRowProps) {
  const contactName = [order.contact.firstName, order.contact.lastName].filter(Boolean).join(' ')

  return (
    <li
      className={cn(
        'grid grid-cols-1 items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 sm:grid-cols-[7rem_1fr_9rem_6rem_5rem] sm:px-6',
        isSelected && 'bg-action-soft/60',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold tabular-nums text-ink">
          #{order.number.replace('B2B-', '')}
        </span>
        {order.isReorder && (
          <span title="Повторне замовлення" className="text-ink-faint">
            <RotateCcw size={13} aria-hidden />
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{order.company.legalName}</p>
        <p className="truncate text-xs text-ink-faint">
          {contactName}
          {order.contact.username ? ` · @${order.contact.username}` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between sm:block sm:text-right">
        <span className="text-xs text-ink-faint sm:hidden">Сума</span>
        <p className="text-sm font-semibold tabular-nums text-ink">
          {formatMoney(order.itemsTotal, order.currency)}
        </p>
        <p className="text-xs text-ink-faint">{order.items.length} поз.</p>
      </div>

      <div className="flex items-center justify-between sm:block">
        <StatusBadge status={order.status} />
        <p className="mt-1 hidden text-xs text-ink-faint sm:block">
          {formatRelativeTime(order.createdAt)}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onOpen(order.id)}
          className="w-full rounded-lg bg-action px-3 py-2 text-sm font-semibold text-surface transition-colors hover:bg-action-hover sm:w-auto"
        >
          Відкрити
        </button>
      </div>
    </li>
  )
}

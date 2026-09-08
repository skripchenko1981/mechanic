import { PackageX, AlertTriangle } from 'lucide-react'
import type { Order } from '@/types/order'
import { OrderRow } from './OrderRow'

interface OrderListProps {
  orders: Order[]
  status: 'idle' | 'loading' | 'error' | 'ready'
  error: string | null
  selectedOrderId: string | null
  onOpen: (orderId: string) => void
  onRetry: () => void
}

function SkeletonRow() {
  return (
    <li className="grid grid-cols-1 items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 sm:grid-cols-[7rem_1fr_9rem_6rem_5rem] sm:px-6">
      <div className="h-4 w-16 animate-pulse rounded bg-line" />
      <div className="space-y-1.5">
        <div className="h-4 w-40 animate-pulse rounded bg-line" />
        <div className="h-3 w-24 animate-pulse rounded bg-line" />
      </div>
      <div className="hidden h-4 w-20 animate-pulse rounded bg-line sm:block" />
      <div className="hidden h-6 w-20 animate-pulse rounded-full bg-line sm:block" />
      <div className="hidden h-8 w-20 animate-pulse rounded-lg bg-line sm:block" />
    </li>
  )
}

export function OrderList({ orders, status, error, selectedOrderId, onOpen, onRetry }: OrderListProps) {
  if (status === 'loading' && orders.length === 0) {
    return (
      <ul>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </ul>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <AlertTriangle size={28} className="text-danger" aria-hidden />
        <p className="text-sm font-semibold text-ink">Не удалось загрузить заказы</p>
        <p className="max-w-sm text-sm text-ink-faint">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
        >
          Повторить попытку
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <PackageX size={28} className="text-ink-faint" aria-hidden />
        <p className="text-sm font-semibold text-ink">Заказов не найдено</p>
        <p className="max-w-sm text-sm text-ink-faint">
          Измените фильтр или запрос поиска — новые заказы от клиентов из Telegram появятся здесь автоматически.
        </p>
      </div>
    )
  }

  return (
    <ul>
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          isSelected={order.id === selectedOrderId}
          onOpen={onOpen}
        />
      ))}
    </ul>
  )
}

import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useOrdersStore, startOrderPolling } from '@/store/ordersStore'
import { FilterBar } from '@/components/orders/FilterBar'
import { OrderList } from '@/components/orders/OrderList'
import { OrderDetailPanel } from '@/components/orders/OrderDetailPanel'
import type { OrderListFilters } from '@/types/order'

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { orders, filters, status, error, selectedOrderId, fetchOrders, setStatusFilter, setQuery, selectOrder } =
    useOrdersStore()

  useEffect(() => {
    void fetchOrders()
    return startOrderPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deep-linkable selection, e.g. shared from a Telegram admin notification.
  useEffect(() => {
    const openId = searchParams.get('open')
    if (openId) selectOrder(openId)
  }, [searchParams, selectOrder])

  const counts = useMemo(() => {
    const result: Partial<Record<OrderListFilters['status'], number>> = { all: orders.length }
    for (const order of orders) {
      result[order.status] = (result[order.status] ?? 0) + 1
    }
    return result
  }, [orders])

  function handleOpen(orderId: string) {
    selectOrder(orderId)
    setSearchParams({ open: orderId })
  }

  function handleClose() {
    selectOrder(null)
    searchParams.delete('open')
    setSearchParams(searchParams)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line bg-surface px-4 py-5 sm:px-6">
        <h1 className="text-xl font-extrabold tracking-tight text-ink">Нові замовлення</h1>
        <p className="mt-0.5 text-sm text-ink-faint">
          Замовлення з Telegram-бота оновлюються автоматично кожні 15 секунд.
        </p>
      </div>

      <FilterBar
        filters={filters}
        counts={counts}
        onStatusChange={setStatusFilter}
        onQueryChange={setQuery}
      />

      <div className="flex-1 overflow-y-auto">
        <OrderList
          orders={orders}
          status={status}
          error={error}
          selectedOrderId={selectedOrderId}
          onOpen={handleOpen}
          onRetry={fetchOrders}
        />
      </div>

      <OrderDetailPanel orderId={selectedOrderId} onClose={handleClose} />
    </div>
  )
}

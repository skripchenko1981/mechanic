import { create } from 'zustand'
import { ApiError } from '@/lib/api/client'
import { listOrders, updateOrderStatus as apiUpdateStatus } from '@/lib/api/orders'
import type { Order, OrderListFilters, OrderStatus } from '@/types/order'

interface OrdersState {
  orders: Order[]
  total: number
  filters: OrderListFilters
  status: 'idle' | 'loading' | 'error' | 'ready'
  error: string | null
  selectedOrderId: string | null
  fetchOrders: () => Promise<void>
  setStatusFilter: (status: OrderListFilters['status']) => void
  setQuery: (query: string) => void
  selectOrder: (orderId: string | null) => void
  transitionOrder: (orderId: string, status: OrderStatus, note?: string) => Promise<void>
}

let pollHandle: ReturnType<typeof setInterval> | null = null

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  total: 0,
  filters: { status: 'all', query: '' },
  status: 'idle',
  error: null,
  selectedOrderId: null,

  fetchOrders: async () => {
    const { filters } = get()
    set({ status: get().orders.length ? get().status : 'loading', error: null })
    try {
      const { orders, total } = await listOrders({ ...filters, pageSize: 50 })
      set({ orders, total, status: 'ready' })
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось загрузить заказы'
      set({ status: 'error', error: message })
    }
  },

  setStatusFilter: (status) => {
    set((state) => ({ filters: { ...state.filters, status } }))
    void get().fetchOrders()
  },

  setQuery: (query) => {
    set((state) => ({ filters: { ...state.filters, query } }))
    void get().fetchOrders()
  },

  selectOrder: (orderId) => set({ selectedOrderId: orderId }),

  transitionOrder: async (orderId, status, note) => {
    const previous = get().orders
    // Optimistic update so the operator sees the change instantly; rolled
    // back if the API rejects the transition (e.g. illegal state change).
    set({
      orders: previous.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    })
    try {
      const updated = await apiUpdateStatus(orderId, status, note)
      set((state) => ({
        orders: state.orders.map((order) => (order.id === orderId ? updated : order)),
      }))
    } catch (error) {
      set({ orders: previous })
      throw error
    }
  },
}))

/** Starts background polling for new orders; call once from the app root. */
export function startOrderPolling(intervalMs = 15_000): () => void {
  if (pollHandle) clearInterval(pollHandle)
  pollHandle = setInterval(() => {
    void useOrdersStore.getState().fetchOrders()
  }, intervalMs)
  return () => {
    if (pollHandle) clearInterval(pollHandle)
    pollHandle = null
  }
}

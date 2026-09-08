import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/api/orders', () => ({
  listOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
}))

import { listOrders, updateOrderStatus } from '@/lib/api/orders'
import { useOrdersStore } from './ordersStore'
import type { Order } from '@/types/order'

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord_1',
    number: 'B2B-00001',
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currency: 'RUB',
    contact: { telegramUserId: 1, username: 'a', firstName: 'A', lastName: null, chatId: 1 },
    company: { id: 'c1', legalName: 'ООО Тест', inn: null, deliveryAddress: 'Адрес', contactPhone: null },
    items: [],
    itemsTotal: 0,
    comment: null,
    history: [{ status: 'new', occurredAt: new Date().toISOString(), actor: 'bot' }],
    isReorder: false,
    sourceOrderId: null,
    ...overrides,
  }
}

describe('useOrdersStore', () => {
  beforeEach(() => {
    vi.mocked(listOrders).mockReset()
    vi.mocked(updateOrderStatus).mockReset()
    useOrdersStore.setState({
      orders: [],
      total: 0,
      filters: { status: 'all', query: '' },
      status: 'idle',
      error: null,
      selectedOrderId: null,
    })
  })

  it('fetchOrders populates orders on success', async () => {
    const order = makeOrder()
    vi.mocked(listOrders).mockResolvedValue({ orders: [order], total: 1 })

    await useOrdersStore.getState().fetchOrders()

    expect(useOrdersStore.getState().orders).toEqual([order])
    expect(useOrdersStore.getState().status).toBe('ready')
  })

  it('fetchOrders surfaces an error state on failure', async () => {
    vi.mocked(listOrders).mockRejectedValue(new Error('boom'))

    await useOrdersStore.getState().fetchOrders()

    expect(useOrdersStore.getState().status).toBe('error')
    expect(useOrdersStore.getState().error).toBeTruthy()
  })

  it('transitionOrder optimistically updates then reconciles with the API response', async () => {
    const order = makeOrder({ status: 'new' })
    useOrdersStore.setState({ orders: [order] })
    const updated = { ...order, status: 'confirmed' as const }
    vi.mocked(updateOrderStatus).mockResolvedValue(updated)

    await useOrdersStore.getState().transitionOrder('ord_1', 'confirmed')

    expect(useOrdersStore.getState().orders[0].status).toBe('confirmed')
  })

  it('transitionOrder rolls back on API failure', async () => {
    const order = makeOrder({ status: 'new' })
    useOrdersStore.setState({ orders: [order] })
    vi.mocked(updateOrderStatus).mockRejectedValue(new Error('rejected transition'))

    await expect(useOrdersStore.getState().transitionOrder('ord_1', 'confirmed')).rejects.toThrow()
    expect(useOrdersStore.getState().orders[0].status).toBe('new')
  })
})

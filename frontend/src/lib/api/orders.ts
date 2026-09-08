/**
 * API contract for orders. This is the boundary the backend team implements
 * against — every endpoint here corresponds to a documented REST route on
 * the API service (see architecture diagram in the project README):
 *
 *   Frontend ↕ API ↕ Database ↕ Redis/Workers ↕ Telegram Bot API ↕ Admin Panel
 *
 * The frontend only depends on this module, never on `fetch` directly, so
 * swapping transport (e.g. adding websockets for live order push) touches
 * one file.
 */

import { apiRequest } from './client'
import {
  USE_MOCK_API,
  mockGetOrder,
  mockListOrders,
  mockSendReorderLink,
  mockUpdateOrderStatus,
} from './mockAdapter'
import type {
  Order,
  OrderListFilters,
  OrderListResponse,
  OrderStatus,
} from '@/types/order'

export interface ListOrdersParams extends Partial<OrderListFilters> {
  page?: number
  pageSize?: number
}

function buildQuery(params: ListOrdersParams): string {
  const search = new URLSearchParams()
  if (params.status && params.status !== 'all') search.set('status', params.status)
  if (params.query) search.set('query', params.query)
  search.set('page', String(params.page ?? 1))
  search.set('pageSize', String(params.pageSize ?? 25))
  return search.toString()
}

/** GET /orders — paginated, filterable order list. */
export async function listOrders(params: ListOrdersParams = {}): Promise<OrderListResponse> {
  if (USE_MOCK_API) return mockListOrders(params)
  return apiRequest<OrderListResponse>(`/orders?${buildQuery(params)}`)
}

/** GET /orders/:id — full order detail, including items and status history. */
export async function getOrder(orderId: string): Promise<Order> {
  if (USE_MOCK_API) return mockGetOrder(orderId)
  return apiRequest<Order>(`/orders/${orderId}`)
}

/**
 * PATCH /orders/:id/status — transition an order's status.
 * The API is the source of truth for legal transitions; the frontend does
 * not attempt to duplicate that state machine, it just surfaces the error
 * returned when a transition is rejected.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
): Promise<Order> {
  if (USE_MOCK_API) return mockUpdateOrderStatus(orderId, status)
  return apiRequest<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status, note },
  })
}

/**
 * POST /orders/:id/reorder-link — asks the API to have the Telegram bot
 * send the customer a one-tap "repeat this order" message in their chat.
 * Returns the deep link so the operator can also copy/share it directly.
 */
export async function sendReorderLink(orderId: string): Promise<{ deepLink: string }> {
  if (USE_MOCK_API) return mockSendReorderLink(orderId)
  return apiRequest<{ deepLink: string }>(`/orders/${orderId}/reorder-link`, {
    method: 'POST',
  })
}

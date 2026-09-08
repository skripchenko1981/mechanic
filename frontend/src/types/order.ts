/**
 * Domain types for the B2B order management frontend.
 *
 * These mirror the API contract documented in `src/lib/api/orders.ts`.
 * Keep this file the single source of truth for the shape of an order —
 * every component, store, and test imports from here rather than
 * redefining fields locally.
 */

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export const ORDER_STATUSES: OrderStatus[] = [
  'new',
  'confirmed',
  'processing',
  'shipped',
  'completed',
  'cancelled',
]

export interface OrderStatusLabel {
  status: OrderStatus
  label: string
  /** Tailwind color token suffix used by <StatusBadge>, e.g. 'amber' */
  tone: 'amber' | 'blue' | 'violet' | 'teal' | 'green' | 'red'
}

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusLabel> = {
  new: { status: 'new', label: 'Новий', tone: 'amber' },
  confirmed: { status: 'confirmed', label: 'Підтверджено', tone: 'blue' },
  processing: { status: 'processing', label: 'У збірці', tone: 'violet' },
  shipped: { status: 'shipped', label: 'Відвантажено', tone: 'teal' },
  completed: { status: 'completed', label: 'Завершено', tone: 'green' },
  cancelled: { status: 'cancelled', label: 'Скасовано', tone: 'red' },
}

/** The customer as identified through the Telegram bot conversation. */
export interface TelegramContact {
  telegramUserId: number
  username: string | null
  firstName: string
  lastName: string | null
  /** Chat id used to push status updates / reorder links back to the customer. */
  chatId: number
}

export interface Company {
  id: string
  legalName: string
  inn: string | null
  /** Free-text delivery address collected during checkout. */
  deliveryAddress: string
  contactPhone: string | null
}

export interface OrderLineItem {
  id: string
  sku: string
  title: string
  unit: string
  quantity: number
  unitPrice: number
  /** quantity * unitPrice, kept explicit so the UI never recomputes money. */
  lineTotal: number
}

export interface OrderStatusEvent {
  status: OrderStatus
  occurredAt: string // ISO 8601
  actor: 'bot' | 'manager' | 'system'
  note?: string
}

export interface Order {
  id: string
  /** Human-facing order number, e.g. "B2B-00125". */
  number: string
  status: OrderStatus
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  currency: 'RUB' | 'UAH' | 'EUR' | 'USD'
  contact: TelegramContact
  company: Company
  items: OrderLineItem[]
  itemsTotal: number
  comment: string | null
  history: OrderStatusEvent[]
  /** True when this order was created via the "repeat order" shortcut. */
  isReorder: boolean
  sourceOrderId: string | null
}

export interface OrderListFilters {
  status: OrderStatus | 'all'
  query: string
}

export interface OrderListResponse {
  orders: Order[]
  total: number
}

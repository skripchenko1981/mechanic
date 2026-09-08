/**
 * Mock adapter used only when VITE_USE_MOCK_API=true (see `.env.example`).
 *
 * Ships with the same signatures as the real API module in `orders.ts` so
 * the app is fully explorable without a backend during frontend
 * development, and switching to the real API later is a one-line change
 * (remove the env flag) — no component or store code changes.
 */

import type { Order, OrderListResponse, OrderStatus } from '@/types/order'
import type { ListOrdersParams } from './orders'

function iso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString()
}

const mockOrders: Order[] = [
  {
    id: 'ord_125',
    number: 'B2B-00125',
    status: 'new',
    createdAt: iso(6),
    updatedAt: iso(6),
    currency: 'RUB',
    contact: {
      telegramUserId: 501234,
      username: 'zakupki_sv',
      firstName: 'Светлана',
      lastName: 'Ковалёва',
      chatId: 501234,
    },
    company: {
      id: 'cmp_10',
      legalName: 'ООО «ТоргСнаб»',
      inn: '7701234567',
      deliveryAddress: 'Москва, Складской пр-д, 4, корп. 2',
      contactPhone: '+7 916 000-11-22',
    },
    items: [
      { id: 'li_1', sku: 'PKG-045', title: 'Плёнка стрейч 500мм', unit: 'рулон', quantity: 40, unitPrice: 620, lineTotal: 24800 },
      { id: 'li_2', sku: 'PKG-012', title: 'Скотч упаковочный 48мм', unit: 'шт', quantity: 120, unitPrice: 55, lineTotal: 6600 },
    ],
    itemsTotal: 31400,
    comment: 'Нужна доставка до пятницы',
    history: [{ status: 'new', occurredAt: iso(6), actor: 'bot' }],
    isReorder: false,
    sourceOrderId: null,
  },
  {
    id: 'ord_126',
    number: 'B2B-00126',
    status: 'new',
    createdAt: iso(22),
    updatedAt: iso(22),
    currency: 'RUB',
    contact: {
      telegramUserId: 501987,
      username: null,
      firstName: 'Игорь',
      lastName: 'Петренко',
      chatId: 501987,
    },
    company: {
      id: 'cmp_22',
      legalName: 'ИП Петренко И.В.',
      inn: '772345678901',
      deliveryAddress: 'Санкт-Петербург, ул. Заставская, 22',
      contactPhone: '+7 921 555-77-33',
    },
    items: [
      { id: 'li_3', sku: 'PKG-003', title: 'Коробка гофро 300×200×200', unit: 'шт', quantity: 200, unitPrice: 38, lineTotal: 7600 },
    ],
    itemsTotal: 7600,
    comment: null,
    history: [{ status: 'new', occurredAt: iso(22), actor: 'bot' }],
    isReorder: true,
    sourceOrderId: 'ord_098',
  },
  {
    id: 'ord_127',
    number: 'B2B-00127',
    status: 'new',
    createdAt: iso(41),
    updatedAt: iso(41),
    currency: 'RUB',
    contact: {
      telegramUserId: 502044,
      username: 'trade_maxim',
      firstName: 'Максим',
      lastName: 'Орлов',
      chatId: 502044,
    },
    company: {
      id: 'cmp_31',
      legalName: 'ООО «Орлов и Ко»',
      inn: '7809876543',
      deliveryAddress: 'Екатеринбург, ул. Фронтовых бригад, 14',
      contactPhone: '+7 343 200-10-00',
    },
    items: [
      { id: 'li_4', sku: 'PKG-045', title: 'Плёнка стрейч 500мм', unit: 'рулон', quantity: 15, unitPrice: 620, lineTotal: 9300 },
      { id: 'li_5', sku: 'PKG-060', title: 'Паллетный уголок картонный', unit: 'шт', quantity: 80, unitPrice: 27, lineTotal: 2160 },
      { id: 'li_6', sku: 'PKG-012', title: 'Скотч упаковочный 48мм', unit: 'шт', quantity: 60, unitPrice: 55, lineTotal: 3300 },
    ],
    itemsTotal: 14760,
    comment: 'Позвоните перед доставкой',
    history: [{ status: 'new', occurredAt: iso(41), actor: 'bot' }],
    isReorder: false,
    sourceOrderId: null,
  },
  {
    id: 'ord_118',
    number: 'B2B-00118',
    status: 'processing',
    createdAt: iso(60 * 5),
    updatedAt: iso(40),
    currency: 'RUB',
    contact: { telegramUserId: 500111, username: 'olga_snab', firstName: 'Ольга', lastName: 'Дёмина', chatId: 500111 },
    company: { id: 'cmp_08', legalName: 'ООО «СтройРезерв»', inn: '7712345098', deliveryAddress: 'Казань, Технопарк, 9', contactPhone: '+7 917 333-22-11' },
    items: [{ id: 'li_7', sku: 'PKG-003', title: 'Коробка гофро 300×200×200', unit: 'шт', quantity: 500, unitPrice: 38, lineTotal: 19000 }],
    itemsTotal: 19000,
    comment: null,
    history: [
      { status: 'new', occurredAt: iso(60 * 5), actor: 'bot' },
      { status: 'confirmed', occurredAt: iso(60 * 4), actor: 'manager' },
      { status: 'processing', occurredAt: iso(40), actor: 'manager' },
    ],
    isReorder: false,
    sourceOrderId: null,
  },
  {
    id: 'ord_099',
    number: 'B2B-00099',
    status: 'completed',
    createdAt: iso(60 * 24 * 3),
    updatedAt: iso(60 * 24 * 2),
    currency: 'RUB',
    contact: { telegramUserId: 500777, username: 'zakupki_sv', firstName: 'Светлана', lastName: 'Ковалёва', chatId: 500777 },
    company: { id: 'cmp_10', legalName: 'ООО «ТоргСнаб»', inn: '7701234567', deliveryAddress: 'Москва, Складской пр-д, 4, корп. 2', contactPhone: '+7 916 000-11-22' },
    items: [{ id: 'li_8', sku: 'PKG-045', title: 'Плёнка стрейч 500мм', unit: 'рулон', quantity: 30, unitPrice: 620, lineTotal: 18600 }],
    itemsTotal: 18600,
    comment: null,
    history: [
      { status: 'new', occurredAt: iso(60 * 24 * 3), actor: 'bot' },
      { status: 'confirmed', occurredAt: iso(60 * 24 * 3 - 30), actor: 'manager' },
      { status: 'processing', occurredAt: iso(60 * 24 * 2 - 120), actor: 'manager' },
      { status: 'shipped', occurredAt: iso(60 * 24 * 2 - 60), actor: 'manager' },
      { status: 'completed', occurredAt: iso(60 * 24 * 2), actor: 'manager' },
    ],
    isReorder: false,
    sourceOrderId: null,
  },
]

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function mockListOrders(params: ListOrdersParams): Promise<OrderListResponse> {
  let filtered = mockOrders
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((o) => o.status === params.status)
  }
  if (params.query) {
    const q = params.query.toLowerCase()
    filtered = filtered.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.company.legalName.toLowerCase().includes(q) ||
        `${o.contact.firstName} ${o.contact.lastName ?? ''}`.toLowerCase().includes(q),
    )
  }
  return delay({ orders: filtered, total: filtered.length })
}

export async function mockGetOrder(orderId: string): Promise<Order> {
  const found = mockOrders.find((o) => o.id === orderId)
  if (!found) throw new Error('Order not found')
  return delay(found)
}

export async function mockUpdateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const order = mockOrders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  order.status = status
  order.updatedAt = new Date().toISOString()
  order.history = [...order.history, { status, occurredAt: order.updatedAt, actor: 'manager' }]
  return delay(order)
}

export async function mockSendReorderLink(orderId: string): Promise<{ deepLink: string }> {
  return delay({ deepLink: `https://t.me/your_b2b_bot?start=reorder_${orderId}` })
}

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

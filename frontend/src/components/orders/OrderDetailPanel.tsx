import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Phone, MapPin, Send, Copy, Check, Loader2 } from 'lucide-react'
import type { Order, OrderStatus } from '@/types/order'
import { getOrder, sendReorderLink } from '@/lib/api/orders'
import { useOrdersStore } from '@/store/ordersStore'
import { StatusBadge } from './StatusBadge'
import { StatusTimeline } from './StatusTimeline'
import { formatDateTime, formatMoney } from '@/lib/utils'

interface OrderDetailPanelProps {
  orderId: string | null
  onClose: () => void
}

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  new: { status: 'confirmed', label: 'Подтвердить заказ' },
  confirmed: { status: 'processing', label: 'Начать сборку' },
  processing: { status: 'shipped', label: 'Отметить отгрузку' },
  shipped: { status: 'completed', label: 'Завершить заказ' },
}

const CANCELLABLE: OrderStatus[] = ['new', 'confirmed', 'processing']

export function OrderDetailPanel({ orderId, onClose }: OrderDetailPanelProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [reorderLink, setReorderLink] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const transitionOrder = useOrdersStore((state) => state.transitionOrder)

  useEffect(() => {
    if (!orderId) {
      setOrder(null)
      setReorderLink(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setActionError(null)
    getOrder(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data)
      })
      .catch(() => {
        if (!cancelled) setActionError('Не удалось загрузить заказ')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [orderId])

  async function handleTransition(status: OrderStatus) {
    if (!order) return
    setTransitioning(true)
    setActionError(null)
    try {
      await transitionOrder(order.id, status)
      const refreshed = await getOrder(order.id)
      setOrder(refreshed)
    } catch {
      setActionError('Не удалось изменить статус заказа. Попробуйте ещё раз.')
    } finally {
      setTransitioning(false)
    }
  }

  async function handleSendReorderLink() {
    if (!order) return
    try {
      const { deepLink } = await sendReorderLink(order.id)
      setReorderLink(deepLink)
    } catch {
      setActionError('Не удалось отправить ссылку клиенту')
    }
  }

  function handleCopyLink() {
    if (!reorderLink) return
    void navigator.clipboard.writeText(reorderLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 1800)
  }

  const isOpen = Boolean(orderId)
  const nextAction = order ? NEXT_STATUS[order.status] : undefined
  const canCancel = order ? CANCELLABLE.includes(order.status) : false

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={order ? `Заказ ${order.number}` : 'Заказ'}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-surface shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-xs font-medium text-ink-faint">Заказ</p>
                <h2 className="font-mono text-lg font-bold tabular-nums text-ink">
                  {order?.number ?? '—'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-ink-soft hover:bg-paper"
                aria-label="Закрыть панель заказа"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {loading && (
                <div className="flex items-center justify-center py-16 text-ink-faint">
                  <Loader2 size={22} className="animate-spin" aria-hidden />
                </div>
              )}

              {!loading && order && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={order.status} />
                    <p className="text-xs text-ink-faint">{formatDateTime(order.createdAt)}</p>
                  </div>

                  <section aria-labelledby="detail-company">
                    <h3 id="detail-company" className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      Клиент
                    </h3>
                    <p className="text-sm font-semibold text-ink">{order.company.legalName}</p>
                    {order.company.inn && <p className="text-xs text-ink-faint">ИНН {order.company.inn}</p>}
                    <p className="mt-2 text-sm text-ink-soft">
                      {[order.contact.firstName, order.contact.lastName].filter(Boolean).join(' ')}
                      {order.contact.username && (
                        <a
                          href={`https://t.me/${order.contact.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1.5 text-action hover:underline"
                        >
                          @{order.contact.username}
                        </a>
                      )}
                    </p>
                    <div className="mt-2 space-y-1 text-sm text-ink-soft">
                      <p className="flex items-start gap-2">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-ink-faint" aria-hidden />
                        {order.company.deliveryAddress}
                      </p>
                      {order.company.contactPhone && (
                        <p className="flex items-center gap-2">
                          <Phone size={15} className="shrink-0 text-ink-faint" aria-hidden />
                          {order.company.contactPhone}
                        </p>
                      )}
                    </div>
                  </section>

                  <section aria-labelledby="detail-items">
                    <h3 id="detail-items" className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      Позиции заказа
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-line">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-line bg-paper text-left text-xs text-ink-faint">
                            <th className="px-3 py-2 font-medium">Товар</th>
                            <th className="px-3 py-2 text-right font-medium">Кол-во</th>
                            <th className="px-3 py-2 text-right font-medium">Сумма</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-b border-line last:border-0">
                              <td className="px-3 py-2">
                                <p className="text-ink">{item.title}</p>
                                <p className="text-xs text-ink-faint">{item.sku}</p>
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums text-ink-soft">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums text-ink">
                                {formatMoney(item.lineTotal, order.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="px-3 py-2 text-sm font-semibold text-ink" colSpan={2}>
                              Итого
                            </td>
                            <td className="px-3 py-2 text-right text-sm font-bold tabular-nums text-ink">
                              {formatMoney(order.itemsTotal, order.currency)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    {order.comment && (
                      <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-sm text-ink-soft">
                        «{order.comment}»
                      </p>
                    )}
                  </section>

                  <section aria-labelledby="detail-history">
                    <h3 id="detail-history" className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      История статуса
                    </h3>
                    <StatusTimeline history={order.history} />
                  </section>

                  <section aria-labelledby="detail-reorder">
                    <h3 id="detail-reorder" className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      Повторный заказ
                    </h3>
                    <p className="mb-2 text-sm text-ink-soft">
                      Отправьте клиенту в Telegram кнопку «Повторить заказ» — он сможет оформить те же позиции в один тап.
                    </p>
                    {!reorderLink ? (
                      <button
                        type="button"
                        onClick={handleSendReorderLink}
                        className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-3.5 py-2 text-sm font-medium text-ink hover:bg-paper"
                      >
                        <Send size={15} aria-hidden />
                        Отправить ссылку клиенту
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2">
                        <code className="flex-1 truncate text-xs text-ink-soft">{reorderLink}</code>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="shrink-0 rounded-md p-1.5 text-ink-soft hover:bg-surface"
                          aria-label="Скопировать ссылку"
                        >
                          {linkCopied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                        </button>
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>

            {order && (nextAction || canCancel) && (
              <div className="space-y-2 border-t border-line px-5 py-4">
                {actionError && <p className="text-sm text-danger">{actionError}</p>}
                <div className="flex gap-2">
                  {canCancel && (
                    <button
                      type="button"
                      disabled={transitioning}
                      onClick={() => handleTransition('cancelled')}
                      className="flex-1 rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper disabled:opacity-50"
                    >
                      Отменить
                    </button>
                  )}
                  {nextAction && (
                    <button
                      type="button"
                      disabled={transitioning}
                      onClick={() => handleTransition(nextAction.status)}
                      className="flex-[2] rounded-lg bg-action px-4 py-2.5 text-sm font-semibold text-surface hover:bg-action-hover disabled:opacity-50"
                    >
                      {transitioning ? 'Сохранение…' : nextAction.label}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

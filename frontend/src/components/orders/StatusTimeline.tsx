import { ORDER_STATUS_META, type OrderStatusEvent } from '@/types/order'
import { formatDateTime } from '@/lib/utils'

const ACTOR_LABEL: Record<OrderStatusEvent['actor'], string> = {
  bot: 'Telegram-бот',
  manager: 'Менеджер',
  system: 'Система',
}

interface StatusTimelineProps {
  history: OrderStatusEvent[]
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  return (
    <ol className="space-y-0">
      {history.map((event, index) => {
        const isLast = index === history.length - 1
        return (
          <li key={`${event.status}-${event.occurredAt}`} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span className="absolute left-[5px] top-3 h-full w-px bg-line" aria-hidden />
            )}
            <span className="relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-action bg-surface" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{ORDER_STATUS_META[event.status].label}</p>
              <p className="text-xs text-ink-faint">
                {formatDateTime(event.occurredAt)} · {ACTOR_LABEL[event.actor]}
              </p>
              {event.note && <p className="mt-0.5 text-xs text-ink-soft">{event.note}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

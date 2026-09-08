import { ORDER_STATUS_META, type OrderStatus } from '@/types/order'
import { cn } from '@/lib/utils'

const toneClasses: Record<string, string> = {
  amber: 'bg-attention-soft text-attention-strong',
  blue: 'bg-info-soft text-info',
  violet: 'bg-progress-soft text-progress',
  teal: 'bg-transit-soft text-transit',
  green: 'bg-success-soft text-success',
  red: 'bg-danger-soft text-danger',
}

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = ORDER_STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        toneClasses[meta.tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  )
}

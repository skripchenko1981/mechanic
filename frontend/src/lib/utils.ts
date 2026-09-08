import { type ClassValue, clsx } from 'clsx'

/** Thin wrapper around clsx so components import one helper for class merging. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

const currencyFormatters: Partial<Record<string, Intl.NumberFormat>> = {}

export function formatMoney(amount: number, currency: string): string {
  if (!currencyFormatters[currency]) {
    currencyFormatters[currency] = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
  }
  return currencyFormatters[currency]!.format(amount)
}

const relativeFormatter = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })

export function formatRelativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60_000)

  if (Math.abs(diffMinutes) < 60) return relativeFormatter.format(diffMinutes, 'minute')
  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return relativeFormatter.format(diffHours, 'hour')
  const diffDays = Math.round(diffHours / 24)
  return relativeFormatter.format(diffDays, 'day')
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

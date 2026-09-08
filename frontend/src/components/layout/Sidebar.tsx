import { NavLink } from 'react-router-dom'
import { PackageSearch, LayoutGrid, Users2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Замовлення', icon: PackageSearch },
  { to: '/catalog', label: 'Каталог', icon: LayoutGrid },
  { to: '/clients', label: 'Клієнти', icon: Users2 },
  { to: '/settings', label: 'Налаштування', icon: Settings },
]

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  return (
    <nav className={cn('flex flex-col gap-1 p-3', className)} aria-label="Основна навігація">
      <div className="mb-4 px-3 pt-2">
        <p className="text-sm font-extrabold tracking-tight text-ink">ПИВО МЕХАНІК</p>
        <p className="text-xs text-ink-faint">B2B · панель замовлень</p>
      </div>
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-action-soft hover:text-action-hover',
              isActive && 'bg-action-soft text-action-hover',
            )
          }
        >
          <Icon size={18} strokeWidth={2} aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

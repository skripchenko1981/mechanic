import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[1440px]">
        {/* Desktop rail */}
        <aside className="hidden w-60 shrink-0 border-r border-line lg:block">
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                aria-hidden
              />
              <motion.div
                className="fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-xl lg:hidden"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.2 }}
              >
                <div className="flex justify-end p-2">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-md p-2 text-ink-soft hover:bg-paper"
              aria-label="Закрити меню"
                  >
                    <X size={20} />
                  </button>
                </div>
                <Sidebar onNavigate={() => setDrawerOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-md p-2 text-ink-soft hover:bg-paper"
              aria-label="Відкрити меню"
            >
              <Menu size={20} />
            </button>
            <p className="text-sm font-extrabold tracking-tight">ПИВО МЕХАНІК</p>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}

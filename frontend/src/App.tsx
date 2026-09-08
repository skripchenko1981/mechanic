import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { OrdersPage } from '@/pages/OrdersPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OrdersPage />} />
        <Route
          path="/catalog"
          element={
            <PlaceholderPage
              title="Каталог"
              description="Керування сортами, залишками та B2B-цінами доступне після підключення сервісу каталогу."
            />
          }
        />
        <Route
          path="/clients"
          element={
            <PlaceholderPage
              title="Клієнти"
              description="Компанії-партнери, контакти й історія їхніх замовлень з’являться тут."
            />
          }
        />
        <Route
          path="/settings"
          element={
            <PlaceholderPage
              title="Налаштування"
              description="Налаштування Telegram-бота, сповіщень та доступу операторів з’являться тут."
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path={ROUTES.PARKING_ENTRY} element={<Placeholder title="Vehicle Entry" />} />
        <Route path={ROUTES.PARKING_EXIT} element={<Placeholder title="Vehicle Exit" />} />
        <Route path={ROUTES.VEHICLES} element={<Placeholder title="Vehicles" />} />
        <Route path={ROUTES.CUSTOMERS} element={<Placeholder title="Customers" />} />
        <Route path={ROUTES.RATES} element={<Placeholder title="Rate Management" />} />
        <Route path={ROUTES.PARKING_LOT} element={<Placeholder title="Parking Lot Configuration" />} />
        <Route path={ROUTES.REPORTS} element={<Placeholder title="Reports" />} />
        <Route path={ROUTES.USERS} element={<Placeholder title="User Management" />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-lg text-gray-500">{title} — coming soon</p>
    </div>
  )
}

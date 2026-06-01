import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { Permission } from '@/config/permissions'

interface NavItem {
  label: string
  path: string
  permission?: Permission
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD },
  { label: 'Entry', path: ROUTES.PARKING_ENTRY, permission: 'parking:entry:create' },
  { label: 'Exit', path: ROUTES.PARKING_EXIT, permission: 'parking:exit:create' },
  { label: 'Vehicles', path: ROUTES.VEHICLES, permission: 'vehicles:manage' },
  { label: 'Customers', path: ROUTES.CUSTOMERS, permission: 'customers:manage' },
  { label: 'Rates', path: ROUTES.RATES, permission: 'rates:manage' },
  { label: 'Parking Lot', path: ROUTES.PARKING_LOT },
  { label: 'Reports', path: ROUTES.REPORTS, permission: 'reports:view' },
  { label: 'Users', path: ROUTES.USERS, permission: 'users:manage' },
]

export function DashboardLayout() {
  const { user, signOut, hasPermission } = useAuth()
  console.log('User permissions:', user)

  return (
    <div className="flex h-dvh">
      <aside className="flex w-64 flex-col border-r bg-white">
        <div className="flex h-14 items-center border-b px-4 font-bold text-gray-900">
          Parking System
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => {
            if (item.permission && !hasPermission(item.permission)) return null
            return (
              <NavLink
                key={item.path}
                to={item.path} 
                end={item.path === ROUTES.DASHBOARD}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="border-t p-4">
          <div className="mb-2 text-sm text-gray-500">{user?.displayName}</div>
          <button
            onClick={signOut} 
            className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  )
}

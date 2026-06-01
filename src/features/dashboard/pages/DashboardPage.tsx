import { useAuth } from '@/features/auth/hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome, {user?.displayName ?? 'User'}. Select a section from the sidebar.
      </p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}

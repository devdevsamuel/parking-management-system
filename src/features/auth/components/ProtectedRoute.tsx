import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { Permission } from '@/config/permissions'

interface ProtectedRouteProps {
  requiredPermission?: Permission
  children: ReactNode
}

export function ProtectedRoute({ requiredPermission, children }: ProtectedRouteProps) {
  const { user, loading, hasPermission } = useAuth()

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

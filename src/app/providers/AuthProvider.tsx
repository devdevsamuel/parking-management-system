import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { signIn, signOut, onAuthChanged, loadUserRole } from '@/services/auth'
import { ROLE_PERMISSIONS } from '@/config/permissions'
import type { Permission } from '@/config/permissions'
import type { AppUser } from '@/types/user'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let aborted = false

    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (aborted) return

      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const appUser = await loadUserRole(firebaseUser.uid)
        if (aborted) return

        if (!appUser) {
          setUser(null)
        } else {
          setUser(appUser)
        }
      } catch (error) {
        if (!aborted) setUser(null)
        if (!aborted) console.error('Failed to load user role:', error)
      } finally {
        if (!aborted) setLoading(false)
      }
    })

    return () => {
      aborted = true
      unsubscribe()
    }
  }, [])

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    await signOut()
  }, [])

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      console.log('Checking permission:', permission, 'for user:', user)
      if (!user) return false
      const permissions = ROLE_PERMISSIONS[user.role]
      return permissions.includes(permission)
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: handleSignIn,
      signOut: handleSignOut,
      hasPermission,
    }),
    [user, loading, handleSignIn, handleSignOut, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

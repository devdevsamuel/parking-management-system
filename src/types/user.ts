import type { Timestamp } from 'firebase/firestore'
import type { UserRole } from '@/config/permissions'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  isActive: boolean
  createdAt: Timestamp
}

import type { Timestamp } from 'firebase/firestore'

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

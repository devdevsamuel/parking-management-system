import type { Timestamp } from 'firebase/firestore'
import type { VehicleType } from './vehicle'

export interface ParkingLotConfig {
  id: string
  name: string
  timezone: string
  lostTicketFee: number
  slots: Record<VehicleType, number>
  updatedAt: Timestamp
  updatedBy: string
}

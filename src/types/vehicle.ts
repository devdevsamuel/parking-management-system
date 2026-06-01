import type { Timestamp } from 'firebase/firestore'

export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'bus'

export interface Vehicle {
  id: string
  plate: string
  plateLower: string
  vehicleType: VehicleType
  customerId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

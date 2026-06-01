import type { Timestamp } from 'firebase/firestore'
import type { VehicleType } from './vehicle'

export interface PricingRule {
  type: 'daily_max' | 'overnight' | 'flat_rate' | 'custom'
  value: number
  conditions?: Record<string, unknown>
}

export interface Rate {
  id: string
  vehicleType: VehicleType
  description: string
  isActive: boolean
  firstHourPrice: number
  additionalHourPrice: number
  gracePeriodMinutes: number
  pricingRules: PricingRule[]
  updatedAt: Timestamp
}

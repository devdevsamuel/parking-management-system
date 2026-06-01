import type { Timestamp } from 'firebase/firestore'
import type { VehicleType } from './vehicle'
import type { PricingRule } from './rate'

export type ParkingStatus = 'active' | 'completed'

export interface RateSnapshot {
  rateId: string
  rateDescription: string
  firstHourPrice: number
  additionalHourPrice: number
  gracePeriodMinutes: number
  pricingRules: PricingRule[]
}

export interface AppliedRule {
  ruleKey: string
  label: string
  amount: number
}

export interface CalculationDetails {
  totalMinutes: number
  billableHours: number
  gracePeriodMinutes: number
  wasWithinGracePeriod: boolean
  appliedRules: AppliedRule[]
  calculatedAmount: number
  finalAmount: number
}

export interface PaymentInfo {
  amount: number
  method: 'cash'
  processedAt: Timestamp
  processedBy: string
}

export interface ParkingEntry {
  id: string
  vehicleId: string
  customerId: string
  vehicleSnapshot: {
    plate: string
    vehicleType: VehicleType
  }
  customerSnapshot: {
    name: string
    phone: string
  }
  rateSnapshot: RateSnapshot
  entryTime: Timestamp
  exitTime: Timestamp | null
  status: ParkingStatus
  totalAmount: number | null
  calculationDetails: CalculationDetails | null
  payment: PaymentInfo | null
  createdBy: string
  processedBy: string | null
  lostTicket: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

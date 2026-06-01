# Firestore Schema

## Collection Overview

| Collection | Documents | Purpose |
|---|---|---|
| `customers` | One per customer | Customer master data |
| `vehicles` | One per vehicle | Vehicle registry, linked to customer |
| `parkingEntries` | One per parking session | Entry/exit records with snapshots |
| `activeEntries` | One per actively parked vehicle | Lookup guard for active sessions |
| `rates` | One per vehicle type (4 total) | Pricing configuration |
| `parkingLotConfig` | Singleton (1 document) | Lot configuration |
| `users` | One per system user | Auth-linked user profile and role |

---

## `customers`

**Purpose:** Stores customer information. A customer owns one or more vehicles. Separating customers from vehicles prevents data duplication when a customer has multiple vehicles.

**Document ID:** Auto-generated (`customerId`)

**Fields:**

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| `name` | string | Yes | No | Customer full name |
| `phone` | string | Yes | No | Customer contact phone |
| `email` | string | No | Yes | Customer email (optional) |
| `createdAt` | Timestamp | Yes | No | Document creation timestamp |
| `updatedAt` | Timestamp | Yes | No | Document last update timestamp |

**TypeScript interface:**

```typescript
interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Relationships:**
- One-to-many with `vehicles` (via `vehicles.customerId`)

**Query patterns:**
- Search by name or phone
- List all customers (paginated)

**Index recommendations:**
- No composite indexes needed for basic queries

---

## `vehicles`

**Purpose:** Stores vehicle information linked to a customer. The `plateLower` field exists specifically for case-insensitive plate search, which is a known Firestore limitation.

**Document ID:** Auto-generated (`vehicleId`)

**Fields:**

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| `plate` | string | Yes | No | License plate (as entered) |
| `plateLower` | string | Yes | No | Lowercased plate for case-insensitive search |
| `vehicleType` | `'car' \| 'motorcycle' \| 'truck' \| 'bus'` | Yes | No | Vehicle category |
| `customerId` | string | Yes | No | Reference to `customers` document ID |
| `createdAt` | Timestamp | Yes | No | Document creation timestamp |
| `updatedAt` | Timestamp | Yes | No | Document last update timestamp |

**TypeScript interface:**

```typescript
interface Vehicle {
  id: string
  plate: string
  plateLower: string
  vehicleType: VehicleType
  customerId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Relationships:**
- Many-to-one with `customers` (via `customerId`)

**Query patterns:**
- Search by `plateLower` (case-insensitive)
- List vehicles by `customerId`
- Check if vehicle already has active entry (via `activeEntries`)

**Index recommendations:**
- `plateLower` ascending (single field)

---

## `parkingEntries`

**Purpose:** The core document of the system. Records every parking session from entry through exit, including all historical snapshots needed for audit and reporting.

**Document ID:** Auto-generated (`entryId`)

**Fields:**

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| `vehicleId` | string | Yes | No | Reference to `vehicles` document ID |
| `customerId` | string | Yes | No | Reference to `customers` document ID |
| `vehicleSnapshot` | object | Yes | No | Historical copy of vehicle data at entry time |
| `vehicleSnapshot.plate` | string | Yes | No | License plate at time of entry |
| `vehicleSnapshot.vehicleType` | VehicleType | Yes | No | Vehicle type at time of entry |
| `customerSnapshot` | object | Yes | No | Historical copy of customer data at entry time |
| `customerSnapshot.name` | string | Yes | No | Customer name at time of entry |
| `customerSnapshot.phone` | string | Yes | No | Customer phone at time of entry |
| `rateSnapshot` | object | Yes | No | Historical copy of rate at entry time |
| `rateSnapshot.rateId` | string | Yes | No | Rate document ID at time of entry |
| `rateSnapshot.rateDescription` | string | Yes | No | Rate description at time of entry |
| `rateSnapshot.firstHourPrice` | number | Yes | No | First hour price at time of entry |
| `rateSnapshot.additionalHourPrice` | number | Yes | No | Additional hour price at time of entry |
| `rateSnapshot.gracePeriodMinutes` | number | Yes | No | Grace period at time of entry |
| `rateSnapshot.pricingRules` | PricingRule[] | Yes | No | Active pricing rules at time of entry |
| `entryTime` | Timestamp | Yes | No | Vehicle entry timestamp |
| `exitTime` | Timestamp | No | Yes | Vehicle exit timestamp (null if active) |
| `status` | `'active' \| 'completed'` | Yes | No | Current parking session status |
| `totalAmount` | number | No | Yes | Calculated fee (null if active) |
| `calculationDetails` | object | No | Yes | Fee calculation breakdown (null if active) |
| `calculationDetails.totalMinutes` | number | Yes | No | Wall-clock duration in minutes |
| `calculationDetails.billableHours` | number | Yes | No | Hours charged after grace period |
| `calculationDetails.gracePeriodMinutes` | number | Yes | No | Grace period applied |
| `calculationDetails.wasWithinGracePeriod` | boolean | Yes | No | True if no charge |
| `calculationDetails.appliedRules` | AppliedRule[] | Yes | No | Each rule that contributed to total |
| `calculationDetails.calculatedAmount` | number | Yes | No | Sum of applied rules |
| `calculationDetails.finalAmount` | number | Yes | No | Final charged amount |
| `payment` | object | No | Yes | Payment information (null if active) |
| `payment.amount` | number | Yes | No | Amount collected |
| `payment.method` | `'cash'` | Yes | No | Payment method (cash for MVP) |
| `payment.processedAt` | Timestamp | Yes | No | When payment was processed |
| `payment.processedBy` | string | Yes | No | Operator UID who processed payment |
| `createdBy` | string | Yes | No | Operator UID who created entry |
| `processedBy` | string | No | Yes | Operator UID who processed exit |
| `lostTicket` | boolean | Yes | No | True if processed as lost ticket |
| `createdAt` | Timestamp | Yes | No | Document creation timestamp |
| `updatedAt` | Timestamp | Yes | No | Document last update timestamp |

**TypeScript interfaces:**

```typescript
interface ParkingEntry {
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
```

**Relationships:**
- Many-to-one with `vehicles` (via `vehicleId`)
- Many-to-one with `customers` (via `customerId`)
- One-to-one with `activeEntries` (via `vehicleSnapshot.plate` → `activeEntries` document ID)
- Payment is embedded (no separate collection)

**Query patterns:**
- Active entries by status (`status == 'active'`)
- History by vehicle plate (`vehicleSnapshot.plate`)
- History by date range (`entryTime`)
- History by operator (`createdBy`)
- Revenue aggregation (`totalAmount`, `entryTime`)

**Index recommendations:**

| Query | Index |
|---|---|
| Active entries (dashboard) | `(status: ASC, entryTime: DESC)` |
| Vehicle entries by plate | `(vehicleSnapshot.plate: ASC, entryTime: DESC)` |
| Entries by date | `(entryTime: DESC)` |
| Entries by operator | `(createdBy: ASC, entryTime: DESC)` |
| Revenue by vehicle type | `(vehicleSnapshot.vehicleType: ASC, entryTime: DESC)` |

---

## `activeEntries`

**Purpose:** Atomic lock mechanism to ensure a vehicle can only have one active parking session. The document ID is `plateLower` for fast lookups. This prevents two operators from simultaneously creating entries for the same vehicle.

**Document ID:** `plateLower` (lowercased plate string)

**Fields:**

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| `entryId` | string | Yes | No | Reference to `parkingEntries` document ID |
| `vehicleType` | VehicleType | Yes | No | Vehicle type for reference |
| `createdAt` | Timestamp | Yes | No | Lock creation timestamp |

**TypeScript interface:**

```typescript
// Defined locally in parking feature (not in shared types)
interface ActiveEntry {
  entryId: string
  vehicleType: VehicleType
  createdAt: Timestamp
}
```

**Query patterns:**
- Check if plate has active entry (`getDoc` by document ID)
- List all active entries (for recovery/cleanup)

**Lifecycle:**
1. Created atomically during entry workflow via `setDoc(docRef, data, { merge: false })`
2. Deleted after exit transaction succeeds
3. If deletion fails (stale lock), cleaned up during next entry attempt for that plate

---

## `rates`

**Purpose:** Stores pricing configuration per vehicle type. Document IDs are vehicle type names, ensuring one rate per type.

**Document ID:** `vehicleType` (string: `'car' | 'motorcycle' | 'truck' | 'bus'`)

**Fields:**

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| `vehicleType` | VehicleType | Yes | No | Vehicle category (matches document ID) |
| `description` | string | Yes | No | Human-readable rate description |
| `isActive` | boolean | Yes | No | Whether this rate is currently in use |
| `firstHourPrice` | number | Yes | No | Price for the first hour |
| `additionalHourPrice` | number | Yes | No | Price for each additional hour |
| `gracePeriodMinutes` | number | Yes | No | Free period before billing starts |
| `pricingRules` | PricingRule[] | Yes | No | Extensible array of additional pricing rules |
| `updatedAt` | Timestamp | Yes | No | Last update timestamp |

**TypeScript interfaces:**

```typescript
interface Rate {
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

interface PricingRule {
  type: 'daily_max' | 'overnight' | 'flat_rate' | 'custom'
  value: number
  conditions?: Record<string, unknown>
}
```

**Index recommendations:**
- No composite indexes needed (queried by document ID)

---

## `parkingLotConfig`

**Purpose:** Singleton document storing parking lot configuration. Only one document exists in this collection.

**Document ID:** `"config"` (fixed string)

**Fields:**

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| `name` | string | Yes | No | Parking lot display name |
| `timezone` | string | Yes | No | IANA timezone (default: `America/Bogota`) |
| `lostTicketFee` | number | Yes | No | Flat fee for lost tickets |
| `slots` | Record | Yes | No | Configured slot counts per vehicle type |
| `slots.car` | number | Yes | No | Total car slots |
| `slots.motorcycle` | number | Yes | No | Total motorcycle slots |
| `slots.truck` | number | Yes | No | Total truck slots |
| `slots.bus` | number | Yes | No | Total bus slots |
| `updatedAt` | Timestamp | Yes | No | Last update timestamp |
| `updatedBy` | string | Yes | No | Admin UID who last updated |

**TypeScript interface:**

```typescript
interface ParkingLotConfig {
  id: string
  name: string
  timezone: string
  lostTicketFee: number
  slots: Record<VehicleType, number>
  updatedAt: Timestamp
  updatedBy: string
}
```

**Index recommendations:**
- No indexes needed (singleton document, always fetched by known ID)

---

## `users`

**Purpose:** Stores user profile information and role. Synced with Firebase Authentication users. Firestore is the authoritative source for roles.

**Document ID:** Firebase Authentication UID (`uid`)

**Fields:**

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| `email` | string | Yes | No | User email |
| `displayName` | string | Yes | No | User display name |
| `role` | `'admin' \| 'operator'` | Yes | No | System role |
| `isActive` | boolean | Yes | No | Whether user account is enabled |
| `createdAt` | Timestamp | Yes | No | Account creation timestamp |

**TypeScript interface:**

```typescript
interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  isActive: boolean
  createdAt: Timestamp
}
```

**Index recommendations:**
- No composite indexes needed (queried by document ID)

---

## Snapshot Strategy

Snapshots are embedded in `ParkingEntry` to preserve historical accuracy. Without snapshots, changing a vehicle plate, customer name, or pricing rate would retroactively alter completed parking records. This would break audit trails, invoices, and reports.

### Why each snapshot is justified:

| Snapshot | Cost (per entry) | Value |
|---|---|---|
| `vehicleSnapshot` | ~50 bytes | Plate/type changes don't alter historical records |
| `customerSnapshot` | ~50 bytes | Name/phone changes don't retroactively alter past sessions |
| `rateSnapshot` | ~150 bytes | Rate changes don't retroactively change what was billed |
| `calculationDetails` | ~200 bytes | Proves how fee was computed; prevents disputes |

Total overhead: ~450 bytes per entry. At 36,000 entries/year (~16 MB), the cost is approximately $0.003/year at Firestore pricing. The audit value vastly exceeds the storage cost.

## Why Payment Is Embedded

Payment information is stored inside `ParkingEntry.payment` rather than in a separate `payments` collection.

**Rationale:**
- Every exit produces exactly one payment — there is no one-to-many relationship that would justify a separate collection
- Exit workflow becomes a single-document update instead of a multi-document transaction
- Payment queries (history, revenue) are queries on `parkingEntries`, not a separate collection
- When payment gateways are added later, the embedded object can be extended with new fields

**Trade-off accepted:** Reporting queries scanning all entries also scan the embedded payment data. For MVP scale (thousands of entries), this is negligible.

## Why Payments Collection Was Removed

During architecture review, a separate `payments` collection was considered and rejected for MVP:

- **More complex exit workflow:** Required multi-document transaction (entry + payment)
- **More Firestore collections:** 7 collections instead of 6
- **More writes per exit:** 2 writes instead of 1
- **No MVP benefit:** Cash-first system with simple payment model doesn't need a separate collection
- **Migration easy later:** An embedded field can be promoted to a separate collection without data loss

## Why Occupancy Is Derived Instead of Persisted

During architecture review, a persisted occupancy counter in `parkingLotConfig.currentOccupancy` was considered and rejected:

- **Entry is always allowed** regardless of occupancy — no need for transactional counter accuracy
- **Derived from query** is simpler and avoids write contention on a counter document
- **Counter accuracy** is only needed for informational dashboard display — a query is sufficient
- **No write hotspot** — the config document is not updated on every entry/exit

## Data Ownership Rules

| Document | Owner | Created By | Modified By |
|---|---|---|---|
| `customers` | System | Operator | Operator |
| `vehicles` | System | Operator | Operator |
| `parkingEntries` | System | Operator (entry) | Operator (exit) |
| `activeEntries` | System | Entry workflow | Exit workflow |
| `rates` | System | Admin | Admin |
| `parkingLotConfig` | System | Admin | Admin |
| `users` | System | Admin (Firebase Console) | Admin (Firebase Console) |

## Referential Relationships

```
customers 1 ──── * vehicles  (customerId)
customers 1 ──── * parkingEntries  (customerId)
vehicles 1 ──── * parkingEntries  (vehicleId)
activeEntries 1 ──── 1 parkingEntries  (entryId → parkingEntry doc ID)
rates 1 ──── * parkingEntries  (rateSnapshot.rateId → rate doc ID)
users 1 ──── * parkingEntries  (createdBy / processedBy → user uid)
```

Note: Firestore does not enforce foreign key constraints. Referential integrity is maintained at the application layer.

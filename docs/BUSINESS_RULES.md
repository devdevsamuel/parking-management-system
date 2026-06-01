# Business Rules

## Occupancy

| Rule | Value |
|---|---|
| Occupancy tracking | Informational only, not restrictive |
| Entry when lot is full | Always allowed |
| Over-capacity | Permitted |
| Available slots calculation | `configuredSlots - occupiedSpots` (may be negative) |
| Occupancy source | Derived from querying active parking entries |
| Occupancy storage | Not persisted in any document; computed on demand |
| Dashboard display | Configured capacity, occupied spaces, available spaces, over-capacity amount |

The system must always allow creating a parking entry regardless of configured slot counts. Real-world parking lots may temporarily operate above capacity. Parking capacity is a monitoring tool, not an enforcement mechanism.

## Payments

| Rule | Value |
|---|---|
| MVP payment method | Cash only |
| Payment storage | Embedded in `ParkingEntry.payment` |
| Dedicated payments collection | No — removed during architecture simplification |
| Payment gateway | Not integrated in MVP |
| Refund workflow | Postponed (post-MVP) |
| Chargeback handling | Postponed (post-MVP) |
| Payment reconciliation | Postponed (post-MVP) |
| Payment history | Viewed via completed parking entries |
| Payment methods type | `'cash'` (union type extendable to `'card' | 'bank_transfer' | 'digital_wallet'` post-MVP) |

Every completed parking session must generate a payment record embedded in the ParkingEntry document. Payment information includes: amount, method (cash), processed timestamp, and operator who processed the payment.

## Pricing

| Rule | Value |
|---|---|
| First hour price | Per vehicle type, configurable |
| Additional hour price | Per vehicle type, configurable |
| Grace period | Per vehicle type, configurable (minutes) |
| Rate changes apply to | New entries only (rate snapshot at entry) |
| Rate changes do NOT affect | Active or completed parking sessions |
| Pricing rules | Extensible via `pricingRules[]` array on Rate |
| Rule types supported | `daily_max | overnight | flat_rate | custom` |

Rate snapshots are captured at entry time and stored inside the ParkingEntry document. Fee calculation always reads from `rateSnapshot`, never from the live `rates` collection. This ensures that rate changes between entry and exit do not retroactively alter the fee.

## Historical Data

| Snapshot | Stored In | Purpose |
|---|---|---|
| Vehicle snapshot | `ParkingEntry.vehicleSnapshot` | Preserves plate and vehicle type at entry time |
| Customer snapshot | `ParkingEntry.customerSnapshot` | Preserves customer name and phone at entry time |
| Rate snapshot | `ParkingEntry.rateSnapshot` | Preserves pricing configuration at entry time |
| Calculation details | `ParkingEntry.calculationDetails` | Preserves how the fee was computed |

Reports and invoices must use snapshots and calculation details rather than current live data. Historical records must remain valid even if vehicle, customer, or rate data changes later.

## Authentication

| Rule | Value |
|---|---|
| Auth provider | Firebase Authentication |
| Auth method | Email/password |
| Role storage | Firestore `users/{uid}` document |
| Role source of truth | Firestore (not Firebase Custom Claims) |
| Role loading | After authentication, before granting access |
| Inactive users | `isActive = false` → access denied |

## Authorization

| Permission | Admin | Operator |
|---|---|---|
| `users:manage` | Yes | No |
| `rates:manage` | Yes | No |
| `reports:view` | Yes | No |
| `parking:entry:create` | Yes | Yes |
| `parking:exit:create` | Yes | Yes |
| `customers:manage` | Yes | Yes |
| `vehicles:manage` | Yes | Yes |

## Parking Entry

| Rule | Value |
|---|---|
| Active entry per vehicle | Maximum one active entry per vehicle |
| Entry guard | Atomic lock via `activeEntries/{plateLower}` document |
| Entry rejection | "Vehicle already has an active parking session" |
| Entry always allowed | Regardless of slot capacity |
| Lock document stored in | `activeEntries` collection |
| Lock removal | Deleted after exit transaction succeeds |

## Parking Exit

| Rule | Value |
|---|---|
| Idempotency guard | Check `status === 'active'` before processing |
| Exit atomicity | Single-document Firestore transaction on ParkingEntry |
| Fee calculation source | `rateSnapshot` (embedded, not live rate) |
| Fee calculation method | Pure function `feeCalculator(rateSnapshot, entryTime, exitTime)` |
| Payment creation | Embedded in ParkingEntry during same transaction |
| Lock cleanup | `activeEntries/{plateLower}` deleted after transaction |
| Stale lock handling | Next entry attempt checks and cleans stale locks |

## Lost Tickets

| Rule | Value |
|---|---|
| MVP status | Approved policy defined, implementation postponed |
| Fee | Flat fee stored in `parkingLotConfig.lostTicketFee` |
| Authorization | Admin only |
| Payment | Cash only |
| Record flag | `ParkingEntry.lostTicket: boolean` |

Default lost ticket fee for MVP: $50.00 (configurable in parkingLotConfig).

## Reports

| Requirement | Approach |
|---|---|
| Data source | Firestore documents |
| Aggregation | Client-side |
| Cloud Functions | None |
| BigQuery | None |
| MVP scale | Client-side aggregation is sufficient for tens of thousands of documents |
| First optimization path | Write-time aggregation via Cloud Function (post-MVP) |

## MVP Constraints

| Constraint | Rule |
|---|---|
| Parking lots | Single location |
| Backend architecture | Firebase-only — no custom backend server |
| Server code | No Cloud Functions, no Node.js backend |
| Payment processing | Cash only — no payment gateway |
| Occupancy enforcement | Never block entry regardless of capacity |
| User management | Admin creates users via Firebase Console (post-MVP: Cloud Function) |
| Reporting | Client-side aggregation only |
| Transaction scope | Single-document transactions only |
| Timezone | America/Bogota (single timezone, hardcoded) |

## Assumptions Challenged During Architecture Review

1. **Firebase Auth can manage users from the frontend** — Cannot create other users without Admin SDK. Solution: Firebase Console for user creation (MVP), Cloud Function (post-MVP).
2. **Occupancy can be derived from a COUNT query** — Can, but loses transactional safety. Accepted for MVP since occupancy is informational only.
3. **Parking entries can live in one collection forever** — At high scale, partitioning needed. Single collection is fine for MVP traffic.
4. **Firestore can handle reporting aggregation** — Cannot do server-side SUM/GROUP BY. Client-side aggregation accepted for MVP.
5. **Vehicle plate search will just work** — Firestore queries are case-sensitive. Solution: store `plateLower` field from day one.
6. **Timezone is a display concern** — Also a data concern for daily report cutoffs. Solution: store timezone in `parkingLotConfig`.

## Operational Rules

- **Operating hours**: 24/7 (no entry/exit restrictions)
- **Overnight stays**: Per-hour model covers this naturally. Daily max pricing rule available.
- **Refund workflow**: Postponed. Cash-first MVP: manual refund if needed.
- **Voided payments**: Not supported in MVP. If exit fails mid-process, admin can re-process.
- **Timezone**: America/Bogota. Stored in `parkingLotConfig.timezone`, all UI converted to this timezone.
- **Vehicle validation**: Case-insensitive plate search via `plateLower` field.

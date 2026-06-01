# Roadmap

## Milestone Overview

```
Phase 1-3  [COMPLETED]  Foundation, Auth, Login/Core Nav
─────────────────────────────────────────────────────
Phase 4    [NEXT]       Shared UI Component Library
Phase 5                 Rates and Parking Lot Configuration
Phase 6                 Customer and Vehicle Management
Phase 7                 Parking Entry Workflow
Phase 8                 Parking Exit Workflow
Phase 9                 Dashboard
Phase 10                Reports
Phase 11                User Management (Admin)
─────────────────────────────────────────────────────
Phase 12+  [POST-MVP]   Gateway Integrations, Scaling, Advanced Features
```

**MVP Milestone** = Phases 3 through 10 deliverable as a working system.
**Post-MVP Milestone** = Phase 12+ items are identified, not scheduled.

---

## Phase 1 — Foundation Setup

**Status:** ✅ Completed

| Aspect | Detail |
|---|---|
| Goal | Scaffold the project, install dependencies, configure TypeScript, Tailwind, Firebase, folder structure, and domain types |
| Complexity | Low |
| Dependencies | None |
| Risk | Low — standard Vite + React scaffolding |

---

## Phase 2 — Authentication Foundation

**Status:** ✅ Completed

| Aspect | Detail |
|---|---|
| Goal | Permission system, Firebase Auth wrapper, AuthProvider context, useAuth hook, ProtectedRoute guard |
| Complexity | Medium |
| Dependencies | firebase, react-router-dom |
| Risk | Low — well-understood React Context pattern |

---

## Phase 3 — Login Page and Core Navigation

**Status:** ✅ Completed

| Aspect | Detail |
|---|---|
| Goal | Wire up the first user-facing page (login), establish the layout shell (AuthLayout for login, DashboardLayout for authenticated routes), and set up the route definitions |
| Complexity | Medium |
| Dependencies | None beyond what is installed |

### Features

- Login page with email/password form
- AuthLayout — centered layout for unauthenticated pages
- DashboardLayout — sidebar navigation with permission-filtered nav items, user info, sign-out
- AppRouter — route definitions with nested layout routes and ProtectedRoute wrappers
- Spinner — shared loading component extracted to `components/ui/`
- Firebase project configured — Authentication enabled, Firestore security rules set, user document created
- End-to-end login flow verified — signIn → onAuthChanged → loadUserRole → ProtectedRoute grants access

### Files Created

```
src/features/auth/pages/LoginPage.tsx       # Login form + useAuth().signIn + redirect
src/layouts/AuthLayout.tsx                  # Centered card layout for login
src/layouts/DashboardLayout.tsx             # Sidebar + Outlet layout route
src/routes/AppRouter.tsx                    # Route definitions with nested layout routes
src/components/ui/Spinner.tsx               # Shared spinner component (sm/md/lg)
src/features/dashboard/pages/DashboardPage.tsx  # Dashboard welcome placeholder
```

### Files Modified

```
src/App.tsx            # Replaced placeholder with AppRouter
.env                   # Created with real Firebase project credentials
```

### Risks

| Risk | Mitigation |
|---|---|
| Login cannot be tested without a real Firebase project | Firebase project was created; `.env` populated with real credentials |
| Sidebar navigation will reference pages that don't exist yet | Route stubs with "coming soon" placeholder pages |
| Redirect to `/login` with no login page breaks the app | LoginPage built first within this phase |

### Acceptance Criteria

- [x] Unauthenticated user is redirected to `/login`
- [x] Login form validates email and password fields (HTML5 `required`)
- [x] Login form shows loading state during sign-in (Spinner in button)
- [x] Login form shows error message on invalid credentials
- [x] Authenticated user is redirected to `/` (dashboard)
- [x] DashboardLayout shows user display name
- [x] DashboardLayout sign-out button works
- [x] Sidebar shows navigation links filtered by `hasPermission`
- [ ] Routes use direct imports (not `React.lazy`) — acceptable for MVP; can be added later if bundle size becomes a concern

---

## Phase 4 — Shared UI Component Library

**Status:** ⬜ Pending

| Aspect | Detail |
|---|---|
| Goal | Build the reusable component primitives that every feature will consume. Prevents each feature from re-implementing common UI patterns |
| Complexity | Medium |
| Dependencies | None |

### Features

- Button (variants: primary, secondary, danger; sizes: sm, md, lg)
- Input (with label, error state, icon support)
- Select (with label, options, error state)
- Table (responsive, sortable columns, loading skeleton)
- Modal (overlay, close on Escape, focus trap)
- Card (padding variants, header/footer slots)
- Badge (color variants for status display)
- Spinner (already exists from Phase 3 — update ProtectedRoute to use it)

### Files to Create

```
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/Select.tsx
src/components/ui/Table.tsx
src/components/ui/Modal.tsx
src/components/ui/Card.tsx
src/components/ui/Badge.tsx
src/components/ui/index.ts          # Barrel export
```

### Files to Modify

```
src/features/auth/components/ProtectedRoute.tsx   # Replace inline spinner with shared <Spinner />
```

### Risks

| Risk | Mitigation |
|---|---|
| Over-engineering components with too many variants | Start with only the variants needed by upcoming phases; extend later |
| Styling inconsistencies with Tailwind | Define a consistent color/ spacing scale early |

### Acceptance Criteria

- [ ] Each component is typed with `interface ComponentNameProps`
- [ ] Components accept `className` for style overrides
- [ ] Components are documented with usage examples (minimal JSDoc)
- [ ] Barrell export from `src/components/ui/index.ts`
- [ ] ProtectedRoute uses shared Spinner instead of inline

---

## Phase 5 — Rates and Parking Lot Configuration

**Status:** ⬜ Pending

| Aspect | Detail |
|---|---|
| Goal | Allow administrators to configure pricing rates per vehicle type and parking lot settings (slot counts, lost ticket fee, timezone). These configurations are prerequisites for parking entry and dashboard |
| Complexity | Low |
| Dependencies | Phase 3 (navigation), Phase 4 (UI components) |

### Features

- Rate list page — shows all 4 vehicle type rates
- Rate form — edit first hour price, additional hour price, grace period, pricing rules
- Parking lot config page — edit slot counts, name, lost ticket fee
- API files for Firestore CRUD operations on `rates` and `parkingLotConfig`
- Admin-only access (requires `rates:manage` permission)

### Files to Create

```
src/features/rates/api/ratesApi.ts              # getRate, updateRate Firestore operations
src/features/rates/hooks/useRates.ts            # Rate data fetching/updating hook
src/features/rates/components/RateForm.tsx     # Rate editing form
src/features/rates/components/RateList.tsx      # Rate list display (4 rows)
src/features/rates/pages/RatesPage.tsx          # Page composing RateList + RateForm

src/features/parking-lot/api/parkingLotApi.ts   # getConfig, updateConfig Firestore operations
src/features/parking-lot/hooks/useParkingLot.ts # Config fetching/updating hook
src/features/parking-lot/components/ParkingLotForm.tsx  # Config editing form
src/features/parking-lot/pages/ParkingLotPage.tsx        # Page composing form
```

### Risks

| Risk | Mitigation |
|---|---|
| Rates collection is empty at startup → entry workflow cannot snapshot | Seed default rates via a Firestore Security Rule or a setup script documented in README |
| Admin-only access not enforceable at Firestore level | Client-side `ProtectedRoute` with `requiredPermission`; Security Rules should mirror this |

### Acceptance Criteria

- [ ] Admin can view all 4 rates
- [ ] Admin can edit each rate field
- [ ] Rate changes do not affect active parking sessions (snapshot strategy)
- [ ] Admin can configure slot counts, lot name, lost ticket fee
- [ ] Non-admin users cannot access rates or parking-lot routes

---

## Phase 6 — Customer and Vehicle Management

**Status:** ⬜ Pending

| Aspect | Detail |
|---|---|
| Goal | Enable operators to register customers and their vehicles. The entry workflow depends on this — without customers and vehicles, entries cannot be created |
| Complexity | Medium |
| Dependencies | Phase 3 (navigation), Phase 4 (UI components) |

### Features

- Customer list page (search by name or phone)
- Customer form (create/edit name, phone, email)
- Vehicle list page (search by plate, filter by customer)
- Vehicle form (create/edit plate, type, link to customer)
- Vehicle search component (used by parking entry workflow)
- API files for Firestore CRUD on `customers` and `vehicles`

### Files to Create

```
src/features/customers/api/customersApi.ts
src/features/customers/hooks/useCustomers.ts
src/features/customers/components/CustomerForm.tsx
src/features/customers/components/CustomerList.tsx
src/features/customers/pages/CustomersPage.tsx

src/features/vehicles/api/vehiclesApi.ts
src/features/vehicles/hooks/useVehicles.ts
src/features/vehicles/components/VehicleForm.tsx
src/features/vehicles/components/VehicleList.tsx
src/features/vehicles/components/VehicleSearch.tsx
src/features/vehicles/pages/VehiclesPage.tsx
```

### Risks

| Risk | Mitigation |
|---|---|
| `plateLower` must be stored on every Vehicle document | Enforce in the API layer (transform `plate → plateLower` before write) |
| Customer search by phone or name requires Firestore `array-contains` or multiple queries | Use simple `where` clauses; consider Algolia for full-text search post-MVP |

### Acceptance Criteria

- [ ] Operator can create a customer (name + phone required)
- [ ] Operator can search customers by name or phone
- [ ] Operator can create a vehicle linked to an existing customer
- [ ] Operator can search vehicles by plate (case-insensitive)
- [ ] Plate is stored with both original case and lowercased version
- [ ] Admin can edit and delete customers and vehicles

---

## Phase 7 — Parking Entry Workflow

**Status:** ⬜ Pending

| Aspect | Detail |
|---|---|
| Goal | The core entry workflow. Operator selects/creates a customer, selects/creates a vehicle, captures the entry time, snapshots the current rate, and creates the atomic lock via `activeEntries` |
| Complexity | High |
| Dependencies | Phase 5 (rates + config), Phase 6 (customers + vehicles), Phase 4 (UI components) |

### Features

- Entry form: select or create customer, select or create vehicle, confirm entry
- Vehicle search with inline customer creation
- Atomic entry guard: `setDoc(activeEntries/{plateLower})` with `merge: false`
- Rate snapshot creation at entry time
- Vehicle and customer snapshot creation
- Entry confirmation display

### Files to Create

```
src/features/parking/api/activeEntriesApi.ts   # activeEntries CRUD (create, delete, check)
src/features/parking/api/parkingApi.ts          # createParkingEntry Firestore operation
src/features/parking/hooks/useParkingEntry.ts   # Entry workflow hook
src/features/parking/hooks/useActiveEntries.ts  # Active entry check hook
src/features/parking/components/EntryForm.tsx   # Main entry form
src/features/parking/components/VehicleSelect.tsx # Vehicle search + inline creation
src/features/parking/components/CustomerSelect.tsx # Customer search + inline creation
src/features/parking/pages/ParkingEntryPage.tsx # Parking entry page
```

### Risks

| Risk | Mitigation |
|---|---|
| `activeEntries` lock fails after entry is created → orphan entry | Create entry first, then lock. If lock fails, delete the orphan entry and reject |
| `activeEntries` stale lock blocks legitimate entry | Implement stale-lock cleanup: read lock entryId, check ParkingEntry status, delete if completed |
| Rate document missing for vehicle type → snapshot fails | Seed default rates in Phase 5; handle missing rate gracefully with a validation error |

### Acceptance Criteria

- [ ] Operator can create an entry with customer + vehicle selection
- [ ] Operator can create a customer inline during entry
- [ ] Operator can create a vehicle inline during entry
- [ ] Attempting to park a vehicle with an active entry is rejected
- [ ] Entry creates rateSnapshot, vehicleSnapshot, customerSnapshot
- [ ] Entry creates `activeEntries` lock document
- [ ] Entry shows confirmation with entry time and vehicle details
- [ ] Active entry appears in dashboard (requires Phase 9 for visual, but Firestore write is verified)

---

## Phase 8 — Parking Exit Workflow

**Status:** ⬜ Pending

| Aspect | Detail |
|---|---|
| Goal | Process vehicle exit: calculate fee using snapshot rate, create payment record, update entry status, delete active lock. Uses a single-document Firestore transaction for atomicity |
| Complexity | High |
| Dependencies | Phase 7 (parking entries exist), Phase 4 (UI components) |

### Features

- Vehicle lookup (by plate) to find active entry
- Fee calculator (pure function in `lib/feeCalculator.ts`)
- Exit form: display calculated fee, confirm payment, select payment method (cash)
- Single-document Firestore transaction:
  1. Read ParkingEntry
  2. Verify `status === 'active'`
  3. Calculate fee using `rateSnapshot`
  4. Update ParkingEntry with exit info, calculationDetails, payment
- Active entry lock deletion (best-effort, after transaction)
- Exit ticket display (receipt summary)

### Files to Create

```
src/lib/feeCalculator.ts                              # Pure function: calculate fee from rateSnapshot + time
src/features/parking/api/parkingExitApi.ts            # exitParking Firestore transaction
src/features/parking/hooks/useParkingExit.ts          # Exit workflow hook
src/features/parking/components/ExitForm.tsx          # Vehicle search + fee display + payment confirm
src/features/parking/components/ParkingTicket.tsx     # Receipt display after exit
src/features/parking/pages/ParkingExitPage.tsx        # Exit page
```

### Risks

| Risk | Mitigation |
|---|---|
| Two operators attempt to exit same vehicle simultaneously | Single-document transaction + `status` guard → second transaction fails |
| Fee calculator has rounding errors | Test with known time intervals; use integer cents internally |
| `activeEntries` deletion fails after successful exit | Best-effort; stale lock cleanup in entry phase handles it |

### Acceptance Criteria

- [ ] Operator can look up active entry by plate
- [ ] Fee is calculated correctly using rateSnapshot (not current rate)
- [ ] Fee calculation preserves all `calculationDetails` fields
- [ ] Exit creates embedded payment record inside ParkingEntry
- [ ] Exit updates status to `'completed'`
- [ ] Active entry is removed (lock deleted)
- [ ] Receipt shows vehicle, entry time, exit time, duration, amount paid
- [ ] Concurrent exit attempts: one succeeds, second is rejected

---

## Phase 9 — Dashboard

**Status:** ⬜ Pending

| Aspect | Detail |
|---|---|
| Goal | Provide real-time operational visibility: current occupancy, active entries, recent completions, slot availability with over-capacity indicator |
| Complexity | Medium |
| Dependencies | Phase 5 (parking lot config for slots), Phase 7 (active entries exist) |

### Features

- Occupancy summary: configured capacity, occupied spots, available spots, over-capacity amount
- Active entries list (recent first, with vehicle plate and entry time)
- Recent completed entries
- Occupancy by vehicle type (optional in MVP: simple counts)

### Files to Create

```
src/features/dashboard/api/dashboardApi.ts       # Query active entries, count by type
src/features/dashboard/hooks/useDashboard.ts     # Dashboard data hook
src/features/dashboard/components/StatsCard.tsx  # Reusable stat display card
src/features/dashboard/components/OccupancySummary.tsx  # Slots overview
src/features/dashboard/components/ActiveEntriesTable.tsx # Active entries list
src/features/dashboard/components/RecentEntriesTable.tsx # Recent completions
src/features/dashboard/pages/DashboardPage.tsx   # Dashboard page
```

### Risks

| Risk | Mitigation |
|---|---|
| Dashboard queries multiple collections → slow load | Use `Promise.all` for parallel queries; show skeleton loading |
| Occupancy numbers stale by seconds | Acceptable for informational display; no real-time subscription needed for MVP |

### Acceptance Criteria

- [ ] Dashboard shows configured capacity, occupied, available, and over-capacity
- [ ] Occupancy can show negative available slots (over-capacity)
- [ ] Active entries list is sorted by entry time (most recent first)
- [ ] Recent completions show exit time and amount
- [ ] Stats update on page load/refresh
- [ ] Operator can navigate to entry/exit pages from dashboard

---

## Phase 10 — Reports

**Status:** ⬜ Pending

| Aspect | Detail |
|---|---|
| Goal | Generate operational reports from completed parking session data. Uses client-side aggregation over Firestore queries |
| Complexity | Medium |
| Dependencies | Phase 8 (completed entries exist with payment data) |

### Features

- Revenue by day (current month default, date range picker)
- Revenue by month (year-to-date default)
- Revenue by vehicle type
- Historical parking sessions (filterable list)
- Occupancy statistics (average occupancy, peak times — simple aggregation)
- Report filters (date range, vehicle type, operator)

### Files to Create

```
src/features/reports/api/reportsApi.ts              # Query completed entries by date range
src/features/reports/hooks/useReports.ts            # Report data aggregation hook
src/features/reports/components/ReportFilters.tsx   # Date range, vehicle type, operator filters
src/features/reports/components/RevenueChart.tsx    # Revenue by day/month chart
src/features/reports/components/RevenueByVehicleType.tsx  # Revenue breakdown
src/features/reports/components/ReportTable.tsx     # Historical sessions table
src/features/reports/components/OccupancyReport.tsx # Occupancy statistics
src/features/reports/pages/ReportsPage.tsx          # Reports page
```

### Risks

| Risk | Mitigation |
|---|---|
| Client-side aggregation becomes slow with many records | At 10K+ documents, consider server-side aggregation (post-MVP). For MVP, add a "loading" indicator |
| Date range queries need composite indexes | Create required indexes in Firebase Console early |
| Revenue calculations must be accurate due to rounding | Use integer arithmetic (cents) and `finalAmount` from `calculationDetails` |

### Acceptance Criteria

- [ ] Revenue by day chart is accurate (matches `ParkingEntry.totalAmount`)
- [ ] Revenue by month chart aggregates daily totals correctly
- [ ] Revenue by vehicle type breaks down by `vehicleSnapshot.vehicleType`
- [ ] Historical sessions list is paginated or scrollable
- [ ] Filters (date range, vehicle type) work correctly
- [ ] Occupancy statistics use historical data
- [ ] Reports use `calculationDetails` and snapshots, not live data
- [ ] Admin can access reports; operator cannot

---

## Phase 11 — User Management (Admin)

**Status:** ⬜ Pending

| Aspect | Detail |
|---|---|
| Goal | Allow administrators to manage user accounts: list users, change roles, disable accounts. For MVP, user creation still happens in Firebase Console |
| Complexity | Low |
| Dependencies | Phase 3 (navigation, auth), Phase 4 (UI components) |

### Features

- User list page (all system users)
- User role editor (change `role` field)
- User disable/enable toggle (`isActive` flag)
- API for reading and updating Firestore `users` collection

### Files to Create

```
src/features/users/api/usersApi.ts              # getUser, updateUser Firestore operations
src/features/users/hooks/useUsers.ts             # Users data hook
src/features/users/components/UserList.tsx       # Users table
src/features/users/components/UserForm.tsx       # Role editor, disable toggle
src/features/users/pages/UsersPage.tsx           # Users page
```

### Risks

| Risk | Mitigation |
|---|---|
| Cannot create users without Cloud Function | Keep Firebase Console for creation; this phase only manages existing users |
| Admin disables own account | Validate that at least one admin remains active |

### Acceptance Criteria

- [ ] Admin can view all system users
- [ ] Admin can change a user's role
- [ ] Admin can disable/enable a user
- [ ] Disabled user cannot sign in (handled in AuthProvider)
- [ ] Operator cannot access user management

---

## Phase 12+ — Post-MVP Enhancements

**Status:** 🔮 Post-MVP — identified, not scheduled

### Items

| Item | Complexity | Trigger / Justification |
|---|---|---|
| **Payment gateway integration** (card, digital wallet) | High | Business requirement for non-cash payments |
| **Multi-location support** | High | Business expansion beyond one lot |
| **Cloud Function for user creation** | Low | Replace Firebase Console workflow with Admin UI |
| **Write-time report aggregation** (Cloud Function) | Medium | Client-side aggregation becomes slow (>10K entries) |
| **BigQuery export** for advanced reporting | Medium | Need for complex SQL queries or long-term analytics |
| **Time-partitioned Firestore collections** | Medium | `parkingEntries` collection exceeds 500K documents |
| **Sharded occupancy counters** | Low | Entry/exit volume exceeds 1 transaction/second on counter |
| **Refund/void payment workflows** | Medium | Business requirement for correcting payment errors |
| **Lost ticket workflow** | Low | Business requirement (policy already defined) |
| **Error monitoring** (Sentry) | Low | Production stability requirement |
| **Full-text search** for vehicles/customers (Algolia) | Medium | Firestore limitations on text search become apparent |
| **Firestore Security Rules** hardening | Medium | Production security audit |

---

## Dependency Graph

```
Phase 3 (Login + Nav)
    │
    ├── Phase 4 (UI Components)     — no hard dependency, can be parallel
    │
    ├── Phase 5 (Rates + Config)    — depends on Phase 3 (nav), Phase 4 (UI)
    │
    ├── Phase 6 (Customers + Vehicles) — depends on Phase 3 (nav), Phase 4 (UI)
    │
    └── Phase 7 (Entry Workflow)    ─┐
        depends on Phase 5 + Phase 6  │
                └─────────────────────┤
        Phase 8 (Exit Workflow)      ├── depends on Phase 7
        depends on Phase 7            │
                └─────────────────────┤
        Phase 9 (Dashboard)          ├── depends on Phase 7, Phase 5
                └─────────────────────┤
        Phase 10 (Reports)           ┘── depends on Phase 8

Phase 11 (User Management) — depends on Phase 3 (nav) only
```

Phases 4, 5, 6, and 11 have no blocking dependencies on each other. They can theoretically be worked in parallel by different developers, but the recommended sequential order minimizes context switching.

---

## Estimated Timeline

| Phase | Estimated Effort | Calendar Estimate (1 dev) |
|---|---|---|
| Phase 3 — Login and Navigation | 3–5 days | 1 week |
| Phase 4 — UI Component Library | 3–5 days | 1 week |
| Phase 5 — Rates and Config | 2–3 days | 3 days |
| Phase 6 — Customers and Vehicles | 4–5 days | 1 week |
| Phase 7 — Parking Entry | 5–7 days | 1.5 weeks |
| Phase 8 — Parking Exit | 5–7 days | 1.5 weeks |
| Phase 9 — Dashboard | 3–4 days | 4 days |
| Phase 10 — Reports | 4–5 days | 1 week |
| Phase 11 — User Management | 2–3 days | 3 days |
| **MVP Total (Phase 3–10)** | **29–41 days** | **6–8 weeks** |

Estimates assume a single developer familiar with the codebase. Add 30–50% for ramp-up time if new to the project.

---

## Recommended Implementation Order

1. **Phase 3** (Login + Navigation) — unlocks testing of the entire app
2. **Phase 4** (UI Components) — foundation for all feature UIs
3. **Phase 5** (Rates + Config) — needed before parking workflows
4. **Phase 6** (Customers + Vehicles) — needed before parking workflows
5. **Phase 7** (Parking Entry) — core feature
6. **Phase 8** (Parking Exit) — core feature
7. **Phase 9** (Dashboard) — depends on entry data
8. **Phase 10** (Reports) — depends on completed entry data
9. **Phase 11** (User Management) — can be deferred; Firebase Console suffices

Phases 5 and 6 are independent and can be reordered. Phase 11 is independent and can be done at any point after Phase 3.

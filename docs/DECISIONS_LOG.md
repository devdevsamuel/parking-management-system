# Decision Log

All dates are approximate and represent the chronological order of decisions during the initial architecture and implementation phases.

---

## 001 — Feature-Based Architecture

- **Date:** Phase 1
- **Decision:** Use feature-based folder structure
- **Reason:** Each feature is self-contained with its own components, hooks, services, and types. Scales well because features can be developed in isolation, lazy-loaded via routes, and deleted by removing one folder.
- **Alternative considered:** Flat folder structure organized by technical concern (all components together, all hooks together)
- **Alternative rejected:** Flat structure becomes unmanageable as the application grows — a component for vehicles and a component for customers end up in the same folder with no clear boundary
- **Impact:** Every feature follows `api/`, `components/`, `hooks/`, `pages/` convention

---

## 002 — Clean Architecture Layers

- **Date:** Phase 1
- **Decision:** Separate layers: Components → Hooks/Services → Firebase
- **Reason:** UI never talks directly to Firebase. Hooks and services act as the bridge. Business logic lives in hooks and services, not inside components. Firebase is an implementation detail.
- **Alternative considered:** Direct Firebase calls inside components
- **Alternative rejected:** Tightly couples UI to infrastructure — swapping Firebase for another backend would require rewriting every component
- **Impact:** Components import only from hooks and config, never from Firebase SDK

---

## 003 — TypeScript Strict Mode

- **Date:** Phase 1
- **Decision:** Enable `strict: true` in tsconfig
- **Reason:** Catches null reference errors, implicit any, and incorrect type usage at compile time instead of runtime
- **Alternative considered:** Standard TypeScript without strict mode
- **Alternative rejected:** Loose TypeScript defeats the purpose of type safety
- **Impact:** All code must handle null, undefined, and type constraints explicitly

---

## 004 — Firebase Only Backend

- **Date:** Phase 1
- **Decision:** Firebase Auth + Firestore as the only backend dependencies
- **Reason:** Eliminates server infrastructure, simplifies deployment, reduces MVP complexity
- **Alternative considered:** Node.js + Express backend, PostgreSQL database
- **Alternative rejected:** Requires server hosting, maintenance, deployment pipeline — over-engineered for MVP
- **Impact:** All data is managed through Firestore directly from the client. Security is enforced through Firestore Security Rules.

---

## 005 — Tailwind CSS

- **Date:** Phase 1
- **Decision:** Use Tailwind CSS for styling
- **Reason:** Utility-first approach reduces CSS file size, eliminates class naming decisions, provides consistent design system
- **Alternative considered:** CSS Modules, Styled Components, plain CSS
- **Alternative rejected:** CSS Modules need naming conventions, Styled Components adds runtime cost, plain CSS doesn't scale
- **Impact:** Styling is done via utility classes in JSX

---

## 006 — Route and Collection Name Constants

- **Date:** Phase 1
- **Decision:** Define route paths and collection names as constants with `as const`
- **Reason:** Prevents typos in path strings, enables TypeScript autocomplete, centralizes changes
- **Alternative considered:** Inline string literals throughout the codebase
- **Alternative rejected:** Hard-coded strings are error-prone and make refactoring difficult
- **Impact:** All routes and collection references use constant imports

---

## 007 — Customer-Vehicle Separation

- **Date:** Architecture review
- **Decision:** Separate `Customer` and `Vehicle` entities
- **Reason:** A customer can own multiple vehicles. Storing customer info on each vehicle duplicates data and creates update anomalies.
- **Alternative considered:** Embedded customer info inside Vehicle document
- **Alternative rejected:** Customer data would be duplicated across vehicles; changing a phone number requires updating every vehicle document
- **Impact:** Customers collection + Vehicles collection with `customerId` foreign key

---

## 008 — Payment Embedded Inside ParkingEntry

- **Date:** Architecture review (MVP simplification)
- **Decision:** Store payment information as embedded object in `ParkingEntry.payment`
- **Reason:** Every exit produces exactly one payment. No one-to-many relationship. Simplifies exit to a single-document update. Reduces collection count.
- **Alternative considered:** Separate `payments` collection
- **Alternative rejected:** Requires multi-document transaction during exit, more collections, more writes. Not justified for cash-first MVP.
- **Impact:** Payment history is queried through parking entries. Future gateway integration can extend the embedded object.

---

## 009 — Rate Snapshots at Entry Time

- **Date:** Architecture review
- **Decision:** Capture `rateSnapshot` in `ParkingEntry` at entry time
- **Reason:** Rate changes between entry and exit should not retroactively alter the fee. The rate in effect when the customer parks is the rate they agreed to.
- **Alternative considered:** Read current rate at exit time
- **Alternative rejected:** Rate changes would create billing disputes and audit issues
- **Impact:** Fee calculator reads from `rateSnapshot`, not live rates collection

---

## 010 — Vehicle and Customer Snapshots

- **Date:** Architecture review
- **Decision:** Capture `vehicleSnapshot` and `customerSnapshot` in `ParkingEntry`
- **Reason:** Vehicle plates and customer names can change. Historical records must remain accurate for audit and reporting purposes.
- **Alternative considered:** Live references to vehicles and customers collections
- **Alternative rejected:** Changes to source data would retroactively alter historical records
- **Impact:** ~450 bytes of additional storage per entry. Audit value far exceeds the cost (~$0.003/year at 36K entries).

---

## 011 — Calculation Details Snapshot

- **Date:** Architecture review
- **Decision:** Capture `calculationDetails` in `ParkingEntry` at exit time
- **Reason:** Provides full audit trail of how the fee was computed. Prevents disputes about billing.
- **Alternative considered:** Recalculate fee on demand when viewing a past entry
- **Alternative rejected:** If fee calculation logic changes, recalculated amounts would differ from original amounts
- **Impact:** Each completed entry stores `totalMinutes`, `billableHours`, `appliedRules`, and `finalAmount`

---

## 012 — Occupancy Is Informational Only

- **Date:** Architecture review
- **Decision:** Do not block entries when configured capacity is reached
- **Reason:** Real parking lots may temporarily operate above capacity. Blocking entries is unrealistic and would frustrate operators.
- **Alternative considered:** Reject entry when slots are full
- **Alternative rejected:** Violates real-world parking operations. Operators need discretion.
- **Impact:** Dashboard shows configured capacity, occupied spots, available spots, and over-capacity amount. Entry is always allowed.

---

## 013 — Occupancy Derived from Query

- **Date:** Architecture review
- **Decision:** Derive occupancy by querying active entries, not from a persisted counter
- **Reason:** No transactional accuracy is needed (occupancy is informational). Avoids write contention on a counter document.
- **Alternative considered:** Persisted `currentOccupancy` counter in `parkingLotConfig`
- **Alternative rejected:** Writes to config on every entry/exit create a hotspot. Counter accuracy is not critical.
- **Impact:** Dashboard loads active entries count on mount. No counter document to maintain.

---

## 014 — Single-Document Transaction for Exit

- **Date:** Architecture review
- **Decision:** Use a single-document Firestore transaction for exit workflow
- **Reason:** Prevents concurrent exit race conditions (two operators processing the same entry). Transaction reads status, verifies active, calculates fee, and updates — all on one document.
- **Alternative considered:** Plain updateDoc without transaction
- **Alternative rejected:** Two operators could read `status = 'active'` simultaneously, both proceed, and the second write silently overwrites the first
- **Impact:** Exit function wraps logic in `runTransaction`. Entry does not need a transaction (no availability guard needed).

---

## 015 — Atomic Entry Guard via `activeEntries` Collection

- **Date:** Architecture review
- **Decision:** Use `activeEntries/{plateLower}` as an atomic lock for entry creation
- **Reason:** Prevents two operators from simultaneously creating entries for the same vehicle
- **Alternative considered:** Query + guard pattern (query for active entry, then create)
- **Alternative rejected:** Race window between query and write allows double-entry
- **Impact:** New collection `activeEntries` with document ID = `plateLower`. Entry uses `setDoc` with `merge: false`. Stale locks cleaned up on next entry attempt for that plate.

---

## 016 — Cash-Only MVP

- **Date:** Architecture review
- **Decision:** Support only cash payments in MVP
- **Reason:** Simplifies payment model. No gateway integration, no refund workflows, no reconciliation complexity.
- **Alternative considered:** Integrate Mercado Pago or similar payment gateway from day one
- **Alternative rejected:** Adds PCI compliance concerns, integration complexity, and feature scope beyond MVP
- **Impact:** `PaymentInfo.method` is typed as `'cash'` (extendable union). No refund/chargeback workflows.

---

## 017 — No Dedicated Payments Collection

- **Date:** Architecture review
- **Decision:** Remove the `payments` collection from the architecture
- **Reason:** MVP payment model is simple (cash, one amount, no refunds). Embedding in `ParkingEntry` reduces collection count from 7 to 6, eliminates multi-document transactions, and reduces writes per exit.
- **Alternative considered:** Keep `payments` collection (original proposal)
- **Alternative rejected:** Added complexity without MVP benefit. Future gateway integration can extend the embedded object or promote it to a separate collection.
- **Impact:** 6 collections instead of 7. Exit workflow is a single-document update.

---

## 018 — Firestore as Source of Truth for Roles

- **Date:** Phase 2
- **Decision:** Store user roles in Firestore `users/{uid}` documents, not in Firebase Custom Claims
- **Reason:** Custom Claims require Admin SDK (Cloud Function) to modify. Firestore documents can be read and written by the client with proper Security Rules. Simpler for MVP.
- **Alternative considered:** Firebase Custom Claims
- **Alternative rejected:** Requires Cloud Function to set/update, adds latency, more complex to manage
- **Impact:** AuthProvider reads role from Firestore after authentication. `loadUserRole` is a simple `getDoc` call.

---

## 019 — Permission System as String Union Types

- **Date:** Phase 2
- **Decision:** Define `Permission` as a string union type (`'users:manage' | 'rates:manage' | ...`)
- **Reason:** Type-safe, tree-shakeable, serializable. No runtime overhead. TypeScript enforces exhaustiveness.
- **Alternative considered:** Enum, string constants object
- **Alternative rejected:** Enums have runtime overhead and aren't tree-shakeable. String constants require importing the object.
- **Impact:** `Permission` type is a type alias. `ROLE_PERMISSIONS` maps roles to `readonly Permission[]`.

---

## 020 — No Cloud Functions in MVP

- **Date:** Architecture review
- **Decision:** Do not use Firebase Cloud Functions in the MVP
- **Reason:** All operations can be performed client-side. User creation happens via Firebase Console. Cloud Functions add deployment complexity and a dependency on the Blaze plan.
- **Alternative considered:** Cloud Function for user creation, Cloud Function for report aggregation
- **Alternative rejected:** Not required at MVP scale. User creation for 5-10 people is simpler via Firebase Console.
- **Impact:** No `firebase-functions` dependency. No backend deployment. Firebase Console for user management.

---

## 021 — `UserRole` Defined in Permissions Config (Not Types)

- **Date:** Phase 2
- **Decision:** Define `UserRole` type in `config/permissions.ts` instead of `types/user.ts`
- **Reason:** `UserRole` is an authorization concept — it defines what a user can do. It should live alongside the permission system.
- **Alternative considered:** Keep `UserRole` in `types/user.ts` (Phase 1)
- **Alternative rejected:** Creates a dependency where `permissions.ts` needs to import from `types/user.ts`, but roles are fundamentally about authorization, not data modeling.
- **Impact:** `types/user.ts` now imports `UserRole` from `config/permissions.ts`

---

## 022 — React Context for Auth State

- **Date:** Phase 2
- **Decision:** Manage auth state via React Context, not external state management
- **Reason:** Auth is read-heavy (most components read, few write). Context is sufficient for this pattern. Avoids adding a dependency like Zustand or Redux.
- **Alternative considered:** Zustand, Redux Toolkit, Jotai
- **Alternative rejected:** Over-engineered for MVP. Auth state is simple: user object, loading flag, and a few actions.
- **Impact:** `AuthProvider` wraps the app. `useAuth` hook provides access.

---

## 023 — Single Timezone (America/Bogota)

- **Date:** Architecture review
- **Decision:** Use a single timezone (America/Bogota) hardcoded in config
- **Reason:** Single parking lot in a single location. No timezone conversion logic needed.
- **Alternative considered:** Dynamic timezone detection, user-selectable timezone
- **Alternative rejected:** Over-engineered for a single-lot MVP
- **Impact:** `TIMEZONE` constant in `config/constants.ts`. UI displays times in this timezone.

---

## 024 — `plateLower` for Case-Insensitive Search

- **Date:** Architecture review
- **Decision:** Store a lowercased `plateLower` field alongside `plate` on every Vehicle document
- **Reason:** Firestore queries are case-sensitive. Without this, searching for "ABC-123" would not match "abc-123".
- **Alternative considered:** Client-side normalization during search
- **Alternative rejected:** Would require loading all vehicles and filtering client-side — doesn't scale
- **Impact:** Every Vehicle document has both `plate` (original case) and `plateLower` (lowercased). Search queries use `where('plateLower', '==', input.toLowerCase())`.

---

## 025 — No User Management UI in MVP

- **Date:** Architecture review
- **Decision:** Admin creates and manages users via Firebase Console, not a custom UI
- **Reason:** For 5-10 users, Firebase Console is more reliable and feature-rich (password resets, MFA, account disabling).
- **Alternative considered:** Custom user management page in the application
- **Alternative rejected:** Needs Cloud Function for user creation (Firebase client SDK can't create other users). Not justified for MVP.
- **Impact:** `features/users/` folder exists for future implementation. Phase 9 will add user management UI + Cloud Function.

---

## 026 — Report Aggregation: Client-Side for MVP

- **Date:** Architecture review
- **Decision:** Use client-side aggregation over Firestore queries for reports
- **Reason:** At MVP scale (thousands of entries/month), client-side aggregation completes in <1 second. No server-side infrastructure needed.
- **Alternative considered:** Firebase Extensions (BigQuery export), Cloud Function write-time aggregation
- **Alternative rejected:** BigQuery requires external setup. Cloud Function adds deployment complexity. Not justified at MVP scale.
- **Impact:** Reports page queries entries and aggregates client-side. Write-time aggregation via Cloud Function is the documented future optimization path.

---

## 027 — Over-Capacity Dashboard Display

- **Date:** Architecture review
- **Decision:** Dashboard displays configured capacity, occupied spots, available spots, and over-capacity amount
- **Reason:** Since occupancy is not enforced, the dashboard needs to clearly show when the lot is over capacity and by how much.
- **Alternative considered:** Hide negative available slots
- **Alternative rejected:** Hiding over-capacity information reduces operational visibility
- **Impact:** `availableSlots = configuredSlots - occupied` can be negative. UI displays over-capacity amount when applicable.

---

## 028 — Single-Document Transaction, Not Multi-Document

- **Date:** Architecture review
- **Decision:** Restrict Firestore transactions to single documents only
- **Reason:** The exit workflow is the only operation that needs a transaction, and it only touches one document (ParkingEntry). Multi-document transactions add complexity, latency, and contention risk.
- **Alternative considered:** Multi-document transactions for exit (ParkingEntry + activeEntries)
- **Alternative rejected:** The `activeEntries` deletion is best-effort (non-critical). If it fails, the stale lock cleanup handles it.
- **Impact:** Exit transaction updates only `parkingEntry`. Lock deletion happens after the transaction (outside the atomic scope).

---

## 029 — Scalability Concerns Documented, Not Solved

- **Date:** Architecture review
- **Decision:** Identify scalability bottlenecks but do not solve them in the MVP
- **Reason:** Premature optimization adds complexity. MVP traffic (100-500 entries/day) is well within Firestore's free tier and single-document performance limits.
- **Alternative considered:** Implement sharded counters, time-partitioned collections, and BigQuery export from day one
- **Alternative rejected:** Adds months of development time for problems that don't exist yet
- **Impact:** Scalability review is documented in architecture. Future optimization paths are identified but not implemented.

---

## 030 — Installation Path Alias `@/*`

- **Date:** Phase 1
- **Decision:** Configure `@` path alias to map to `src/` in both Vite and TypeScript
- **Reason:** Eliminates deep relative imports (`../../../components/Button` becomes `@/components/Button`). Makes imports readable and refactoring easier.
- **Alternative considered:** Relative imports only
- **Alternative rejected:** Deep relative paths are fragile during refactoring — moving a file breaks all its imports
- **Impact:** Added `@types/node` for `path` module in Vite config. TypeScript config uses `baseUrl` + `paths`.

---

## 031 — Layout Route Pattern with `<Outlet />`

- **Date:** Phase 3
- **Decision:** DashboardLayout uses `<Outlet />` (React Router nested route rendering) instead of a `children` prop
- **Reason:** Enables the React Router layout route pattern where child routes inherit the parent layout. This is the idiomatic approach for React Router v7 and keeps the route definition in AppRouter clean.
- **Alternative considered:** Wrapping child components inside `<DashboardLayout><Child /></DashboardLayout>` at the route level
- **Alternative rejected:** Would require repeating the layout wrapper for every route. Layout routes with `<Outlet />` are the standard pattern.
- **Impact:** AppRouter defines `<Route element={<DashboardLayout />}>` as a parent, and all authenticated pages are nested child routes.

---

## 032 — Direct Route Imports (Not `React.lazy`)

- **Date:** Phase 3
- **Decision:** AppRouter uses direct imports for page components instead of `React.lazy` with dynamic `import()`
- **Reason:** The MVP has few features (~10 routes). The entire application bundle including Firebase SDK is ~567 KB gzipped. Code splitting adds complexity (loading states, suspense boundaries) without meaningful benefit at this scale.
- **Alternative considered:** `React.lazy` + `<Suspense>` for each route
- **Alternative rejected:** Premature optimization. Code splitting can be introduced later if bundle analysis shows a need.
- **Impact:** All route components are eagerly loaded. No `<Suspense>` boundaries needed at the route level.

---

## 033 — Login Redirect via `location.state.from`

- **Date:** Phase 3
- **Decision:** After successful login, redirect to the URL stored in `location.state.from` (set by ProtectedRoute when redirecting unauthenticated users)
- **Reason:** If a user tries to access `/users` while unauthenticated, ProtectedRoute redirects to `/login` with `{ state: { from: '/users' } }`. After login, the user is redirected back to their original destination instead of the dashboard.
- **Alternative considered:** Always redirect to dashboard after login
- **Alternative rejected:** Poor UX — user must re-navigate to where they were going
- **Impact:** LoginPage reads `(location.state as { from?: string })?.from ?? ROUTES.DASHBOARD`. ProtectedRoute's `<Navigate>` does not currently set this state (planned enhancement).

---

## 034 — AuthLayout as Separate Layout Component

- **Date:** Phase 3
- **Decision:** Unauthenticated pages use a dedicated `AuthLayout` component (centered card with app name), distinct from `DashboardLayout`
- **Reason:** Authentication pages have a fundamentally different visual structure (centered narrow card, no sidebar, no header) from authenticated pages. Using the same layout would require conditional rendering and confuse the separation of concerns.
- **Alternative considered:** Single layout with conditional sidebar based on auth state
- **Alternative rejected:** Creates a component with two divergent rendering paths, harder to test and maintain
- **Impact:** `AuthLayout` in `layouts/` renders a centered card with `APP_NAME`. `DashboardLayout` renders sidebar + main content area.

---

## 035 — Shared Spinner Component Extraction

- **Date:** Phase 3
- **Decision:** Extract the inline spinner from ProtectedRoute into a reusable `Spinner` component in `components/ui/`
- **Reason:** Multiple loading states will need a spinner (login button, dashboard, entry/exit workflows). A reusable component ensures consistent styling, supports multiple sizes, and includes proper ARIA attributes (`role="status"`, `sr-only` label).
- **Alternative considered:** Keep inline Tailwind classes everywhere
- **Alternative rejected:** Duplicates code, makes styling changes require editing every usage site
- **Impact:** `Spinner` accepts `size` prop ('sm' | 'md' | 'lg'). ProtectedRoute still uses inline spinner (migration deferred to Phase 4).

---

## 036 — Permission-Filtered Sidebar Navigation

- **Date:** Phase 3
- **Decision:** Sidebar nav items in DashboardLayout declare an optional `permission` field and are conditionally rendered via `hasPermission()`
- **Reason:** Users should only see navigation links they have permission to use. An operator shouldn't see "User Management" in the sidebar. This is a UI-level convenience, not a security measure (route-level protection via ProtectedRoute is the security boundary).
- **Alternative considered:** Render all nav items and let routes handle authorization
- **Alternative rejected:** Poor UX — users see links to pages they can't access, and get redirected back when they click them
- **Impact:** `NAV_ITEMS` array maps labels to routes with optional `Permission`. Items without a permission requirement (Dashboard, Parking Lot) are visible to all authenticated users.

---

## 037 — Dashboard Page as Welcome Placeholder

- **Date:** Phase 3
- **Decision:** The dashboard route (`/`) renders a simple welcome page instead of a fully implemented dashboard
- **Reason:** The real dashboard depends on Phase 7 (parking entries exist) and Phase 5 (parking lot config). Creating placeholder pages allows the navigation and routing structure to be verified without blocking Phase 3 completion.
- **Alternative considered:** Implement full dashboard in Phase 3
- **Alternative rejected:** Dashboard implementation depends on data from future phases. Building it now would require mocking or stubbing data.
- **Impact:** `DashboardPage.tsx` shows a welcome message with the user's display name. Full dashboard with occupancy stats, active entries, and recent completions is planned for Phase 9.

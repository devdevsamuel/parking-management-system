# Development Progress

## Phase 1 — Foundation Setup

**Status:** Completed and approved

### Scope
Project scaffolding, dependency installation, TypeScript strict mode, Tailwind CSS, folder structure, domain types, Firebase initialization, configuration files.

### Files Created

| File | Purpose |
|---|---|
| `src/types/customer.ts` | Customer domain model interface |
| `src/types/vehicle.ts` | VehicleType union, Vehicle interface |
| `src/types/rate.ts` | PricingRule interface, Rate interface |
| `src/types/parkingLot.ts` | ParkingLotConfig interface |
| `src/types/user.ts` | AppUser interface |
| `src/types/parking.ts` | ParkingStatus, RateSnapshot, AppliedRule, CalculationDetails, PaymentInfo, ParkingEntry |
| `src/types/index.ts` | Barrel export for all domain types |
| `src/config/firebase.ts` | Firebase app initialization (exporting auth, db) |
| `src/config/routes.ts` | Route path constants with `as const` |
| `src/config/constants.ts` | App-wide constants (timezone, collection names) |
| `.env.example` | Environment variable template |

### Files Modified

| File | Change |
|---|---|
| `tsconfig.app.json` | Added `strict: true`, `baseUrl`, `paths` for `@/*`, `ignoreDeprecations: "6.0"` |
| `vite.config.ts` | Added `@tailwindcss/vite` plugin, `@` path alias with `resolve` |
| `src/index.css` | Replaced boilerplate with `@import "tailwindcss"` |
| `src/App.tsx` | Stripped to minimal placeholder |
| `index.html` | Updated title, removed favicon |

### Dependencies Installed

| Package | Purpose |
|---|---|
| `firebase` ^12.14.0 | Firebase SDK (Auth + Firestore) |
| `tailwindcss` ^4.3.0 | Utility-first CSS framework |
| `@tailwindcss/vite` ^4.3.0 | Tailwind CSS Vite plugin |

### TypeScript Concepts Learned

- **`type`** vs **`interface`** — type for unions, interface for object shapes
- **Union types** — `'car' | 'motorcycle' | 'truck' | 'bus'`
- **`Record<K, V>`** — Utility type for key-value mappings
- **Optional properties** (`?`) — For genuinely optional fields
- **`| null`** — For fields that always exist but may be null
- **`import type`** — Type-only imports, required by `verbatimModuleSyntax`
- **`as const`** — Literal type inference for constant objects

### Architectural Decisions Made

- Feature-based folder structure
- Domain types separated by entity
- Firebase init in `config/` (not `services/`)
- Route and collection name constants with `as const`
- Scaffold boilerplate cleaned before feature work

---

## Phase 2 — Authentication Foundation

**Status:** Completed and approved

### Scope
Permission system, Firebase Auth wrapper, AuthProvider React Context, useAuth hook, ProtectedRoute route guard.

### Files Created

| File | Responsibility |
|---|---|
| `src/config/permissions.ts` | Defines `Permission` union, `UserRole` union, and `ROLE_PERMISSIONS` mapping |
| `src/services/auth.ts` | Firebase Auth wrapper (signIn, signOut, onAuthChanged, loadUserRole) |
| `src/app/providers/AuthProvider.tsx` | React Context provider for auth state |
| `src/features/auth/hooks/useAuth.ts` | Consumer hook with null guard |
| `src/features/auth/components/ProtectedRoute.tsx` | Route guard with auth + optional permission check |

### Files Modified

| File | Change |
|---|---|
| `src/types/user.ts` | Removed local `UserRole` definition, imports from `@/config/permissions` |
| `src/types/index.ts` | Removed `UserRole` barrel export (now in permissions.ts) |
| `src/main.tsx` | Wrapped App with `<BrowserRouter>` and `<AuthProvider>` |

### Dependencies Installed

| Package | Purpose |
|---|---|
| `react-router-dom` ^7.16.0 | Navigate component in ProtectedRoute, routing for future phases |

### Authentication Flow

```
1. App mounts → AuthProvider subscribes to onAuthStateChanged
   ├─ loading = true (initial state)

2. Firebase resolves auth state:
   ├─ No user → user = null, loading = false
   └─ User exists → loadUserRole(uid) called:
       ├─ Firestore doc exists + isActive → user = AppUser, loading = false
       ├─ Firestore doc missing → user = null, loading = false
       ├─ isActive=false → user = null, loading = false
       └─ Error → user = null, loading = false, console.error

3. signIn(email, password):
   ├─ loading = true
   ├─ Firebase Auth call
   ├─ On success → onAuthChanged fires → step 2 (user resolves)
   └─ On failure → loading = false, error thrown to caller

4. signOut():
   ├─ Firebase Auth signOut
   └─ onAuthChanged fires with null → user = null, loading = false
```

### Authorization Flow

```
hasPermission(permission):
  1. If no user → return false
  2. Read user.role from context (loaded from Firestore)
  3. Look up ROLE_PERMISSIONS[user.role]
  4. Return permissions.includes(permission)

ProtectedRoute:
  1. useAuth() → { user, loading, hasPermission }
  2. If loading → spinner
  3. If !user → Navigate to /login
  4. If requiredPermission && !hasPermission → Navigate to /
  5. Otherwise → render children
```

### TypeScript Concepts Learned

- **Generic `createContext<T>`** — Typing React Context with `AuthContextValue | null`
- **`useCallback`** — Memoizing function references to prevent unnecessary re-renders
- **`useMemo`** — Memoizing context value object to prevent consumer re-renders
- **Type guard / null check** — Narrowing `T | null` to `T` with early return
- **`Omit<T, K>`** — Creating a type without specific fields
- **`interface` for React props** — Extendable, better error messages
- **Error propagation in async** — Catch → cleanup → throw for caller handling

### Architectural Decisions Made

- `UserRole` moved from `types/user.ts` to `config/permissions.ts` (authorization concern)
- `Permission` defined as string union type (not enum — tree-shakeable, serializable)
- `ROLE_PERMISSIONS` uses `readonly Permission[]` (prevents accidental mutation)
- `loadUserRole` in services layer (not in provider — separation of concerns)
- `aborted` flag in AuthProvider useEffect (prevents state updates after unmount)
- `ProtectedRoute` supports both `<ProtectedRoute>` and `<ProtectedRoute requiredPermission="...">` modes
- Unauthorized redirects to `/` (dashboard) instead of login (they are authenticated, but not allowed)

---

## Phase 3 — Login Page and Core Navigation

**Status:** Completed and approved

### Scope
Login page with email/password form, AuthLayout for unauthenticated pages, DashboardLayout with sidebar navigation, AppRouter with route definitions, shared Spinner component, Firebase environment configuration, Authentication setup, Firestore security rules, and end-to-end login flow verification.

### Files Created

| File | Responsibility |
|---|---|
| `src/components/ui/Spinner.tsx` | Reusable loading indicator (sm/md/lg sizes, `role="status"` for accessibility) |
| `src/layouts/AuthLayout.tsx` | Centered card layout for unauthenticated pages (app name header + content slot) |
| `src/layouts/DashboardLayout.tsx` | Sidebar navigation + `<Outlet />` layout route pattern; permission-filtered nav items; user info and sign-out in footer |
| `src/features/auth/pages/LoginPage.tsx` | Email/password form with validation, loading state, error display, redirect to `from` location |
| `src/features/dashboard/pages/DashboardPage.tsx` | Welcome placeholder with user display name |
| `src/routes/AppRouter.tsx` | Centralized route definitions with nested layout routes; `ProtectedRoute` wrappers; catch-all redirect |

### Files Modified

| File | Change |
|---|---|
| `src/App.tsx` | Replaced placeholder with `<AppRouter />` |
| `.env` | Created with real Firebase project credentials (previously only `.env.example` existed) |

### Operational Tasks Completed

| Task | Detail |
|---|---|
| Firebase project created and configured | Authentication enabled with email/password sign-in |
| Firestore security rules updated | Authenticated users can read their own `users/{uid}` document |
| Firestore user document created | `users/{uid}` with role, isActive, displayName, email — verified via loadUserRole |
| Login flow tested end-to-end | signIn → onAuthChanged → loadUserRole → ProtectedRoute grants access |
| Production build verified | `tsc -b && vite build` passes |
| `.env` populated | `VITE_FIREBASE_*` variables configured with real project values |

### Authentication Flow (Verified Working)

```
1. User visits /login → LoginPage renders inside AuthLayout
2. User enters email + password → signIn(email, password) called
3. Firebase Auth resolves → onAuthChanged fires
4. AuthProvider calls loadUserRole(uid) → reads users/{uid}
5. If doc exists + isActive → AppUser created, loading=false
6. ProtectedRoute detects user → renders DashboardLayout
7. LoginPage navigates to / (or previous `from` location)
```

### TypeScript Concepts Learned

- **Layout route pattern** — Using `<Outlet />` from react-router-dom for nested route rendering
- **`location.state`** — Passing redirect target via React Router's state between pages
- **`Omit` utility type** — Used in auth service to exclude `uid` from Firestore data casting
- **`role="status"` + `sr-only`** — Accessible loading indicators with Tailwind

### Architectural Decisions Made

- **Layout route pattern**: DashboardLayout uses `<Outlet />` (React Router layout route) instead of `children` prop — enables nested route definitions in AppRouter
- **Direct route imports**: Routes use direct imports (not `React.lazy`) — simplicity over code splitting for MVP; feature count is small
- **Login redirect via `location.state.from`**: After login, user is redirected to the page they originally tried to access (or `/` if no prior location)
- **AuthLayout as separate layout**: Unauthenticated pages have a distinct visual shell (centered card) separate from DashboardLayout
- **Spinner in `components/ui/`**: First shared UI component extracted as a reusable primitive — establishes the pattern for Phase 4
- **Permission-filtered sidebar**: Nav items declare `permission?: Permission` and are conditionally rendered via `hasPermission` — items without a permission requirement (Dashboard, Parking Lot) are visible to all authenticated users

---

## Current Status

- TypeScript strict mode: **Enabled** (compiles without errors)
- Production build: **Passes**
- All Phase 1, Phase 2, and Phase 3 files: **Created and verified**
- Path alias `@/`: **Working** (Vite + TypeScript)
- Tailwind CSS: **Configured** (v4 with Vite plugin)
- Firebase: **Configured and connected** (real Firebase project, `.env` populated)
- Firebase Authentication: **Enabled** (email/password sign-in method)
- Firestore: **Configured** (security rules allow authenticated users to read their own user document)
- Auth system: **Verified working end-to-end** (signIn → loadUserRole → ProtectedRoute grants access)
- Login page: **Functional** (redirects authenticated users to dashboard)
- Dashboard layout: **Rendered** (sidebar with permission-filtered nav, sign-out button)
- Route protection: **Active** (unauthenticated → /login, unauthorized → /)
- Spinner component: **Extracted** as shared component in `components/ui/`

## Next Recommended Phase

**Phase 4: Shared UI Component Library**

Build the reusable component primitives (Button, Input, Select, Table, Modal, Card, Badge) that every future feature will consume. This phase also includes updating ProtectedRoute to use the shared Spinner component and creating a barrel export from `src/components/ui/index.ts`.

## Known Technical Debt

1. **ProtectedRoute still uses inline spinner** — shared `Spinner` component exists but `ProtectedRoute.tsx` has not been updated to use it. Scheduled for Phase 4.
2. **UI component library** not started — Button, Input, Select, Table, Modal, Card, Badge not yet built
3. **`activeEntries` stale lock cleanup** — defined architecturally but not implemented
4. **Fee calculator** — defined architecturally but not implemented
5. **No error boundaries** — auth errors propagate to caller
6. **Routes use direct imports** — not lazy-loaded (acceptable for MVP scale; `React.lazy` can be added later if bundle size becomes a concern)

## Future Improvements

- [x] Shared UI component library (Spinner extracted, remaining: Button, Input, Select, Table, Modal, Card, Badge)
- [ ] Firebase Cloud Function for user creation (replace Firebase Console workflow)
- [ ] Write-time aggregation for reports (Cloud Function updates daily summaries on exit)
- [ ] Time-partitioned parking entries (date-based subcollections)
- [ ] Payment gateway integration
- [ ] Multi-location support
- [ ] BigQuery export for advanced reporting
- [ ] Error boundary component for graceful failure handling
- [ ] Sentry or similar error monitoring

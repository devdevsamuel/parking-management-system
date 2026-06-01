# Architecture

## Architecture Overview

The Parking Management System follows a **feature-based clean architecture** with strict separation of concerns. The architecture is organized into four layers:

```
Presentation (Components)
    ↓ calls hooks
Application (Hooks + Services)
    ↓ calls Firebase SDK
Infrastructure (Firebase Auth + Firestore)
    ────────
Config (cross-cutting configuration)
Types (shared domain models)
Lib (pure utility functions)
```

Each layer has a single responsibility and communicates only with the layer directly below it.

## Folder Structure

```
src/
├── app/                    # App shell: providers, entry point
│   ├── App.tsx
│   ├── main.tsx
│   └── providers/          # React Context providers (AuthProvider)
│
├── assets/                 # Static assets (images, icons) — currently empty
│
├── components/
│   └── ui/                 # Shared reusable UI primitives (Spinner, Button, Input, Table, Modal)
│                           # NOT feature-specific; feature components live in features/
│
├── config/                 # Cross-cutting configuration
│   ├── firebase.ts         # Firebase app initialization (auth, db)
│   ├── routes.ts           # Route path constants
│   ├── permissions.ts      # Permission types, role-permission mapping
│   └── constants.ts        # App-wide constants (timezone, collection names)
│
├── features/               # Feature modules (one per domain capability)
│   ├── auth/               # Authentication + authorization UI
│   ├── customers/          # Customer management
│   ├── dashboard/          # Dashboard with stats and occupancy
│   ├── parking/            # Parking entry and exit workflows
│   ├── parking-lot/        # Parking lot configuration
│   ├── rates/              # Pricing rate management
│   ├── reports/            # Operational reports
│   ├── users/              # User management (admin)
│   └── vehicles/           # Vehicle management
│
├── hooks/                  # Shared cross-feature custom hooks
│
├── layouts/                # Page layout components (AuthLayout, DashboardLayout)
│
├── lib/                    # Pure utility functions (feeCalculator, formatters, validators)
│
├── routes/                 # Route definitions with lazy loading
│   └── AppRouter.tsx       # Route definitions with nested layout routes
│
├── services/               # Firebase abstraction layer (auth, firestore)
│
└── types/                  # Shared TypeScript domain model types
```

## Feature Module Structure

Each feature in `features/<name>/` follows a consistent internal structure:

```
features/<name>/
├── api/            # Firestore queries and mutations for this feature
├── components/     # Feature-specific React components (not reusable outside feature)
├── hooks/          # Feature-specific custom hooks
└── pages/          # Page-level components (one per route)
```

### Responsibilities

#### Components (`components/ui/`)
- Generic, reusable UI primitives (Button, Input, Select, Table, Modal, Card, Badge, Spinner)
- No business logic
- No direct Firebase calls
- Receive data and callbacks via props

#### Feature Components (`features/<name>/components/`)
- Compositions of UI primitives and feature-specific markup
- Minimal logic — delegates to hooks
- Not intended for reuse across features

#### Hooks
- Business logic and state management
- Call service functions for data access
- Return data and actions to components
- Can use other hooks (useAuth, useMediaQuery, etc.)

#### Services
- Abstract Firebase SDK calls
- Transform Firestore data to/from domain types
- Handle Firebase-specific error handling
- Pure data access — no React, no UI logic

#### Config
- Static configuration with `as const` for literal types
- Environment-dependent values (Firebase config)
- Role-permission mappings
- Route path constants
- Collection name constants

#### Types
- Interfaces for domain models (matching Firestore document shapes)
- Type aliases for unions, enums, and utility types
- Import-only with `import type` (no runtime code)
- Barrel export from `types/index.ts`

#### Providers (`app/providers/`)
- React Context providers for cross-cutting concerns (auth)
- Subscribe to external state (Firebase auth listener)
- Provide context value to entire component tree

#### Layouts
- Page shell components (header, sidebar, content area)
- Read auth state for user info and navigation
- No page-specific logic

#### Routes
- Centralized route definitions
- ProtectedRoute wrappers for auth and permission checks
- React Router configuration with nested layout routes (DashboardLayout via `<Outlet />`)

## Firebase Integration Strategy

- Firebase is the only backend dependency
- `src/config/firebase.ts` initializes Firebase and exports `auth` and `db`
- Services layer (`src/services/auth.ts`, `src/services/firestore.ts`) wraps Firebase SDK calls
- Components never import from `firebase/*` directly
- Services transform Firestore document shapes to typed domain models

```
Component → Hook → Service → Firebase SDK
```

## Authentication Architecture

```
Firebase Auth (email/password)
    ↓ onAuthStateChanged listener
AuthProvider (React Context)
    ↓ loadUserRole (Firestore users/{uid})
AuthContextValue { user, loading, signIn, signOut, hasPermission }
    ↓ useAuth hook
Components
```

- Auth state is managed via React Context, not external state management
- Firebase `onAuthStateChanged` listener is subscribed in AuthProvider
- User role is fetched from Firestore `users/{uid}` document after authentication
- Firestore is the authoritative source for roles
- Firebase Custom Claims are NOT used
- Loading state is true during initial auth resolution and during sign-in

## Authorization Architecture

```
Permission type (union of string literals)
    ↓
ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]>
    ↓
hasPermission(permission) checks user.role against mapping
    ↓
ProtectedRoute uses hasPermission for route gating
```

- Permissions are string literal types (`'users:manage'`, `'parking:entry:create'`, etc.)
- Each role maps to a readonly array of permissions
- `hasPermission` is a pure function of `(user.role, permission)` → `boolean`
- ProtectedRoute supports optional `requiredPermission` prop:
  - `<ProtectedRoute>` — auth only
  - `<ProtectedRoute requiredPermission="users:manage">` — auth + permission check
- Unauthenticated users redirect to `/login`
- Authenticated but unauthorized users redirect to `/`

## TypeScript Conventions

- `strict: true` enabled
- `verbatimModuleSyntax: true` (requires `import type` for type-only imports)
- `noUnusedLocals: true`, `noUnusedParameters: true`
- `any` is forbidden
- Explicit typing preferred when educational value is higher
- `interface` for object shapes (extends better, better error messages)
- `type` for unions, aliases, and utility types
- `as const` for literal constant objects
- Path alias `@/` maps to `src/`

## Route Protection Strategy

```
<ProtectedRoute requiredPermission="users:manage">
  <UsersPage />
</ProtectedRoute>
```

1. `useAuth()` reads context → gets `{ user, loading, hasPermission }`
2. If `loading` → show spinner (no redirect during loading)
3. If `!user` → `<Navigate to="/login" replace />`
4. If `requiredPermission && !hasPermission(requiredPermission)` → `<Navigate to="/" replace />`
5. Otherwise → render children

## Why This Architecture Was Chosen

| Decision | Rationale |
|---|---|
| Feature-based | Each feature is independent; teams can work in parallel; deleting a feature = deleting one folder |
| Components separated by scope | `components/ui/` for shared primitives, `features/X/components/` for specific compositions. Prevents bloated shared component folders |
| Services layer | Firebase is abstracted behind services. Swapping to a different backend requires changing only services/ |
| Hooks as logic layer | Components remain declarative; logic is testable without rendering |
| Pure functions in lib/ | Fee calculator, formatters, validators are testable without React or Firebase |
| Context for auth | No state management library needed for MVP. Auth is read-heavy, write-light |
| Config as constants with `as const` | Prevents typos, enables autocomplete, allows TypeScript to infer literal types |

## Architectural Simplifications Approved for MVP

- **No Cloud Functions** — Firebase Admin SDK is not used. User creation happens via Firebase Console. No backend code.
- **No microservices** — Single frontend application, single Firebase project.
- **No multi-location support** — Single parking lot only.
- **No dedicated payments collection** — Payment data is embedded in ParkingEntry.
- **No occupancy counter document** — Occupancy is derived from querying active entries.
- **No multi-document transactions** — Exit workflow uses single-document transaction on ParkingEntry.
- **No BigQuery or external reporting** — Reports use client-side aggregation over Firestore data.
- **No sharded counters** — Single-document occupancy query is sufficient for MVP traffic.

## Decisions That Must Not Be Changed Without Discussion

1. Firebase is the only backend — no additional servers, databases, or services without explicit approval
2. React Context for auth — no external state management library unless justified
3. Feature-based folder structure — do not collapse features into flat folders
4. Snapshot strategy — rateSnapshot, vehicleSnapshot, customerSnapshot, calculationDetails must be preserved
5. Payment embedded in ParkingEntry — no separate payments collection without re-evaluation
6. Occupancy is informational — entries are never blocked
7. Cash-first payment — no payment gateway integration in MVP
8. Firestore is source of truth for roles — no Custom Claims
9. Single-document transaction for exit — no multi-document transactions
10. TypeScript strict mode must remain enabled

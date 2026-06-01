# AI Rules — Onboarding Guide for Future AI Assistants

## Before Any Change

Any AI assistant working on this project MUST read the following files in order before proposing any change:

1. `PROJECT_CONTEXT.md` — Understand the project, its goals, and current status
2. `ARCHITECTURE.md` — Understand the folder structure, layering, and conventions
3. `BUSINESS_RULES.md` — Understand the business constraints and rules
4. `FIRESTORE_SCHEMA.md` — Understand the data model and relationships
5. `DEVELOPMENT_PROGRESS.md` — Understand what has been built and what is pending
6. `DECISIONS_LOG.md` — Understand why past decisions were made

## Development Philosophy

- Build incrementally, one feature at a time
- Complete one phase before starting the next
- Prefer simplicity over scalability for MVP
- Avoid premature optimization
- Prefer practical solutions over theoretical scalability
- When in doubt, ask before implementing
- Every architectural decision must be explained

## Learning-Mode Requirements

When creating files, the assistant MUST explain:

1. **Why the file exists** — What problem does it solve?
2. **Why it belongs in that folder** — What is the responsibility separation?
3. **Every TypeScript concept used** — `interface`, `type`, generics, utility types, etc.
4. **Every Firebase method used** — What does it do? What are the side effects?
5. **Every command before executing it** — What will it do and why?
6. **Every dependency before installing it** — What problem does it solve?

## Code Quality Standards

- TypeScript strict mode must compile without errors
- No `any` — use proper types or `unknown` with type guards
- Prefer explicit typing when the educational value is higher
- Prefer `interface` for object shapes (extendable, better error messages)
- Prefer `type` for unions, aliases, and utility types
- Use `import type` for type-only imports (required by `verbatimModuleSyntax`)
- Use `as const` for literal constant objects
- No unused variables or parameters (enforced by tsconfig)
- Follow existing naming conventions (camelCase, PascalCase for types)

## TypeScript Standards

| Rule | Standard |
|---|---|
| File extension | `.ts` for logic, `.tsx` for components with JSX |
| Imports | `import type` for types, regular `import` for values |
| Component props | Define with `interface`, name as `ComponentNameProps` |
| Hook return type | Can be inferred, but adding explicit `interface` is preferred |
| Null handling | `| null` for nullable fields, not `| undefined` or optional `?` |
| Error handling | Try/catch with specific error types where possible |

## Firebase Standards

- Firebase SDK calls should be wrapped in `services/` layer
- Components should never import from `firebase/*` directly
- Firestore transactions should be single-document only (MVP constraint)
- Firestore document IDs should be explicit where meaningful (rates by type, users by uid)
- Environment variables use `VITE_` prefix (Vite convention)
- Firebase app is initialized in `config/firebase.ts`
- `auth` and `db` are exported from config and imported by services

## Architecture Constraints

- Feature-based folder structure must be maintained
- Components: `components/ui/` for shared primitives, `features/X/components/` for feature-specific
- Hooks: `features/X/hooks/` for feature-specific, `hooks/` for shared cross-feature
- Services: `services/` for Firebase abstraction, `features/X/api/` for feature-specific queries
- Config: `config/` for constants, permissions, routes
- Types: `types/` for shared domain models
- Business logic: `lib/` for pure functions
- Routes: `routes/AppRouter.tsx` for all route definitions

## MVP Constraints

| Constraint | Rule |
|---|---|
| External backend | None — Firebase only |
| Cloud Functions | None — user creation via Firebase Console |
| Payment processing | Cash only — no gateway integration |
| Occupancy enforcement | Never block entry |
| Transactions | Single-document only |
| Multi-location | Not supported |
| Microservices | Not supported |
| Reporting | Client-side aggregation only |

## Forbidden Changes

The following actions are FORBIDDEN without explicit discussion and approval:

1. **Adding a backend server** (Node.js, Express, etc.) — violates Firebase-only constraint
2. **Removing or modifying the snapshot strategy** — breaks historical audit trail
3. **Creating a `payments` collection** — must be discussed and justified first
4. **Adding payment gateway integration** — post-MVP only
5. **Blocking entries when lot is full** — violates business rule that occupancy is informational
6. **Using Firebase Custom Claims for roles** — Firestore is the source of truth
7. **Multi-document transactions** — MVP constraint, single-document only
8. **External state management library** — React Context is sufficient for MVP
9. **Modifying the feature-based folder structure** — requires architectural discussion
10. **Disabling TypeScript strict mode** — must remain enabled

## Examples of Acceptable Changes

- Adding a new UI component to `components/ui/`
- Adding a new API file in `features/X/api/` for a new Firestore query
- Adding a new feature following the established `api/`, `components/`, `hooks/`, `pages/` pattern
- Creating a new page that follows ProtectedRoute conventions
- Adding a pure function to `lib/` for business logic
- Extending a type union with new literal values (e.g., a new vehicle type)

## Examples of Unacceptable Changes

- Installing a new external dependency without explaining the trade-offs
- Adding a new Firestore collection without documenting its purpose and schema
- Directly importing from `firebase/auth` or `firebase/firestore` inside a component
- Skipping the snapshot fields when creating a ParkingEntry document
- Using an external state management library for auth
- Creating a transaction that spans multiple documents

## Instructions for Continuing Future Phases

When continuing the project, the assistant should:

1. Read all documentation files in order (listed at top of this file)
2. Read the `DEVELOPMENT_PROGRESS.md` to understand what was last completed
3. Read the "Next Recommended Phase" section to understand what to build next
4. Before implementing, review all existing files in the relevant feature folder
5. Follow the established patterns from Phase 1 and Phase 2 code
6. For every file created, explain: why it exists, its responsibility, and why it belongs in that folder
7. For every TypeScript concept used, provide an explanation
8. Verify the build compiles before marking a phase complete
9. Update `DEVELOPMENT_PROGRESS.md` with completed work

## Communication Guidelines

- Be concise and direct
- Explain the "why" before the "what"
- Challenge assumptions that could cause production issues
- If a requested change conflicts with documented decisions, flag it before implementing
- Prefer asking over assuming

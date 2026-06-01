# Project Context

## Project Overview

A Parking Management System (PMS) for a single parking lot location. The system enables parking lot operators and administrators to manage vehicle entries and exits, track parking sessions, calculate fees based on configurable pricing rates, and generate operational reports.

## Project Goals

- Provide a simple, reliable system for managing daily parking lot operations
- Eliminate manual fee calculation errors
- Maintain accurate historical records of all parking sessions
- Provide real-time visibility into lot occupancy
- Enable configurable pricing without developer intervention
- Generate basic operational reports

## Problem Being Solved

Small parking lots rely on manual ticket systems or error-prone mental calculation for fee collection. There is no audit trail, pricing changes require re-printing rate cards, and occupancy is tracked through visual estimation. This system digitizes the entire workflow while keeping operational complexity low.

## Target Users

- **Parking Operators** — Register vehicle entries, process exits, collect cash payments, view active sessions
- **Administrators** — All operator capabilities plus manage pricing rates, configure lot settings, view reports, manage user accounts

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | ^19.2.6 |
| Build tool | Vite | ^8.0.12 |
| Language | TypeScript | ~6.0.2 (strict mode) |
| Authentication | Firebase Authentication | ^12.14.0 |
| Database | Cloud Firestore | ^12.14.0 |
| Styling | Tailwind CSS | ^4.3.0 |
| Routing | react-router-dom | ^7.16.0 |
| Deployment | Vercel | — |

## Current MVP Scope

- Single parking lot location
- Cash-only payments
- Email/password authentication
- Two user roles: admin and operator
- Vehicle entry and exit registration
- Time-based fee calculation with configurable rates
- Dashboard with real-time occupancy and recent entries
- Basic operational reports
- Historical record preservation

## Current Project Status

Phase 3 (Login Page and Core Navigation) completed. Phases 1 through 3 are production-ready and compiled. The Firebase project is connected, Authentication is enabled, Firestore security rules permit authenticated users to read their own user document, and a Firestore user document has been created and verified. The login flow is fully functional. The project is ready for Phase 4 (Shared UI Component Library).

## Completed Phases

- **Phase 1**: Project scaffolding, dependency installation, TypeScript strict mode, Tailwind CSS, folder structure, domain types, Firebase initialization, configuration files
- **Phase 2**: Authentication foundation — permission system, Firebase Auth wrapper, AuthProvider context, useAuth hook, ProtectedRoute guard
- **Phase 3**: Login page, Dashboard layout, sidebar navigation, AppRouter, shared Spinner component, Firebase environment configuration, Authentication enabled, Firestore security rules updated, user document created and verified, login flow fully functional

## Pending Phases

- Phase 4: Shared UI Component Library
- Phase 5: Rates and parking lot configuration
- Phase 6: Customer and vehicle management
- Phase 7: Parking entry workflow
- Phase 8: Parking exit workflow with fee calculation
- Phase 9: Dashboard
- Phase 10: Reports
- Phase 11: User management (admin)

## High-Level Architecture Summary

```
Feature-based clean architecture:

Presentation (Components) → Application (Hooks + Services) → Infrastructure (Firebase)

- Components render UI and delegate logic to hooks
- Hooks manage state and call service functions
- Services abstract Firebase Auth and Firestore operations
- Business logic (fee calculation) lives in pure functions in lib/
- Configuration (permissions, routes, constants) lives in config/
```

## Current Development Philosophy

- Build incrementally, one feature at a time
- Prefer simplicity over scalability for MVP
- Avoid premature optimization
- Use pure functions for business logic
- Keep Firebase as the only backend dependency
- No external state management libraries (React Context is sufficient)

## Future Roadmap (Discussed Only)

- Payment gateway integration (post-MVP)
- Multi-location support (post-MVP)
- BigQuery export for advanced reporting (post-MVP)
- Cloud Functions for user creation (post-MVP)
- Time-partitioned Firestore collections for archive (post-MVP)
- Sharded occupancy counters for high traffic (post-MVP)
- Refund and void payment workflows (post-MVP)
- Lost ticket workflow with flat fee (post-MVP)

# Parking Management System

A modern parking management system built with React, TypeScript, Firebase, and Tailwind CSS.

The application is designed for small and medium-sized parking lots, allowing operators to register vehicle entries and exits, manage customers and vehicles, configure parking rates, track occupancy, and generate operational reports.

## Key Features

* Secure authentication with Firebase Authentication
* Role-based access control (Admin and Operator)
* Customer and vehicle management
* Parking entry and exit registration
* Automatic parking fee calculation
* Configurable pricing rules by vehicle type
* Real-time occupancy tracking and overcapacity monitoring
* Historical snapshots for auditability and reporting
* Dashboard with operational metrics
* Revenue and activity reports
* Responsive and scalable architecture

## Technical Stack

* React
* TypeScript (Strict Mode)
* Vite
* Firebase Authentication
* Cloud Firestore
* Tailwind CSS
* React Router

## Architecture

The project follows a feature-based architecture combined with clean separation of concerns:

Presentation Layer → Application Layer → Firebase Infrastructure

Business logic is isolated from UI components, making the application easier to maintain, test, and scale.

## Current Status

This project is being developed as an MVP (Minimum Viable Product) focused on cash-based parking operations, with future plans for payment gateway integrations, multi-location support, and advanced reporting capabilities.

File context lines	Purpose
PROJECT_CONTEXT.md	101	Project overview, goals, stack, scope, roadmap
ARCHITECTURE.md	245	Folder structure, layering, conventions, protected decisions
BUSINESS_RULES.md	157	All approved business rules, MVP constraints, assumption challenges
FIRESTORE_SCHEMA.md	430	All 7 collections documented with fields, types, indexes, relationships
DEVELOPMENT_PROGRESS.md	205	Completed Phase 1 & 2, auth/authorization flows, technical debt, roadmap
AI_RULES.md	145	Onboarding guide for future AI agents, forbidden changes, standards
DECISIONS_LOG.md	333	30 architectural decisions with rationale, alternatives, and impact
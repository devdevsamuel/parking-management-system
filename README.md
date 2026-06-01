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

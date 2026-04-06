# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-03-07

### Added
- **Authentication** — Login, Register with session-based auth and role routing
- **Patient Dashboard** — Stats cards, recent bookings overview
- **Lab Tests Catalog** — Search, filter, pagination, and test detail modals
- **Booking System** — Book tests, select date/time/collection type, price breakdown
- **My Bookings** — Status tabs, booking cards, cancel flow, invoice download
- **Booking Details** — Status timeline, patient/test info, print option
- **Patient Profile** — View/edit profile, change password, delete account
- **Doctor Dashboard** — Pending approvals count, recent bookings stats
- **Pending Approvals** — Confirm/reject bookings with filters and pagination
- **All Bookings (Doctor)** — Advanced filters, CSV/PDF export, column visibility
- **Patient History (Doctor)** — Search patients, view booking history
- **Technician Dashboard** — Today's collections, schedule overview
- **Assigned Collections** — Collection cards with mark-collected flow
- **Collection History** — Date range filters, export options

### Infrastructure
- **Error Boundaries** — Global React error boundary with recovery UI
- **API Interceptors** — Axios retry with exponential backoff (3 attempts)
- **Offline Indicator** — Network connectivity toast notifications
- **Form Validations** — Phone (India +91), age restrictions, password strength meter
- **Web Vitals** — FCP, LCP, CLS, INP, TTFB monitoring with threshold warnings

### UI/UX
- **Dark Mode** — Persistent toggle with Tailwind `dark:` variant
- **Animations** — Framer Motion page transitions and card hover effects
- **Skeleton Loaders** — Content-shaped loading placeholders for dashboards
- **Accessibility** — WCAG AA focus rings, `aria-current`, `aria-expanded` attributes

### Performance
- **Code Splitting** — React.lazy() for all route components
- **Vendor Chunks** — Separated React, ReactDOM, Framer Motion bundles
- **Bundle Analysis** — rollup-plugin-visualizer integration
- **React.memo** — Memoized Card, StatusBadge, and dashboard components
- **PWA** — vite-plugin-pwa with service worker and offline caching

### DevOps
- **Environment Configs** — `.env.production`, `.env.staging`, `.env.example`
- **Vercel Config** — SPA rewrites, security headers, asset caching
- **Netlify Support** — `_redirects` for SPA routing
- **GitHub Actions** — CI (lint/typecheck/build) and deploy workflows
- **Sentry Integration** — Optional error tracking with dynamic SDK loading
- **SEO** — Meta tags, Open Graph properties, robots directive

# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

---

## [1.0.0] - 2026-02-18

### Added

- JWT authentication with refresh tokens and RBAC (PATIENT, TECHNICIAN, MEDICAL_OFFICER, ADMIN)
- User registration, login, profile management, and password change
- Lab test catalog (100+ tests across 15 categories)
- Fuzzy search, filters, sorting, and pagination for tests
- Test packages (Complete, Executive, Master) with bundled pricing
- Location-based pricing and lab partner support
- Booking system with home sample collection and slot scheduling
- Proximity-based technician assignment and booking tracking
- 12-state booking workflow with timeline updates
- Payment processing with gateway integration and webhook handling
- Automated report generation with abnormality detection and PDF export
- Report verification, trends, and critical value alerts
- Notifications via email and SMS
- Admin dashboard with analytics (bookings, revenue, trends, popular tests)
- Redis caching for catalog, pricing, and sessions
- Database indexing and JPA optimization for performance
- Global exception handling and input validation
- Spring Boot Actuator health and metrics endpoints
- Load testing suite with JMeter and reporting
- Docker Compose setup for local environments
- Comprehensive documentation (features, architecture, API, setup, deployment)

### Fixed

- N/A (initial release)

### Known Issues

- None reported at release time. Open an issue if you find a bug or regression.

### Roadmap

- Add multi-lab partner marketplace support with SLA-based routing
- Introduce appointment rescheduling with automated technician re-assignment
- Add push notifications for mobile clients
- Implement advanced analytics dashboards (cohort analysis, retention)
- Add full audit trail with exportable compliance reports
- Enable multi-region deployments with read replicas and failover
- Add rate limit dashboards and per-tenant quotas
- Implement full-text search with Elasticsearch
- Add offline PDF report access for mobile
- Expand test package personalization using health scores

---

## [Unreleased]

- Planned improvements and feature expansions will be tracked here.

# Consolidated Schema and API Status (MySQL + Spring Boot)

## Current Snapshot (April 2026)

Your proposal is document-first (collections), while this project is relational (MySQL + JPA).  
Mapping is now in place and the core API surface is mostly aligned.

Flyway status:
- Baseline: `1`
- Applied: `V10` -> `V42` (success)
- `V42` seeds complete package catalog (M/W/C/CH/SM/SW/V package codes)

---

## 1) Core Model Mapping

| Proposed Core Collection | Current Relational Mapping | Status |
|---|---|---|
| `users` | `users` + profile-related tables (`family_members`, `user_addresses`, `medical_history`, `user_medications`, `emergency_contacts`) | Implemented |
| `tests` | `tests` (`LabTest`) | Implemented |
| `test_parameters` | `test_parameters` + `reference_ranges` | Implemented |
| `packages` | `test_packages` + `package_tests` (+ package metadata tables via JPA element collections) | Implemented |
| `bookings` | `bookings` | Implemented |
| `reports` | `reports` + `report_results` + `report_verifications` + `report_shares` | Implemented |
| `health_metrics` | `health_metrics` | Implemented |
| `promotions` | `promotions` API present; coupon-backed model still exists in parts of service layer | Partial-Unified |
| `collection_centers` | `lab_locations` / `lab_partners` equivalent | Partial (naming difference) |

---

## 2) Endpoint Alignment Status

### Authentication
- `POST /api/auth/register` implemented
- `POST /api/auth/login` implemented
- `POST /api/auth/logout` implemented
- `POST /api/auth/refresh-token` implemented
- `POST /api/auth/verify-email` implemented
- `POST /api/auth/verify-phone` not present as dedicated endpoint

### Packages
- `GET /api/packages` implemented
- `GET /api/packages/{id}` implemented
- `GET /api/packages/{id}/details` implemented
- `GET /api/packages/category/{category}` implemented
- `GET /api/packages/compare` implemented
- Admin create/update/delete under `/api/packages` still needs explicit verification for role guards

### Tests and Screenings
- `GET /api/tests` implemented
- `GET /api/tests/{id}` implemented (slug/id style depending on controller)
- `GET /api/tests/{id}/parameters` available through parameter controller flow
- `GET /api/tests/{id}/packages` available through package/test flows
- `GET /api/screenings` implemented

### User Profile
- `GET /api/users/profile` implemented
- `PUT /api/users/profile` implemented
- `GET/POST/PUT/DELETE /api/users/family-members*` implemented
- `GET/POST/PUT/DELETE /api/users/addresses*` implemented

### Bookings and Reports
- `POST /api/bookings` implemented
- `GET /api/users/bookings` implemented
- `PUT /api/users/bookings/{id}/reschedule` implemented
- `DELETE /api/users/bookings/{id}` implemented
- `GET /api/users/reports` implemented
- `GET /api/users/reports/{id}` implemented
- `GET /api/users/reports/{id}/pdf` implemented
- `POST /api/users/reports/{id}/share` implemented

### Settings, Health, Promotions
- `GET /api/users/settings` implemented
- `PUT /api/users/settings` implemented
- `POST /api/users/change-password` implemented
- `GET /api/users/health-metrics` implemented
- `GET /api/users/health-insights` implemented
- `GET /api/promotions` implemented
- `POST /api/promotions/apply` implemented

---

## 3) Database Migration Notes

- Package catalog migration added: `V42__seed_complete_health_packages_catalog.sql`
- It inserts/updates package master records with:
  - package code/name/type/tier
  - price and discount metadata
  - fasting + turnaround + consultation level
  - age/gender applicability and ordering

Important:
- `V4` and `V5` are intentionally shown as `Ignored` due to baseline ordering.
- `pom.xml` now includes Flyway ignore pattern for ignored migrations, so normal Flyway commands run cleanly.

---

## 4) Remaining Gaps to Reach Exact Proposal Parity

1. Add explicit `/api/auth/verify-phone` flow (OTP verification endpoint + service path).
2. Fully unify promotion storage naming (`coupons` vs `promotions`) if strict schema naming parity is required.
3. If needed, add first-class `collection_centers` naming alias over existing `lab_locations/lab_partners`.
4. Expand package sub-package linkage and package-level included test parameter richness to exactly match the document examples.

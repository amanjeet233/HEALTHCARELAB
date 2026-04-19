# Changelog

## [Unreleased]

### Fixed
- Added `package_id` column to `bookings` table in schema and database to match `Booking` entity mapping.
- Recreated `bookings.package_id` column and foreign key to `test_packages(id)` to eliminate MySQL metadata issues causing `Unknown column 'pb1_0.package_id'` errors.
- Updated `DataInitializer` to use `existsByEmail` / `findByEmailWithoutRelationships` to avoid unnecessary relationship loading during startup.
- Adjusted `AuditListener` to skip loading `@OneToMany` / collection fields when capturing audit snapshots, preventing eager loading of `Booking` records during initialization.

### Notes
- Application now starts successfully, `DataInitializer` completes, and all default users are initialized with correct roles.
- Redis warnings about repository store assignment are informational only and do not block application startup.

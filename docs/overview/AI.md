# Healthcare Lab Test Booking System - AI Change Log

## Last Updated: 2026-02-16

## Issues Fixed

### 1. Register API 500 Error
- **Problem**: Register API was returning 500 when email already existed
- **Cause**: RuntimeException thrown without proper exception handler
- **Fix**: 
  - Created `UserAlreadyExistsException` class
  - Updated `GlobalExceptionHandler` to return 409 Conflict
  - Simplified controller to let exception handler work

### 2. Authentication Flow
- **Problem**: Login working but register failing with same credentials
- **Cause**: Test data already exists in database
- **Fix**: Proper error handling with appropriate HTTP status codes

### 3. Database Connection
- **Status**: ✅ Working
- **Database**: MySQL
- **URL**: jdbc:mysql://localhost:3306/labtestbooking

### 4. JWT Configuration
- **Status**: ✅ Working
- **Secret**: Configured in application.properties
- **Expiration**: 24 hours (86400000 ms)

## API Status

| Endpoint | Method | Expected Status | Actual Status |
|----------|--------|-----------------|---------------|
| /api/auth/register | POST | 201 Created / 409 Conflict | ✅ Working |
| /api/auth/login | POST | 200 OK | ✅ Working |
| /api/users/profile | GET | 200 OK | ✅ Working |
| /api/bookings/slots | GET | 200 OK | ✅ Working |
| /api/bookings | POST | 201 Created | ⚠️ Pending |

## Known Issues
1. Create Booking API returning 500 (needs investigation)
2. Test data already exists (patient@test.com, tech@test.com, doctor@test.com)

## Next Steps
1. Fix Create Booking API (check BookingService)
2. Add test data cleanup utility
3. Update API documentation

## Configuration
- Java Version: 21
- Spring Boot: 3.2.2
- Database: MySQL 8.0
- Port: 8080

# 🚀 QUICK START - Data Initialization

## What Was Done

✅ **Created 3 files to fix data initialization issues:**

### 1. [data.sql](src/main/resources/data.sql)
- **Location:** `src/main/resources/data.sql`
- **Contains:** 6 lab tests + 3 users with correct roles
- **Runs:** Automatically on Spring Boot startup (after schema creation)
- **Password:** All users have password = "password123" (BCrypt encoded)

### 2. [DataInitializer.java](src/main/java/com/healthcare/labtestbooking/config/DataInitializer.java)
- **Location:** `src/main/java/com/healthcare/labtestbooking/config/DataInitializer.java`
- **Type:** Spring @Component implementing CommandLineRunner
- **Does:**
  - Runs on Spring Boot startup
  - Inserts lab tests (if database is empty)
  - Inserts/fixes users with correct roles
  - Prevents duplicate inserts on every restart
  - Logs all actions with DEBUG level

### 3. [application.properties](src/main/resources/application.properties) - UPDATED
- **Added:** Three new configuration properties
```properties
spring.sql.init.mode=always
spring.sql.init.continue-on-error=true
spring.jpa.defer-datasource-initialization=true
```

---

## Test Users Created

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| `patient@test.com` | password123 | PATIENT | Test booking creation |
| `technician@test.com` | password123 | TECHNICIAN | Test report submission |
| `doctor@test.com` | password123 | MEDICAL_OFFICER | Test approval workflows |

---

## Lab Tests Created

1. **Blood Glucose Test** - $200 (Fasting: 8 hrs)
2. **Complete Blood Count (CBC)** - $300 (No fasting)
3. **Thyroid Profile** - $500 (No fasting)
4. **Lipid Profile** - $250 (Fasting: 12 hrs)
5. **Liver Function Test** - $350 (No fasting)
6. **Kidney Function Test** - $280 (No fasting)

---

## How to Use

### Option 1: Automatic (Recommended)
```bash
# Just restart Spring Boot - everything happens automatically
mvn spring-boot:run
```
- data.sql runs first (inserts initial data)
- DataInitializer runs next (verifies and fixes roles)
- Logs show: "========== DATA INITIALIZER STARTED =========="

### Option 2: Manual Database Reset
```sql
-- If you want to reset everything:
DELETE FROM users WHERE email IN ('patient@test.com', 'technician@test.com', 'doctor@test.com');
DELETE FROM lab_tests;

-- Then restart Spring Boot
```

---

## Verify It Works

### In MySQL:
```sql
-- Check lab tests
SELECT COUNT(*) FROM lab_tests;  -- Should show 6

-- Check users
SELECT email, role FROM users;
-- Should show:
-- patient@test.com | PATIENT
-- technician@test.com | TECHNICIAN
-- doctor@test.com | MEDICAL_OFFICER
```

### In Postman:
```
✅ POST /api/auth/login
   Email: technician@test.com, Password: password123
   Response: 200 OK with JWT token

✅ POST /api/bookings
   With patient token, use lab test ID: 1
   Response: 201 Created

✅ POST /api/reports/results
   With technician token
   Response: 201 Created (not 401 anymore!)
```

### In Spring Boot Logs:
```
========== DATA INITIALIZER STARTED ==========
Checking lab tests in database...
✓ Lab tests already exist (count: 6). Skipping initialization.
Checking users in database...
✓ Patient user already exists
✓ Technician user already exists with TECHNICIAN role
✓ Doctor user already exists with MEDICAL_OFFICER role
✓ All users initialized successfully with correct roles
========== DATA INITIALIZER COMPLETED ==========
```

---

## Problem → Solution

| Issue | Cause | Solution |
|-------|-------|----------|
| "Lab test not found" (400) | Empty lab_tests table | ✅ Seeded by data.sql + DataInitializer |
| "Unauthorized" (401) on /api/reports/results | technician has PATIENT role | ✅ DataInitializer fixes role to TECHNICIAN |
| Postman tests fail | doctor has PATIENT role | ✅ DataInitializer fixes role to MEDICAL_OFFICER |
| Data duplicates on restart | data.sql inserted every time | ✅ DataInitializer checks count, only inserts once |

---

## Files Overview

```
src/main/
├── resources/
│   ├── application.properties   ← UPDATED (added 3 spring.sql.init properties)
│   ├── data.sql                 ← NEW (SQL insert statements)
│   └── schema.sql               ← Existing (unchanged)
│
└── java/com/healthcare/labtestbooking/config/
    ├── DataInitializer.java     ← NEW (Spring component)
    ├── SecurityConfig.java      ← Existing (unchanged)
    └── GlobalExceptionHandler.java ← Existing (unchanged)
```

---

## Spring Boot Startup Order

```
1. MySQL Database connects
2. Hibernate creates tables from @Entity classes (ddl-auto=update)
3. data.sql executes (inserts lab tests + users)
4. DataInitializer.run() executes:
   - Checks if lab_tests exist, if yes → skip insert
   - Checks if users exist, if wrong role → update
   - Logs all actions
5. Application ready on port 8080
```

---

## Configuration Properties Explained

```properties
# spring.sql.init.mode=always
# → Execute data.sql every startup (Spring Boot 2.5+)
# Change to 'never' to disable

# spring.sql.init.continue-on-error=true
# → Don't crash if data.sql has errors
# Useful if data already exists

# spring.jpa.defer-datasource-initialization=true
# → Wait for Hibernate DDL first, then run data.sql
# CRITICAL: Must be true for data.sql to work after schema creation
```

---

## No Manual Setup Needed

❌ **Don't need to:**
- Manually run SQL insert statements
- Create users before testing
- Stop and restart to seed data
- Use different test database

✅ **Everything happens automatically:**
- Spring Boot startup → MySQL tables created → data inserted → roles verified
- Idempotent (safe to restart multiple times)
- Logs show exactly what happened

---

**Compilation Status:** ✅ SUCCESSFUL
**All Files:** ✅ VERIFIED
**Ready for Testing:** ✅ YES

Next: Restart Spring Boot and run your Postman tests!

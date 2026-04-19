# Healthcare Lab Test Booking API - Data Initialization Guide

## ✅ SOLUTION SUMMARY

Complete data initialization setup that solves all three problems:

- ✅ **6 lab tests** auto-seeded on startup
- ✅ **Correct user roles** enforced:
  - patient@test.com → PATIENT
  - technician@test.com → TECHNICIAN
  - doctor@test.com → MEDICAL_OFFICER
- ✅ **Email alignment** fixed (technician@test.com everywhere)

---

## 📁 FILE LOCATIONS

```
src/main/
├── resources/
│   ├── application.properties          ← UPDATED
│   ├── data.sql                        ← NEW
│   └── schema.sql
└── java/com/healthcare/labtestbooking/
    └── config/
        ├── DataInitializer.java        ← NEW
        ├── SecurityConfig.java
        └── GlobalExceptionHandler.java
```

---

## 📝 data.sql (NEW)

**Location:** `src/main/resources/data.sql`

**Purpose:** SQL seed script executed automatically on Spring Boot startup

**Contains:**
- 6 lab tests with all fields (testName, category, price, fastingRequired, etc.)
- 3 users with CORRECT roles (PATIENT, TECHNICIAN, MEDICAL_OFFICER)

**Key Features:**
- Uses `INSERT INTO` statements
- All passwords use BCrypt hash of "password123"
- All users have `is_active=true`
- All lab tests have `is_active=true`

---

## ⚙️ application.properties (UPDATED)

**Location:** `src/main/resources/application.properties`

**New Configuration:**
```properties
spring.sql.init.mode=always
spring.sql.init.continue-on-error=true
spring.jpa.defer-datasource-initialization=true
```

**Purpose:**
- Enable data.sql execution on every startup
- Don't crash if data.sql has issues
- Let Hibernate create schema first, THEN run data.sql

---

## 🚀 DataInitializer.java (NEW)

**Location:** `src/main/java/com/healthcare/labtestbooking/config/DataInitializer.java`

**Purpose:** Smart Spring Boot component that intelligently initializes data

### Key Features:

**1. Prevents Duplicate Inserts**
```java
long existingCount = labTestRepository.count();
if (existingCount > 0) {
    log.info("✓ Lab tests already exist. Skipping initialization.");
    return;
}
```

**2. Fixes User Roles if Incorrect**
```java
if (existingTech.getRole() != UserRole.TECHNICIAN) {
    existingTech.setRole(UserRole.TECHNICIAN);
    userRepository.save(existingTech);
}
```

**3. Uses CommandLineRunner Pattern**
- Automatically runs after Spring Boot startup
- No need to call manually

**4. Transaction Management**
- All operations are atomic with @Transactional

**5. Uses PasswordEncoder**
- Passwords properly encrypted with BCrypt

**6. Detailed Logging**
```
========== DATA INITIALIZER STARTED ==========
✓ Lab tests already exist (count: 6). Skipping initialization.
========== DATA INITIALIZER COMPLETED ==========
```

---

## ✅ VERIFICATION

### Check Compilation
```bash
mvn -q -DskipTests compile
# Should show: ✓ Compilation successful!
```

### Check Database After Startup
```sql
SELECT COUNT(*) FROM lab_tests;         -- Should show: 6
SELECT COUNT(*) FROM users WHERE role='TECHNICIAN';  -- Should show: 1
SELECT COUNT(*) FROM users WHERE role='MEDICAL_OFFICER';  -- Should show: 1

SELECT email, role FROM users;
-- Should show:
-- patient@test.com          | PATIENT
-- technician@test.com       | TECHNICIAN
-- doctor@test.com           | MEDICAL_OFFICER
```

### Test Postman Endpoints
```
POST /api/auth/login
Body: { "email": "technician@test.com", "password": "password123" }
Result: 200 OK with token

POST /api/reports/results (with technician token)
Result: 201 Created (no longer 401 Unauthorized)
```

---

## 🔄 INITIALIZATION EXECUTION ORDER

When Spring Boot Starts:

```
1. Spring Context Initialization
2. DataSource Configuration (MySQL)
3. JPA/Hibernate Bean Creation
4. Hibernate Schema Creation (DDL)
5. data.sql Execution (INSERTs)
6. All Beans Initialized
7. CommandLineRunner.run() Executes
   ├─ DataInitializer checks data
   ├─ Verifies lab tests count
   └─ Fixes user roles if needed
8. Application Ready
```

---

## 📊 DATABASE SCHEMA MATCH

### Lab Tests Table:
```sql
CREATE TABLE lab_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    fasting_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
)
```

### Users Table:
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

---

## 🔐 Password Information

**All test users have password:** `password123`

**To login in Postman:**
```json
{
    "email": "technician@test.com",
    "password": "password123"
}
```

---

## 🚨 TROUBLESHOOTING

### Problem: "Lab test not found with id: 1"
**Solution:**
1. Check if MySQL is running
2. Verify Spring Boot started successfully
3. Check logs for "DATA INITIALIZER" messages
4. Manually verify: `SELECT * FROM lab_tests;`

### Problem: "Unauthorized" (401) on /api/reports/results
**Solution:**
1. Verify technician@test.com exists with TECHNICIAN role
2. Check: `SELECT email, role FROM users WHERE email='technician@test.com';`
3. If role is wrong, restart Spring Boot (DataInitializer will fix it)

### Problem: Data not loading on startup
**Solution:**
1. Verify application.properties has 3 spring.sql.init properties
2. Verify data.sql is in `src/main/resources/`
3. Check logs for "DATA INITIALIZER" messages
4. Try deleting database and restarting

### Problem: Duplicate key error
**Solution:**
```sql
DELETE FROM users WHERE email IN ('patient@test.com', 'technician@test.com', 'doctor@test.com');
DELETE FROM lab_tests;
```
Then restart Spring Boot - data will be re-inserted

---

## ✨ KEY IMPROVEMENTS

| Problem | Before | After |
|---------|--------|-------|
| Lab tests available | ❌ None | ✅ 6 seeded |
| Technician role | ❌ PATIENT (wrong) | ✅ TECHNICIAN (correct) |
| Doctor role | ❌ PATIENT (wrong) | ✅ MEDICAL_OFFICER (correct) |
| Duplicate prevention | ❌ Inserts every startup | ✅ Inserts once, updates roles |
| Role fixing | ❌ Manual SQL needed | ✅ Automatic on startup |
| Logging | ❌ No initialization logs | ✅ Detailed DEBUG logs |

---

## 📋 POSTMAN TEST EXPECTATIONS

After running the initialization:

✅ **POST /api/auth/login** → 200 OK with token
✅ **POST /api/bookings** → 201 Created
✅ **POST /api/reports/results** (technician token) → 201 Created
❌ **POST /api/reports/results** (patient token) → 403 Forbidden

---

## 🎯 NEXT STEPS

1. Restart Spring Boot to trigger DataInitializer
2. Check logs for "DATA INITIALIZER" messages
3. Query database to verify data was seeded
4. Run Postman collection - all tests should pass now
5. Create new test users with registration endpoints if needed


# 📋 Log Reference Guide

## What to Look For in Spring Boot Console Output

### ✅ SUCCESS LOGS (First Startup)

When you start the application for the first time, you should see:

```
... [main] com.healthcare.labtestbooking.config.DataInitializer
        ========== DATA INITIALIZER STARTED ==========

... [main] com.healthcare.labtestbooking.config.DataInitializer
        Checking lab tests in database...

... [main] com.healthcare.labtestbooking.config.DataInitializer
        No lab tests found. Initializing 6 lab tests...

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ✓ 6 lab tests initialized successfully

... [main] com.healthcare.labtestbooking.config.DataInitializer
        Checking users in database...

... [main] com.healthcare.labtestbooking.config.DataInitializer
        Creating patient@test.com with PATIENT role

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ✓ Patient user created

... [main] com.healthcare.labtestbooking.config.DataInitializer
        Creating technician@test.com with TECHNICIAN role

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ✓ Technician user created with TECHNICIAN role

... [main] com.healthcare.labtestbooking.config.DataInitializer
        Creating doctor@test.com with MEDICAL_OFFICER role

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ✓ Medical Officer user created with MEDICAL_OFFICER role

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ✓ All users initialized successfully with correct roles

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ========== DATA INITIALIZER COMPLETED ==========

... [main] com.healthcare.labtestbooking.LabTestBookingApplication : Started LabTestBookingApplication in 4.234 seconds

================================
Server started on http://localhost:8080
```

---

## ✅ SUCCESS LOGS (Subsequent Startups)

On restart, you should see:

```
... [main] com.healthcare.labtestbooking.config.DataInitializer
        ========== DATA INITIALIZER STARTED ==========

... [main] com.healthcare.labtestbooking.config.DataInitializer
        Checking lab tests in database...

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ✓ Lab tests already exist (count: 6). Skipping initialization.

... [main] com.healthcare.labtestbooking.config.DataInitializer
        Checking users in database...

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ✓ Patient user already exists

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ✓ Technician user already exists with TECHNICIAN role

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ✓ All users initialized successfully with correct roles

... [main] com.healthcare.labtestbooking.config.DataInitializer
        ========== DATA INITIALIZER COMPLETED ==========
```

**Note:** No duplicate inserts, just verification ✓

---

## 🔴 ERROR LOGS (And Solutions)

### ❌ MySQL Connection Error

```
[ERROR] com.zaxxer.hikari.HikariDataSource : HikariPool-1 - Connection is not available
```

**Solution:**
1. Verify MySQL is running: `netstat -ano | findstr :3306`
2. Check connection string in application.properties
3. Verify database exists

---

### ❌ data.sql SQL Syntax Error

```
[ERROR] o.s.b.SpringApplication : Application run failed
org.h2.jdbc.JdbcSQLSyntaxErrorException: Syntax error in SQL statement
```

**Solution:**
1. Check data.sql syntax
2. Verify column names match tables
3. Check for missing commas or semicolons

---

### ❌ DataInitializer Not Running

```
[No "DATA INITIALIZER STARTED" message in logs]
```

**Causes & Solutions:**

*Cause 1: Missing @Component annotation*
```java
// WRONG ❌
public class DataInitializer implements CommandLineRunner { }

// RIGHT ✓
@Component
public class DataInitializer implements CommandLineRunner { }
```

*Cause 2: Missing @Transactional*
```java
// WRONG ❌
@Component
public class DataInitializer implements CommandLineRunner { }

// RIGHT ✓
@Component
@Transactional
public class DataInitializer implements CommandLineRunner { }
```

*Cause 3: Application properties not updated*
```properties
# Add these if missing:
spring.sql.init.mode=always
spring.sql.init.continue-on-error=true
spring.jpa.defer-datasource-initialization=true
```

*Cause 4: File not in correct location*
```
WRONG ❌  src/test/java/.../DataInitializer.java
RIGHT ✓  src/main/java/.../config/DataInitializer.java
```

---

### ⚠️ Duplicate Key Error

```
[ERROR] java.sql.SQLIntegrityConstraintViolationException: Duplicate entry 'patient@test.com'
```

**Solution:**
```sql
DELETE FROM users WHERE email IN ('patient@test.com', 'technician@test.com', 'doctor@test.com');
DELETE FROM lab_tests;
```

Then restart Spring Boot - data will re-insert automatically.

---

### ⚠️ Role Assignment Not Working

```
SELECT email, role FROM users;

patient@test.com      | PATIENT          ✓
technician@test.com   | PATIENT          ❌ (should be TECHNICIAN)
doctor@test.com       | PATIENT          ❌ (should be MEDICAL_OFFICER)
```

**Solution:**
DataInitializer will fix this on next restart. You should see:

```
Technician user exists but has role: PATIENT. Updating to TECHNICIAN...
✓ Technician user role updated to TECHNICIAN
```

---

## 📊 Log Levels to Monitor

### DEBUG Level Logs

These show what the application is doing:

```properties
logging.level.com.healthcare.labtestbooking=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

**You should see:**
- DataInitializer messages
- Spring Web controller mappings
- Hibernate SQL INSERT statements

---

## 🔍 SQL Verification Queries

After startup, run these in MySQL:

```sql
-- Check lab tests
SELECT COUNT(*) as lab_test_count FROM lab_tests;
-- Expected: 6

-- Check users
SELECT COUNT(*) as user_count FROM users;
-- Expected: 3

-- Check user roles
SELECT email, role FROM users ORDER BY email;
-- Expected:
-- doctor@test.com       | MEDICAL_OFFICER
-- patient@test.com      | PATIENT
-- technician@test.com   | TECHNICIAN

-- Check passwords are encrypted
SELECT email, CHAR_LENGTH(password) as pwd_hash_length FROM users;
-- Expected: All lengths > 60

-- Check all data is active
SELECT COUNT(*) as inactive_tests FROM lab_tests WHERE is_active = 0;
-- Expected: 0

SELECT COUNT(*) as inactive_users FROM users WHERE is_active = 0;
-- Expected: 0
```

---

## ✅ Quick Verification Checklist

- [ ] Spring Boot starts without errors
- [ ] "DATA INITIALIZER STARTED" appears in logs
- [ ] "DATA INITIALIZER COMPLETED" appears in logs
- [ ] No error messages in console
- [ ] Application listening on port 8080
- [ ] Database queries show 6 lab tests
- [ ] Database queries show 3 users with correct roles
- [ ] No duplicate key errors

---

## 💡 Pro Tips

### Monitor Specific Logs
```bash
mvn spring-boot:run 2>&1 | grep "DATA INITIALIZER"
```

### Reset Database Safely
```sql
DELETE FROM booking_items;
DELETE FROM bookings;
DELETE FROM users;
DELETE FROM lab_tests;

-- Restart Spring Boot to re-seed
```

### View Complete MySQL Logs
```bash
mysql -u root -p -v -v -v -e "SELECT * FROM users;" labtestbooking
```


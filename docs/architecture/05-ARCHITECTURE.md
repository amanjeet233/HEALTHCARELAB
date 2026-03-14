# Data Initialization Architecture

## 🔄 Spring Boot Startup Sequence

```
┌─────────────────────────────────────────────────────────────┐
│                  SPRING BOOT STARTS                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│        MySQL Database Configuration Loaded                  │
│  ✓ URL: jdbc:mysql://localhost:3306/labtestbooking         │
│  ✓ Username: root                                           │
│  ✓ Password: Amanjeet@4321.                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     Hibernate Creates Tables (DDL auto-update)             │
│  ✓ users table created from @Entity User                   │
│  ✓ lab_tests table created from @Entity LabTest            │
│  ✓ bookings, reports, etc.                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          data.sql Executed by Spring Boot                   │
│  ✓ INSERT INTO lab_tests (6 records)                        │
│  ✓ INSERT INTO users (3 records)                            │
│    - patient@test.com (role=PATIENT)                        │
│    - technician@test.com (role=TECHNICIAN)                  │
│    - doctor@test.com (role=MEDICAL_OFFICER)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  All Spring Beans Initialized (including Repositories)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  CommandLineRunner Beans Executed (ordered)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────────┐
         │   DataInitializer.run()         │
         │   (@Component)                  │
         │                                 │
         │  1. Check lab_tests count       │
         │     - If > 0: Skip insert       │
         │     - If = 0: Insert 6 tests    │
         │                                 │
         │  2. Check each user exists      │
         │     - If missing: Insert        │
         │     - If exists: Check role     │
         │       └─ If wrong: Update role  │
         │                                 │
         │  3. Detailed logging at each    │
         │     step (DEBUG level)          │
         └─────────────┬───────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     Application Ready on Port 8080                          │
│  ✓ Database: Ready with seed data                           │
│  ✓ API Endpoints: Ready for requests                        │
│  ✓ Authentication: Ready with test users                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Dependencies & Execution

```
application.properties
│
├─ spring.sql.init.mode=always
│  └─ Triggers data.sql execution
│
├─ spring.jpa.defer-datasource-initialization=true
│  └─ Ensures Hibernate DDL runs BEFORE data.sql
│
└─ spring.jpa.hibernate.ddl-auto=update
   └─ Hibernate creates tables first

         ↓ (after schema created)

     data.sql
     │
     ├─ INSERT INTO lab_tests (6 records)
     │  ├─ Blood Glucose Test ($200)
     │  ├─ CBC ($300)
     │  ├─ Thyroid Profile ($500)
     │  ├─ Lipid Profile ($250)
     │  ├─ Liver Function Test ($350)
     │  └─ Kidney Function Test ($280)
     │
     └─ INSERT INTO users (3 records)
        ├─ patient@test.com / PATIENT
        ├─ technician@test.com / TECHNICIAN
        └─ doctor@test.com / MEDICAL_OFFICER

         ↓ (after data.sql completes)

     DataInitializer.java
     │
     ├─ Runs: labTestRepository.count()
     │  └─ If > 0: Skip initialize ✓
     │
     └─ Runs: userRepository.findByEmail()
        ├─ For each user: Check existence
        └─ For each user: Verify role is correct
           └─ If wrong: Update role
```

---

## 🔐 User Role Authorization Flow

```
┌──────────────────────────────┐
│  POST /api/auth/login        │
│  { email, password }         │
└────────────┬─────────────────┘
             │
             ▼
    ❓ authenticateAndGetToken()
             │
             ├─ Email found? ✓
             │
             ├─ Password matches? ✓
             │
             └─ Get role from database ✓
                │
                ├─ PATIENT role
                │  └─ Include in JWT: authorities=['ROLE_PATIENT']
                │
                ├─ TECHNICIAN role
                │  └─ Include in JWT: authorities=['ROLE_TECHNICIAN']
                │
                └─ MEDICAL_OFFICER role
                   └─ Include in JWT: authorities=['ROLE_MEDICAL_OFFICER']

                    ↓

┌──────────────────────────────┐
│   Return JWT Token           │
│   with authorities claim     │
└──────────────────────────────┘

         ↓

Next API Call: POST /api/reports/results

┌──────────────────────────────────────────┐
│  @PreAuthorize("hasRole('TECHNICIAN')")  │
│  public ResponseEntity<...> submitResults│
└────────────┬─────────────────────────────┘
             │
             ▼
        ❓ Check JWT token's authorities
             │
             ├─ Contains 'ROLE_TECHNICIAN'? ✓ → ALLOWED (201 Created)
             │
             └─ Does NOT contain 'ROLE_TECHNICIAN'? ✗ → DENIED (403 Forbidden)
```

---

## 🗄️ Database Schema Alignment

```
ENTITY CLASS: User
    ↓
    ├─ @Id
    ├─ @Column name → email, password, phone
    ├─ @Enumerated(EnumType.STRING) role
    │  └─ Storage: VARCHAR(20) = 'PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER'
    ├─ gender, bloodGroup, address
    └─ isActive, createdAt, updatedAt

         ↓ Creates Table ↓

DATABASE TABLE: users
    ├─ id (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
    ├─ name (VARCHAR(100))
    ├─ email (VARCHAR(100), UNIQUE)
    ├─ password (VARCHAR(255))
    ├─ role (VARCHAR(20))  ← Enum stored as string
    ├─ phone (VARCHAR(15), UNIQUE)
    ├─ address (TEXT)
    ├─ gender (VARCHAR(10))
    ├─ blood_group (VARCHAR(5))
    ├─ date_of_birth (DATE)
    ├─ is_active (BOOLEAN, DEFAULT true)
    ├─ created_at (TIMESTAMP)
    └─ updated_at (TIMESTAMP)

         ↓ data.sql Inserts ↓

Sample Insert:
INSERT INTO users (
    name, email, password, role, phone, 
    address, gender, blood_group, date_of_birth, 
    is_active, created_at, updated_at
) 
VALUES (
    'Technician User', 
    'technician@test.com', 
    '$2a$10$...bcrypt_hash...', 
    'TECHNICIAN',  ← Matches Enum
    '9876543211', 
    '456 Lab Tech Avenue', 
    'FEMALE', 
    'B+', 
    '1992-05-20', 
    true, 
    NOW(), 
    NOW()
);
```

---

## 🛡️ Smart Initialization (DataInitializer)

```
On Startup:

   Check lab_tests count
   │
   ├─ Count = 0?
   │  └─ Insert 6 lab tests ✓
   │
   └─ Count > 0?
      └─ Already initialized, skip ✓
      └─ No duplicates on restart!

   Check each user:
   │
   ├─ patient@test.com exists?
   │  └─ YES: Skip (already initialized)
   │  └─ NO: Create with PATIENT role
   │
   ├─ technician@test.com exists?
   │  ├─ NO: Create with TECHNICIAN role
   │  └─ YES: Verify role
   │     ├─ Role = TECHNICIAN? Continue ✓
   │     └─ Role ≠ TECHNICIAN? Update role! ✓
   │
   └─ doctor@test.com exists?
      ├─ NO: Create with MEDICAL_OFFICER role
      └─ YES: Verify role
         ├─ Role = MEDICAL_OFFICER? Continue ✓
         └─ Role ≠ MEDICAL_OFFICER? Update role! ✓

Result:
✓ Idempotent (safe to run multiple times)
✓ Fixes corrupted role data automatically
✓ Prevents duplicate inserts
✓ Detailed logging at each step
```

---

## 📊 Data Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   TEST DATA LIFECYCLE                        │
└─────────────────────────────────────────────────────────────┘

INITIALIZATION (Startup):
  ├─ Hibernate DDL → Tables created
  ├─ data.sql → Initial insert
  └─ DataInitializer → Verify & fix

         ↓

TESTING (Postman):
  ├─ Login Tests
  │  ├─ patient@test.com/password123 → Token with ROLE_PATIENT
  │  ├─ technician@test.com/password123 → Token with ROLE_TECHNICIAN
  │  └─ doctor@test.com/password123 → Token with ROLE_MEDICAL_OFFICER
  │
  ├─ Authorization Tests
  │  ├─ POST /api/bookings (PATIENT token) → 201 ✓
  │  ├─ POST /api/reports/results (TECHNICIAN token) → 201 ✓
  │  └─ POST /api/reports/results (PATIENT token) → 403 ✗
  │
  └─ Booking Tests
     ├─ Create booking with test ID 1 → 201 ✓
     ├─ Get booking... → 200 ✓
     └─ Submit results → 201 ✓
```

---

## 🎯 Key Architecture Patterns

### 1. CommandLineRunner Pattern
- Executes after Spring context fully initialized
- Perfect for database seeding
- No manual invocation needed

### 2. Idempotent Initialization
- Safe to restart application multiple times
- Prevents duplicate data inserts
- Can be run on every startup without issues

### 3. Role-Based Access Control (RBAC)
- SecurityConfig protects endpoints with @PreAuthorize
- JWT token carries user's authorities
- Spring Security checks before method execution

### 4. Transaction Management
- Operations marked with @Transactional
- Atomic: all-or-nothing execution
- Rollback on any error


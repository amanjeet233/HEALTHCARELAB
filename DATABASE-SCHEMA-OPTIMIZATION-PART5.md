# 🗄️ Database Schema & Optimization - Part 5

**Date:** 2026-03-24
**Phase:** Phase 5.3 - Database Design & Performance
**Database:** MySQL 8.0+
**Status:** Complete Schema Design ✅

---

## 📑 Table of Contents

1. [Database Architecture Overview](#database-architecture-overview)
2. [Complete Schema Design](#complete-schema-design)
3. [Entity Relationships](#entity-relationships)
4. [Indexes & Performance](#indexes--performance)
5. [Optimization Strategies](#optimization-strategies)
6. [Query Examples](#query-examples)
7. [Migration Guide](#migration-guide)
8. [Backup & Recovery](#backup--recovery)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Scaling Strategy](#scaling-strategy)

---

## Database Architecture Overview

### Database Design Principles

```
✅ Normalization (3NF)
✅ Referential Integrity (Foreign Keys)
✅ Soft Deletes (Data preservation)
✅ Audit Trail (Status history)
✅ Indexing Strategy (Performance)
✅ Partitioning (Large tables)
```

### Current Database Statistics

```
Total Tables:           15+
Total Columns:          150+
Estimated Rows:         10,000+ (initial)
Estimated Size:         500 MB (year 1)
Transaction Rate:       1,000+ per day
Peak Concurrent Users:  500+
```

---

## Complete Schema Design

### 1. Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'User unique identifier',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email address',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password',
    first_name VARCHAR(100) NOT NULL COMMENT 'First name',
    last_name VARCHAR(100) NOT NULL COMMENT 'Last name',
    phone_number VARCHAR(15) UNIQUE COMMENT 'Phone number',
    date_of_birth DATE COMMENT 'Date of birth',
    gender ENUM('MALE', 'FEMALE', 'OTHER') COMMENT 'Gender',

    -- Address
    address_line_1 VARCHAR(255) COMMENT 'Street address',
    address_line_2 VARCHAR(255) COMMENT 'Apartment, suite, etc',
    city VARCHAR(100) COMMENT 'City',
    state VARCHAR(100) COMMENT 'State/Province',
    postal_code VARCHAR(20) COMMENT 'Postal code',
    country VARCHAR(100) DEFAULT 'India' COMMENT 'Country',

    -- Account Status
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Account active flag',
    email_verified BOOLEAN DEFAULT FALSE COMMENT 'Email verification status',
    phone_verified BOOLEAN DEFAULT FALSE COMMENT 'Phone verification status',
    email_verified_at TIMESTAMP NULL COMMENT 'Email verification timestamp',

    -- Profile
    profile_picture_url VARCHAR(500) COMMENT 'Profile picture URL',
    bio TEXT COMMENT 'User biography',
    emergency_contact_name VARCHAR(100) COMMENT 'Emergency contact name',
    emergency_contact_phone VARCHAR(15) COMMENT 'Emergency contact phone',

    -- Security
    failed_login_attempts INT DEFAULT 0 COMMENT 'Failed login counter',
    account_locked_until TIMESTAMP NULL COMMENT 'Account lockout expiry',
    last_login_at TIMESTAMP NULL COMMENT 'Last login timestamp',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation time',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',

    -- Constraints
    CONSTRAINT check_phone_length CHECK (CHAR_LENGTH(phone_number) >= 10),
    CONSTRAINT check_email_format CHECK (email LIKE '%@%.%'),

    -- Indexes
    KEY idx_email (email),
    KEY idx_phone (phone_number),
    KEY idx_active (is_active),
    KEY idx_created_at (created_at),
    KEY idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User accounts table';
```

### 2. User Roles Table

```sql
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role ENUM('PATIENT', 'DOCTOR', 'TECHNICIAN', 'ADMIN', 'LAB_PARTNER') NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT COMMENT 'Admin who assigned role',

    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_role UNIQUE KEY (user_id, role),

    KEY idx_role (role),
    KEY idx_assigned_at (assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User to role mapping table';
```

### 3. Lab Tests Table

```sql
CREATE TABLE IF NOT EXISTS lab_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique test code',
    test_name VARCHAR(255) NOT NULL COMMENT 'Test name',
    description TEXT COMMENT 'Test description',
    category VARCHAR(100) NOT NULL COMMENT 'Test category',
    sub_category VARCHAR(100) COMMENT 'Subcategory',

    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL COMMENT 'Base price',
    min_price DECIMAL(10, 2) COMMENT 'Minimum price',
    max_price DECIMAL(10, 2) COMMENT 'Maximum price',

    -- Technical Details
    sample_type VARCHAR(100) COMMENT 'Sample type (Blood, Urine, etc)',
    sample_quantity INT COMMENT 'Sample quantity required',
    fasting_required BOOLEAN DEFAULT FALSE COMMENT 'Fasting requirement',
    fasting_hours INT COMMENT 'Number of fasting hours',
    preparation_instructions TEXT COMMENT 'Preparation instructions',

    -- Turnaround
    report_turnaround_time_hours INT COMMENT 'Report generation time in hours',

    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    requires_appointment BOOLEAN DEFAULT FALSE,

    -- Metadata
    test_parameter_count INT COMMENT 'Number of parameters tested',
    accuracy_percentage DECIMAL(5, 2) COMMENT 'Test accuracy percentage',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    KEY idx_test_code (test_code),
    KEY idx_category (category),
    KEY idx_available (is_available),
    KEY idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lab tests catalog table';
```

### 4. Orders Table

```sql
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_reference VARCHAR(20) UNIQUE NOT NULL COMMENT 'ORD-XXXXXXXX',
    user_id BIGINT NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' COMMENT 'Order status',
    payment_status VARCHAR(40) NOT NULL DEFAULT 'PENDING' COMMENT 'Payment status',

    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Coupon
    coupon_code VARCHAR(50) COMMENT 'Applied coupon code',

    -- Payment
    razorpay_order_id VARCHAR(100) UNIQUE COMMENT 'Razorpay order ID',
    payment_method VARCHAR(50) COMMENT 'Payment method used',

    -- Scheduling
    preferred_date DATE COMMENT 'Preferred collection date',
    preferred_time_slot VARCHAR(20) COMMENT 'Preferred time slot',
    preferred_location VARCHAR(255) COMMENT 'Sample collection location',

    -- Contact
    contact_email VARCHAR(255),
    contact_phone VARCHAR(15),

    -- Additional Info
    special_instructions TEXT,

    -- Technician
    assigned_technician_id BIGINT COMMENT 'Assigned technician user ID',
    technician_notes TEXT,

    -- Timeline
    sample_collected_at TIMESTAMP NULL,
    report_generated_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    last_status_changed_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_technician FOREIGN KEY (assigned_technician_id)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_total_amount CHECK (total_amount > 0),

    KEY idx_user_id (user_id),
    KEY idx_status (status),
    KEY idx_payment_status (payment_status),
    KEY idx_razorpay_order_id (razorpay_order_id),
    KEY idx_order_reference (order_reference),
    KEY idx_created_at (created_at),
    KEY idx_preferred_date (preferred_date),
    KEY idx_deleted_at (deleted_at),
    KEY idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Orders master table';
```

### 5. Order Items Table

```sql
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,

    -- Item Details
    test_code VARCHAR(50),
    test_name VARCHAR(255) NOT NULL,

    -- Pricing
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_price DECIMAL(10, 2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_test FOREIGN KEY (test_id)
        REFERENCES lab_tests(id) ON DELETE RESTRICT,

    KEY idx_order_id (order_id),
    KEY idx_test_id (test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Order items detail table';
```

### 6. Order Status History Table

```sql
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    reason VARCHAR(500),
    changed_by VARCHAR(100),
    metadata JSON COMMENT 'Additional metadata as JSON',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_status_history_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE,

    KEY idx_order_id (order_id),
    KEY idx_created_at (created_at),
    KEY idx_new_status (new_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Order status audit trail table';
```

### 7. Gateway Payment Table

```sql
CREATE TABLE IF NOT EXISTS gateway_payment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL UNIQUE,
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,

    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('INITIATED', 'SUCCESS', 'FAILURE', 'PENDING') DEFAULT 'INITIATED',

    -- Response Data
    response_data JSON COMMENT 'Full Razorpay response',
    failure_reason VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_gateway_payment_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE,

    KEY idx_order_id (order_id),
    KEY idx_razorpay_order_id (razorpay_order_id),
    KEY idx_razorpay_payment_id (razorpay_payment_id),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Payment gateway transactions table';
```

### 8. Shopping Cart Table

```sql
CREATE TABLE IF NOT EXISTS shopping_cart (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    status ENUM('ACTIVE', 'CHECKED_OUT', 'ABANDONED') DEFAULT 'ACTIVE',

    -- Pricing
    subtotal DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) DEFAULT 0,

    -- Coupon
    coupon_code VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    abandoned_at TIMESTAMP NULL,

    CONSTRAINT fk_cart_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,

    KEY idx_user_id (user_id),
    KEY idx_status (status),
    KEY idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Shopping cart table';
```

### 9. Cart Items Table

```sql
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    package_id BIGINT COMMENT 'For package items',

    -- Item Details
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_price DECIMAL(10, 2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id)
        REFERENCES shopping_cart(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_test FOREIGN KEY (test_id)
        REFERENCES lab_tests(id) ON DELETE CASCADE,

    KEY idx_cart_id (cart_id),
    KEY idx_test_id (test_id),
    KEY idx_package_id (package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Shopping cart items table';
```

### 10. Coupons Table

```sql
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,

    -- Limits
    max_usage INT COMMENT 'Total usage limit',
    max_usage_per_user INT DEFAULT 1,
    min_cart_amount DECIMAL(10, 2) COMMENT 'Minimum cart amount',
    max_discount_amount DECIMAL(10, 2) COMMENT 'Maximum discount cap',

    -- Validity
    valid_from DATE NOT NULL,
    valid_till DATE NOT NULL,

    -- Tracking
    current_usage INT DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    KEY idx_code (code),
    KEY idx_valid_from (valid_from),
    KEY idx_valid_till (valid_till),
    KEY idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Discount coupons table';
```

### 11. JWT Token Blacklist Table

```sql
CREATE TABLE IF NOT EXISTS token_blacklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_blacklist_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,

    KEY idx_user_id (user_id),
    KEY idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='JWT token blacklist for logout functionality';
```

### 12. Audit Log Table

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE',
    old_values JSON,
    new_values JSON,
    changed_by BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user FOREIGN KEY (changed_by)
        REFERENCES users(id) ON DELETE SET NULL,

    KEY idx_entity (entity_type, entity_id),
    KEY idx_action (action),
    KEY idx_created_at (created_at),
    KEY idx_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Complete audit trail table';
```

---

## Entity Relationships

### ER Diagram (Text Format)

```
┌─────────────┐
│   Users     │
├─────────────┤
│ id (PK)     │
│ email       │
│ password    │
│ first_name  │
│ last_name   │
└─────┬───────┘
      │
      ├─→ 1:N ┌──────────────┐
      │        │ User Roles   │
      │        └──────────────┘
      │
      ├─→ 1:N ┌──────────────┐
      │        │  Orders      │◄─────┐
      │        └──────────────┘       │
      │                               │
      └─→ 1:1 ┌──────────────┐       │
             │Cart          │        │
             └──────────────┘        │
                    │                │
                    │ 1:N            │
                    ▼                │
            ┌──────────────┐         │
            │ Cart Items   │         │
            └──────────────┘         │
                    ▲                │
                    │ N:1            │
                    │                │
            ┌──────────────┐         │
            │  Lab Tests   │         │
            └──────────────┘         │
                    ▲                │
                    │ N:M            │
                    │                │
            ┌──────────────┐         │
            │Order Items   │◄────────┘
            └──────────────┘
                    │
                    │ 1:N
                    ▼
            ┌──────────────────┐
            │Order Status      │
            │ History          │
            └──────────────────┘

            ┌──────────────────┐
Orders ────→│Gateway Payment   │
(1:1)       └──────────────────┘
```

---

## Indexes & Performance

### Index Strategy

```sql
-- User Indexes (Fast lookups)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created ON users(created_at);

-- Order Indexes (Query optimization)
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_razorpay ON orders(razorpay_order_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_preferred_date ON orders(preferred_date);
-- Composite index for common queries
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);

-- Cart Indexes
CREATE INDEX idx_cart_user ON shopping_cart(user_id);
CREATE INDEX idx_cart_status ON shopping_cart(status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- Payment Indexes
CREATE INDEX idx_payment_order ON gateway_payment(order_id);
CREATE INDEX idx_payment_razorpay_order ON gateway_payment(razorpay_order_id);
CREATE INDEX idx_payment_razorpay_payment ON gateway_payment(razorpay_payment_id);
CREATE INDEX idx_payment_status ON gateway_payment(status);

-- Status History Indexes
CREATE INDEX idx_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_status_history_created ON order_status_history(created_at);

-- Auth Indexes
CREATE INDEX idx_token_blacklist_user ON token_blacklist(user_id);
CREATE INDEX idx_token_blacklist_expires ON token_blacklist(expires_at);

-- Audit Indexes
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

### Query Performance Analysis

```sql
-- Check index usage
SELECT * FROM sys.schema_unused_indexes
WHERE object_schema NOT IN ('mysql', 'information_schema', 'performance_schema');

-- Analyze query performance
EXPLAIN SELECT * FROM orders
WHERE user_id = 1 AND status = 'PENDING'
ORDER BY created_at DESC LIMIT 10;

-- Expected result with indexes:
-- Key: idx_orders_user_status
-- Rows: 5-10 (fast)
```

---

## Optimization Strategies

### 1. Query Optimization

```sql
-- ❌ SLOW: Full table scan
SELECT * FROM orders WHERE status = 'PENDING';

-- ✅ FAST: Index usage
SELECT id, order_reference, status, total_amount
FROM orders
WHERE status = 'PENDING'
LIMIT 100;

-- ❌ SLOW: Using function on indexed column
SELECT * FROM orders
WHERE YEAR(created_at) = 2026;

-- ✅ FAST: Range query
SELECT * FROM orders
WHERE created_at >= '2026-01-01'
AND created_at < '2026-02-01';

-- ❌ SLOW: Multiple OR conditions
SELECT * FROM orders
WHERE status = 'PENDING' OR status = 'PAYMENT_COMPLETED';

-- ✅ FAST: IN clause
SELECT * FROM orders
WHERE status IN ('PENDING', 'PAYMENT_COMPLETED');

-- ❌ SLOW: N+1 query problem (fetch orders, then fetch user for each)
SELECT * FROM orders; -- 1000 rows
foreach order:
    SELECT * FROM users WHERE id = order.user_id; -- 1000 queries

-- ✅ FAST: Single JOIN query
SELECT o.*, u.email, u.first_name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.created_at BETWEEN '2026-01-01' AND '2026-01-31';
```

### 2. Connection Pool

```properties
# application.properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.auto-commit=true
```

### 3. Pagination

```sql
-- Efficient pagination with index
SELECT * FROM orders
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- Better: Use keyset pagination for large offsets
SELECT * FROM orders
WHERE user_id = 1
AND created_at < (SELECT created_at FROM orders WHERE id = 5000)
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Caching Strategy

```
Level 1: Application Cache (In-memory)
├─ User profile cache (1 hour TTL)
├─ Test catalog cache (24 hour TTL)
└─ Coupon codes cache (1 hour TTL)

Level 2: Redis Cache
├─ JWT token blacklist
├─ Cart data
├─ Recent orders
└─ Payment status

Level 3: Database
└─ Source of truth
```

### 5. Denormalization for Reports

```sql
-- Materialized view for reporting
CREATE TABLE order_summary_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT UNIQUE,
    user_id BIGINT,
    order_reference VARCHAR(20),
    status VARCHAR(50),
    payment_status VARCHAR(40),
    total_amount DECIMAL(10, 2),
    item_count INT,
    created_at TIMESTAMP,

    CONSTRAINT fk_report_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE,

    KEY idx_user_id (user_id),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB;

-- Refresh every hour
INSERT INTO order_summary_report
SELECT o.id, o.id, o.user_id, o.order_reference, o.status,
       o.payment_status, o.total_amount, COUNT(oi.id), o.created_at
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;
```

---

## Query Examples

### 1. Get User Orders with Items

```sql
SELECT
    o.id,
    o.order_reference,
    o.status,
    o.payment_status,
    o.total_amount,
    o.created_at,
    COUNT(oi.id) as item_count,
    GROUP_CONCAT(lt.test_name SEPARATOR ', ') as test_names
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN lab_tests lt ON oi.test_id = lt.id
WHERE o.user_id = ?
    AND o.deleted_at IS NULL
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### 2. Payment Status Dashboard

```sql
SELECT
    DATE(created_at) as date,
    payment_status,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM gateway_payment
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), payment_status
ORDER BY date DESC, payment_status;
```

### 3. Cart Abandonment Analysis

```sql
SELECT
    sc.id as cart_id,
    u.email,
    u.first_name,
    COUNT(ci.id) as item_count,
    sc.total_price,
    sc.abandoned_at
FROM shopping_cart sc
JOIN users u ON sc.user_id = u.id
LEFT JOIN cart_items ci ON sc.id = ci.cart_id
WHERE sc.status = 'ABANDONED'
    AND sc.abandoned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY sc.id
ORDER BY sc.abandoned_at DESC;
```

### 4. Popular Tests

```sql
SELECT
    lt.id,
    lt.test_name,
    lt.category,
    COUNT(oi.id) as total_ordered,
    SUM(oi.quantity) as total_quantity,
    AVG(oi.unit_price) as avg_price
FROM lab_tests lt
LEFT JOIN order_items oi ON lt.id = oi.test_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY lt.id
ORDER BY total_ordered DESC
LIMIT 20;
```

---

## Migration Guide

### Step 1: Backup Current Data

```bash
# Full backup
mysqldump -u root -p healthcare_db > backup_$(date +%Y%m%d).sql

# Verify backup
mysql -u root -p healthcare_db < backup_20260324.sql
```

### Step 2: Create New Tables

```bash
# Run migration script
mysql -u root -p healthcare_db < schema_migration_v2.sql
```

### Step 3: Migrate Data

```sql
-- Step 1: Copy existing data
INSERT INTO new_table SELECT * FROM old_table;

-- Step 2: Verify row counts
SELECT COUNT(*) FROM new_table;
SELECT COUNT(*) FROM old_table;

-- Step 3: Add foreign key constraints
ALTER TABLE new_table
ADD CONSTRAINT fk_new_table
FOREIGN KEY (user_id) REFERENCES users(id);

-- Step 4: Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```

### Step 4: Validate Migration

```sql
-- Check referential integrity
SELECT COUNT(*) as orphaned_records
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- Result should be 0
```

---

## Backup & Recovery

### Automated Backup Strategy

```bash
#!/bin/bash
# backup.sh - Daily backup script

BACKUP_DIR="/backups/mysql"
DB_NAME="healthcare_db"
DATE=$(date +%Y%m%d_%H%M%S)

# Full backup
mysqldump -u root -p${MYSQL_PASSWORD} \
    --single-transaction \
    --quick \
    --lock-tables=false \
    ${DB_NAME} > ${BACKUP_DIR}/full_${DATE}.sql

# Compress backup
gzip ${BACKUP_DIR}/full_${DATE}.sql

# Keep only last 30 days
find ${BACKUP_DIR} -name "full_*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_DIR}/full_${DATE}.sql.gz"
```

### Restore from Backup

```bash
# Restore full database
mysql -u root -p healthcare_db < backup_20260324.sql

# Restore specific table
mysql -u root -p healthcare_db < backup_orders_table.sql

# Point-in-time recovery
mysqlbinlog --start-position=154 --stop-position=458 \
    /var/log/mysql/mysql-bin.000001 | mysql -u root -p healthcare_db
```

---

## Monitoring & Maintenance

### Regular Maintenance Tasks

```sql
-- Optimize tables (monthly)
OPTIMIZE TABLE users;
OPTIMIZE TABLE orders;
OPTIMIZE TABLE order_items;

-- Check table integrity (weekly)
CHECK TABLE users;
CHECK TABLE orders;
REPAIR TABLE users;

-- Analyze tables for query optimization (monthly)
ANALYZE TABLE users;
ANALYZE TABLE orders;
ANALYZE TABLE cart_items;

-- Update statistics
ANALYZE TABLE orders;

-- Check for duplicate records
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING count > 1;
```

### Performance Monitoring

```sql
-- Current active queries
SELECT * FROM INFORMATION_SCHEMA.PROCESSLIST
WHERE TIME > 60 AND COMMAND != 'Sleep';

-- Slow query log analysis
SELECT * FROM mysql.slow_log
ORDER BY start_time DESC
LIMIT 10;

-- Table sizes
SELECT
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.tables
WHERE table_schema = 'healthcare_db'
ORDER BY size_mb DESC;

-- Buffer pool usage
SHOW STATUS LIKE 'Innodb_buffer_pool%';
```

---

## Scaling Strategy

### Horizontal Scaling (Sharding)

```
Sharding by User ID:
┌─────────────────┐
│  User ID 1-1M   │ → Database Shard 1
│  User ID 1M-2M  │ → Database Shard 2
│  User ID 2M-3M  │ → Database Shard 3
└─────────────────┘

Shard Key: user_id % number_of_shards
```

### Read Replicas

```
Master (Write)
    ↓
    ├─→ Slave 1 (Read - Reports)
    ├─→ Slave 2 (Read - Analytics)
    └─→ Slave 3 (Read - Backup)
```

### Partition Strategy (for large tables)

```sql
-- Partition orders by month
ALTER TABLE orders
PARTITION BY RANGE (YEAR_MONTH(created_at)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

---

## Database Schema Summary

```
Total Tables:           12
Total Indexes:          50+
Estimated Daily Growth: 500 MB
Year 1 Size:           500 GB
Backup Size:           150 GB (compressed)

Performance Targets:
- Query avg response:   < 100ms
- Report generation:    < 5 seconds
- Backup time:          < 30 minutes
- Recovery time:        < 60 minutes
```

---

**Last Updated:** 2026-03-24

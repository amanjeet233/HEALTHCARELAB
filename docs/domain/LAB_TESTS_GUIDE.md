# Lab Tests Database Integration Guide

## 📋 Overview

This guide covers the comprehensive Lab Tests Database functionality integrated into the Healthcare Lab Test Booking System Spring Boot application.

## 🏗️ Architecture

### Entity Hierarchy

```
TestCategory (1) ──────────── (Many) LabTest
                                  │
                                  ├── (1) ─── (Many) TestParameter
                                  └── (Many) ─── PackageTest (M:M with TestPackage)

TestPackage (1) ──────────── (Many) PackageTest ──────────── (Many) LabTest
```

## 📦 Components Created

### 1. Entity Classes

#### TestCategory.java
- Represents lab test categories (Hematology, Biochemistry, etc.)
- Fields: id, categoryName, description, displayOrder, isActive, createdAt, updatedAt
- Relationships: One-to-Many with LabTest

#### LabTest.java (Enhanced)
- **New fields:**
  - `testCode`: Unique test identifier (e.g., CBC-001)
  - `testType`: ENUM (HEMATOLOGY, BIOCHEMISTRY, IMMUNOLOGY, etc.)
  - `methodology`: Test methodology description
  - `unit`: Unit of measurement
  - `normalRangeMin/Max`: Normal range boundaries
  - `criticalLow/criticalHigh`: Critical thresholds
  - `normalRangeText`: Text description of normal range
  - `pediatricRange`: Pediatric-specific ranges
  - `maleRange/femaleRange`: Gender-specific ranges
  - `Timestamps`: createdAt, updatedAt

#### TestParameter.java (Updated)
- Renamed `labTest` to `test`
- **New fields:**
  - `criticalLow/criticalHigh`: Critical thresholds
  - `normalRangeText`: Text description
  - `displayOrder`: Parameter ordering

#### TestPackage.java
- Represents bundled test packages with discounts
- Fields: packageCode, packageName, totalTests, totalPrice, discountedPrice, discountPercentage
- Relationships: One-to-Many with PackageTest

#### PackageTest.java
- Many-to-Many mapping between TestPackage and LabTest
- Fields: id, testPackage, labTest, displayOrder, createdAt
- Enables flexible package composition

### 2. Repositories

- `TestCategoryRepository`: Query test categories
- `LabTestRepository`: Enhanced with new methods:
  - `findByTestCode()`: Find by unique test code
  - `findByTestType()`: Filter by test type
  - `findByCategory()`: Filter by category
  - `searchTests()`: Full-text search by name/code
  - `findByPriceRange()`: Price-based filtering
  - `findAllTestTypes()`: Get all test types

- `TestPackageRepository`: Package queries
- `PackageTestRepository`: Package-test mapping queries
- `TestParameterRepository`: Parameter queries with ordering

### 3. DTOs

- `LabTestDTO`: Complete test information with parameters
- `TestParameterDTO`: Test parameter details
- `TestPackageDTO`: Package information with constituent tests

### 4. Services

#### LabTestService
- `getAllActiveTests()`: Fetch all active tests
- `getTestById()`: Get test by ID
- `getTestByCode()`: Get test by unique code
- `getTestsByCategory()`: Filter by category
- `getTestsByType()`: Filter by test type (ENUM)
- `searchTests()`: Full-text search
- `getTestsByPriceRange()`: Price-based filtering
- `getAllTestTypes()`: Get available test types

#### TestPackageService
- `getAllActivePackages()`: Fetch all active packages
- `getPackageById()`: Get package by ID
- `getPackageByCode()`: Get package by code
- `getBestDeals()`: Get highest discount packages
- `getPackagesByPriceRange()`: Price-based filtering

### 5. Controller

#### LabTestController
Endpoints at `/api/lab-tests`:

**Test Endpoints:**
- `GET /` - Get all active tests
- `GET /{id}` - Get test by ID
- `GET /code/{testCode}` - Get test by code
- `GET /category/{categoryId}` - Get tests by category
- `GET /type/{testType}` - Get tests by type
- `GET /search?keyword=` - Search tests
- `GET /price-range?min=&max=` - Filter by price
- `GET /types` - Get all test types

**Package Endpoints:**
- `GET /packages` - Get all packages
- `GET /packages/{id}` - Get package by ID
- `GET /packages/code/{packageCode}` - Get package by code
- `GET /packages/best-deals` - Get best deals

### 6. Data Initialization

#### TestType Enum
```java
HEMATOLOGY, BIOCHEMISTRY, IMMUNOLOGY, MICROBIOLOGY, 
HORMONES, URINE, COAGULATION, TUMOR_MARKERS, OTHER
```

#### Seed Data (via data.sql)

**8 Test Categories:**
- Hematology
- Biochemistry
- Immunology
- Microbiology
- Endocrinology
- Cardiology
- Hepatology
- Nephrology

**10 Lab Tests:**
1. Complete Blood Count (CBC) - $300
2. Blood Glucose (Fasting) - $200
3. Thyroid Profile - $500
4. Lipid Profile - $250
5. Liver Function Test - $350
6. Kidney Function Test - $280
7. Urine Routine - $150
8. Blood Group & Rh Factor - $100
9. C-Reactive Protein - $200
10. COVID-19 RT-PCR - $400

**4 Test Packages:**
- Basic Health Package (5 tests) - $899 (23% discount)
- Advanced Health Package (8 tests) - $1,699 (25% discount)
- Critical Care Package (7 tests) - $1,499 (24% discount)
- Wellness & Prevention (6 tests) - $1,099 (28% discount)

## 🔌 API Usage Examples

### Get All Active Tests
```bash
curl -X GET http://localhost:8080/api/lab-tests \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "testCode": "CBC-001",
      "testName": "Complete Blood Count",
      "categoryName": "Hematology",
      "testType": "HEMATOLOGY",
      "price": 300.00,
      "fastingRequired": false,
      "reportTimeHours": 2,
      "parameters": [...]
    }
  ],
  "message": "Tests fetched successfully"
}
```

### Search Tests
```bash
curl -X GET "http://localhost:8080/api/lab-tests/search?keyword=blood" \
  -H "Authorization: Bearer {token}"
```

### Get Tests by Price Range
```bash
curl -X GET "http://localhost:8080/api/lab-tests/price-range?min=200&max=500" \
  -H "Authorization: Bearer {token}"
```

### Get Test Packages
```bash
curl -X GET http://localhost:8080/api/lab-tests/packages \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "packageCode": "PKG-BASIC",
      "packageName": "Basic Health Package",
      "totalTests": 5,
      "totalPrice": 1180.00,
      "discountedPrice": 899.00,
      "discountPercentage": 23.73,
      "savings": 281.00,
      "tests": [...]
    }
  ]
}
```

### Get Best Deals
```bash
curl -X GET http://localhost:8080/api/lab-tests/packages/best-deals \
  -H "Authorization: Bearer {token}"
```

## 🗄️ Database Schema

### Tables Created/Enhanced

1. **test_categories** (7 columns)
   - id, category_name, description, display_order, is_active, created_at, updated_at

2. **lab_tests** (26 columns - ENHANCED)
   - Core: id, test_code, test_name, price, is_active
   - Organization: category_id, test_type
   - Ranges: normal_range_min/max, critical_low/high
   - Gender-specific: male_range, female_range, pediatric_range
   - Metadata: methodology, unit, normal_range_text
   - Constraints: fasting_required, fasting_hours, report_time_hours
   - Timestamps: created_at, updated_at

3. **test_packages** (11 columns)
   - id, package_code, package_name, description
   - total_tests, total_price, discounted_price, discount_percentage
   - is_active, created_at, updated_at

4. **package_tests** (5 columns - M:M mapping)
   - id, package_id, test_id, display_order, created_at

5. **test_parameters** (10 columns - ENHANCED)
   - id, test_id, parameter_name, unit
   - normal_range_min/max, critical_low/high
   - normal_range_text, display_order

## 🚀 Running the Application

### Prerequisites
- Java 21+
- MySQL 8.0+
- Maven 3.6+

### Configuration

In `application.properties`:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/labtestbooking
spring.datasource.username=root
spring.datasource.password=your_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# SQL Initialization
spring.sql.init.mode=always
spring.sql.init.data-locations=classpath:data.sql, classpath:db/migration/V1__create_lab_tests_tables.sql
spring.jpa.defer-datasource-initialization=true
spring.sql.init.continue-on-error=true
```

### Start Application
```bash
mvn spring-boot:run
```

## 📝 Postman Collection

Import `postman/LabTests-API.postman_collection.json` for ready-to-use API requests.

**Variable Setup:**
- `base_url`: http://localhost:8080
- `patient_token`: Your JWT auth token

## 🧪 Testing

### Manual Testing Steps

1. **Get All Tests:**
   - Navigate to: `GET /api/lab-tests`
   - Verify 10 tests are returned

2. **Search Tests:**
   - Try: `GET /api/lab-tests/search?keyword=blood`
   - Verify results contain blood-related tests

3. **Filter by Price:**
   - Try: `GET /api/lab-tests/price-range?min=200&max=500`
   - Verify only tests in range $200-$500 are returned

4. **Get Test Types:**
   - Try: `GET /api/lab-tests/types`
   - Verify all test types are returned

5. **Get Packages:**
   - Try: `GET /api/lab-tests/packages`
   - Verify 4 packages are returned with discount info

## 🔒 Security

- All endpoints require JWT authentication
- Use Bearer token in Authorization header
- Test users available for login:
  - Email: `patient@test.com` (Role: PATIENT)
  - Email: `doctor@test.com` (Role: MEDICAL_OFFICER)
  - Email: `technician@test.com` (Role: TECHNICIAN)

## 📊 Key Features

✅ **Comprehensive Test Catalog** - 10+ predefined tests with full specifications
✅ **Advanced Search & Filtering** - By code, category, type, price range
✅ **Test Packages** - Bundled tests with discount pricing
✅ **Gender-Specific Ranges** - Different ranges for male/female
✅ **Pediatric Support** - Age-specific test ranges
✅ **Critical Thresholds** - Flag critical values for immediate attention
✅ **Full Audit Trail** - Created/updated timestamps for all entities
✅ **RESTful API** - Clean, well-documented endpoints
✅ **Automatic Initialization** - Seed data via SQL scripts

## 🛠️ Troubleshooting

### Issue: "Test not found with code: XYZ"
- Verify test code exists in database
- Check test is active (`is_active = 1`)

### Issue: No tests returned
- Verify data.sqlhas been executed
- Check `spring.sql.init.mode=always` in application.properties
- Manually run: `mysql -u root labtestbooking < schema.sql`

### Issue: JWT authentication errors
- Verify Bearer token is valid
- Check token hasn't expired
- Ensure user role has required permissions

## 📚 Additional Resources

- [LabTestDTO Documentation](./LabTestDTO.md)
- [API Response Format](./API_RESPONSE.md)
- [Database Schema Diagram](./SCHEMA_DIAGRAM.md)

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready ✅

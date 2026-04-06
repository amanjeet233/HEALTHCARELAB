# Individual Lab Tests Implementation - Complete Guide

## Overview
This implementation adds comprehensive support for 88 individual lab tests with advanced filtering, categorization, and detailed test information including sub-tests and tags.

## Components Updated

### Backend (Java Spring Boot)

#### 1. **Entity Updates** (`LabTest.java`)
- Added `subTests` field (JSON) - List of constituent tests
- Added `tags` field (JSON) - Search and filter tags
- Added `@PrePersist` and `@PostLoad` methods for JSON serialization/deserialization
- Automatically converts List<String> to/from JSON storage

#### 2. **Seed Data** (`TestsSeedData.java`)
- Generates 88 comprehensive lab tests
- Categories: BLOOD (35), URINE (5), IMAGING (10), PATHOLOGY (12), HORMONE (8), PREGNANCY (5), PEDIATRIC (5), SENIOR (8)
- Each test includes:
  - testCode (T001-T088)
  - testName
  - categoryName
  - price
  - reportTime
  - fastingRequired
  - description
  - subTests array
  - tags array

#### 3. **Seeder Configuration** (`TestsSeeder.java`)
- Automatically populates database on application startup
- Checks for existing data to prevent duplicates
- Logs category breakdown for verification
- Uses CommandLineRunner pattern

#### 4. **Repository Updates** (`LabTestRepository.java`)
- Added `countByCategory(String categoryName)` method
- Supports filtering by category name (string-based)
- Existing methods for price range, search, and pagination

#### 5. **Service Enhancements** (`LabTestService.java`)
- **`filterTests()`** - Advanced filtering with multiple criteria
  - Category name
  - Price range (min/max)
  - Fasting requirement
  - Search keywords
  - All support pagination

- **`getTestsByCategory(String categoryName, Pageable)`** - Filter by category
- **`getCategoryCount()`** - Get test counts per category
- **`getTestsByTag(String tag, Pageable)`** - Filter by tag
- **`getTestsByCodeList(List<String>)`** - Get tests by code array

#### 6. **Controller New Endpoints** (`LabTestController.java`)

```
GET  /api/lab-tests/filter
     Query Params: category, minPrice, maxPrice, fasting, search, page, size
     Returns: Paginated filtered tests

GET  /api/lab-tests/categories/{categoryName}
     Returns: All tests in specific category (paginated)

GET  /api/lab-tests/category-counts
     Returns: Count of tests per category

GET  /api/lab-tests/by-tag/{tag}
     Query Params: page, size
     Returns: Tests matching the tag
```

#### 7. **DTO Updates** (`LabTestDTO.java`)
- Added `subTests: List<String>`
- Added `tags: List<String>`
- Now includes all new fields in API responses

### Frontend (React + TypeScript)

#### 1. **IndividualTestCard Component** (`IndividualTestCard.tsx`)
- Beautiful card layout for individual tests
- Displays:
  - Test name, code, category
  - Price with discount calculation
  - Fasting requirements, turnaround time
  - Sample type
  - Sub-tests (expandable, shows top 3 with "+X more" button)
  - Tags with icons
  - Add to cart functionality
- Responsive design for mobile/tablet/desktop
- Hover effects and animations

#### 2. **IndividualTestsPage Component** (`IndividualTestsPage.tsx`)
- Comprehensive test browsing interface
- Features:
  - **Category Filter** - BLOOD, URINE, IMAGING, PATHOLOGY, ALL
  - **Price Range Filter** - Custom min/max with quick price buttons
  - **Fasting Filter** - Toggle to show only fasting tests
  - **Search** - Real-time search by name/code/symptoms
  - **Pagination** - Supports multiple pages
  - **Result Count** - Shows filtered results
  - **Mobile Responsive** - Sidebar filters on desktop, toggleable on mobile

#### 3. **Styling**
- `IndividualTestCard.css` - Modern card design
- `IndividualTestsPage.css` - Full page layout with responsive grid
- Gradient backgrounds, smooth transitions
- Mobile-first responsive design

### Database

#### SQL Migration (`add-individual-tests-columns.sql`)
```sql
ALTER TABLE tests ADD COLUMN sub_tests JSON DEFAULT '[]'
ALTER TABLE tests ADD COLUMN tags JSON DEFAULT '[]'
CREATE INDEX idx_category_active ON tests(category_name, is_active)
CREATE INDEX idx_price_active ON tests(price, is_active)
CREATE INDEX idx_fasting_active ON tests(fasting_required, is_active)
CREATE VIEW v_active_tests AS ...
```

## API Response Examples

### GET /api/lab-tests/filter?category=BLOOD&minPrice=100&maxPrice=500&page=0&size=12

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "testCode": "T001",
        "testName": "Complete Blood Count (CBC)",
        "categoryName": "BLOOD",
        "price": 299,
        "originalPrice": 399,
        "description": "Full body health check...",
        "shortDescription": "Full body health check — fever, weakness...",
        "turnaroundTime": "24 hours",
        "fastingRequired": false,
        "fastingHours": 0,
        "sampleType": "Whole Blood / Serum / Plasma",
        "subTests": [
          "WBC Count",
          "RBC Count",
          "Hemoglobin",
          "Hematocrit",
          // ... 11 more
        ],
        "tags": [
          "fever",
          "weakness",
          "anemia",
          "general"
        ],
        "isActive": true
      },
      // ... more tests
    ],
    "totalElements": 45,
    "totalPages": 4,
    "currentPage": 0
  }
}
```

### GET /api/lab-tests/category-counts

```json
{
  "success": true,
  "data": {
    "ALL": 88,
    "BLOOD": 35,
    "URINE": 5,
    "IMAGING": 10,
    "PATHOLOGY": 33
  }
}
```

## Setup Instructions

### 1. Backend Setup

```bash
# Run database migration
mysql -u root -p healthcare < backend/add-individual-tests-columns.sql

# Compile backend
cd backend
mvn clean compile

# The seeder will automatically populate 88 tests on startup
mvn spring-boot:run
```

### 2. Frontend Setup

```bash
# The components are already created
# Just import and use in your routing:

import IndividualTestsPage from '@pages/IndividualTestsPage'

// Add to router
<Route path="/tests/individual" element={<IndividualTestsPage />} />
```

## Test Data Summary

### Categories
- **BLOOD (35 tests)**: CBC, Blood Sugar, Lipid Profile, Liver Function, Kidney Function, Thyroid, etc.
- **URINE (5 tests)**: Routine, Pregnancy, Microalbumin, Culture, Albumin-Creatinine Ratio
- **IMAGING (10 tests)**: X-Ray, Ultrasound, ECG, Echo, CT, MRI, Mammography
- **PATHOLOGY (33 tests)**: Infectious diseases (Malaria, Dengue, COVID, HIV, etc.), Hormones, Fertility, Pediatric, Stool

### Pricing
- Range: ₹99 to ₹3,500
- Average: ₹400-500
- Discounts built-in via originalPrice field

### Features
- Fasting requirements clearly marked (8h, 12h standard)
- Turnaround times: 1 hour to 72+ hours
- Sample types: Blood, Urine, Imaging, etc.
- Sub-tests: Up to 15 constituent tests per panel test
- Tags: 3-4 searchable tags per test

## Performance Optimization

### Database
- Indexes on `category_name`, `price`, `fasting_required` for fast filtering
- JSON columns with proper indexing support
- View `v_active_tests` for common queries

### Frontend
- Card component is lightweight (CSS-based animations)
- Pagination limits load (default 12 items per page)
- Search debouncing (300ms) to prevent excessive API calls
- Responsive grid that adapts to screen size

### Caching (Future)
- Consider Redis for category counts
- Cache popular tests separately
- TTL: 1 hour for category data

## Integration Checklist

- [x] Backend: Entity, Service, Controller, DTO updates
- [x] Database: Migration script with indexes
- [x] Seed data: 88 tests populated
- [x] Frontend: IndividualTestCard component
- [x] Frontend: IndividualTestsPage with filters
- [ ] Route registration in main App.tsx
- [ ] Cart integration (hook up onAddToCart)
- [ ] Test detail page (TestDetailPage.tsx)
- [ ] Booking integration
- [ ] Analytics/popularity tracking

## Testing Endpoints

```bash
# Get all tests with filters
curl "http://localhost:8080/api/lab-tests/filter?category=BLOOD&page=0&size=5"

# Get category counts
curl "http://localhost:8080/api/lab-tests/category-counts"

# Search tests
curl "http://localhost:8080/api/lab-tests/filter?search=fever&page=0&size=10"

# Get tests by tag
curl "http://localhost:8080/api/lab-tests/by-tag/diabetes?page=0&size=10"

# Get tests by category
curl "http://localhost:8080/api/lab-tests/categories/BLOOD?page=0&size=20"
```

## Notes

1. **Backward Compatibility**: Existing endpoints still work. New endpoints are additions.
2. **Seed Data**: Automatically runs on first startup. To re-seed, delete all tests and restart.
3. **JSON Storage**: Sub-tests and tags are stored as JSON in MySQL, making them flexible and searchable.
4. **Fasting Calculation**: `fastingRequired` flag + `fastingHours` field for precise requirements.
5. **Pricing**: originalPrice is used for discount calculation (if > price)

## Future Enhancements

1. Lab Test Packages - Combine multiple individual tests into bundle packages
2. Seasonal Tests - Different tests for different seasons
3. Popular Tests - Real-time popularity tracking
4. Reviews & Ratings - User feedback on tests
5. PDF Reports - Download lab reports after booking
6. Comparison - Side-by-side test comparison
7. Custom Panels - Users create their own test panels
8. AI Recommendations - "Based on your symptoms" recommendations

# API Documentation

> Complete REST API reference for the Healthcare Lab Test Booking System

## 📋 Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Common Patterns](#common-patterns)
- [Authentication APIs](#authentication-apis)
- [User APIs](#user-apis)
- [Test Catalog APIs](#test-catalog-apis)
- [Booking APIs](#booking-apis)
- [Report APIs](#report-apis)
- [Payment APIs](#payment-apis)
- [Admin APIs](#admin-apis)
- [Technician APIs](#technician-apis)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)

---

## 🌐 API Overview

**Base URL:** `http://localhost:8080/api`

**Production URL:** `https://api.labtestbooking.com/api`

**API Version:** v1

**Content Type:** `application/json`

**Character Encoding:** UTF-8

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzA4MjQ...
```

### Token Lifecycle

| Token Type | Purpose | Expiration |
|------------|---------|------------|
| Access Token | API authentication | 24 hours |
| Refresh Token | Token renewal | 7 days |

---

## 📐 Common Patterns

### Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (integer, default: 0) - Page number (zero-indexed)
- `size` (integer, default: 20) - Items per page (max: 100)
- `sort` (string, optional) - Sort field (e.g., `createdAt,desc`)

**Response Structure:**
```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

### Filtering

Filter parameters use the format: `fieldName=value`

**Supported Operators:**
- `fieldName=value` - Exact match
- `fieldName_gt=value` - Greater than
- `fieldName_lt=value` - Less than
- `fieldName_gte=value` - Greater than or equal
- `fieldName_lte=value` - Less than or equal
- `fieldName_like=value` - Contains (case-insensitive)

### Error Response Format

```json
{
  "timestamp": "2026-02-18T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'email'",
  "details": {
    "field": "email",
    "rejectedValue": "invalid-email",
    "reason": "must be a well-formed email address"
  },
  "path": "/api/auth/register"
}
```

---

## 🔑 Authentication APIs

### Register New User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** None

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "role": "PATIENT",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "address": "123 Main St, New York, NY 10001"
}
```

**Request Body Schema:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | string | Yes | Valid email format, unique |
| password | string | Yes | Min 8 chars, must contain uppercase, lowercase, digit, special char |
| fullName | string | Yes | 2-100 characters |
| phoneNumber | string | Yes | E.164 format, unique |
| role | enum | Yes | PATIENT, TECHNICIAN, MEDICAL_OFFICER, ADMIN |
| dateOfBirth | date | Yes | Must be in the past |
| gender | enum | Yes | MALE, FEMALE, OTHER |
| address | string | No | Max 500 characters |

**Response:** `201 Created`

```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "role": "PATIENT",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "isActive": true,
  "createdAt": "2026-02-18T10:00:00"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Invalid request body or validation failure |
| 409 | Email or phone number already exists |

---

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** None

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTcwODI0...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTcwODI0...",
  "type": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "PATIENT"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 401 | Invalid email or password |
| 403 | Account is inactive or suspended |

---

### Refresh Token

Obtain a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Authentication:** None

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTcwODI0..."
}
```

**Response:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTcwODI0...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTcwODI0...",
  "expiresIn": 86400
}
```

---

### Logout

Invalidate current access token.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required (Bearer Token)

**Request Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

---

### Forgot Password

Request password reset email.

**Endpoint:** `POST /api/auth/forgot-password`

**Authentication:** None

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:** `200 OK`

```json
{
  "message": "Password reset link sent to your email"
}
```

---

### Reset Password

Reset password using reset token.

**Endpoint:** `POST /api/auth/reset-password`

**Authentication:** None

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`

```json
{
  "message": "Password reset successfully"
}
```

---

## 👤 User APIs

### Get User Profile

Retrieve current user's profile information.

**Endpoint:** `GET /api/users/profile`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer {token}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "role": "PATIENT",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "address": "123 Main St, New York, NY 10001",
  "profilePictureUrl": "https://storage.example.com/profiles/1.jpg",
  "isActive": true,
  "emailVerified": true,
  "phoneVerified": true,
  "createdAt": "2026-01-01T10:00:00",
  "lastLoginAt": "2026-02-18T09:30:00"
}
```

---

### Update User Profile

Update current user's profile information.

**Endpoint:** `PUT /api/users/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "John Michael Doe",
  "phoneNumber": "+1234567891",
  "address": "456 Oak Avenue, Los Angeles, CA 90001",
  "dateOfBirth": "1990-01-15"
}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "fullName": "John Michael Doe",
  "phoneNumber": "+1234567891",
  "address": "456 Oak Avenue, Los Angeles, CA 90001",
  "updatedAt": "2026-02-18T10:30:00"
}
```

---

### Change Password

Change current user's password.

**Endpoint:** `POST /api/users/change-password`

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Response:** `200 OK`

```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Passwords do not match |
| 401 | Current password is incorrect |

---

### Get User Bookings

Retrieve all bookings for current user.

**Endpoint:** `GET /api/users/bookings`

**Authentication:** Required

**Query Parameters:**
- `status` (optional) - Filter by booking status
- `page` (default: 0)
- `size` (default: 20)

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 123,
      "labTest": {
        "id": 5,
        "name": "Complete Blood Count (CBC)",
        "category": "Hematology"
      },
      "bookingDate": "2026-02-20T09:00:00",
      "status": "CONFIRMED",
      "totalAmount": 500.00,
      "address": "123 Main St, New York, NY 10001",
      "technician": {
        "id": 10,
        "name": "Technician John",
        "phone": "+1234567899"
      },
      "createdAt": "2026-02-18T10:00:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 5,
  "totalPages": 1
}
```

---

### Get User Reports

Retrieve all reports for current user.

**Endpoint:** `GET /api/users/reports`

**Authentication:** Required

**Query Parameters:**
- `fromDate` (optional) - Filter reports from date
- `toDate` (optional) - Filter reports to date
- `page` (default: 0)
- `size` (default: 20)

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 456,
      "bookingId": 123,
      "testName": "Complete Blood Count (CBC)",
      "status": "VERIFIED",
      "reportDate": "2026-02-22T14:30:00",
      "pdfUrl": "https://storage.example.com/reports/456.pdf",
      "hasAbnormalValues": false,
      "verifiedBy": {
        "name": "Dr. Sarah Johnson",
        "qualification": "MD, Pathology"
      }
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 3,
  "totalPages": 1
}
```

---

## 🧪 Test Catalog APIs

### List All Tests

Retrieve paginated list of lab tests.

**Endpoint:** `GET /api/tests`

**Authentication:** None

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)
- `sort` (default: name,asc)

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 1,
      "name": "Complete Blood Count (CBC)",
      "code": "TEST_CBC_001",
      "category": "Hematology",
      "description": "Measures different components of blood",
      "basePrice": 500.00,
      "discountedPrice": 450.00,
      "discount": 10,
      "reportTime": 24,
      "reportTimeUnit": "HOURS",
      "gender": "BOTH",
      "isActive": true,
      "parameterCount": 12,
      "sampleType": "Blood",
      "fastingRequired": false
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 105,
  "totalPages": 6
}
```

---

### Get Test Details

Retrieve detailed information about a specific test.

**Endpoint:** `GET /api/tests/{id}`

**Authentication:** None

**Path Parameters:**
- `id` (required) - Test ID

**Response:** `200 OK`

```json
{
  "id": 1,
  "name": "Complete Blood Count (CBC)",
  "code": "TEST_CBC_001",
  "category": "Hematology",
  "description": "Comprehensive blood test measuring various blood components",
  "basePrice": 500.00,
  "discountedPrice": 450.00,
  "discount": 10,
  "reportTime": 24,
  "reportTimeUnit": "HOURS",
  "gender": "BOTH",
  "sampleType": "Blood",
  "fastingRequired": false,
  "preparation": [
    "No special preparation required",
    "Can be done at any time of the day"
  ],
  "parameters": [
    {
      "id": 1,
      "name": "Hemoglobin",
      "unit": "g/dL",
      "referenceRange": {
        "male": "13.5 - 17.5",
        "female": "12.0 - 15.5"
      }
    },
    {
      "id": 2,
      "name": "RBC Count",
      "unit": "million/µL",
      "referenceRange": {
        "male": "4.5 - 5.5",
        "female": "4.0 - 5.0"
      }
    }
  ],
  "locationPricing": [
    {
      "pincode": "110001",
      "city": "Delhi",
      "price": 450.00,
      "collectionCharge": 50.00,
      "labPartner": "Lab XYZ"
    }
  ]
}
```

---

### Search Tests (Fuzzy)

Search lab tests with fuzzy matching and typo tolerance.

**Endpoint:** `GET /api/tests/search`

**Authentication:** None

**Query Parameters:**
- `q` (required) - Search query
- `page` (default: 0)
- `size` (default: 20)

**Example Request:**
```http
GET /api/tests/search?q=tiroyd&page=0&size=10
```

**Response:** `200 OK`

```json
{
  "query": "tiroyd",
  "suggestions": ["thyroid", "thyroid profile"],
  "content": [
    {
      "id": 5,
      "name": "Thyroid Profile",
      "code": "TEST_THYROID_001",
      "category": "Endocrinology",
      "basePrice": 800.00,
      "discountedPrice": 720.00,
      "matchScore": 0.85,
      "highlightedName": "<mark>Thyroid</mark> Profile"
    }
  ],
  "totalElements": 3
}
```

---

### Filter Tests

Advanced filtering of lab tests.

**Endpoint:** `GET /api/tests/filter`

**Authentication:** None

**Query Parameters:**
- `category` (optional) - Category name
- `gender` (optional) - MALE, FEMALE, BOTH
- `minPrice` (optional) - Minimum price
- `maxPrice` (optional) - Maximum price
- `reportTime` (optional) - SAME_DAY, NEXT_DAY, STANDARD
- `hasDiscount` (optional) - true/false
- `organSystem` (optional) - Heart, Liver, Kidney, etc.
- `page` (default: 0)
- `size` (default: 20)
- `sort` (default: popularity,desc)

**Example Request:**
```http
GET /api/tests/filter?category=Cardiovascular&minPrice=500&maxPrice=2000&hasDiscount=true&page=0&size=20
```

**Response:** `200 OK`

```json
{
  "filters": {
    "category": "Cardiovascular",
    "minPrice": 500,
    "maxPrice": 2000,
    "hasDiscount": true
  },
  "content": [
    {
      "id": 15,
      "name": "Lipid Profile",
      "category": "Cardiovascular",
      "basePrice": 800.00,
      "discountedPrice": 720.00,
      "discount": 10,
      "reportTime": 24,
      "organSystem": "Heart"
    }
  ],
  "totalElements": 12,
  "totalPages": 1
}
```

---

### List Test Packages

Retrieve all health packages.

**Endpoint:** `GET /api/packages`

**Authentication:** None

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 1,
      "name": "Complete Health Package",
      "description": "Comprehensive health checkup with 86 tests",
      "basePrice": 5000.00,
      "discountedPrice": 3500.00,
      "discount": 30,
      "testCount": 86,
      "categories": ["CBC", "Lipid Profile", "Liver Function", "Kidney Function"],
      "gender": "BOTH",
      "reportTime": 48,
      "savings": 1500.00
    }
  ]
}
```

---

### Get Package Details

Get detailed information about a health package.

**Endpoint:** `GET /api/packages/{id}`

**Authentication:** None

**Response:** `200 OK`

```json
{
  "id": 1,
  "name": "Complete Health Package",
  "description": "Comprehensive health checkup covering all major organs",
  "basePrice": 5000.00,
  "discountedPrice": 3500.00,
  "discount": 30,
  "reportTime": 48,
  "reportTimeUnit": "HOURS",
  "gender": "BOTH",
  "tests": [
    {
      "id": 1,
      "name": "Complete Blood Count (CBC)",
      "category": "Hematology",
      "parameterCount": 12
    },
    {
      "id": 5,
      "name": "Lipid Profile",
      "category": "Cardiovascular",
      "parameterCount": 8
    }
  ],
  "totalParameters": 86,
  "savings": 1500.00
}
```

---

### List Test Categories

Get all test categories.

**Endpoint:** `GET /api/categories`

**Authentication:** None

**Response:** `200 OK`

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Hematology",
      "displayName": "Complete Blood Count",
      "testCount": 8,
      "icon": "blood-drop",
      "description": "Blood-related tests"
    },
    {
      "id": 2,
      "name": "Cardiovascular",
      "displayName": "Heart Health",
      "testCount": 12,
      "icon": "heart",
      "description": "Tests related to heart and cholesterol"
    }
  ]
}
```

---

## 📅 Booking APIs

### Create Booking

Create a new test booking.

**Endpoint:** `POST /api/bookings`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "labTestId": 1,
  "packageId": null,
  "bookingDate": "2026-02-25T09:00:00",
  "address": "123 Main St, New York, NY 10001",
  "pincode": "10001",
  "familyMemberId": null,
  "notes": "Please call before arrival"
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| labTestId | integer | Yes* | ID of lab test (required if packageId is null) |
| packageId | integer | Yes* | ID of package (required if labTestId is null) |
| bookingDate | datetime | Yes | Appointment date and time (must be in future) |
| address | string | Yes | Collection address |
| pincode | string | Yes | 6-digit pincode |
| familyMemberId | integer | No | ID of family member (if booking for someone else) |
| notes | string | No | Additional instructions |

**Response:** `201 Created`

```json
{
  "id": 123,
  "userId": 1,
  "labTest": {
    "id": 1,
    "name": "Complete Blood Count (CBC)"
  },
  "bookingDate": "2026-02-25T09:00:00",
  "status": "PENDING",
  "totalAmount": 500.00,
  "collectionCharge": 50.00,
  "finalAmount": 550.00,
  "address": "123 Main St, New York, NY 10001",
  "pincode": "10001",
  "paymentLink": "https://payment.gateway.com/pay/abc123",
  "orderId": "ORDER_123456",
  "createdAt": "2026-02-18T10:30:00"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Invalid booking date or address |
| 404 | Lab test or package not found |
| 409 | Slot not available |

---

### Get Booking Details

Retrieve details of a specific booking.

**Endpoint:** `GET /api/bookings/{id}`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Booking ID

**Response:** `200 OK`

```json
{
  "id": 123,
  "userId": 1,
  "userName": "John Doe",
  "labTest": {
    "id": 1,
    "name": "Complete Blood Count (CBC)",
    "category": "Hematology"
  },
  "bookingDate": "2026-02-25T09:00:00",
  "status": "CONFIRMED",
  "totalAmount": 500.00,
  "collectionCharge": 50.00,
  "discount": 0.00,
  "finalAmount": 550.00,
  "address": "123 Main St, New York, NY 10001",
  "pincode": "10001",
  "technician": {
    "id": 10,
    "name": "Technician John",
    "phone": "+1234567899",
    "currentLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "estimatedArrival": "15 minutes"
  },
  "payment": {
    "id": 456,
    "amount": 550.00,
    "status": "SUCCESS",
    "method": "UPI",
    "transactionId": "TXN_123456789",
    "paidAt": "2026-02-18T10:35:00"
  },
  "createdAt": "2026-02-18T10:30:00",
  "updatedAt": "2026-02-18T10:35:00"
}
```

---

### Get My Bookings

Retrieve all bookings for the current user.

**Endpoint:** `GET /api/bookings/my-bookings`

**Authentication:** Required

**Query Parameters:**
- `status` (optional) - Filter by status (PENDING, CONFIRMED, ASSIGNED, etc.)
- `fromDate` (optional) - Filter from date
- `toDate` (optional) - Filter to date
- `page` (default: 0)
- `size` (default: 20)

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 123,
      "testName": "Complete Blood Count (CBC)",
      "bookingDate": "2026-02-25T09:00:00",
      "status": "CONFIRMED",
      "finalAmount": 550.00,
      "canCancel": true,
      "canReschedule": true
    }
  ],
  "page": 0,
  "totalElements": 5
}
```

---

### Check Available Slots

Get available time slots for a specific date and pincode.

**Endpoint:** `GET /api/slots/available`

**Authentication:** None

**Query Parameters:**
- `date` (required) - Date in YYYY-MM-DD format
- `pincode` (required) - 6-digit pincode

**Example Request:**
```http
GET /api/slots/available?date=2026-02-25&pincode=110001
```

**Response:** `200 OK`

```json
{
  "date": "2026-02-25",
  "pincode": "110001",
  "slots": [
    {
      "time": "06:00 AM",
      "endTime": "07:00 AM",
      "available": true,
      "techniciansAvailable": 5,
      "capacity": 10,
      "booked": 5
    },
    {
      "time": "07:00 AM",
      "endTime": "08:00 AM",
      "available": true,
      "techniciansAvailable": 3,
      "capacity": 10,
      "booked": 7
    },
    {
      "time": "08:00 AM",
      "endTime": "09:00 AM",
      "available": false,
      "techniciansAvailable": 0,
      "capacity": 10,
      "booked": 10
    }
  ]
}
```

---

### Cancel Booking

Cancel a booking and process refund.

**Endpoint:** `PUT /api/bookings/{id}/cancel`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Booking ID

**Request Body:**
```json
{
  "reason": "SCHEDULE_CONFLICT",
  "comments": "Unable to be available at scheduled time"
}
```

**Reason Options:**
- `SCHEDULE_CONFLICT`
- `BOOKED_BY_MISTAKE`
- `DOCTOR_ADVICE`
- `FINANCIAL_REASON`
- `OTHER`

**Response:** `200 OK`

```json
{
  "bookingId": 123,
  "status": "CANCELLED",
  "refundAmount": 550.00,
  "refundPercentage": 100,
  "cancellationFee": 0.00,
  "refundMode": "ORIGINAL_PAYMENT_METHOD",
  "processingTime": "3-5 business days",
  "cancelledAt": "2026-02-18T11:00:00"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| 400 | Booking cannot be cancelled in current status |
| 403 | Not authorized to cancel this booking |
| 404 | Booking not found |

---

### Track Booking Status

Get real-time tracking information for a booking.

**Endpoint:** `GET /api/bookings/{id}/status`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Booking ID

**Response:** `200 OK`

```json
{
  "bookingId": 123,
  "currentStatus": "EN_ROUTE",
  "timeline": [
    {
      "status": "PENDING",
      "timestamp": "2026-02-18T10:30:00",
      "message": "Booking created",
      "description": "Your booking has been created and is awaiting payment"
    },
    {
      "status": "CONFIRMED",
      "timestamp": "2026-02-18T10:35:00",
      "message": "Payment confirmed",
      "description": "Payment of ₹550 received successfully"
    },
    {
      "status": "ASSIGNED",
      "timestamp": "2026-02-18T11:00:00",
      "message": "Technician assigned",
      "description": "Technician John has been assigned to your booking",
      "technician": {
        "name": "John Doe",
        "phone": "+1234567899"
      }
    },
    {
      "status": "EN_ROUTE",
      "timestamp": "2026-02-25T08:30:00",
      "message": "Technician on the way",
      "description": "Technician is traveling to your location",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "estimatedArrival": "15 minutes"
    }
  ],
  "nextSteps": [
    "Sample will be collected",
    "Sample will be submitted to lab",
    "Lab will process the tests",
    "Report will be available in 24 hours"
  ]
}
```

---

### Reschedule Booking

Reschedule a booking to a new date and time.

**Endpoint:** `PUT /api/bookings/{id}/reschedule`

**Authentication:** Required

**Request Body:**
```json
{
  "newBookingDate": "2026-02-26T10:00:00",
  "reason": "Personal emergency"
}
```

**Response:** `200 OK`

```json
{
  "bookingId": 123,
  "oldDate": "2026-02-25T09:00:00",
  "newDate": "2026-02-26T10:00:00",
  "rescheduleFee": 0.00,
  "message": "Booking rescheduled successfully"
}
```

---

## 📊 Report APIs

### Get Report

Retrieve a specific report.

**Endpoint:** `GET /api/reports/{id}`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Report ID

**Response:** `200 OK`

```json
{
  "id": 456,
  "bookingId": 123,
  "testName": "Complete Blood Count (CBC)",
  "patientName": "John Doe",
  "age": 36,
  "gender": "MALE",
  "status": "VERIFIED",
  "reportDate": "2026-02-26T14:30:00",
  "verifiedBy": {
    "name": "Dr. Sarah Johnson",
    "qualification": "MD, Pathology",
    "licenseNumber": "MED123456"
  },
  "results": [
    {
      "parameterId": 1,
      "parameterName": "Hemoglobin",
      "measuredValue": 14.5,
      "unit": "g/dL",
      "referenceRange": {
        "min": 13.5,
        "max": 17.5
      },
      "status": "NORMAL",
      "interpretation": "Within normal range"
    },
    {
      "parameterId": 2,
      "parameterName": "RBC Count",
      "measuredValue": 4.2,
      "unit": "million/µL",
      "referenceRange": {
        "min": 4.5,
        "max": 5.5
      },
      "status": "LOW",
      "severity": "MILD",
      "interpretation": "Slightly below normal range. Consult physician."
    }
  ],
  "summary": {
    "totalParameters": 12,
    "normalCount": 10,
    "abnormalCount": 2,
    "criticalCount": 0
  },
  "pdfUrl": "https://storage.example.com/reports/456.pdf",
  "qrCode": "https://verify.labtestbooking.com/report/456"
}
```

---

### Get Smart Report

Get AI-enhanced report with insights and recommendations.

**Endpoint:** `GET /api/reports/{id}/smart`

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "reportId": 456,
  "basicReport": {
    "...": "standard report data"
  },
  "aiInsights": {
    "overallHealthScore": 85,
    "riskFactors": [
      {
        "factor": "Slightly low RBC count",
        "severity": "LOW",
        "recommendation": "Include iron-rich foods in diet"
      }
    ],
    "positiveIndicators": [
      "Hemoglobin levels are optimal",
      "Platelet count is healthy",
      "WBC count indicates good immunity"
    ],
    "recommendations": [
      {
        "category": "Diet",
        "suggestions": [
          "Increase iron-rich foods (spinach, red meat)",
          "Include vitamin C for better iron absorption"
        ]
      },
      {
        "category": "Lifestyle",
        "suggestions": [
          "Regular exercise to improve blood circulation",
          "Adequate sleep (7-8 hours)"
        ]
      }
    ],
    "followUpTests": [
      {
        "testName": "Iron Studies",
        "reason": "To check iron levels and TIBC",
        "recommendedAfter": "3 months"
      }
    ]
  },
  "comparisons": {
    "populationAverage": {
      "hemoglobin": 14.8,
      "yourValue": 14.5,
      "percentile": 45
    }
  }
}
```

---

### Get Trends

Get historical trend data for a specific test parameter.

**Endpoint:** `GET /api/reports/{id}/trends/{parameterId}`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Report ID
- `parameterId` (required) - Parameter ID (e.g., Hemoglobin)

**Query Parameters:**
- `fromDate` (optional) - Start date
- `toDate` (optional) - End date

**Response:** `200 OK`

```json
{
  "parameterId": 1,
  "parameterName": "Hemoglobin",
  "unit": "g/dL",
  "referenceRange": {
    "min": 13.5,
    "max": 17.5
  },
  "data": [
    {
      "date": "2025-08-15",
      "value": 15.2,
      "status": "NORMAL",
      "reportId": 100
    },
    {
      "date": "2025-11-20",
      "value": 14.8,
      "status": "NORMAL",
      "reportId": 200
    },
    {
      "date": "2026-02-26",
      "value": 14.5,
      "status": "NORMAL",
      "reportId": 456
    }
  ],
  "trend": "DECREASING",
  "percentageChange": -4.6,
  "interpretation": "Gradual decrease observed over 6 months. Monitor and consult physician if continues.",
  "chart": {
    "type": "line",
    "dataUrl": "https://api.labtestbooking.com/charts/hemoglobin-123.png"
  }
}
```

---

### Download PDF Report

Download report in PDF format.

**Endpoint:** `GET /api/reports/{id}/pdf`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Report ID

**Request Headers:**
```http
Authorization: Bearer {token}
Accept: application/pdf
```

**Response:** `200 OK`

**Response Headers:**
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="lab_report_456_2026-02-26.pdf"
Content-Length: 425678
```

**Response Body:** Binary PDF data

---

### Verify Report (Admin/Medical Officer)

Verify and approve a report.

**Endpoint:** `POST /api/reports/{id}/verify`

**Authentication:** Required (MEDICAL_OFFICER or ADMIN)

**Request Body:**
```json
{
  "verificationStatus": "APPROVED",
  "comments": "All values reviewed and verified. Report is accurate.",
  "criticalValuesHandled": true
}
```

**Response:** `200 OK`

```json
{
  "reportId": 456,
  "status": "VERIFIED",
  "verifiedBy": {
    "id": 5,
    "name": "Dr. Sarah Johnson",
    "qualification": "MD, Pathology"
  },
  "verifiedAt": "2026-02-26T14:30:00",
  "comments": "All values reviewed and verified. Report is accurate."
}
```

---

## 💳 Payment APIs

### Create Payment Order

Create a payment order for a booking.

**Endpoint:** `POST /api/payments/create-order`

**Authentication:** Required

**Request Body:**
```json
{
  "bookingId": 123,
  "amount": 550.00,
  "currency": "INR"
}
```

**Response:** `201 Created`

```json
{
  "orderId": "ORDER_123456",
  "amount": 550.00,
  "currency": "INR",
  "paymentLink": "https://payment.gateway.com/pay/abc123",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "expiresAt": "2026-02-18T12:00:00"
}
```

---

### Payment Webhook

Handle payment gateway webhooks (internal use).

**Endpoint:** `POST /api/payments/webhook`

**Authentication:** Webhook signature verification

**Request Headers:**
```http
X-Webhook-Signature: sha256_signature_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "payment.success",
  "orderId": "ORDER_123456",
  "paymentId": "PAY_123456789",
  "amount": 550.00,
  "currency": "INR",
  "method": "UPI",
  "timestamp": "2026-02-18T10:35:00"
}
```

**Response:** `200 OK`

```json
{
  "received": true
}
```

---

### Get Payment for Booking

Retrieve payment details for a booking.

**Endpoint:** `GET /api/payments/booking/{bookingId}`

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "id": 789,
  "bookingId": 123,
  "orderId": "ORDER_123456",
  "amount": 550.00,
  "status": "SUCCESS",
  "method": "UPI",
  "transactionId": "TXN_123456789",
  "gatewayResponse": "Payment successful",
  "paidAt": "2026-02-18T10:35:00"
}
```

---

### Get Payment History

Get payment history for current user.

**Endpoint:** `GET /api/payments/history`

**Authentication:** Required

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 789,
      "bookingId": 123,
      "testName": "Complete Blood Count (CBC)",
      "amount": 550.00,
      "status": "SUCCESS",
      "method": "UPI",
      "paidAt": "2026-02-18T10:35:00"
    }
  ],
  "totalElements": 5
}
```

---

### Download Invoice

Download payment invoice.

**Endpoint:** `GET /api/payments/invoice/{paymentId}`

**Authentication:** Required

**Response:** `200 OK`

**Response Headers:**
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice_789.pdf"
```

---

## 👨‍💼 Admin APIs

### Get Dashboard Analytics

Retrieve admin dashboard metrics.

**Endpoint:** `GET /api/admin/analytics/dashboard`

**Authentication:** Required (ADMIN)

**Query Parameters:**
- `period` (optional) - TODAY, WEEK, MONTH, YEAR (default: TODAY)

**Response:** `200 OK`

```json
{
  "period": "TODAY",
  "metrics": {
    "totalBookings": 45,
    "confirmedBookings": 38,
    "completedTests": 32,
    "revenue": 25000.00,
    "newUsers": 12,
    "activeUsers": 156,
    "averageRating": 4.7,
    "cancellationRate": 5.2
  },
  "comparisons": {
    "bookings": {
      "current": 45,
      "previous": 38,
      "change": "+18.4%"
    },
    "revenue": {
      "current": 25000.00,
      "previous": 22000.00,
      "change": "+13.6%"
    }
  },
  "topTests": [
    {
      "testId": 1,
      "testName": "Complete Blood Count (CBC)",
      "bookingCount": 15,
      "revenue": 7500.00
    }
  ],
  "revenueByMethod": {
    "UPI": 12000.00,
    "CARD": 8000.00,
    "NET_BANKING": 5000.00
  }
}
```

---

### Get Booking Analytics

Detailed booking analytics.

**Endpoint:** `GET /api/admin/analytics/bookings`

**Authentication:** Required (ADMIN)

**Query Parameters:**
- `fromDate` (required) - Start date
- `toDate` (required) - End date
- `groupBy` (optional) - DAILY, WEEKLY, MONTHLY (default: DAILY)

**Response:** `200 OK`

```json
{
  "fromDate": "2026-02-01",
  "toDate": "2026-02-18",
  "groupBy": "DAILY",
  "data": [
    {
      "date": "2026-02-01",
      "bookings": 42,
      "revenue": 21000.00,
      "cancellations": 3
    },
    {
      "date": "2026-02-02",
      "bookings": 38,
      "revenue": 19000.00,
      "cancellations": 2
    }
  ],
  "summary": {
    "totalBookings": 756,
    "totalRevenue": 378000.00,
    "averageBookingsPerDay": 42,
    "averageRevenuPerDay": 21000.00,
    "cancellationRate": 5.5
  }
}
```

---

### Get Revenue Reports

Revenue analytics and reports.

**Endpoint:** `GET /api/admin/analytics/revenue`

**Authentication:** Required (ADMIN)

**Query Parameters:**
- `fromDate` (required)
- `toDate` (required)

**Response:** `200 OK`

```json
{
  "fromDate": "2026-02-01",
  "toDate": "2026-02-18",
  "totalRevenue": 378000.00,
  "breakdown": {
    "individualTests": 226800.00,
    "packages": 151200.00
  },
  "byPaymentMethod": {
    "UPI": 189000.00,
    "CARD": 113400.00,
    "NET_BANKING": 75600.00
  },
  "refunds": 5600.00,
  "netRevenue": 372400.00,
  "topRevenueTests": [
    {
      "testName": "Complete Health Package",
      "bookingCount": 45,
      "revenue": 157500.00
    }
  ]
}
```

---

### Add New Test

Create a new lab test (Admin only).

**Endpoint:** `POST /api/admin/tests`

**Authentication:** Required (ADMIN)

**Request Body:**
```json
{
  "name": "Vitamin D Test",
  "code": "TEST_VITD_001",
  "category": "Vitamins",
  "description": "Measures vitamin D levels in blood",
  "basePrice": 1200.00,
  "discount": 15,
  "reportTime": 48,
  "reportTimeUnit": "HOURS",
  "gender": "BOTH",
  "sampleType": "Blood",
  "fastingRequired": false,
  "preparation": [
    "No special preparation needed"
  ],
  "parameters": [
    {
      "name": "25-OH Vitamin D",
      "unit": "ng/mL",
      "referenceRanges": [
        {
          "gender": "BOTH",
          "ageGroup": "ADULT",
          "minValue": 30.0,
          "maxValue": 100.0
        }
      ]
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "id": 106,
  "name": "Vitamin D Test",
  "code": "TEST_VITD_001",
  "isActive": true,
  "createdAt": "2026-02-18T12:00:00"
}
```

---

### Update Pricing

Update pricing for a test in specific locations.

**Endpoint:** `PUT /api/admin/pricing`

**Authentication:** Required (ADMIN)

**Request Body:**
```json
{
  "testId": 1,
  "locationPricing": [
    {
      "pincode": "110001",
      "city": "Delhi",
      "price": 480.00,
      "collectionCharge": 50.00,
      "labPartnerId": 1
    },
    {
      "pincode": "400001",
      "city": "Mumbai",
      "price": 520.00,
      "collectionCharge": 60.00,
      "labPartnerId": 2
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "testId": 1,
  "updatedLocations": 2,
  "message": "Pricing updated successfully"
}
```

---

## 👨‍🔧 Technician APIs

### Get Assigned Bookings

Get bookings assigned to the current technician.

**Endpoint:** `GET /api/technician/bookings`

**Authentication:** Required (TECHNICIAN)

**Query Parameters:**
- `status` (optional) - Filter by status
- `date` (optional) - Filter by date
- `page` (default: 0)
- `size` (default: 20)

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 123,
      "patientName": "John Doe",
      "phoneNumber": "+1234567890",
      "testName": "Complete Blood Count (CBC)",
      "bookingDate": "2026-02-25T09:00:00",
      "status": "ASSIGNED",
      "address": "123 Main St, New York, NY 10001",
      "pincode": "10001",
      "distanceFromCurrent": "2.5 km",
      "navigationUrl": "https://maps.google.com/?q=40.7128,-74.0060"
    }
  ]
}
```

---

### Update Booking Status

Update status of assigned booking.

**Endpoint:** `PUT /api/technician/bookings/{id}/status`

**Authentication:** Required (TECHNICIAN)

**Request Body:**
```json
{
  "status": "EN_ROUTE",
  "notes": "Starting journey to patient location",
  "currentLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:** `200 OK`

```json
{
  "bookingId": 123,
  "status": "EN_ROUTE",
  "updatedAt": "2026-02-25T08:30:00",
  "estimatedArrival": "15 minutes"
}
```

---

### Submit Sample

Mark sample as collected and submitted to lab.

**Endpoint:** `POST /api/technician/bookings/{id}/submit-sample`

**Authentication:** Required (TECHNICIAN)

**Request Body:**
```json
{
  "sampleCollectedAt": "2026-02-25T09:15:00",
  "barcodeId": "SAMPLE_123456",
  "notes": "Sample collected successfully",
  "temperature": "Room temperature"
}
```

**Response:** `200 OK`

```json
{
  "bookingId": 123,
  "status": "COLLECTED",
  "sampleId": "SAMPLE_123456",
  "message": "Sample submitted successfully"
}
```

---

## ⚠️ Error Handling

### Standard Error Response

All error responses follow this format:

```json
{
  "timestamp": "2026-02-18T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": {
    "field": "email",
    "rejectedValue": "invalid-email",
    "reason": "must be a well-formed email address"
  },
  "path": "/api/auth/register"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE (no response body) |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists or conflict |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server temporarily unavailable |

### Common Error Messages

**Authentication Errors:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is expired or invalid"
}
```

**Validation Errors:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "must be a well-formed email address"
    },
    {
      "field": "password",
      "message": "must contain at least 8 characters"
    }
  ]
}
```

**Resource Not Found:**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Booking with id 999 not found"
}
```

---

## 🚦 Rate Limiting

Rate limits are applied per user/IP address:

| User Type | Limit | Window |
|-----------|-------|--------|
| Unauthenticated | 100 requests | 1 minute |
| Authenticated | 500 requests | 1 minute |
| Admin | 1000 requests | 1 minute |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1708248000
```

**Rate Limit Exceeded Response:**
```json
{
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Maximum 500 requests per minute.",
  "retryAfter": 35
}
```

---

## 🔔 Webhooks

### Payment Webhook

Receive payment notifications from gateway.

**URL:** `POST https://your-domain.com/api/payments/webhook`

**Headers:**
```http
X-Webhook-Signature: sha256_signature
Content-Type: application/json
```

**Payload:**
```json
{
  "event": "payment.success",
  "orderId": "ORDER_123456",
  "paymentId": "PAY_123456789",
  "amount": 550.00,
  "currency": "INR",
  "method": "UPI",
  "timestamp": "2026-02-18T10:35:00"
}
```

### Notification Webhook

Receive delivery status from notification services.

**URL:** `POST https://your-domain.com/api/notifications/webhook`

**Payload:**
```json
{
  "event": "sms.delivered",
  "messageId": "MSG_123456",
  "recipient": "+1234567890",
  "status": "DELIVERED",
  "timestamp": "2026-02-18T10:35:30"
}
```

---

## 📝 API Testing

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User",
    "phoneNumber": "+1234567890",
    "role": "PATIENT",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Get Tests (with auth):**
```bash
curl -X GET http://localhost:8080/api/tests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API collection from Swagger UI
2. Set up environment variables:
   - `BASE_URL`: http://localhost:8080/api
   - `JWT_TOKEN`: (obtained from login)
3. Use collection runner for automated testing

---

## 🔗 Related Documentation

- [Complete Features](../overview/FEATURES.md) - All 60+ features documented
- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md) - Architecture diagrams and design
- [Setup Guide](../ops/SETUP.md) - Installation and configuration
- [Project Overview](../overview/PROJECT_OVERVIEW.md) - Getting started guide

---

**Last Updated:** February 18, 2026

**API Version:** 1.0

**Support:** support@labtestbooking.com

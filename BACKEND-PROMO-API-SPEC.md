# Promo Code System - Backend API Specification

## Overview
This document specifies all API endpoints required for the promo code system implementation.

## Base URL
```
http://localhost:8080/api/promo-codes
```

## Authentication
All endpoints require user authentication via JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get Available Promo Codes
Lists all active, non-expired promo codes available to the user.

**Endpoint**: `GET /api/promo-codes/available`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Max codes to return (default: 100) |
| offset | number | No | Pagination offset (default: 0) |
| type | string | No | Filter by type: "PERCENTAGE" or "FLAT" |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "SAVE20",
      "description": "Save 20% on all laboratory tests",
      "discount_type": "PERCENTAGE",
      "discount_value": 20,
      "max_discount": null,
      "min_cart_value": 500,
      "expiry_date": "2025-12-31T23:59:59Z",
      "is_active": true,
      "usage_limit": 1000,
      "used_count": 250,
      "applicable_tests": null,
      "is_applicable_to_all": true,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-12-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

**Status Codes**:
- `200 OK` - Successfully retrieved codes
- `401 Unauthorized` - Missing/invalid authentication
- `500 Internal Server Error` - Server error

---

### 2. Get Promo Code by Code
Fetch details of a specific promo code.

**Endpoint**: `GET /api/promo-codes/{code}`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| code | string | The promo code (e.g., "SAVE20") |

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "code": "SAVE20",
    "description": "Save 20% on all laboratory tests",
    "discount_type": "PERCENTAGE",
    "discount_value": 20,
    "max_discount": null,
    "min_cart_value": 500,
    "expiry_date": "2025-12-31T23:59:59Z",
    "is_active": true,
    "usage_limit": 1000,
    "used_count": 250,
    "applicable_tests": ["test_1", "test_2"],
    "is_applicable_to_all": true,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "Promo code not found"
  }
}
```

---

### 3. Validate Promo Code
Validates if a promo code is applicable to the user's cart.

**Endpoint**: `POST /api/promo-codes/validate`

**Request Body**:
```json
{
  "code": "SAVE20",
  "cartValue": 1500,
  "testIds": ["test_1", "test_2"]
}
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Yes | Promo code to validate |
| cartValue | number | Yes | Total cart value in rupees |
| testIds | string[] | No | Array of test IDs in cart |

**Success Response**:
```json
{
  "success": true,
  "data": {
    "code": "SAVE20",
    "discount_type": "PERCENTAGE",
    "discount_value": 20,
    "discount_amount": 300,
    "max_discount": null,
    "min_cart_value": 500,
    "message": "Promo code is valid and applicable",
    "terms_and_conditions": {
      "description": "Save 20% on all laboratory tests",
      "applicableTests": null,
      "expiryDate": "2025-12-31"
    }
  }
}
```

**Error Response Examples**:

**Expired Code**:
```json
{
  "success": false,
  "error": {
    "code": "EXPIRED",
    "message": "This promo code has expired",
    "details": {
      "reason": "EXPIRED",
      "expiryDate": "2024-12-31"
    }
  }
}
```

**Minimum Cart Value Not Met**:
```json
{
  "success": false,
  "error": {
    "code": "MIN_CART_VALUE",
    "message": "Minimum cart value of ₹500 required",
    "details": {
      "reason": "MIN_CART_VALUE",
      "minCartValue": 500,
      "currentCartValue": 300
    }
  }
}
```

**Invalid Code**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "Invalid or non-existent promo code",
    "details": {
      "reason": "INVALID_CODE"
    }
  }
}
```

**Not Applicable**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_APPLICABLE",
    "message": "This promo code is not applicable to items in your cart",
    "details": {
      "reason": "NOT_APPLICABLE",
      "applicableTests": ["specific_test_1"]
    }
  }
}
```

**Usage Limit Exceeded**:
```json
{
  "success": false,
  "error": {
    "code": "USAGE_LIMIT",
    "message": "This promo code has reached its usage limit",
    "details": {
      "reason": "USAGE_LIMIT",
      "usageLimit": 1000,
      "usedCount": 1000
    }
  }
}
```

---

### 4. Apply Promo Code
Applies a validated promo code to the cart and returns discount details.

**Endpoint**: `POST /api/promo-codes/apply`

**Request Body**:
```json
{
  "code": "SAVE20",
  "cartValue": 1500,
  "testIds": ["test_1", "test_2"]
}
```

**Request Parameters**: Same as validate endpoint

**Success Response**:
```json
{
  "success": true,
  "data": {
    "code": "SAVE20",
    "discount_type": "PERCENTAGE",
    "discount_value": 20,
    "discount_amount": 300,
    "max_discount": null,
    "message": "Promo code 'SAVE20' applied successfully! You saved ₹300",
    "appliedAt": "2024-12-15T10:30:00Z"
  }
}
```

**Error Response**: Same as validate endpoint

**Side Effects**:
- Increments promo code usage counter
- Records promo code usage in user's history
- Creates audit log entry

---

### 5. Remove Promo Code
Removes an applied promo code from the cart.

**Endpoint**: `POST /api/promo-codes/remove`

**Request Body**:
```json
{
  "code": "SAVE20"
}
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Yes | Promo code to remove |

**Success Response**:
```json
{
  "success": true,
  "message": "Promo code removed successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "REMOVAL_ERROR",
    "message": "Failed to remove promo code"
  }
}
```

---

### 6. Get Featured Promo Codes
Fetches featured/trending promo codes for widget display.

**Endpoint**: `GET /api/promo-codes/featured`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of codes to return (default: 5) |

**Response**: Same structure as available endpoint

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "SAVE20",
      "description": "Save 20% on all tests",
      "discount_type": "PERCENTAGE",
      "discount_value": 20,
      ...
    }
  ]
}
```

---

### 7. Search Promo Codes
Search promo codes by query string.

**Endpoint**: `GET /api/promo-codes/search`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| category | string | No | Filter by category |
| limit | number | No | Results limit (default: 20) |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "SAVE20",
      ...
    }
  ],
  "total": 5
}
```

---

### 8. Get User Promo History
Retrieves the user's promo code usage history.

**Endpoint**: `GET /api/promo-codes/history`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Results limit (default: 50) |
| offset | number | No | Pagination offset (default: 0) |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "SAVE20",
      "description": "Save 20% on all tests",
      "discountAmount": 300,
      "appliedAt": "2024-12-15T10:30:00Z",
      "orderId": "order_123"
    }
  ],
  "total": 10
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|------------|-------------|
| INVALID_CODE | 400 | Code doesn't exist or is inactive |
| EXPIRED | 400 | Code has expired |
| MIN_CART_VALUE | 400 | Cart value below minimum |
| USAGE_LIMIT | 400 | Code usage limit exceeded |
| NOT_APPLICABLE | 400 | Code not applicable to cart items |
| ALREADY_USED | 400 | Code already used by user in current session |
| REMOVAL_ERROR | 400 | Failed to remove code |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| UNAUTHORIZED | 401 | Missing/invalid authentication |
| SERVER_ERROR | 500 | Internal server error |

---

## Request/Response Headers

**Required Headers**:
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
Accept: application/json
```

**Response Headers**:
```
Content-Type: application/json
Cache-Control: no-cache
X-Request-ID: <unique_id>
```

---

## Rate Limiting

- **Validate Endpoint**: 10 requests per minute per user
- **Apply Endpoint**: 3 requests per minute per user
- **List Endpoints**: 30 requests per minute per user

Returns `429 Too Many Requests` if exceeded.

---

## Data Validation Rules

### Code Validation
- Valid characters: A-Z, 0-9, hyphen (-)
- Length: 3-20 characters
- Case-insensitive (stored as uppercase)

### Cart Value
- Minimum: 0
- Maximum: 999,999,999
- Decimal places: 2

### Discount Value
- PERCENTAGE: 0-100
- FLAT: 0-999,999,999

### Test IDs
- Format: UUID or alphanumeric
- Array length: 0-1000

---

## Database Schema

```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  discount_type ENUM('PERCENTAGE', 'FLAT') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount DECIMAL(10, 2),
  min_cart_value DECIMAL(10, 2),
  expiry_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_applicable_to_all BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  INDEX idx_code (code),
  INDEX idx_active (is_active),
  INDEX idx_expiry (expiry_date)
);

CREATE TABLE promo_code_tests (
  promo_id UUID,
  test_id VARCHAR(100),
  FOREIGN KEY (promo_id) REFERENCES promo_codes(id),
  PRIMARY KEY (promo_id, test_id)
);

CREATE TABLE promo_code_usage (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  code_id UUID NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  order_id UUID,
  FOREIGN KEY (code_id) REFERENCES promo_codes(id),
  INDEX idx_user (user_id),
  INDEX idx_code (code_id),
  INDEX idx_order (order_id)
);
```

---

## Implementation Checklist

- [ ] Create database tables
- [ ] Implement validation logic
- [ ] Implement discount calculation
- [ ] Create API endpoints
- [ ] Add authentication middleware
- [ ] Add rate limiting
- [ ] Add error handling
- [ ] Add logging
- [ ] Add caching (Redis optional)
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add API documentation (Swagger)
- [ ] Deploy to staging
- [ ] Load test
- [ ] Deploy to production

---

## Example Integration Flow

1. **User enters code**: `SAVE20`
2. **Frontend calls validate**: `POST /api/promo-codes/validate`
3. **Backend checks**:
   - Code exists? ✓
   - Code active? ✓
   - Expired? ✗ (not expired)
   - Min cart value met? ✓
   - Applicable to tests? ✓
   - Usage limit? ✓
4. **Returns**: `{ success: true, discount_amount: 300 }`
5. **User clicks apply**
6. **Frontend calls apply**: `POST /api/promo-codes/apply`
7. **Backend**:
   - Validates again
   - Increments usage counter
   - Records in usage history
   - Returns success
8. **Frontend shows**: "Saved ₹300!"
9. **Cart updates** with discount
10. **User proceeds** to checkout

---

## Performance Considerations

1. **Cache featured codes** (TTL: 1 hour)
2. **Index promo code table** on: code, is_active, expiry_date
3. **Lazy load** promo list (pagination)
4. **Debounce** frontend validation calls
5. **Batch operations** for bulk promo management
6. **Archive old codes** (> 1 year expired)

---

## Security Considerations

1. **CSRF Protection**: Include CSRF token in requests
2. **XSS Prevention**: Sanitize all inputs
3. **SQL Injection**: Use parameterized queries
4. **Rate Limiting**: Prevent brute force attacks
5. **Audit Logging**: Log all promo applications
6. **User Isolation**: Users can't see other users' history
7. **Code Expiration**: Automatic cleanup of expired codes

---

## Support & Contact

For API implementation questions:
- **Backend Lead**: [Team Lead Name]
- **Technical Architect**: [Architect Name]
- **DevOps**: [DevOps Contact]

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Status**: Ready for Implementation

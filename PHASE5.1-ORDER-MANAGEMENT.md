# Phase 5.1 - Order Management Implementation

**Status:** ✅ COMPLETE & COMMITTED
**Date:** 2026-03-23
**Commit:** f90531d
**Build:** Clean (0 errors)

## Overview

Phase 5.1 implements the core order management system enabling conversion of shopping carts into orders. This is the critical first step for completing the checkout flow.

---

## Implementation Summary

### 1. OrderRequest DTO
**File:** `backend/src/main/java/com/healthcare/labtestbooking/dto/OrderRequest.java`

```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderRequest {
    @NotNull Long cartId;
    @NotBlank String preferredLocation;
    @NotNull @FutureOrPresent LocalDate preferredDate;
    @NotBlank String preferredTimeSlot;  // e.g., "09:00-10:00"
    String specialInstructions;
    @Email String contactEmail;
    @Pattern(regexp = "^[0-9]{10}$") String contactPhone;
}
```

**Validation Rules:**
- Cart ID required and must exist
- Preferred date must be today or future
- Time slot required (24-hour format range)
- Phone must be exactly 10 digits
- Email must be valid format

### 2. OrderResponse DTO
**File:** `backend/src/main/java/com/healthcare/labtestbooking/dto/OrderResponse.java`

Complete order details including:
- Order metadata (ID, reference, user, status)
- Pricing breakdown (subtotal, discount, tax, total)
- Order items with individual pricing
- Timeline (createdAt, updatedAt, lastStatusChangedAt)
- Nested OrderItemResponse with cart item details

### 3. OrderRepository Enhancement
**File:** `backend/src/main/java/com/healthcare/labtestbooking/repository/OrderRepository.java`

Added pagination support:
```java
Page<Order> findByUserId(Long userId, Pageable pageable);
```

### 4. OrderService Implementation
**File:** `backend/src/main/java/com/healthcare/labtestbooking/service/OrderService.java`

#### Key Methods:

**createOrderFromCart(Long userId, OrderRequest request)**
- Validates user exists and owns the cart
- Ensures cart is not empty
- Generates unique order reference: `ORD-XXXXXXXX`
- Creates Order entity with:
  - Status: PENDING
  - Slot info: "{timeSlot} on {date}"
  - Payment info: "{email} | {phone}"
  - Technician info: special instructions
- Records initial status history entry
- Auto-checkouts the cart
- Returns complete OrderResponse

**Response Data Flow:**
```
Cart Items → Order with user/status → OrderResponse
                ↓
           Status History Entry
                ↓
           Cart marked CHECKED_OUT
```

**getUserOrders(Long userId, Pageable pageable)**
- Retrieves user's orders with pagination
- Supports sorting and filtering
- Validates user exists

**getUserOrdersAsResponse(Long userId, Pageable pageable)**
- Returns Page<OrderResponse> for REST APIs
- Includes all order details and pricing

**updateStatus(Long orderId, OrderStatus newStatus, String notes, String updatedBy)**
- Updates order status with validation
- Records status change in history
- Returns updated OrderResponse

**deleteOrder(Long id)**
- Only allows deletion of PENDING orders
- Prevents deletion of paid/processed orders

### 5. OrderStatusHistoryService Enhancement
**File:** `backend/src/main/java/com/healthcare/labtestbooking/service/OrderStatusHistoryService.java`

Added method:
```java
@Transactional
public OrderStatusHistory recordStatusChange(
    Long orderId,
    OrderStatus newStatus,
    String notes,
    String changedBy
)
```

Creates audit trail for order status transitions.

### 6. OrderController Implementation
**File:** `backend/src/main/java/com/healthcare/labtestbooking/controller/OrderController.java`

---

## API Endpoints

### 1. Create Order from Cart
```http
POST /api/orders/create
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "cartId": 1,
  "preferredDate": "2026-03-25",
  "preferredTimeSlot": "09:00-10:00",
  "preferredLocation": "Lab Downtown",
  "contactEmail": "patient@example.com",
  "contactPhone": "9876543210",
  "specialInstructions": "Fasting required"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 101,
    "orderReference": "ORD-A3F7B2C1",
    "userId": 5,
    "userName": "John Doe",
    "status": "PENDING",
    "items": [
      {
        "cartItemId": 50,
        "itemName": "Complete Blood Count",
        "itemCode": "CBC",
        "itemType": "LAB_TEST",
        "quantity": 1,
        "unitPrice": 299.00,
        "discountPercentage": 0.00,
        "lineTotal": 299.00
      }
    ],
    "subtotal": 299.00,
    "discountAmount": 0.00,
    "taxAmount": 53.82,
    "totalAmount": 352.82,
    "preferredDate": "2026-03-25",
    "preferredTimeSlot": "09:00-10:00",
    "specialInstructions": "Fasting required",
    "contactEmail": "patient@example.com",
    "contactPhone": "9876543210",
    "createdAt": "2026-03-23T10:30:00",
    "updatedAt": "2026-03-23T10:30:00",
    "lastStatusChangedAt": "2026-03-23T10:30:00"
  }
}
```

**Error Cases:**
- `400 Bad Request` - Validation failure (invalid date, empty cart, etc.)
- `404 Not Found` - Cart or user not found
- `403 Forbidden` - Cart doesn't belong to user

---

### 2. Get User's Orders
```http
GET /api/orders/my?page=0&size=10&sortBy=createdAt&direction=DESC
Authorization: Bearer {JWT_TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": {
    "content": [
      {
        "id": 101,
        "orderReference": "ORD-A3F7B2C1",
        "status": "PENDING",
        "totalAmount": 352.82,
        "createdAt": "2026-03-23T10:30:00"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 1,
      "totalPages": 1
    }
  }
}
```

**Query Parameters:**
- `page` (default: 0) - Page number (0-based)
- `size` (default: 10) - Items per page
- `sortBy` (default: createdAt) - Sort field
- `direction` (default: DESC) - Sort direction (ASC/DESC)

---

### 3. Get Order by ID
```http
GET /api/orders/{id}
Authorization: Bearer {JWT_TOKEN}
```

**Response (200 OK):** Full OrderResponse object

**Error Cases:**
- `404 Not Found` - Order doesn't exist

---

### 4. Update Order Status (Admin Only)
```http
PUT /api/orders/{id}/status?status=CONFIRMED&notes=Payment+confirmed
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Status Transitions:**
```
PENDING → CONFIRMED (payment received)
CONFIRMED → SAMPLE_COLLECTED (sample collected)
SAMPLE_COLLECTED → PROCESSING (lab processing)
PROCESSING → COMPLETED (results ready)
```

**Response (200 OK):** Updated OrderResponse

**Error Cases:**
- `403 Forbidden` - Admin role required
- `404 Not Found` - Order doesn't exist

---

### 5. Delete Order
```http
DELETE /api/orders/{id}
Authorization: Bearer {JWT_TOKEN}
```

**Constraints:**
- Only PENDING orders can be deleted
- User must own the order (or be admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**Error Cases:**
- `400 Bad Request` - Order not in PENDING status
- `404 Not Found` - Order doesn't exist

---

### 6. Get Order Status History
```http
GET /api/orders/{orderId}/status-history
Authorization: Bearer {JWT_TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "History fetched successfully",
  "data": [
    {
      "id": 201,
      "status": "PENDING",
      "note": "Order created from cart",
      "changedBy": "patient@example.com",
      "changedAt": "2026-03-23T10:30:00"
    },
    {
      "id": 202,
      "status": "CONFIRMED",
      "note": "Payment confirmed",
      "changedBy": "admin@example.com",
      "changedAt": "2026-03-23T11:00:00"
    }
  ]
}
```

---

## Authentication & Authorization

### Endpoint Security Matrix

| Endpoint | Method | Auth | Roles |
|----------|--------|------|-------|
| /orders/create | POST | Required | PATIENT, ADMIN |
| /orders/my | GET | Required | PATIENT, ADMIN |
| /orders | GET | Required | ADMIN |
| /orders/{id} | GET | Required | PATIENT, ADMIN |
| /orders/{id}/status | PUT | Required | ADMIN |
| /orders/{id} | DELETE | Required | PATIENT, ADMIN |
| /orders/{id}/status-history | GET | Required | PATIENT, ADMIN |

### User Extraction
- Extracts user from JWT token via `Authentication.getPrincipal()`
- Looks up user in database by email
- Enforces user isolation on GET /orders/my
- Admin endpoints bypass user isolation

---

## Database Changes

### Order Entity Fields Used
- `orderReference` - Generated unique identifier
- `user_id` - Foreign key to User
- `status` - Enum field (OrderStatus)
- `slotInfo` - "{timeSlot} on {date}"
- `paymentInfo` - "{email} | {phone}"
- `technicianInfo` - Special instructions
- `lastStatusChangedAt` - Last status transition time
- `createdAt` - Order creation timestamp
- `updatedAt` - Last update timestamp

### OrderStatusHistory Table
- `id` - Primary key
- `order_id` - Foreign key to Order
- `status` - Current status at this entry
- `note` - Change description (nullable)
- `changed_by` - User email who made change
- `changed_at` - Timestamp of change

---

## Testing Guide

### cURL Examples

**1. Create Order**
```bash
curl -X POST http://localhost:8080/api/orders/create \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": 1,
    "preferredDate": "2026-03-25",
    "preferredTimeSlot": "09:00-10:00",
    "preferredLocation": "Lab Downtown",
    "contactEmail": "patient@example.com",
    "contactPhone": "9876543210",
    "specialInstructions": "Fasting required"
  }'
```

**2. Get User Orders**
```bash
curl -X GET "http://localhost:8080/api/orders/my?page=0&size=10" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**3. Get Order Details**
```bash
curl -X GET http://localhost:8080/api/orders/101 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**4. Update Order Status**
```bash
curl -X PUT "http://localhost:8080/api/orders/101/status?status=CONFIRMED&notes=Payment+received" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

**5. Get Status History**
```bash
curl -X GET http://localhost:8080/api/orders/101/status-history \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ POST /api/orders/create (OrderRequest)              │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ OrderService.createOrderFromCart()                  │
│  1. Verify user exists                              │
│  2. Fetch cart by ID                                │
│  3. Validate cart ownership & non-empty             │
│  4. Generate unique orderReference                  │
│  5. Create Order entity                             │
│  6. Save Order                                      │
│  7. Record PENDING status in history                │
│  8. Checkout cart                                   │
│  9. Build & return OrderResponse                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │ Order(PENDING)   │ ← Database saved
         │ + OrderStatusHis │
         │ + Cart marked    │
         │   CHECKED_OUT    │
         └────────┬─────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │ OrderResponse (201 Created) │
    └─────────────────────────────┘
```

---

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "cartId": "Cart ID is required",
    "preferredDate": "Date must be today or future",
    "contactPhone": "Phone must be 10 digits"
  }
}
```

### Resource Not Found (404)
```json
{
  "success": false,
  "message": "Cart not found"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Cart does not belong to this user"
}
```

### Bad Request (400)
```json
{
  "success": false,
  "message": "Cannot delete order with status: CONFIRMED"
}
```

---

## Integration Points

### Dependencies
- **CartService**: For `checkoutCart()` operation
- **CartRepository**: For cart validation
- **UserRepository**: For user lookup
- **OrderStatusHistoryService**: For audit trail
- **OrderRepository**: For CRUD operations

### Required for Phase 5.2
- Razorpay payment integration
- Order → Payment linking
- Status update triggers (payment → CONFIRMED)
- Invoice generation

---

## Files Modified

```
backend/src/main/java/com/healthcare/labtestbooking/
├── dto/
│   ├── OrderRequest.java (→ 34 lines with validation)
│   └── OrderResponse.java (→ 73 lines with nested ItemResponse)
├── service/
│   ├── OrderService.java (→ 207 lines with conversion logic)
│   └── OrderStatusHistoryService.java (→ 55 lines with recordStatusChange)
├── controller/
│   └── OrderController.java (→ 126 lines with 7 endpoints)
└── repository/
    └── OrderRepository.java (→ 12 lines with pagination)
```

**Total Lines Added:** 364
**Build Status:** ✅ Clean (0 errors)

---

## Next Phase: Phase 5.2

**Payment Integration & Razorpay Integration**
- Link orders to payment orders
- Implement Razorpay checkout endpoint
- Handle payment callbacks
- Update order status on payment success
- Implement refund logic
- Test payment flow end-to-end

---

## Deployment Checklist

- [ ] Backend compilation successful (✅ Verified)
- [ ] All endpoints tested with valid tokens
- [ ] Error handling verified
- [ ] Pagination working correctly
- [ ] User isolation enforced
- [ ] Admin operations working
- [ ] Status history populated correctly
- [ ] Cart auto-checkout working
- [ ] Database migrations applied
- [ ] Razorpay keys available for Phase 5.2

---

**Status:** Ready for Phase 5.2 implementation
**Test Coverage:** Manual testing guide above
**Documentation:** Complete with API examples

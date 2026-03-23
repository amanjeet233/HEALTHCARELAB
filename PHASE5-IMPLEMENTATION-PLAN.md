# PHASE 5: Backend Enhancement - Critical Endpoints

**Status:** Planning → Implementation Ready
**Priority:** HIGH - These endpoints block checkout and admin functions
**Estimated Scope:** 18 new/enhanced endpoints across 5 phases

---

## Executive Summary

Phase 5 focuses on implementing **7 critical missing endpoint categories** that currently block the application:

| Category | Current Status | Impact | Priority |
|----------|---|---|---|
| Order Creation | ❌ Missing | Checkout blocked | 🔴 CRITICAL |
| Order Updates | ❌ Missing | Status tracking broken | 🔴 CRITICAL |
| Payment Refunds | ❌ Missing | Cancellations fail | 🔴 CRITICAL |
| Lab Partner CRUD | ❌ Incomplete | Admin can't manage labs | 🟠 HIGH |
| Lab Test Admin | ⚠️ Partial | Limited test creation | 🟠 HIGH |
| Report Delivery | ❌ Missing | Patients can't get reports | 🟡 MEDIUM |
| Booking Cancellation | ⚠️ Partial | No refund flow | 🟡 MEDIUM |

---

## Phase 5 Breakdown

### ⚡ Phase 5.1: ORDER MANAGEMENT (WEEK 1 - DAY 1-2)
**Fixes:** Checkout pipeline

**New Endpoints:**
```
POST   /api/orders/create              → Create order from cart
PUT    /api/orders/{id}/status         → Update order status (PENDING→CONFIRMED→PROCESSING)
PUT    /api/orders/{id}/update         → Update order items/details
DELETE /api/orders/{id}/cancel         → Cancel order (no refund yet)
```

**Files to Create/Modify:**
- `OrderController.java` - Add 4 new endpoints
- `OrderService.java` - Enhance with new business logic
- `CartService.java` - Add `convertCartToOrderItems()` method
- `PaymentService.java` - Add integration hook for order payment

**DTO Changes:**
- Add: `CreateOrderRequest`, `UpdateOrderRequest`, `OrderStatusUpdateRequest`
- Modify: `OrderResponse` to include pricing breakdown

**Key Logic:**
```
createOrder():
  1. Validate cart items exist
  2. Calculate order total (items + tax - coupon)
  3. Create Order entity with PENDING status
  4. Create OrderItems from cart
  5. Verify chosen lab services available tests
  6. Store preferred collection date/time
  7. Set lab location
  8. Return OrderResponse with total for payment

updateStatus():
  1. Validate order exists and status transition valid
  2. Update status (PENDING → CONFIRMED → PROCESSING → COMPLETED)
  3. Log status change
  4. Trigger notifications (email/SMS)
  5. Close transaction with timestamp
```

**Security:** `@PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")`

**Testing:**
```
✓ Create order from cart with multiple items
✓ Calculate pricing with tax (18%) and coupon discount
✓ Reject invalid status transitions (COMPLETED → PENDING)
✓ Soft delete order (keep audit trail)
✓ Can only see own orders (unless ADMIN role)
```

---

### 💳 Phase 5.2: PAYMENT REFUNDS (WEEK 1 - DAY 3-4)
**Fixes:** Payment reversals and refund tracking

**New Endpoints:**
```
POST   /api/payments/{id}/refund          → Process payment refund
GET    /api/refunds/{refundId}            → Check refund status
GET    /api/payments/{id}/refund-status   → Check if refundable
POST   /api/refunds/{id}/callback         → Webhook for refund confirmation
```

**Files to Create/Modify:**
- `PaymentController.java` - Add refund endpoints
- `PaymentService.java` - `processRefund()`, `trackRefund()`
- New: `RefundService.java` - Manage refund lifecycle
- New: `RefundResponse.java` DTO

**Refund Status Flow:**
```
INITIATED → PROCESSING → COMPLETED (success) or FAILED
           ↑                        (and log error)
         Check with gateway
```

**Key Logic:**
```
processRefund(paymentId, reason):
  1. Get Payment entity
  2. Verify is_refundable flag (check if within 24h or reason is "cancellation")
  3. Call payment gateway API for reversal
  4. Create Refund entity with INITIATED status
  5. Store gateway refund reference ID
  6. Return RefundResponse with status

trackRefund(refundId):
  1. Get Refund entity
  2. If status is PROCESSING, poll gateway webhook status
  3. Update status when confirmed
  4. Update associated Order/Booking with refund info
  5. Trigger notification email/SMS to patient
```

**DTO:**
```java
@Data
class RefundRequest {
  private String reason;        // "cancellation", "duplicate", "patient_request"
  private BigDecimal amount;    // Optional (full if null)
  private String notes;
}

@Data
class RefundResponse {
  private Long refundId;
  private String status;        // INITIATED, PROCESSING, COMPLETED, FAILED
  private BigDecimal amount;
  private String gatewayRefundId;
  private LocalDateTime createdAt;
}
```

**Security:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')") OR own payment`

**Validation:**
```
✓ Cannot refund already refunded payment
✓ Cannot refund beyond 24h without admin override
✓ Cannot refund more than original payment
✓ Require reason for refund
✓ Gateway API integration works
```

---

### 🏥 Phase 5.3: LAB PARTNER CRUD (WEEK 2 - DAY 1-2)
**Fixes:** Admin lab management

**New Endpoints:**
```
POST   /api/labs/register            → Register new lab (admin only)
PUT    /api/labs/{id}                → Update lab details
DELETE /api/labs/{id}                → Deactivate lab (soft delete)
PUT    /api/labs/{id}/activate       → Reactivate deactivated lab
PUT    /api/labs/{id}/services       → Update services offered
```

**Files to Create/Modify:**
- `LabPartnerController.java` - Add POST, PUT, DELETE endpoints
- `LabPartnerService.java` - Add business logic
- `LabLocationService.java` - Handle location updates
- Modify: `LabPartnerRequest` to include all registration fields

**Request/Response:**
```java
@Data
class LabPartnerRequest {
  @NotBlank
  private String name;

  @Email
  private String email;

  @NotBlank
  private String phone;

  @NotEmpty
  private List<LabLocationRequest> locations;

  private List<String> certifications;
  private String accreditation;
  private Integer yearsInOperation;
  private String website;
}

@Data
class LabLocationRequest {
  private String address;
  private String city;
  private String state;
  private String zipCode;
  private Double latitude;
  private Double longitude;
  private String phoneLoc;
  private LocalTime openingTime;
  private LocalTime closingTime;
}
```

**Key Logic:**
```
registerLab(request):
  1. Validate all required fields
  2. Check no duplicate email/phone
  3. Geocode addresses for lat/long
  4. Create LabPartner entity with ACTIVE status
  5. Create associated LabLocation records
  6. Send activation email with credentials
  7. Return LabPartnerResponse with ID

updateLab(id, request):
  1. Get existing lab
  2. Update fields (name, contact, certifications)
  3. If locations changed, update LabLocation records
  4. Refresh geocoding if address changed
  5. Log audit trail
  6. Return updated response

deactivateLab(id):
  1. Soft delete (set is_active = false)
  2. Keep all data intact
  3. Prevent from appearing in public listings
  4. Preserve audit trail

reactivateLab(id):
  1. Set is_active = true
  2. Log reactivation
  3. Notify lab with confirmation
```

**Security:** `@PreAuthorize("hasRole('ADMIN')")`

**Validation:**
```
✓ Email/phone must be unique
✓ At least one location required
✓ Hours must be valid (closing > opening)
✓ Admin can only register labs (not self-serve initially)
✓ Deactivated labs don't show in searches
```

---

### 📋 Phase 5.4: LAB TEST ADMIN ENDPOINT (WEEK 2 - DAY 3)
**Fixes:** Secondary test creation endpoint

**New Endpoints:**
```
POST   /api/lab-tests/admin/create          → Create lab test (admin)
PUT    /api/lab-tests/{id}/admin/update     → Update test (admin)
GET    /api/lab-tests/admin/all             → List all tests with edit icons
PUT    /api/lab-tests/{id}/admin/pricing    → Update pricing
```

**Note:** These are alternatives to DoctorTestController endpoints, simpler for general admins.

**Key Differences from DoctorTestController:**
- No analytics generation
- Simpler request structure
- No bulk operations
- Focuses on CRUD

**Files to Modify:**
- `LabTestController.java` - Add these endpoints (separate from read-only catalog)
- `LabTestService.java` - Enhance create/update methods

**Security:** `@PreAuthorize("hasRole('ADMIN')")`

---

### 📧 Phase 5.5: REPORT DELIVERY (WEEK 2 - DAY 4+)
**Fixes:** Multi-channel report delivery

**New Endpoints:**
```
POST   /api/reports/{id}/send-email    → Send report to patient email
POST   /api/reports/{id}/send-sms      → Send report link via SMS
POST   /api/reports/{id}/download      → Download as PDF/Excel
POST   /api/reports/{id}/print         → Request print service (admin)
GET    /api/reports/{id}/verify-qr     → Verify report authenticity
```

**Files to Create/Modify:**
- `ReportController.java` - Add delivery endpoints
- `ReportService.java` - Add delivery methods
- New: `EmailService.java` - Template-based email
- New: `SMSService.java` - SMS gateway integration
- New: `ReportDeliveryDTO.java` - Track delivery status

**Key Logic:**
```
sendReportEmail(reportId):
  1. Get Report entity
  2. Generate PDF
  3. Get patient email
  4. Create email with:
     - Report summary
     - PDF attachment
     - QR code for mobile verification
     - Doctor notes (if any)
  5. Send via email service
  6. Log delivery in audit trail
  7. Record delivery timestamp

sendReportSMS(reportId):
  1. Get patient phone
  2. Generate unique access link (with token)
  3. Create short URL
  4. Send SMS: "Report ready: [short_url]"
  5. Track SMS delivery status

downloadReport(reportId, format):
  1. Get Report
  2. If format=PDF: generatePDF()
  3. If format=EXCEL: generateExcel()
  4. Add digital signature/QR for verification
  5. Log download in audit trail
  6. Return file
```

**Security:** `@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")`
- Patients only see own reports
- Doctors see for their consultation patients
- Admins see all

---

### 🔄 Phase 5.5: BOOKING CANCELLATION WITH REFUND (WEEK 3)
**Fixes:** Complete cancellation flow

**Enhanced Endpoint:**
```
POST   /api/bookings/{id}/cancel-with-refund   → Cancel and initiate refund
```

**Files to Modify:**
- `BookingController.java` - Add or enhance cancellation endpoint
- `BookingService.java` - Add refund integration
- `OrderService.java` - Update order status on booking cancellation

**Workflow:**
```
cancelBookingWithRefund(bookingId, cancellationReason):
  1. Get Booking entity
  2. Check cancellation eligibility:
     - Not already completed/collected samples
     - Within cancellation window
  3. Get associated Payment
  4. Update Booking status to CANCELLED
  5. Call PaymentService.processRefund()
  6. Update associated Order status to CANCELLED
  7. Send notification email/SMS with refund status
  8. Return cancellation confirmation

Refund Policy:
  - Within 24h of booking: Full refund
  - 24h-48h: 75% refund
  - 48h+: No refund (non-refundable)
  - Medical emergency: Exception - full refund (manual admin approval)
```

---

## Implementation Roadmap

### Week 1 (Days 1-4)
- ✅ Phase 5.1: Order Management (all CRUD)
- ✅ Phase 5.2: Payment Refunds (all refund operations)
- ✅ Manual testing with curl/Postman

### Week 2 (Days 1-4)
- ✅ Phase 5.3: Lab Partner CRUD (registration & updates)
- ✅ Phase 5.4: Lab Test Admin endpoint (alternative creation)
- ✅ Phase 5.5: Report Delivery (email/SMS/download)

### Week 3 (Days 1-2)
- ✅ Booking Cancellation integration
- ✅ Full end-to-end testing
- ✅ Performance optimization if needed

---

## File Changes Summary

### New Files to Create
```
src/main/java/com/healthcare/labtestbooking/
  ├── service/
  │   ├── OrderServiceEnhanced.java      (new methods)
  │   ├── RefundService.java              (NEW)
  │   ├── EmailService.java               (NEW - if not exists)
  │   └── SMSService.java                 (NEW - if not exists)
  └── dto/
      ├── CreateOrderRequest.java         (NEW/Enhanced)
      ├── RefundRequest.java              (NEW)
      ├── RefundResponse.java             (NEW)
      ├── LabPartnerRequest.java          (Enhanced)
      └── LabLocationRequest.java         (Enhanced)
```

### Files to Modify
```
Controllers:
  - OrderController.java         (+4 endpoints)
  - PaymentController.java       (+4 endpoints)
  - LabPartnerController.java    (+5 endpoints)
  - LabTestController.java       (+3 endpoints)
  - ReportController.java        (+5 endpoints)
  - BookingController.java       (+1 endpoint)

Services:
  - OrderService.java            (3 new methods)
  - PaymentService.java          (2 new methods)
  - LabPartnerService.java       (4 new methods)
  - ReportService.java           (5 new methods)
  - BookingService.java          (1 new method)

Total new endpoint methods: 22
Total service enhancements: 15
```

---

## Success Criteria

### Phase 5.1 Complete When:
- [ ] Can create order from cart
- [ ] Order total calculates with tax/coupon
- [ ] Status transitions work (PENDING→CONFIRMED→PROCESSING)
- [ ] Test with multiple carts items
- [ ] Authorization verified (only own orders, admin can see all)

### Phase 5.2 Complete When:
- [ ] Can initiate refund
- [ ] Refund status tracking works
- [ ] Can check refund eligibility
- [ ] Gateway webhook integration works
- [ ] Payment shows as refunded

### Phase 5.3 Complete When:
- [ ] Can register new lab partner
- [ ] Can update lab details
- [ ] Can deactivate/reactivate
- [ ] Lab appears/disappears in listings
- [ ] Only admins can access (role verification)

### Phase 5.4 Complete When:
- [ ] Can create test via admin endpoint
- [ ] Admin endpoint updates existing test
- [ ] Price updates work
- [ ] Alternative to DoctorTestController verified

### Phase 5.5 Complete When
- [ ] Report sends via email with PDF
- [ ] Report sends via SMS with link
- [ ] Downloads generate correct files
- [ ] QR verification works
- [ ] Audit trail logs all deliveries

---

## Testing Approach

### Unit Tests
- Test each service method independently
- Mock repositories and external APIs

### Integration Tests
- Test endpoint → service → repository chain
- Verify data changes in database

### End-to-End Tests
- Complete checkout flow: Add items → Create order → Payment → Refund
- Lab admin flow: Register lab → Update → Services → Bookings
- Report flow: Upload → Generate → Send → Verify

### Manual Testing
- Use Postman or curl
- Verify CORS headers correct
- Check authentication required where needed
- Test error scenarios

---

## Estimated Effort

| Phase | Estimated Hours | Complexity |
|-------|---|---|
| 5.1: Order | 6-8 hours | Medium |
| 5.2: Refunds | 8-10 hours | High |
| 5.3: Lab Partner | 6-8 hours | Medium |
| 5.4: Test Admin | 2-3 hours | Low |
| 5.5: Report Delivery | 4-6 hours | Medium |

**Total: 26-35 hours (~3-4 full development days)**

---

## Ready to Start?

Would you like to begin with:
1. **Phase 5.1** (Order Management) - Highest priority, unblocks checkout
2. **Phase 5.2** (Payment Refunds) - Critical for production safety
3. **All phases in order** - Comprehensive implementation

Choose your preferred approach and I'll create the specific code!

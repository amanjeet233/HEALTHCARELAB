# Phase 5.2 - Payment Integration & Razorpay Implementation Plan

**Status:** PLANNING
**Target:** Complete payment integration for Order checkout flow
**Estimated Duration:** 2-3 hours
**Blocking Issue:** None (can start immediately)

---

## Overview

Phase 5.2 implements complete payment processing integration using Razorpay, linking orders created in Phase 5.1 to payment transactions. This enables the complete order checkout flow from selecting items → cart → order creation → payment → order confirmation.

---

## Scope

### What's Already Done (Phase 5.1)
- ✅ Order creation from cart
- ✅ Order status tracking
- ✅ Order history management
- ✅ Cart auto-checkout after order

### What Phase 5.2 Will Add
1. **Razorpay Integration**
   - Add Razorpay SDK dependency
   - Configure Razorpay keys (test mode)
   - Create RazorpayService wrapper

2. **Order-Payment Linking**
   - Link Order → Payment relationship
   - Create PaymentOrderRequest DTO
   - Implement order payment creation

3. **Payment Order Endpoints**
   - POST /api/orders/{orderId}/payment - Initiate payment
   - GET /api/orders/{orderId}/payment-status - Check status
   - POST /api/payments/webhook - Razorpay callback

4. **Status Management**
   - Update order status on payment success
   - Record payment status in OrderStatusHistory
   - Handle payment failure gracefully

5. **Payment Responses**
   - Return Razorpay payment link to frontend
   - Track transaction IDs
   - Store payment metadata

---

## Technical Implementation

### 1. Maven Dependency Addition
```xml
<dependency>
    <groupId>com.razorpay</groupId>
    <artifactId>razorpay-java</artifactId>
    <version>1.4.5</version>
</dependency>
```

**File:** `backend/pom.xml`

### 2. Configuration Addition
```properties
# Razorpay Configuration
razorpay.key-id=${RAZORPAY_KEY_ID}
razorpay.key-secret=${RAZORPAY_KEY_SECRET}
razorpay.webhook-secret=${RAZORPAY_WEBHOOK_SECRET}

# Payment Configuration
app.payment.success-url=http://localhost:5173/payment/success
app.payment.failure-url=http://localhost:5173/payment/failure
app.payment.webhook-secret=your-webhook-secret-here
```

**File:** `backend/src/main/resources/application.properties`

### 3. New Services

#### 3a. RazorpayService
**File:** `backend/src/main/java/com/healthcare/labtestbooking/service/RazorpayService.java`

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayService {

    private final RazorpayClient client;  // Razorpay SDK client

    /**
     * Create payment order for Razorpay
     * @param amount Amount in paise (100 paise = 1 rupee)
     * @param orderId Order ID from our system
     * @param email Customer email
     * @param phone Customer phone
     * @return Razorpay Order ID
     */
    public RazorpayOrderResponse createOrder(
        BigDecimal amount,
        Long orderId,
        String email,
        String phone
    )

    /**
     * Verify payment signature from webhook
     */
    public boolean verifyPaymentSignature(
        String razorpayOrderId,
        String razorpayPaymentId,
        String signature
    )

    /**
     * Get payment status from Razorpay
     */
    public RazorpayPaymentStatus getPaymentStatus(String razorpayPaymentId)

    /**
     * Process refund through Razorpay
     */
    public RefundResponse refundPayment(String razorpayPaymentId, BigDecimal amount)
}
```

#### 3b. OrderPaymentService (NEW)
**File:** `backend/src/main/java/com/healthcare/labtestbooking/service/OrderPaymentService.java`

Handles linking orders to payments:

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderPaymentService {

    private final OrderRepository orderRepository;
    private final GatewayPaymentRepository gatewayPaymentRepository;
    private final RazorpayService razorpayService;
    private final OrderStatusHistoryService historyService;

    /**
     * Initiate payment for an order
     */
    @Transactional
    public PaymentInitiationResponse initiatePaymentForOrder(
        Long orderId,
        Long userId,
        String email,
        String phone
    )

    /**
     * Handle payment success webhook
     */
    @Transactional
    public void handlePaymentSuccess(
        String razorpayOrderId,
        String razorpayPaymentId,
        String signature
    )

    /**
     * Get order payment status
     */
    public OrderPaymentStatus getOrderPaymentStatus(Long orderId)
}
```

### 4. New DTOs

#### 4a. PaymentInitiationRequest
```java
@Data
public class PaymentInitiationRequest {
    @NotNull Long orderId;
    @Email String email;
    @Pattern(regexp = "^[0-9]{10}$") String phone;
}
```

#### 4b. PaymentInitiationResponse
```java
@Data
public class PaymentInitiationResponse {
    private String paymentId;
    private String razorpayOrderId;
    private String paymentLink;
    private BigDecimal amount;
    private String currency;
    private String orderReference;
}
```

#### 4c. PaymentSuccessRequest (Webhook)
```java
@Data
public class PaymentSuccessRequest {
    private String razorpay_order_id;      // from webhook
    private String razorpay_payment_id;    // from webhook
    private String razorpay_signature;     // from webhook
}
```

### 5. Entity Modifications

#### 5a. Order Entity - Add Payment Reference
```java
@Entity
public class Order {
    // ... existing fields

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<GatewayPayment> payments;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;
}
```

#### 5b. GatewayPayment Entity - Link to Order
Already exists and has order reference. Good to reuse.

### 6. Updated Endpoints

#### 6a. POST /api/orders/{orderId}/initiate-payment
```
Request:
{
    "email": "patient@example.com",
    "phone": "9876543210"
}

Response:
{
    "paymentId": "pay_123456",
    "razorpayOrderId": "order_123456",
    "paymentLink": "https://rzp.io/i/ABC123",
    "amount": 352.82,
    "currency": "INR",
    "orderReference": "ORD-A3F7B2C1"
}
```

Endpoint: `/api/orders/{orderId}/initiate-payment`
Method: POST
Auth: Required (Patient/Admin)
Purpose: Start payment for order

#### 6b. GET /api/orders/{orderId}/payment-status
```
Response:
{
    "orderId": 101,
    "paymentStatus": "SUCCESS",
    "razorpayOrderId": "order_123456",
    "razorpayPaymentId": "pay_123456",
    "amount": 352.82,
    "transactionDate": "2026-03-23T11:30:00"
}
```

Endpoint: `/api/orders/{orderId}/payment-status`
Method: GET
Auth: Required
Purpose: Check payment status

#### 6c. POST /api/payments/razorpay/webhook
```
Request (from Razorpay):
{
    "razorpay_order_id": "order_123456",
    "razorpay_payment_id": "pay_123456",
    "razorpay_signature": "signature_hash"
}

Response:
{
    "success": true,
    "message": "Payment processed successfully"
}
```

Endpoint: `/api/payments/razorpay/webhook`
Method: POST
Auth: No auth (Razorpay doesn't send auth headers)
Purpose: Handle payment callback

### 7. Flow Diagram

```
User Checkout Flow:
┌─────────────────────────────────────┐
│ 1. User selects tests in cart       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 2. POST /api/orders/create          │
│    (Convert cart to Order)          │
│    ↓ Response: Order (PENDING)      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 3. POST /api/orders/{id}/           │
│    initiate-payment                 │
│    (Get Razorpay link)              │
│    ↓ Response: paymentLink          │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 4. Frontend redirects to Razorpay   │
│    (User enters payment details)    │
│    (User completes payment)         │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 5. Razorpay sends webhook callback  │
│    POST /api/payments/razorpay/     │
│    webhook                          │
│    (Signature verification)         │
│    (Update order status → CONFIRMED)│
│    (Record in OrderStatusHistory)   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 6. Frontend polls or gets notified  │
│    GET /api/orders/{id}/            │
│    payment-status                   │
│    (Check order status)             │
│    ↓ Response: status = CONFIRMED   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ 7. Redirect to confirmation page    │
│    Order → Lab Sample Collection    │
└─────────────────────────────────────┘
```

### 8. Status Transitions

```
Order Status Flow with Payment:
PENDING
  ├─ Payment initiated
  ↓
CONFIRMED (after payment success)
  ├─ Sample collection scheduled
  ↓
SAMPLE_COLLECTED
  ├─ Lab processing started
  ↓
PROCESSING
  ├─ Tests completed
  ↓
COMPLETED (with report)


Payment Status Flow:
PENDING → AUTHORIZED → CAPTURED → SUCCESS
                              ↖
                         (or FAILED)
```

### 9. Database Schema Changes

```sql
-- Add to Order table:
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(40) DEFAULT 'PENDING';
ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(100);

-- Add to GatewayPayment (already exists):
-- order_id (FK to orders)
-- razorpay_payment_id
-- transaction_id
-- status
```

---

## Implementation Checklist

- [ ] Phase 1: Add Razorpay dependency to pom.xml
- [ ] Phase 2: Configure Razorpay keys in application.properties
- [ ] Phase 3: Create RazorpayService with SDK integration
- [ ] Phase 4: Create OrderPaymentService
- [ ] Phase 5: Create payment DTOs (Request & Response)
- [ ] Phase 6: Add payment endpoints to OrderController OR create new PaymentOrderController
- [ ] Phase 7: Implement webhook handler for Razorpay callbacks
- [ ] Phase 8: Update Order entity with payment fields
- [ ] Phase 9: Update OrderStatusHistoryService to track payment status
- [ ] Phase 10: Test endpoints with cURL
- [ ] Phase 11: Commit all changes
- [ ] Phase 12: Create PHASE5.2-PAYMENT-INTEGRATION.md documentation

---

## Testing Strategy

### Test Scenario 1: Successful Payment
```bash
# 1. Create order (from Phase 5.1)
curl -X POST http://localhost:8080/api/orders/create \
  -H "Authorization: Bearer {JWT}" \
  -d '{"cartId": 1, ...}'
# Response: {"id": 101, "orderReference": "ORD-ABC123", "status": "PENDING"}

# 2. Initiate payment
curl -X POST http://localhost:8080/api/orders/101/initiate-payment \
  -H "Authorization: Bearer {JWT}" \
  -d '{"email": "patient@example.com", "phone": "9876543210"}'
# Response: {"paymentLink": "https://rzp.io/...", "razorpayOrderId": "order_xyz"}

# 3. Open payment link in browser
# 4. Complete payment in Razorpay test mode
# 5. Check webhook received and order status updated

# 6. Verify payment status
curl -X GET http://localhost:8080/api/orders/101/payment-status \
  -H "Authorization: Bearer {JWT}"
# Response: {"paymentStatus": "SUCCESS", "ordering": "CONFIRMED"}
```

### Test Scenario 2: Payment Failure
```bash
# Same as above but use test card that fails
# Verify order status remains PENDING
# Verify webhook triggers with failure status
```

### Test Scenario 3: Webhook Signature Validation
```bash
# Try calling webhook with invalid signature
# Should return 400 Bad Request
```

---

## Environment Variables Required

```bash
export RAZORPAY_KEY_ID="rzp_test_xxxxx"           # Razorpay test account ID
export RAZORPAY_KEY_SECRET="xxxxx"                # Razorpay test secret
export RAZORPAY_WEBHOOK_SECRET="webhook_secret"   # Webhook signing secret
```

**Get these from:** https://dashboard.razorpay.com/app/keys

---

## Razorpay Test Credentials

For testing without connecting to production:

**Test Cards:**
- Visa: `4111 1111 1111 1111` (any future expiry, any CVV)
- Mastercard: `5555 5555 5555 4444`

**Payment Methods:**
- OTP: `123456` for all test attempts
- Amount: Any amount works in test mode

---

## Deployment Notes

### Before Production:
1. Get Razorpay production credentials
2. Update environment variables
3. Enable HTTPS (Razorpay requires HTTPS for webhooks)
4. Configure CORS for Razorpay domain
5. Set up redirectURL to production frontend
6. Test refund flow
7. Set up monitoring for payment errors

---

## Security Considerations

1. **Signature Verification:** HMAC-SHA256 validation on every webhook
2. **Amount Verification:** Verify payment amount matches order total
3. **Idempotency:** Handle duplicate webhooks gracefully
4. **Rate Limiting:** Apply to payment endpoints
5. **PCI Compliance:** Never store full card details (Razorpay handles this)

---

## Files to Be Created/Modified

### New Files:
- `backend/src/main/java/com/healthcare/labtestbooking/service/RazorpayService.java`
- `backend/src/main/java/com/healthcare/labtestbooking/service/OrderPaymentService.java`
- `backend/src/main/java/com/healthcare/labtestbooking/dto/PaymentInitiationRequest.java`
- `backend/src/main/java/com/healthcare/labtestbooking/dto/PaymentInitiationResponse.java`
- `backend/src/main/java/com/healthcare/labtestbooking/dto/PaymentSuccessRequest.java`

### Modified Files:
- `backend/pom.xml` (add Razorpay dependency)
- `backend/src/main/resources/application.properties` (add Razorpay config)
- `backend/src/main/java/com/healthcare/labtestbooking/entity/Order.java` (add payment fields)
- `backend/src/main/java/com/healthcare/labtestbooking/controller/OrderController.java` (add payment endpoints)
- `backend/src/main/java/com/healthcare/labtestbooking/service/OrderStatusHistoryService.java` (add payment status tracking)

---

## Estimated Effort

| Task | Duration | Notes |
|------|----------|-------|
| Dependency + Config | 15 mins | pom.xml + properties |
| RazorpayService | 45 mins | SDK integration |
| OrderPaymentService | 40 mins | Business logic |
| DTOs | 15 mins | Simple POJOs |
| Endpoints | 30 mins | Controller methods |
| Webhook Handler | 30 mins | Signature verification |
| Entity Updates | 15 mins | Add fields |
| Testing | 30 mins | Manual cURL tests |
| Documentation | 20 mins | PHASE5.2-PAYMENT-INTEGRATION.md |

**Total: ~200 minutes (3-4 hours)**

---

## Success Criteria

✅ All tests pass
✅ Payment endpoints return correct responses
✅ Razorpay SDK integrates successfully
✅ Webhooks are processed correctly
✅ Order status updates on payment
✅ Documentation complete
✅ Zero compilation errors
✅ Clean build

---

## Next Steps After Phase 5.2

### Phase 5.3: Refund Management
- Implement order cancellation with refund
- Handle partial refunds
- Refund status tracking

### Phase 6: Lab Partner Integration
- Connect orders to lab partner
- SLA management
- Sample collection scheduling

### Phase 7: Report Delivery
- Generate test reports
- Send reports to patient email
- Report view in frontend

---

**Ready to proceed with Phase 5.2? Type "yes" or "start"**

# 🎯 Complete Integration Guide & Troubleshooting - Part 6

**Date:** 2026-03-24 | **Phase:** 5.2 Complete | **Status:** Production Integration Manual

---

## 📊 End-to-End User Journey

```
User Adds Test → Cart Updated → Clicks Checkout
        ↓              ↓              ↓
   POST /api/         useCart        navigate to
   cart/add-test      hook           /checkout
        ↓              ↓              ↓
   Backend: Add    Frontend:      OrderCheckoutPage
   to cart DB       Update State   Form
        ↓              ↓              ↓
    CartResponse  Cart Context    User fills form
        ↓              ↓              ↓
    Add Success ← Cart Icon     POST /api/orders/
                  Badge Count      create
                      ↓              ↓
                  Frontend       Backend:
                  Shows item    1. Validate
                  in cart       2. Create order
                      ↓         3. Auto-checkout
                  Ready for     4. Record history
                  Checkout      ↓
                                OrderResponse
                                ↓
                            navigate to
                            /payment/{orderId}
                                ↓
                            PaymentPage
                                ↓
                            POST /api/orders/{id}/
                                initiate-payment
                                ↓
                            Backend:
                            1. Create Razorpay order
                            2. Return payment link
                                ↓
                            PaymentInitiationResponse
                                ↓
                            Load Razorpay Script
                                ↓
                            Open Modal
                                ↓
                            User Pays
                                ↓
                        Razorpay Webhook ←→ Backend
                    (Server-to-Server - No Frontend)
                                ↓
                            Backend Webhook:
                            1. Verify HMAC-SHA256 sig
                            2. Update order status
                            3. Record history
                                ↓
                            navigate to
                          /payment-status/{id}
                                ↓
                        ✅ Payment Successful
                        Order: ORD-XXXXX
                        Amount: ₹6,251
```

---

## 🔧 Troubleshooting Guide

### Issue 1: "Cart not found" Error

**Symptoms:**
```
POST /api/orders/create → 404 Not Found
Error: "No active cart found"
```

**Solutions:**
1. Add test to cart first: `POST /api/cart/add-test`
2. Verify cart status: `SELECT status FROM cart WHERE user_id = ?`
3. Check auth token: Verify JWT in Authorization header

**Code Fix:**
```typescript
// Ensure cart exists before checkout
const cart = await useCart().fetchCart();
if (!cart || cart.items.length === 0) {
  await useCart().addTest(testId);
}
```

---

### Issue 2: "Payment Initiation Failed"

**Symptoms:**
```
POST /api/orders/{id}/initiate-payment → 400/500
Error: null or generic error message
```

**Solutions:**
1. Validate email format: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
2. Validate phone: exactly 10 digits
3. Check order exists: Query database by orderId
4. Check Razorpay API status
5. Network timeout: Increase axios timeout

**Code Fix:**
```typescript
const validatePaymentForm = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  if (!emailRegex.test(email)) throw new Error("Invalid email");
  if (!phoneRegex.test(phone)) throw new Error("Phone: 10 digits");
};
```

---

### Issue 3: Razorpay Modal Not Opening

**Symptoms:**
- Modal doesn't appear
- Console: "Razorpay script not loaded"

**Solutions:**
1. Verify Razorpay script loaded: Check Network tab
2. Use HTTPS (not HTTP)
3. Check `.env`: `VITE_RAZORPAY_KEY_ID` set
4. Disable ad blocker
5. Try incognito mode

**Code Fix:**
```typescript
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

---

### Issue 4: Payment Successful But Order Not Updated

**Symptoms:**
- Razorpay shows ✅ success
- Order status still PENDING
- No status history entry

**Solutions:**
1. Check webhook URL in Razorpay dashboard
2. Verify webhook secret in backend
3. Check database: `SELECT * FROM orders WHERE razorpay_order_id = 'order_xxx'`
4. Review backend logs: `tail logs/application.log`

**Debug:**
```bash
# Test webhook locally
curl -X POST http://localhost:8080/api/payments/razorpay-callback \
  -H "Content-Type: application/json" \
  -d '{"razorpay_order_id":"order_xxx","razorpay_payment_id":"pay_xxx"}'

# Check database
mysql> SELECT id, razorpay_order_id, status, payment_status 
       FROM orders WHERE razorpay_order_id = 'order_xxx';
```

---

### Issue 5: CORS Error in Frontend

**Symptoms:**
```
CORS error in browser console
Status: (blocked by CORS policy)
```

**Solutions:**
1. Update backend CORS config
2. Add frontend origin to whitelist
3. Set `withCredentials: true` in axios
4. Use HTTPS in production

**Code Fix - Backend:**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public WebSecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().configurationSource(request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "https://yourdomain.com"
            ));
            config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
            config.setAllowCredentials(true);
            return config;
        });
        return http.build();
    }
}
```

**Code Fix - Frontend:**
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
```

---

## ❓ FAQ

| Question | Answer |
|----------|--------|
| Can users have multiple active carts? | No, one ACTIVE cart per user |
| Can orders be edited? | No, orders are immutable |
| Are refunds automatic? | No, admin processes via admin panel |
| What if webhook is lost? | 24-hour grace period, verify manually |
| Can payment method change? | Only if payment fails |

---

## ✅ Deployment Verification

```bash
# 1. Health check
curl http://backend:8080/health

# 2. Database connection
mysql -h localhost -u user -p healthcare_lab -e "SELECT 1"

# 3. API endpoints
curl -X GET http://backend:8080/api/tests \
  -H "Authorization: Bearer $TOKEN"

# 4. Monitor error rate
tail -f logs/application.log | grep ERROR

# 5. Check payment status
curl -X GET http://backend:8080/api/orders/1001/payment-status \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Daily Monitoring Checklist

- [ ] Error rate < 0.1%
- [ ] Response time P95 < 200ms
- [ ] Payment success > 99.5%
- [ ] No database locks
- [ ] Disk space > 20%
- [ ] Redis cache hit rate > 80%
- [ ] Backup completed
- [ ] No critical alerts
- [ ] All health checks green

---

**Status:** ✅ Production-Ready & Integration Complete

**Last Updated:** 2026-03-24

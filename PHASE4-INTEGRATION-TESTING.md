# Phase 4: Integration Testing Guide

**Status:** Backend running on port 8080 ✅
**Next:** Start frontend and test end-to-end

---

## Frontend Startup

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Open http://localhost:5173 in your browser

---

## Test Plan

### 1. Test Public Catalog (Tests Page)

**Route:** http://localhost:5173/tests

**Expected:**
- ✅ Tests display in 3-column grid
- ✅ Test cards show name, description, price
- ✅ "Add to Cart" button visible on each card
- ✅ No authentication required
- ✅ No CORS errors in browser console

**Browser DevTools → Network tab should show:**
```
GET /api/lab-tests?page=0&size=12  → 200 OK
Content-Type: application/json
```

**Console should show:**
```
📡 Fetching tests (page: 0, size: 12)
✅ Tests loaded: 12 tests
```

---

### 2. Test Search Functionality

**On Tests page:**
1. Type "blood" in search box
2. Wait 0.5 seconds (debounce)

**Expected:**
- ✅ Tests filtered to show only blood-related tests
- ✅ No page reload
- ✅ Grid updates smoothly
- ✅ Console shows debounced request

**Network should show (after 0.5s delay):**
```
GET /api/lab-tests/search?query=blood&page=0&size=12  → 200 OK
```

---

### 3. Test Add to Cart (Public User)

**On Tests page:**
1. Click "Add to Cart" on any test

**Expected:**
- ✅ Button shows loading state
- ✅ Success notification appears ("Added to cart")
- ✅ Network shows 2 requests:
   - OPTIONS /api/cart/add-test (CORS preflight)
   - POST /api/cart/add-test (actual call)

**If you get 401 Unauthorized:**
- This is expected (cart is protected - requires login)
- Proceed to Test 4 (Login first)

---

### 4. Test Authentication & Cart

**Step 1: Login**
- Navigate to login page
- Use existing test credentials:
  - **Patient:** patient@example.com / password (or check database)
  - **Email verification:** If prompted, check backend for token

**Step 2: After successful login**
- JWT token stored in localStorage
- Redirect to home page
- Token included in all subsequent requests

**Step 3: Add to Cart (Authenticated)**
1. Navigate to /tests
2. Click "Add to Cart"

**Expected:**
- ✅ POST /api/cart/add-test returns 201 Created
- ✅ Success message shows
- ✅ Button state updates to "In Cart"
- ✅ Authorization header includes JWT token

**Console should show:**
```
📡 Adding test to cart (testId: X)
✅ Added to cart successfully
```

---

### 5. Test Cart Page

**Route:** http://localhost:5173/cart

**Expected after adding items:**
- ✅ Added test displays in cart
- ✅ Shows: Test name, price, quantity
- ✅ Quantity controls (+/- buttons) work
- ✅ Total calculation correct: quantity × price
- ✅ Price breakdown shows: subtotal, tax (18%), total
- ✅ "Remove" button removes item from cart
- ✅ "Clear All" button clears entire cart

**Network requests:**
```
GET /api/cart           → 200 OK (fetch cart)
POST /api/cart/add-test → 201 Created (add test)
PUT /api/cart/item/{id} → 200 OK (update quantity)
DELETE /api/cart/item/{id} → 204 No Content (remove)
```

---

### 6. Test Quantity Update

**On Cart page:**
1. Click + button to increase quantity
2. Click - button to decrease quantity
3. Type directly in quantity input

**Expected:**
- ✅ Quantity updates immediately
- ✅ Total price recalculates
- ✅ Network shows PUT request to /api/cart/item/{id}
- ✅ Minimum quantity is 1 (- button disabled when qty=1)

---

### 7. Test Coupon (If available)

**On Cart page:**
1. Enter coupon code in "Have a coupon code?" field
2. Click "Apply"

**Expected behaviors:**

**If coupon is valid:**
- ✅ Green badge shows: "✓ Coupon Applied: CODE"
- ✅ Discount amount reflects in price breakdown
- ✅ Total recalculates with discount applied
- ✅ X button to remove coupon

**If coupon is invalid:**
- ✅ Error message in red: "Invalid coupon code"
- ✅ Console shows error details

**Network:**
```
POST /api/cart/coupon/apply  → 200 OK (valid) or 400 Bad Request (invalid)
DELETE /api/cart/coupon      → 200 OK (on remove)
```

---

### 8. Test Pagination

**On Tests page:**
1. Scroll to bottom
2. Click page numbers

**Expected:**
- ✅ Page buttons are disabled/enabled correctly
- ✅ Clicking page loads tests for that page
- ✅ Grid updates with new tests
- ✅ No page reload, smooth transition

**Network:**
```
GET /api/lab-tests?page=1&size=12  → 200 OK
GET /api/lab-tests?page=2&size=12  → 200 OK
```

---

### 9. Test CORS Preflight

**In Browser DevTools → Network tab:**

1. Look for OPTIONS requests
2. Click any OPTIONS request for /api/* endpoint

**Should see headers:**
```
Request Headers:
  Access-Control-Request-Method: POST
  Access-Control-Request-Headers: content-type, authorization

Response Headers:
  Access-Control-Allow-Origin: http://localhost:5173
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: *
  Access-Control-Allow-Credentials: true
```

---

### 10. Test Error Handling

**Simulate errors:**

1. **Network error:**
   - Disconnect internet / disable backend
   - Try to fetch tests
   - Expected: Error message displays, consolelogs error

2. **Invalid coupon:**
   - Enter "INVALID_CODE"
   - Try to apply
   - Expected: Red error message appears

3. **Quantity validation:**
   - Try to set quantity to 0 or negative
   - Expected: No change, stays at minimum 1

---

## Console Debugging

**Open Browser DevTools (F12) → Console tab**

You should see logs like:
```
📡 Fetching tests (page: 0, size: 12)
✅ Tests loaded: 12 tests
📡 Adding test to cart (testId: 5)
✅ Added to cart successfully
📡 Fetching cart
✅ Cart loaded: 2 items
📡 Updating quantity (itemId: 1, qty: 3)
✅ Quantity updated
```

**If you see errors:**
```
❌ Error fetching tests: Network error
❌ CORS error: No 'Access-Control-Allow-Origin' header
❌ 401 Unauthorized: Token expired
```

---

## Quick Test Checklist

Copy this and track your testing:

```
PUBLIC CATALOG
[ ] Tests load in grid format
[ ] Search filters results with debounce
[ ] Pagination works
[ ] Add to cart button visible (may show 401 if not logged in)

AUTHENTICATION
[ ] Can login with credentials
[ ] JWT token stored in localStorage
[ ] Token included in Authorization header

CART OPERATIONS (After login)
[ ] Add test to cart shows success
[ ] Cart page displays items
[ ] Quantity +/- buttons work
[ ] Total price calculates correctly
[ ] Remove item works
[ ] Clear all works

ADVANCED
[ ] Coupon code application works
[ ] Price breakdown shows all components
[ ] CORS headers correct in Network tab
[ ] No JavaScript errors in console
[ ] No CORS policy errors

EDGE CASES
[ ] Error message shows for invalid coupon
[ ] Quantity can't go below 1
[ ] Cart persists after page refresh (if using localStorage)
[ ] Invalid token redirects to login
```

---

## Expected Backend Log Output (when frontend requests)

```
2026-03-23T22:33:09.627+05:30 DEBUG 1392 --- [nio-8080-exec-1]
  JWT filter invoked for GET /api/lab-tests. Token present: false

DEBUG: Handler execution chain for GET /api/lab-tests

200 OK: GET /api/lab-tests?page=0&size=12
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Tests don't load | CORS blocked | Check browser console for CORS error, verify @CrossOrigin on controller |
| 404 Not Found | API endpoint wrong | Verify URL in Network tab matches backend routes |
| 401 Unauthorized | No JWT token | Login first, check if token in Authorization header |
| 403 Forbidden | Wrong role | Verify user has PATIENT role for cart endpoints |
| Quantity input unresponsive | Event listener issue | Check browser console for errors |
| Cart not persisting | State not saved | Check Redux/Context/localStorage implementation |
| CORS OPTIONS fails | Missing OPTIONS method | Verify SecurityConfig allows OPTIONS for "/**" |
| Search not filtering | Debounce too short | Should be 500ms, verify useTests hook |

---

## Success Criteria for Phase 4 ✅

- [ ] Backend running without errors on port 8080
- [ ] Frontend running on port 5173
- [ ] Tests display in responsive grid
- [ ] Search/filter/pagination functional
- [ ] Can add test to cart (logged in)
- [ ] Cart page displays items correctly
- [ ] Quantity controls work
- [ ] Price breakdown displays correctly
- [ ] CORS preflight requests return 200
- [ ] No console errors (except possible warnings)
- [ ] No CORS policy violations
- [ ] Authentication works (JWT in headers)
- [ ] All network requests shown in DevTools

---

## Next Phase (Phase 5 - Optional)

Once all tests pass:
1. Add checkout page
2. Add order confirmation
3. Add user profile page
4. Integrate payment gateway (Razorpay)
5. Add order history

---

## Need Help?

Check:
1. Backend logs (should show incoming requests)
2. Browser console (Ctrl+Shift+I → Console)
3. Network tab (shows all API calls)
4. These test instructions (detailed steps above)

Good luck! 🚀

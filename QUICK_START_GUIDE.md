# 🚀 Quick Start: Test Cart Integration

## ✅ Current Status
- ✅ Dev server running on http://localhost:3007
- ✅ Frontend build successful (no errors)
- ✅ Cart API integration complete
- ✅ Test card UI with ADD button fully functional

---

## 3️⃣ Simple Testing Steps

### Step 1: Navigate to Tests Page
```
http://localhost:3007
→ Explore Lab Tests section
→ You should see test cards with:
  • Test name (e.g., "Complete Blood Count")
  • Sample type badge (Blood, Urine, etc.)
  • Price (₹amount)
  • Two buttons: "🛒 ADD" and "BOOK"
```

### Step 2: Add Test to Cart
```
1. Click "🛒 ADD" button on any test card
2. Expected behavior:
   ✓ Success notification appears with test name
   ✓ "Added [Test Name] to cart!" message
   ✓ No console errors

3. If working:
   - Test ID sent to backend
   - CartItem created with test details
   - Cart updated in database
```

### Step 3: View Cart
```
1. Click "View Cart" or go to /cart
2. You should see:
   ✓ Test name
   ✓ Sample type (Blood, Urine, etc.)
   ✓ Fasting requirement
   ✓ Price
   ✓ Total amount
   ✓ Remove button for each test
```

---

## 🔍 What's Working

### Frontend Side
```
TestCard Component:
┌─────────────────────────────────┐
│ Flask Icon    Test Name         │
│              Description         │
│ Red Badge: 8 Hrs Fasting        │
│ Purple Badge: Blood             │
│ Blue Badge: Reports in 24 hrs   │
│ TEST PRICE ₹500                 │
│ [🛒 ADD] [BOOK]  ← Clicking ADD │
└─────────────────────────────────┘
     │
     └─→ API Call to Backend
```

### Backend Side
```
Request: POST /api/cart/add-test
Body: { testId: 123, quantity: 1 }
Headers: { X-User-Id: 456 }

↓ Processing

CartService.addTestToCart(userId, request)
  ├─ Find or create cart for user
  ├─ Fetch test details from LabTest
  ├─ Check if test already in cart
  ├─ Create or update CartItem
  └─ Save to database

↓ Response

{
  "data": {
    "cartId": 789,
    "items": [
      {
        "testId": 123,
        "testName": "Complete Blood Count",
        "quantity": 1,
        "price": 500
      }
    ],
    "totalPrice": 500,
    "itemCount": 1
  }
}
```

---

## 🛠️ Troubleshooting

### Issue: "Failed to add test to cart"
```
Solution:
1. Check browser console (F12 → Console)
2. Look for error message details
3. Verify backend is running (localhost:8080)
4. Check X-User-Id header is being sent
   
Debug in console:
  const userId = localStorage.getItem('userId')
  console.log('Current user:', userId)
```

### Issue: Button click does nothing
```
Solution:
1. Check if JavaScript is loading
2. Verify TestCard component is imported
3. Check console for JavaScript errors
4. Refresh page (Ctrl+R)
```

### Issue: Success message but test not in cart
```
Solution:
1. Check backend database
2. Verify CartItem table has entry
3. Check if user is logged in
4. Verify test ID is valid
```

---

## 📱 User Flow Diagram

```
User Interface (Frontend)
┌─────────────────────────────────────────────────┐
│  TestListingPage                                 │
│                                                  │
│  [Test Card 1]  [Test Card 2]  [Test Card 3]   │
│  Click "ADD"    │           │                   │
│   │             │           │                   │
│   └─→ onAddToCart callback  │                   │
│       ├─ Call useCart.addTest(testId)           │
│       ├─ Show loading state                     │
│       └─ Display success notification           │
│                                                  │
│  Success: "Added Test Name to cart!"            │
└─────────────────────────────────────────────────┘
    │ API Call
    │ POST /api/cart/add-test
    │ { testId: 123, quantity: 1 }
    │
Backend (Spring Boot)
└─────────────────────────────────────────────────┐
│  CartController.addTestToCart()                 │
│   │                                              │
│   ├─→ CartService.addTestToCart()               │
│       ├─ Get or create cart                     │
│       ├─ Fetch test from LabTestRepository      │
│       ├─ Create CartItem                        │
│       ├─ Save to database                       │
│       └─ Return CartResponse with test details  │
│                                                  │
│  Database                                        │
│  carts → [ Cart with items ]                    │
│  cart_items → [ Item with testId + testName ]   │
│  lab_tests → [ Original test definition ]       │
└─────────────────────────────────────────────────┘
    │ API Response
    │ { cartId, items[], totalPrice, itemCount }
    │
Frontend (Update State)
└─────────────────────────────────────────────────┐
│  useCart hook updates cart state                │
│  ├─ Cart count badge updated                    │
│  ├─ Total price displayed                       │
│  └─ Individual test tracked by ID + name        │
└─────────────────────────────────────────────────┘
```

---

## 📊 Data Flow: Individual Test Tracking

```
Test Card Display:
  id: 123
  name: "Complete Blood Count"
  sampleType: "Blood"
  price: 500
        │
        ├─→ User clicks [🛒 ADD]
        │
API Request:
  POST /api/cart/add-test
  { testId: 123, quantity: 1 }
        │
        ├─→ Backend retrieves LabTest record
        │   with all details (name, sample, price)
        │
Database Insert:
  INSERT INTO cart_items
  (cart_id, lab_test_id, quantity, price_at_add)
  VALUES (789, 123, 1, 500)
        │
        ├─→ Frontend receives response with test name
        │
Cart Display:
  [Complete Blood Count] [Blood] [₹500] [×]
           ↑
      Test name stored and displayed
      Individual test tracked by ID
```

---

## ✨ Features Enabled

### 1. **Individual Test Addition** ✅
- Add one test at a time
- Each test tracked separately
- Test name displayed in notifications

### 2. **Multiple Tests in Cart** ✅
- Add 5+ different tests
- Each stored individually
- Quantity adjustable per test

### 3. **Test Details Persistence** ✅
- Sample type stored (Blood, Urine, Tissue)
- Price stored at add time
- Fasting requirements included
- Sample collection details included

### 4. **Responsive Feedback** ✅
- Loading state during API call
- Success notification with test name
- Error handling with user message
- Cart count badge updates

---

## 🎯 What Test Should Show

When you add a test called "Thyroid Function Test", you should see:

**Success Notification:**
```
✓ Added Thyroid Function Test to cart!
```

**In Cart Page:**
```
Cart:
├─ Thyroid Function Test | Blood | No Fasting | ₹400 | [×]
├─ Total Items: 1
└─ Total: ₹400
```

**In Database:**
```
cart_items table:
{
  cart_item_id: 1,
  cart_id: 456,
  lab_test_id: 123,        ← Individual test ID
  quantity: 1,
  price_at_add: 400,
  created_at: 2026-04-04
}
```

---

## 🔗 API Endpoints Active

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/cart` | Get full cart |
| POST | `/api/cart/add-test` | Add test by ID |
| DELETE | `/api/cart/remove/{testId}` | Remove test |
| DELETE | `/api/cart/clear` | Clear entire cart |
| GET | `/api/cart/quick` | Get item count + total |

---

## ✅ Verification Checklist

- [ ] Dev server running on localhost:3007
- [ ] Test cards display on /tests page
- [ ] Can click "🛒 ADD" button without errors
- [ ] Success notification appears with test name
- [ ] Can navigate to /cart and see added test
- [ ] Test name displayed correctly in cart
- [ ] Can add multiple different tests
- [ ] Cart total updates correctly
- [ ] Can remove test from cart
- [ ] Page refresh - cart persists

---

## 📞 Debug Commands

**Check if backend is running:**
```bash
curl http://localhost:8080/api/tests
```

**Monitor API calls in browser:**
```javascript
// Open DevTools → Network tab → Filter by "cart"
// Click ADD button and watch request/response
```

**Check cart in browser storage:**
```javascript
// DevTools → Console
localStorage.getItem('userId')  // Check if user logged in
sessionStorage.getItem('cart')  // Check cart data
```

---

## 🎬 Demo Recording Guide

If you want to record a demo:
1. Navigate to test listing page
2. Scroll and show various test cards
3. Click "🛒 ADD" on 3 different tests
4. Show success notification each time
5. Open cart page
6. Show all 3 tests with details and total
7. Remove one test
8. Show updated total

**Result:** Demonstrates individual test tracking in action!

---

## 🚀 You're All Set!

Your lab test booking system is ready to:
- ✅ Display individual tests as cards
- ✅ Add tests to cart by individual test ID and name
- ✅ Track test details (sample type, price, fasting)
- ✅ Persist cart across sessions
- ✅ Show cart with all test information
- ✅ Remove individual tests from cart

**Start using it:** http://localhost:3007

Happy testing! 🎉

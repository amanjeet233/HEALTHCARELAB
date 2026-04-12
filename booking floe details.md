# HealthcareLab BOOKING FLOW - DETAILED SPECIFICATION

**Focus:** Book Click → Cart → Booking Page → Payment → Confirmation + Email

---

## 1️⃣ BOOK BUTTON → ADD TO CART

### Where Book Button Appears
- ✓ Package details page
- ✓ Package listing card (secondary)
- ✓ Test detail page

### On Click Action

```javascript
// BookButton.jsx
const BookButton = ({ packageId, packageName, price }) => {
  const handleClick = () => {
    // Add to cart (Redux action)
    dispatch(addToCart({
      id: packageId,
      name: packageName,
      price: price,
      quantity: 1,
      addedAt: new Date()
    }));
    
    // Show toast
    toast.success("Added to cart!");
    
    // Navigate to cart
    navigate('/cart');
  };
  
  return <button onClick={handleClick}>📦 Book Now</button>;
};
```

### Cart State (Redux)

```javascript
// store/cartSlice.js
const initialState = {
  items: [
    {
      id: "pkg-001",
      name: "Men's Cardiac Gold",
      price: 1799,
      finalPrice: 1799,
      discount: 40,
      quantity: 1,
      addedAt: "2025-01-15T10:00:00Z"
    }
  ],
  subtotal: 1799,
  tax: 180,
  total: 1979,
  appliedPromo: null
};
```

---

## 2️⃣ CART PAGE → BOOKING PAGE

### Cart Preview (Header)

```
┌─────────────────────────────────────────┐
│ 🛒 YOUR CART  [1 Item]                  │
├─────────────────────────────────────────┤
│ Men's Cardiac Gold × 1                  │
│ Price: ₹1799                            │
├─────────────────────────────────────────┤
│ Subtotal: ₹1799                         │
│ Tax (10%): ₹180                         │
│ TOTAL: ₹1979                            │
│                                         │
│         [Proceed to Booking]            │
└─────────────────────────────────────────┘
```

### On "Proceed to Booking" Click

```javascript
// Navigate to booking page
navigate('/booking', {
  state: {
    cartItems: cart.items,
    total: cart.total
  }
});
```

---

## 3️⃣ BOOKING PAGE LAYOUT

### Full Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│              BOOKING: Men's Cardiac Gold                        │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                       │
│  LEFT SIDEBAR            │  RIGHT CONTENT                       │
│  (Order Summary)         │  (Booking Form)                      │
│                          │                                       │
│  ┌──────────────────┐    │  ┌──────────────────────────────┐   │
│  │ ORDER SUMMARY    │    │  │ STEP 1: SELECT PERSON       │   │
│  ├──────────────────┤    │  ├──────────────────────────────┤   │
│  │ Package:         │    │  │ Who is booking this test?    │   │
│  │ Men's Cardiac    │    │  │ ○ Self (Raj Kumar)          │   │
│  │ Gold             │    │  │ ○ Family Member             │   │
│  │                  │    │  │   ┌──────────────────────┐   │   │
│  │ Price:           │    │  │   │ Select:              │   │   │
│  │ ₹2999 → ₹1799    │    │  │   │ [Priya Kumar ▼]      │   │   │
│  │ (40% off)        │    │  │   └──────────────────────┘   │   │
│  │                  │    │  │                              │   │
│  │ Tests Included:  │    │  ├──────────────────────────────┤   │
│  │ • Lipid Profile  │    │  │ STEP 2: SELECT SLOT         │   │
│  │ • hs-CRP         │    │  ├──────────────────────────────┤   │
│  │ • Troponin       │    │  │ Select Date:                │   │
│  │ • [+8 more]      │    │  │ [📅 Feb 01, 2025] ▼        │   │
│  │                  │    │  │                              │   │
│  │ Promo Code:      │    │  │ Select Time:                │   │
│  │ [PROMO20____]    │    │  │ ○ 09:00 AM                 │   │
│  │ [Apply]          │    │  │ ○ 11:00 AM                 │   │
│  │                  │    │  │ ○ 02:00 PM                 │   │
│  │ Discount: -₹200  │    │  │ ○ 04:00 PM                 │   │
│  │ (PROMO20)        │    │  │                              │   │
│  │                  │    │  ├──────────────────────────────┤   │
│  │ Subtotal: ₹2999  │    │  │ STEP 3: SELECT ADDRESS      │   │
│  │ Discount: -₹440  │    │  ├──────────────────────────────┤   │
│  │ Tax (10%): ₹256  │    │  │ Delivery Address:           │   │
│  ├──────────────────┤    │  │ [★ Home: 123 Main St] ▼     │   │
│  │ TOTAL: ₹2815     │    │  │                              │   │
│  │                  │    │  │ OR                           │   │
│  │ 💳 Payment:      │    │  │ [+ Add New Address]         │   │
│  │ [Credit Card ▼]  │    │  │                              │   │
│  │                  │    │  │ ┌──────────────────────────┐ │   │
│  │ [Continue to     │    │  │ │ ADD NEW ADDRESS          │ │   │
│  │  Payment] ►      │    │  │ ├──────────────────────────┤ │   │
│  │                  │    │  │ │ Type: [Home ▼]           │ │   │
│  └──────────────────┘    │  │ │ Street: [________]       │ │   │
│                          │  │ │ City: [Delhi ▼]          │ │   │
│                          │  │ │ Postal: [110001]         │ │   │
│                          │  │ │ ☑ Set as default         │ │   │
│                          │  │ │ [Save] [Cancel]          │ │   │
│                          │  │ └──────────────────────────┘ │   │
│                          │  │                              │   │
│                          │  │ [Previous] [Next: Payment] ► │   │
│                          │  └──────────────────────────────┘   │
│                          │                                       │
└──────────────────────────┴──────────────────────────────────────┘
```

### LEFT SIDEBAR: Order Summary Card

```javascript
// OrderSummaryCard.jsx
const OrderSummaryCard = ({ cartItems, total, discount, promo }) => {
  return (
    <div className="order-summary">
      <h3>ORDER SUMMARY</h3>
      
      {/* Package Info */}
      <div className="package-info">
        <p className="label">Package</p>
        <p className="value">{cartItems[0].name}</p>
      </div>
      
      {/* Price Breakdown */}
      <div className="price-breakdown">
        <div className="row">
          <span>Original Price:</span>
          <span>₹{cartItems[0].price}</span>
        </div>
        <div className="row">
          <span>Discount (40%):</span>
          <span>-₹{Math.floor(cartItems[0].price * 0.4)}</span>
        </div>
        {promo && (
          <div className="row promo-row">
            <span>Promo ({promo.code}):</span>
            <span>-₹{promo.discount}</span>
          </div>
        )}
        <div className="divider"></div>
        <div className="row total">
          <span>Subtotal:</span>
          <span>₹{cartItems[0].price - (cartItems[0].price * 0.4)}</span>
        </div>
        <div className="row">
          <span>Tax (10%):</span>
          <span>₹{Math.floor(total * 0.1)}</span>
        </div>
      </div>
      
      {/* Tests Included */}
      <div className="tests-included">
        <p className="label">Tests Included:</p>
        <ul>
          <li>Lipid Profile</li>
          <li>hs-CRP</li>
          <li>Troponin</li>
          <li className="more">[+8 more tests]</li>
        </ul>
      </div>
      
      {/* Promo Code Section */}
      <div className="promo-section">
        <input 
          type="text" 
          placeholder="Enter promo code" 
          value={promoInput}
          onChange={handlePromoChange}
        />
        <button onClick={handleApplyPromo}>Apply</button>
        {promo && (
          <div className="promo-applied">
            ✓ {promo.code} applied
          </div>
        )}
      </div>
      
      {/* Payment Method */}
      <div className="payment-method">
        <label>Payment Method:</label>
        <select value={paymentMethod} onChange={handlePaymentChange}>
          <option value="credit-card">💳 Credit Card</option>
          <option value="debit-card">💳 Debit Card</option>
          <option value="upi">📱 UPI</option>
          <option value="wallet">💰 Wallet</option>
        </select>
      </div>
      
      {/* Total Amount */}
      <div className="total-amount">
        <div className="amount">
          TOTAL: <span>₹{total}</span>
        </div>
        <button className="continue-btn" onClick={handleContinuePayment}>
          Continue to Payment ►
        </button>
      </div>
    </div>
  );
};
```

### RIGHT CONTENT: Multi-Step Booking Form

```javascript
// BookingForm.jsx
const BookingForm = ({ cartItems, onNext, onPrevious }) => {
  const [step, setStep] = useState(1); // 1, 2, 3
  const [formData, setFormData] = useState({
    personType: "self", // "self" or family member ID
    familyMemberId: null,
    scheduledDate: null,
    scheduledTime: null,
    addressId: null,
    newAddress: null
  });
  
  const handlePersonSelect = (type, memberId) => {
    setFormData({
      ...formData,
      personType: type,
      familyMemberId: memberId
    });
  };
  
  const handleDateTimeSelect = (date, time) => {
    setFormData({
      ...formData,
      scheduledDate: date,
      scheduledTime: time
    });
  };
  
  const handleAddressSelect = (addressId) => {
    setFormData({
      ...formData,
      addressId: addressId,
      newAddress: null
    });
  };
  
  const handleAddNewAddress = (address) => {
    setFormData({
      ...formData,
      newAddress: address
    });
  };
  
  const handleNextStep = () => {
    if (step === 3) {
      onNext(formData);
    } else {
      setStep(step + 1);
    }
  };
  
  return (
    <div className="booking-form">
      <h2>BOOKING: {cartItems[0].name}</h2>
      
      {step === 1 && (
        <Step1_SelectPerson
          onSelect={handlePersonSelect}
          selected={formData.personType}
        />
      )}
      
      {step === 2 && (
        <Step2_SelectSlot
          onSelect={handleDateTimeSelect}
          selected={{
            date: formData.scheduledDate,
            time: formData.scheduledTime
          }}
        />
      )}
      
      {step === 3 && (
        <Step3_SelectAddress
          onAddressSelect={handleAddressSelect}
          onAddNewAddress={handleAddNewAddress}
          selected={{
            addressId: formData.addressId,
            newAddress: formData.newAddress
          }}
        />
      )}
      
      <div className="form-actions">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)}>Previous</button>
        )}
        <button onClick={handleNextStep}>
          {step === 3 ? "Next: Payment ►" : "Next"}
        </button>
      </div>
    </div>
  );
};

// STEP 1: Select Person
const Step1_SelectPerson = ({ onSelect, selected }) => {
  const [familyMembers] = useQuery(`/users/profile`);
  
  return (
    <div className="step-1">
      <h3>STEP 1: Who is booking this test?</h3>
      
      <div className="person-options">
        <label className="option">
          <input
            type="radio"
            name="person"
            value="self"
            checked={selected === "self"}
            onChange={(e) => onSelect("self", null)}
          />
          <span className="person-name">Self (Raj Kumar)</span>
          <span className="person-dob">DOB: 1990-05-15</span>
        </label>
        
        <label className="section-title">Family Members:</label>
        {familyMembers.map(member => (
          <label key={member.id} className="option">
            <input
              type="radio"
              name="person"
              value={member.id}
              checked={selected === member.id}
              onChange={(e) => onSelect(member.id, member.id)}
            />
            <span className="person-name">{member.firstName} {member.lastName}</span>
            <span className="person-dob">DOB: {member.dateOfBirth}</span>
            <span className="person-relation">({member.relation})</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// STEP 2: Select Slot
const Step2_SelectSlot = ({ onSelect, selected }) => {
  const [availableSlots] = useQuery(`/collection-centers/slots`);
  
  return (
    <div className="step-2">
      <h3>STEP 2: Select Date & Time</h3>
      
      <div className="date-picker">
        <label>Select Date:</label>
        <input
          type="date"
          min={getMinDate()} // Today + 2 days
          value={selected.date || ""}
          onChange={(e) => onSelect(e.target.value, selected.time)}
        />
      </div>
      
      <div className="time-slots">
        <label>Select Time:</label>
        <div className="slots-grid">
          {availableSlots.map(slot => (
            <label key={slot.time} className="slot-option">
              <input
                type="radio"
                name="time"
                value={slot.time}
                checked={selected.time === slot.time}
                onChange={(e) => onSelect(selected.date, e.target.value)}
              />
              <span className={`slot-time ${slot.available ? '' : 'disabled'}`}>
                {slot.time}
              </span>
              <span className="slot-available">
                {slot.available ? `${slot.spots} spots` : "Full"}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="collection-center-info">
        <p className="label">Collection Center:</p>
        <p className="value">Delhi South Center</p>
        <p className="address">123 Medical Complex, South Delhi 110001</p>
        <p className="phone">📞 +91-11-1234-5678</p>
      </div>
    </div>
  );
};

// STEP 3: Select Address
const Step3_SelectAddress = ({ onAddressSelect, onAddNewAddress, selected }) => {
  const [userAddresses] = useQuery(`/users/profile`);
  const [showAddNewForm, setShowAddNewForm] = useState(false);
  
  return (
    <div className="step-3">
      <h3>STEP 3: Delivery Address</h3>
      
      <div className="existing-addresses">
        <label className="section-title">Your Addresses:</label>
        {userAddresses.map(addr => (
          <label key={addr.id} className="address-option">
            <input
              type="radio"
              name="address"
              value={addr.id}
              checked={selected.addressId === addr.id}
              onChange={() => onAddressSelect(addr.id)}
            />
            <div className="address-details">
              <span className="address-type">{addr.type.toUpperCase()}</span>
              {addr.isDefault && <span className="badge">★ Default</span>}
              <p className="address-text">
                {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
              </p>
            </div>
          </label>
        ))}
      </div>
      
      <button 
        className="add-address-btn"
        onClick={() => setShowAddNewForm(true)}
      >
        + Add New Address
      </button>
      
      {showAddNewForm && (
        <div className="add-address-form">
          <h4>Add New Address</h4>
          <form onSubmit={(e) => {
            e.preventDefault();
            // Collect form data and call onAddNewAddress
            onAddNewAddress(formData);
            setShowAddNewForm(false);
          }}>
            <div className="form-group">
              <label>Address Type:</label>
              <select name="type" required>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Street Address:</label>
              <input type="text" name="street" placeholder="123 Main Street" required />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City:</label>
                <input type="text" name="city" placeholder="Delhi" required />
              </div>
              <div className="form-group">
                <label>State:</label>
                <select name="state" required>
                  <option value="">Select State</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  {/* ... */}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Postal Code:</label>
              <input 
                type="text" 
                name="postalCode" 
                placeholder="110001"
                pattern="\d{6}"
                required 
              />
            </div>
            
            <div className="form-group">
              <label>
                <input type="checkbox" name="setDefault" />
                Set as default address
              </label>
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setShowAddNewForm(false)}>
                Cancel
              </button>
              <button type="submit">Save Address</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
```

---

## 4️⃣ PAYMENT PAGE

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│            PAYMENT: Men's Cardiac Gold                      │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                       │
│  ORDER SUMMARY       │  PAYMENT METHOD                       │
│  (Same as before)    │                                       │
│                      │  ┌──────────────────────────────┐   │
│  Package: Men's      │  │ SELECT PAYMENT METHOD        │   │
│  Cardiac Gold        │  ├──────────────────────────────┤   │
│                      │  │ ○ Credit Card                │   │
│  Total: ₹2815        │  │   ┌────────────────────────┐ │   │
│                      │  │   │ Card Number:           │ │   │
│  [Previous] [Pay     │  │   │ [____-____-____-____]  │ │   │
│   Now] ►             │  │   │                        │ │   │
│                      │  │   │ Name: [Raj Kumar]      │ │   │
│                      │  │   │                        │ │   │
│                      │  │   │ Expiry: [MM/YY]  CVV:  │ │   │
│                      │  │   │         [___]    [___] │ │   │
│                      │  │   │                        │ │   │
│                      │  │   │ ☑ Save card for        │ │   │
│                      │  │   │   future use           │ │   │
│                      │  │   └────────────────────────┘ │   │
│                      │  │                              │   │
│                      │  │ ○ Debit Card                │   │
│                      │  │ ○ UPI (Recommended)         │   │
│                      │  │ ○ Digital Wallet           │   │
│                      │  │                              │   │
│                      │  │ ┌──────────────────────────┐ │   │
│                      │  │ │ 🔒 Secure Payment        │ │   │
│                      │  │ │    SSL Encrypted         │ │   │
│                      │  │ │    100% Safe             │ │   │
│                      │  │ └──────────────────────────┘ │   │
│                      │  │                              │   │
│                      │  │ [Pay ₹2815 Now] ►           │   │
│                      │  └──────────────────────────────┘   │
│                      │                                       │
└──────────────────────┴──────────────────────────────────────┘
```

### Payment Handler

```javascript
// PaymentPage.jsx
const PaymentPage = ({ bookingData, total }) => {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [loading, setLoading] = useState(false);
  
  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Call backend to initiate payment
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingData,
          amount: total,
          paymentMethod,
          userId: currentUser.id
        })
      });
      
      const { paymentId, redirectUrl } = await response.json();
      
      if (paymentMethod === 'upi') {
        // Redirect to UPI handler
        window.location.href = redirectUrl;
      } else {
        // Show payment form for card/debit
        initializePaymentForm(paymentId);
      }
    } catch (error) {
      toast.error("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="payment-page">
      {/* Order Summary (Sidebar) */}
      <OrderSummaryCard cartItems={cartItems} total={total} />
      
      {/* Payment Method Selection */}
      <div className="payment-methods">
        <h3>SELECT PAYMENT METHOD</h3>
        
        <label className="method-option">
          <input
            type="radio"
            value="credit-card"
            checked={paymentMethod === "credit-card"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>💳 Credit Card</span>
        </label>
        
        {paymentMethod === "credit-card" && (
          <div className="card-form">
            <input placeholder="Card Number (16 digits)" />
            <input placeholder="Card Holder Name" />
            <div className="card-row">
              <input placeholder="MM/YY" style={{ width: '50%' }} />
              <input placeholder="CVV" style={{ width: '50%' }} />
            </div>
            <label>
              <input type="checkbox" /> Save for future use
            </label>
          </div>
        )}
        
        <label className="method-option">
          <input
            type="radio"
            value="debit-card"
            checked={paymentMethod === "debit-card"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>💳 Debit Card</span>
        </label>
        
        <label className="method-option">
          <input
            type="radio"
            value="upi"
            checked={paymentMethod === "upi"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>📱 UPI (Recommended)</span>
        </label>
        
        <label className="method-option">
          <input
            type="radio"
            value="wallet"
            checked={paymentMethod === "wallet"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span>💰 Digital Wallet</span>
        </label>
        
        <div className="security-badge">
          🔒 Secure Payment | SSL Encrypted | 100% Safe
        </div>
        
        <button 
          className="pay-button"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay ₹${total} Now`}
        </button>
      </div>
    </div>
  );
};
```

---

## 5️⃣ CONFIRMATION PAGE

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    ✅ BOOKING CONFIRMED!                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│        Confirmation Number: HLTH-2025-0001                  │
│        Booking ID: bkg-001                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ BOOKING DETAILS                                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Package: Men's Cardiac Gold Package                 │  │
│  │ Tests: 45 tests (Lipid Profile, hs-CRP, ...)      │  │
│  │ Report Turnaround: 48 hours                         │  │
│  │                                                      │  │
│  │ Appointment:                                        │  │
│  │ Date: Feb 01, 2025                                 │  │
│  │ Time: 09:00 AM                                     │  │
│  │ Location: Delhi South Collection Center            │  │
│  │           123 Medical Complex, South Delhi          │  │
│  │           📞 +91-11-1234-5678                       │  │
│  │                                                      │  │
│  │ For: Raj Kumar (DOB: 1990-05-15)                   │  │
│  │ Delivery Address: 123 Main St, Delhi 110001        │  │
│  │                                                      │  │
│  │ Payment Status: ✓ CONFIRMED                        │  │
│  │ Amount Paid: ₹2815                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  📧 Email: Confirmation sent to raj.kumar@example.com      │
│  📱 SMS: Reminder sent to +919876543210                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ NEXT STEPS                                           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 1. You will receive reminder 24 hours before        │  │
│  │ 2. Arrive 10 minutes early                          │  │
│  │ 3. Bring valid ID & reference number               │  │
│  │ 4. Report will be ready by Feb 03, 2025            │  │
│  │ 5. You'll receive email when report is ready       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [View My Bookings]  [Download Confirmation]  [Home] ►     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Confirmation Component

```javascript
// ConfirmationPage.jsx
const ConfirmationPage = ({ bookingId }) => {
  const [booking, setBooking] = useState(null);
  
  useEffect(() => {
    // Fetch booking details
    fetch(`/api/users/bookings/${bookingId}`)
      .then(res => res.json())
      .then(data => setBooking(data.booking));
  }, [bookingId]);
  
  const handleDownloadPDF = () => {
    window.location.href = `/api/bookings/${bookingId}/confirmation-pdf`;
  };
  
  const handleGoToBookings = () => {
    navigate('/bookings');
  };
  
  if (!booking) return <Spinner />;
  
  return (
    <div className="confirmation-page">
      <div className="success-header">
        <div className="checkmark">✅</div>
        <h1>BOOKING CONFIRMED!</h1>
        <p className="confirmation-number">
          Confirmation #: {booking.confirmationNumber}
        </p>
      </div>
      
      <div className="booking-details-card">
        <h2>BOOKING DETAILS</h2>
        
        <div className="detail-row">
          <span className="label">Package:</span>
          <span className="value">{booking.packageName}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Tests Included:</span>
          <span className="value">{booking.testCount} tests</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Report Turnaround:</span>
          <span className="value">{booking.reportTurnaroundHours} hours</span>
        </div>
        
        <div className="divider"></div>
        
        <div className="section">
          <h3>Appointment Details</h3>
          <div className="detail-row">
            <span className="label">Date:</span>
            <span className="value">{formatDate(booking.scheduledDate)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Time:</span>
            <span className="value">{booking.scheduledTime}</span>
          </div>
          <div className="detail-row">
            <span className="label">Location:</span>
            <span className="value">{booking.collectionCenter.name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Address:</span>
            <span className="value">{booking.collectionCenter.address}</span>
          </div>
          <div className="detail-row">
            <span className="label">Phone:</span>
            <span className="value">
              <a href={`tel:${booking.collectionCenter.phone}`}>
                {booking.collectionCenter.phone}
              </a>
            </span>
          </div>
        </div>
        
        <div className="divider"></div>
        
        <div className="section">
          <h3>Patient Information</h3>
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value">{booking.patientName}</span>
          </div>
          <div className="detail-row">
            <span className="label">DOB:</span>
            <span className="value">{booking.patientDOB}</span>
          </div>
          <div className="detail-row">
            <span className="label">Delivery Address:</span>
            <span className="value">{booking.deliveryAddress}</span>
          </div>
        </div>
        
        <div className="divider"></div>
        
        <div className="payment-section">
          <div className="detail-row">
            <span className="label">Payment Status:</span>
            <span className="value success">✓ CONFIRMED</span>
          </div>
          <div className="detail-row">
            <span className="label">Amount Paid:</span>
            <span className="value">₹{booking.amount}</span>
          </div>
        </div>
      </div>
      
      <div className="notifications">
        <p className="email-sent">
          📧 Confirmation email sent to <strong>{booking.userEmail}</strong>
        </p>
        <p className="sms-sent">
          📱 SMS reminder sent to <strong>{booking.userPhone}</strong>
        </p>
      </div>
      
      <div className="next-steps-card">
        <h3>NEXT STEPS</h3>
        <ol>
          <li>You will receive a reminder 24 hours before appointment</li>
          <li>Please arrive 10 minutes early</li>
          <li>Bring valid ID and reference number</li>
          <li>Report will be ready by {formatDate(booking.estimatedReportDate)}</li>
          <li>You'll receive email when report is available</li>
        </ol>
      </div>
      
      <div className="actions">
        <button onClick={handleDownloadPDF} className="secondary">
          📥 Download Confirmation
        </button>
        <button onClick={handleGoToBookings} className="primary">
          View My Bookings ►
        </button>
      </div>
    </div>
  );
};
```

---

## 6️⃣ EMAIL TEMPLATES (Professional)

### Template 1: Booking Confirmation Email

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; }
    .header { background: #2E75B6; color: white; padding: 20px; text-align: center; }
    .content { background: white; padding: 30px; }
    .section { margin: 20px 0; border-left: 4px solid #2E75B6; padding-left: 15px; }
    .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .badge { display: inline-block; background: #28a745; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; }
    .button { display: inline-block; background: #2E75B6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Header -->
    <div class="header">
      <h1>✅ Booking Confirmed!</h1>
      <p>Your health checkup is scheduled</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      
      <p>Hi <strong>{{userName}}</strong>,</p>
      
      <p>Thank you for booking with HealthcareLab! Your booking has been confirmed. Here are the details:</p>
      
      <!-- Booking Details Section -->
      <div class="section">
        <h3>📦 Booking Details</h3>
        <div class="detail">
          <span>Confirmation Number:</span>
          <span><strong>{{confirmationNumber}}</strong></span>
        </div>
        <div class="detail">
          <span>Package:</span>
          <span><strong>{{packageName}}</strong></span>
        </div>
        <div class="detail">
          <span>Tests Included:</span>
          <span>{{testCount}} tests</span>
        </div>
        <div class="detail">
          <span>Report Turnaround:</span>
          <span>{{reportTurnaround}} hours</span>
        </div>
      </div>
      
      <!-- Appointment Details Section -->
      <div class="section">
        <h3>📅 Appointment Details</h3>
        <div class="detail">
          <span>Date:</span>
          <span><strong>{{appointmentDate}}</strong></span>
        </div>
        <div class="detail">
          <span>Time:</span>
          <span><strong>{{appointmentTime}}</strong></span>
        </div>
        <div class="detail">
          <span>Collection Center:</span>
          <span><strong>{{centerName}}</strong></span>
        </div>
        <div class="detail">
          <span>Address:</span>
          <span>{{centerAddress}}</span>
        </div>
        <div class="detail">
          <span>Phone:</span>
          <span><a href="tel:{{centerPhone}}">{{centerPhone}}</a></span>
        </div>
      </div>
      
      <!-- Patient Information Section -->
      <div class="section">
        <h3>👤 Patient Information</h3>
        <div class="detail">
          <span>For:</span>
          <span>{{patientName}}</span>
        </div>
        <div class="detail">
          <span>Delivery Address:</span>
          <span>{{deliveryAddress}}</span>
        </div>
      </div>
      
      <!-- Payment Section -->
      <div class="section">
        <h3>💳 Payment Confirmation</h3>
        <div class="detail">
          <span>Amount Paid:</span>
          <span><strong>₹{{amount}}</strong></span>
        </div>
        <div class="detail">
          <span>Payment Status:</span>
          <span><span class="badge">CONFIRMED</span></span>
        </div>
        <div class="detail">
          <span>Payment Method:</span>
          <span>{{paymentMethod}}</span>
        </div>
      </div>
      
      <!-- Next Steps Section -->
      <div class="section">
        <h3>📋 What's Next?</h3>
        <ol>
          <li>You will receive a reminder SMS 24 hours before appointment</li>
          <li>Please arrive <strong>10 minutes early</strong> for collection</li>
          <li>Bring valid ID and this confirmation number</li>
          <li>Your health report will be ready by {{reportReadyDate}}</li>
          <li>We'll send you an email notification when your report is ready</li>
        </ol>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{bookingDetailsLink}}" class="button">View Booking Details</a>
      </div>
      
      <!-- FAQ Section -->
      <div class="section">
        <h3>❓ Frequently Asked Questions</h3>
        <p><strong>Q: What if I need to reschedule?</strong></p>
        <p>A: You can reschedule your appointment up to 48 hours before your scheduled time. Visit your bookings page to reschedule.</p>
        
        <p><strong>Q: What should I bring?</strong></p>
        <p>A: Please bring a valid government-issued ID (Aadhar, PAN, Passport, or Driving License).</p>
        
        <p><strong>Q: Do I need to fast?</strong></p>
        <p>A: {{fastingInstructions}}</p>
      </div>
      
      <!-- Contact Support -->
      <div style="background: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0;"><strong>Need help?</strong></p>
        <p style="margin: 5px 0;">📞 Call us: 1800-HEALTH-1 (1800-432-5841)</p>
        <p style="margin: 5px 0;">📧 Email: support@healthcarelab.com</p>
        <p style="margin: 5px 0;">⏰ Available 24/7</p>
      </div>
      
      <p>Thank you for choosing HealthcareLab. We look forward to serving you!</p>
      
      <p style="color: #666;">Best regards,<br><strong>HealthcareLab Team</strong></p>
      
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>© 2025 HealthcareLab. All rights reserved.</p>
      <p>
        <a href="#" style="color: #2E75B6; text-decoration: none; margin: 0 10px;">Manage Preferences</a> | 
        <a href="#" style="color: #2E75B6; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
        <a href="#" style="color: #2E75B6; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
      </p>
    </div>
    
  </div>
</body>
</html>
```

### Template 2: Report Ready Notification

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; }
    .content { background: white; padding: 30px; }
    .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-size: 16px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    
    <div class="header">
      <h1>📊 Your Health Report is Ready!</h1>
    </div>
    
    <div class="content">
      
      <p>Hi {{userName}},</p>
      
      <p>Great news! Your health report from <strong>{{packageName}}</strong> is now ready for download.</p>
      
      <div style="background: #e8f4f8; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p><strong>Report Details:</strong></p>
        <p style="margin: 5px 0;">📦 Package: {{packageName}}</p>
        <p style="margin: 5px 0;">📅 Collected: {{collectionDate}}</p>
        <p style="margin: 5px 0;">✓ Tests: {{testCount}} completed</p>
        <p style="margin: 5px 0;">👤 For: {{patientName}}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{reportDownloadLink}}" class="button">📥 View & Download Report</a>
      </div>
      
      <div class="alert">
        <p><strong>⚠️ Important:</strong> Please consult your doctor to interpret your results and understand the next steps.</p>
      </div>
      
      <p><strong>What you can do now:</strong></p>
      <ul>
        <li>Download your detailed PDF report</li>
        <li>Share your report with your doctor</li>
        <li>Book follow-up tests if recommended</li>
        <li>View health insights and trends</li>
      </ul>
      
      <p style="color: #666; font-size: 14px;">
        <strong>Note:</strong> Your report is secure and encrypted. It will be available for 90 days from today. We recommend downloading and saving a copy for your records.
      </p>
      
      <p>Have questions about your results? Our team is here to help:</p>
      <p>
        📞 <strong>1800-HEALTH-1</strong> | 
        📧 <strong>support@healthcarelab.com</strong> | 
        💬 <strong>Chat with us 24/7</strong>
      </p>
      
      <p>Best regards,<br><strong>HealthcareLab Medical Team</strong></p>
      
    </div>
    
    <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
      <p>© 2025 HealthcareLab. Your health, our priority.</p>
    </div>
    
  </div>
</body>
</html>
```

### Template 3: Appointment Reminder

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .reminder-header { background: #ff9800; color: white; padding: 15px; text-align: center; }
    .reminder-box { background: #fff8f0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    
    <div class="reminder-header">
      <h2>⏰ Appointment Reminder</h2>
      <p>Your health checkup is in 24 hours!</p>
    </div>
    
    <div class="content" style="padding: 30px;">
      
      <p>Hi {{userName}},</p>
      
      <p>This is a friendly reminder about your upcoming appointment with HealthcareLab.</p>
      
      <div class="reminder-box">
        <p><strong>📅 Appointment Details:</strong></p>
        <p><strong>Date:</strong> {{appointmentDate}}</p>
        <p><strong>Time:</strong> {{appointmentTime}}</p>
        <p><strong>Location:</strong> {{centerName}}</p>
        <p><strong>Address:</strong> {{centerAddress}}</p>
      </div>
      
      <p><strong>📋 Things to Remember:</strong></p>
      <ul>
        <li>✓ Arrive <strong>10 minutes early</strong></li>
        <li>✓ Bring valid <strong>Government ID</strong></li>
        <li>✓ {{fastingInstructions}}</li>
        <li>✓ Wear <strong>comfortable clothing</strong></li>
        <li>✓ {{otherInstructions}}</li>
      </ul>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{rescheduleLink}}" style="color: #2E75B6; text-decoration: none;">Need to reschedule?</a>
      </p>
      
      <p style="color: #666;">
        If you have any questions, contact us at {{supportPhone}} or {{supportEmail}}
      </p>
      
    </div>
    
  </div>
</body>
</html>
```

---

## 7️⃣ API ENDPOINTS FOR BOOKING FLOW

### Booking Endpoints

```
POST /api/bookings
  Body: {
    packageId, 
    personType (self/family), 
    familyMemberId,
    scheduledDate, 
    scheduledTime,
    addressId,
    newAddress (if creating new)
  }
  Response: { bookingId, status: "pending", ... }

GET /api/users/bookings/{bookingId}
  Response: { booking: {...} }

PUT /api/bookings/{bookingId}/reschedule
  Body: { newDate, newTime }
  
DELETE /api/bookings/{bookingId}
  Body: { reason }

GET /api/collection-centers/available-slots
  Query: ?date=2025-02-01
  Response: { slots: [...] }
```

### Payment Endpoints

```
POST /api/payments/initiate
  Body: { bookingData, amount, paymentMethod }
  Response: { paymentId, redirectUrl }

POST /api/payments/verify
  Body: { paymentId, transactionId }
  Response: { status: "success/failure" }

POST /api/payments/callback
  (Webhook from payment gateway)
```

### Email Trigger Endpoints

```
// Triggered after successful booking:
POST /api/emails/send-booking-confirmation
  Body: { bookingId }
  
// Triggered 24 hours before appointment:
POST /api/emails/send-appointment-reminder
  Body: { bookingId }
  
// Triggered when report ready:
POST /api/emails/send-report-ready
  Body: { reportId }
```

---

## 8️⃣ BOOKING FLOW STATE MANAGEMENT (Redux)

```javascript
// store/bookingSlice.js
const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    currentStep: 'cart', // cart → booking → payment → confirmation
    cartItems: [],
    bookingData: {
      personType: 'self',
      familyMemberId: null,
      scheduledDate: null,
      scheduledTime: null,
      addressId: null,
      newAddress: null
    },
    paymentData: {
      method: 'credit-card',
      amount: 0,
      status: null
    },
    confirmation: {
      bookingId: null,
      confirmationNumber: null,
      createdAt: null
    },
    loading: false,
    error: null
  },
  reducers: {
    addToCart: (state, action) => {
      state.cartItems.push(action.payload);
    },
    setBookingData: (state, action) => {
      state.bookingData = { ...state.bookingData, ...action.payload };
    },
    setPaymentData: (state, action) => {
      state.paymentData = { ...state.paymentData, ...action.payload };
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setConfirmation: (state, action) => {
      state.confirmation = action.payload;
      state.currentStep = 'confirmation';
    }
  }
});
```

---

**All files ready for implementation. Email templates use professional HTML with brand colors. Ready to integrate with SendGrid/AWS SES for real email sending.**

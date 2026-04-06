# 🎨 ALIGNMENT PROMPTS - सभी Components के लिए

## 1️⃣ GLOBAL LAYOUT ALIGNMENT

### HTML Structure (Base)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HealthcareLab</title>
</head>
<body>
  <nav class="navbar"></nav>
  <main class="main-content">
    <section class="hero"></section>
    <section class="content-section"></section>
  </main>
  <footer class="footer"></footer>
</body>
</html>
```

### Global CSS for Alignment
```css
/* Full page alignment */
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Center main container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  flex-direction: column;
}

/* Align items center horizontally */
section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

---

## 2️⃣ NAVIGATION BAR ALIGNMENT

### HTML Structure
```tsx
<nav className="navbar">
  <div className="navbar-container">
    <div className="navbar-logo">
      <span>HEALTHCARELAB</span>
    </div>

    <div className="navbar-search">
      <input type="text" placeholder="Search..." />
    </div>

    <div className="navbar-menu">
      <a href="/">Home</a>
      <a href="/tests">Tests</a>
      <a href="/packages">Packages</a>
      <a href="/cart">Cart(3)</a>
    </div>

    <div className="navbar-actions">
      <button className="btn-login">Login</button>
      <button className="btn-signup">Sign Up</button>
    </div>
  </div>
</nav>
```

### CSS for Navigation Alignment
```css
.navbar {
  width: 100%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: var(--spacing-md) 0;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

/* Logo - Left */
.navbar-logo {
  flex: 0 0 auto;
  color: white;
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  white-space: nowrap;
}

/* Search - Center */
.navbar-search {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
}

.navbar-search input {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: none;
}

/* Menu - Right */
.navbar-menu {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  color: white;
}

.navbar-menu a {
  color: white;
  text-decoration: none;
  font-weight: var(--font-medium);
  transition: all var(--transition-base);
  white-space: nowrap;
}

.navbar-menu a:hover {
  color: var(--color-accent-light);
}

/* Action Buttons - Far Right */
.navbar-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.btn-login, .btn-signup {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  font-weight: var(--font-semibold);
  white-space: nowrap;
}

.btn-login {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-login:hover {
  background: white;
  color: var(--color-primary);
}

.btn-signup {
  background: white;
  color: var(--color-primary);
}

.btn-signup:hover {
  background: var(--color-accent-light);
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .navbar-menu {
    gap: var(--spacing-md);
  }

  .navbar-menu a {
    font-size: var(--font-sm);
  }

  .navbar-search input {
    max-width: 250px;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .navbar-container {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .navbar-logo {
    order: 1;
  }

  .navbar-search {
    order: 3;
    flex-basis: 100%;
    margin-top: var(--spacing-sm);
  }

  .navbar-menu {
    order: 2;
    flex-basis: auto;
  }

  .navbar-actions {
    order: 4;
  }
}
```

---

## 3️⃣ HERO SECTION ALIGNMENT

### HTML Structure
```tsx
<section className="hero">
  <div className="hero-container">
    <div className="hero-content">
      <h1>Your Health Pocket-Sized</h1>
      <p>Track reports in 3D, consult doctors via AR, manage vitality</p>

      <div className="hero-buttons">
        <button className="btn btn-primary">LOCATE ME</button>
        <button className="btn btn-secondary">Learn More</button>
      </div>

      <div className="hero-popular">
        <span>POPULAR:</span>
        <span className="popular-badge">CBC</span>
        <span className="popular-badge">THYROID</span>
        <span className="popular-badge">VITAMIN D</span>
      </div>
    </div>

    <div className="hero-image">
      <img src="hero-image.png" alt="Health visualization" />
    </div>
  </div>
</section>
```

### CSS for Hero Alignment
```css
.hero {
  width: 100%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  padding: var(--spacing-3xl) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  min-height: 500px;
}

.hero-container {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3xl);
  align-items: center;
  margin: 0 auto;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  justify-content: center;
}

.hero-content h1 {
  font-size: var(--font-4xl);
  line-height: 1.2;
  margin: 0;
  color: white;
}

.hero-content p {
  font-size: var(--font-lg);
  margin: 0;
  opacity: 0.95;
}

.hero-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.hero-buttons .btn {
  min-width: 150px;
}

.hero-popular {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.hero-popular span:first-child {
  font-weight: var(--font-bold);
  white-space: nowrap;
}

.popular-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  white-space: nowrap;
}

.hero-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: 100%;
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: var(--spacing-2xl);
  }

  .hero {
    min-height: auto;
    padding: var(--spacing-2xl) var(--spacing-lg);
  }

  .hero-image {
    height: 300px;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .hero {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .hero-content h1 {
    font-size: var(--font-2xl);
  }

  .hero-content p {
    font-size: var(--font-base);
  }

  .hero-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-buttons .btn {
    width: 100%;
    min-width: auto;
  }

  .hero-image {
    height: 250px;
  }
}
```

---

## 4️⃣ TEST CARDS GRID ALIGNMENT

### HTML Structure
```tsx
<section className="tests-section">
  <div className="tests-container">
    <h2>Available Tests</h2>
    <div className="tests-filters">
      <button className="filter-btn active">ALL</button>
      <button className="filter-btn">BLOOD</button>
      <button className="filter-btn">URINE</button>
      <button className="filter-btn">IMAGING</button>
    </div>

    <div className="tests-grid">
      <div className="test-card">
        <div className="test-icon">🩸</div>
        <h3>Complete Blood Count</h3>
        <p>Full blood count test</p>
        <div className="test-price">₹500</div>
        <div className="test-rating">⭐⭐⭐⭐ (234)</div>
        <button className="btn btn-primary">Add to Cart</button>
      </div>
    </div>
  </div>
</section>
```

### CSS for Cards Grid Alignment
```css
.tests-section {
  width: 100%;
  background: var(--color-bg-light);
  padding: var(--spacing-3xl) var(--spacing-lg);
}

.tests-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.tests-container h2 {
  text-align: center;
  margin: 0;
}

.tests-filters {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.filter-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border);
  background: white;
  color: var(--color-text);
  cursor: pointer;
  font-weight: var(--font-semibold);
  transition: all var(--transition-base);
}

.filter-btn:hover,
.filter-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Grid Layout */
.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--spacing-lg);
  width: 100%;
}

.test-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--color-primary);

  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: flex-start;
  transition: all var(--transition-base);
  height: 100%;
}

.test-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-left-color: var(--color-accent);
}

.test-icon {
  font-size: var(--font-3xl);
}

.test-card h3 {
  margin: 0;
  font-size: var(--font-lg);
  color: var(--color-primary);
  line-height: 1.3;
}

.test-card p {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-text-light);
  line-height: 1.4;
}

.test-price {
  color: var(--color-primary);
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  margin-top: auto;
}

.test-rating {
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.test-card .btn {
  width: 100%;
  margin-top: auto;
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .tests-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .tests-section {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .tests-grid {
    grid-template-columns: 1fr;
  }

  .tests-filters {
    gap: var(--spacing-md);
  }

  .tests-section {
    padding: var(--spacing-xl) var(--spacing-md);
  }
}
```

---

## 5️⃣ CART PAGE ALIGNMENT

### HTML Structure
```tsx
<section className="cart-section">
  <div className="cart-container">
    <h1>Shopping Cart</h1>

    <div className="cart-layout">
      {/* Left: Cart Items */}
      <div className="cart-items">
        <div className="cart-item">
          <div className="item-info">
            <h3>Complete Blood Count</h3>
            <p className="item-code">CBC-001</p>
          </div>
          <div className="item-qty">
            <button>-</button>
            <input type="number" value="1" />
            <button>+</button>
          </div>
          <div className="item-price">₹500</div>
          <button className="btn-remove">Remove</button>
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>

        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹1,300</span>
        </div>

        <div className="summary-row discount">
          <span>Discount (20%):</span>
          <span>-₹260</span>
        </div>

        <div className="summary-row">
          <span>Tax (18%):</span>
          <span>+₹187</span>
        </div>

        <div className="summary-total">
          <span>TOTAL:</span>
          <span>₹1,227</span>
        </div>

        <button className="btn btn-primary btn-lg">Proceed to Payment</button>
      </div>
    </div>
  </div>
</section>
```

### CSS for Cart Alignment
```css
.cart-section {
  width: 100%;
  background: var(--color-bg-light);
  padding: var(--spacing-3xl) var(--spacing-lg);
  min-height: 80vh;
}

.cart-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-container h1 {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-2xl);
  align-items: flex-start;
}

/* Cart Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.cart-item {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
  box-shadow: var(--shadow-sm);

  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: var(--spacing-lg);
  align-items: center;
}

.item-info h3 {
  margin: 0;
  font-size: var(--font-lg);
}

.item-code {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.item-qty {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
}

.item-qty button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-lg);
  color: var(--color-primary);
}

.item-qty input {
  width: 40px;
  border: none;
  text-align: center;
  font-weight: var(--font-bold);
}

.item-price {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  text-align: right;
}

.btn-remove {
  background: transparent;
  border: 2px solid var(--color-danger);
  color: var(--color-danger);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-semibold);
}

/* Order Summary */
.order-summary {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);

  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  position: sticky;
  top: 100px;
}

.order-summary h3 {
  margin: 0;
  font-size: var(--font-xl);
  color: var(--color-dark);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: var(--spacing-md);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-base);
}

.summary-row.discount {
  color: var(--color-success);
  font-weight: var(--font-semibold);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-primary-lighter);
  border-radius: var(--radius-md);
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

.order-summary .btn {
  width: 100%;
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }

  .cart-item {
    grid-template-columns: 1fr;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .cart-section {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .cart-item {
    grid-template-columns: 1fr;
  }

  .item-price,
  .btn-remove {
    text-align: left;
  }
}
```

---

## 6️⃣ FOOTER ALIGNMENT

### HTML Structure
```tsx
<footer className="footer">
  <div className="footer-container">
    <div className="footer-section">
      <h4>About Us</h4>
      <ul>
        <li><a href="#">Our Story</a></li>
        <li><a href="#">Team</a></li>
        <li><a href="#">Careers</a></li>
      </ul>
    </div>

    <div className="footer-section">
      <h4>Support</h4>
      <ul>
        <li><a href="#">Help Center</a></li>
        <li><a href="#">Contact Us</a></li>
        <li><a href="#">FAQ</a></li>
      </ul>
    </div>

    <div className="footer-section">
      <h4>Legal</h4>
      <ul>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms & Conditions</a></li>
      </ul>
    </div>

    <div className="footer-section">
      <h4>Follow Us</h4>
      <div className="social-links">
        <a href="#">Facebook</a>
        <a href="#">Twitter</a>
        <a href="#">Instagram</a>
      </div>
    </div>
  </div>

  <div className="footer-bottom">
    <p>&copy; 2026 HealthcareLab. All rights reserved.</p>
  </div>
</footer>
```

### CSS for Footer Alignment
```css
.footer {
  width: 100%;
  background: var(--color-dark);
  color: white;
  margin-top: auto;
}

.footer-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-3xl) var(--spacing-lg);

  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-2xl);
}

.footer-section h4 {
  color: white;
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-lg);
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.footer-section a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all var(--transition-base);
}

.footer-section a:hover {
  color: white;
  padding-left: var(--spacing-sm);
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.footer-bottom {
  background: rgba(0, 0, 0, 0.2);
  padding: var(--spacing-lg);
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom p {
  margin: 0;
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl);
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .footer-container {
    grid-template-columns: 1fr;
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .footer-section {
    text-align: center;
  }

  .footer-section a:hover {
    padding-left: 0;
  }
}
```

---

## 7️⃣ FLEXBOX HELPER CLASSES

```css
/* Flexbox Utilities */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-start {
  display: flex;
  align-items: flex-start;
}

.flex-end {
  display: flex;
  align-items: flex-end;
}

.gap-xs { gap: var(--spacing-xs); }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }
.gap-xl { gap: var(--spacing-xl); }

.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-end { justify-content: flex-end; }

.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }

.w-full { width: 100%; }
.h-full { height: 100%; }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
```

---

## 8️⃣ GRID HELPER CLASSES

```css
/* Grid Utilities */
.grid-auto {
  display: grid;
  gap: var(--spacing-lg);
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.grid-cols-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

/* Responsive Grid */
@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
}
```

---

## ✅ QUICK ALIGNMENT CHECKLIST

```
✓ Navigation: flex, space-between
✓ Hero: grid 2 columns, center align
✓ Cards: grid auto-fill
✓ Cart: grid 2fr 1fr
✓ Footer: grid 4 columns
✓ Mobile: All grid 1fr
✓ Spacing: Use var(--spacing-*)
✓ Flex gaps: Use gap utility
✓ Center: flex-center class
✓ Between: flex-between class
```

---

## 🎯 COPY & PASTE के लिए तैयार!

सभी alignment पहले ही दिए हैं। बस अपने components में copy-paste करो!

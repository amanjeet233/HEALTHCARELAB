# Code Quality Checklist - Before You Commit

Use this checklist before pushing any code to ensure it meets quality standards.

---

## 1. Self-Documenting Code ✓

### Variable Names
- [ ] Can I understand what this variable contains without comments?
- [ ] Are all variable names descriptive (avoiding `data`, `temp`, `value`, `obj`)?
- [ ] Do names use full words (not abbreviations like `usr`, `req`, `res`)?
- [ ] Would a new team member understand this in 30 seconds?

**Example:**
```java
// ❌ Poor
String d;
int v;
Object o;

// ✅ Good
String userEmailAddress;
int retryCount;
Object currentAuthenticatedUser;
```

---

### Method Names
- [ ] Does the method name clearly describe what it does?
- [ ] Can I understand the purpose without reading the implementation?
- [ ] Does it start with a clear action verb (create, validate, calculate, send)?
- [ ] Is the name length acceptable for clarity (30 chars max)?

**Example:**
```java
// ❌ Poor - What does it do?
public void process() { }
public void handle(User u) { }
public void doIt() { }

// ✅ Good - Clear purpose
public void validateUserEmailAndSendVerification() { }
public void calculateAndApplyMonthlyDiscount() { }
public void retryFailedPaymentTransaction() { }
```

---

### Class Names
- [ ] Does the class name describe its responsibility?
- [ ] Is it specific enough (not `Manager`, `Helper`, `Util`)?
- [ ] Would two developers give it the same name?
- [ ] Does it follow noun-based naming (service/repository names)?

**Example:**
```java
// ❌ Poor
class UserUtil { }
class DataProcessor { }
class Manager { }

// ✅ Good
class BookingService { }
class EmailNotificationSender { }
class AuthenticationTokenValidator { }
```

---

### Boolean Variables
- [ ] Do booleans start with `is`, `has`, `can`, or `should`?
- [ ] Can I understand the true/false meaning from the name alone?

**Example:**
```java
// ❌ Poor
boolean active;           // What is active?
boolean status;           // True = success?
boolean verify;           // What to verify?

// ✅ Good
boolean isActive;         // Current state
boolean hasAdminPermission;  // Does it have permission?
boolean canDeleteRecord;  // Can delete?
boolean shouldRetryOnFailure;  // Intent clear
```

---

## 2. Function Size & Single Responsibility ✓

### Function Length
- [ ] Is this function under 20 lines? (Soft limit, not absolute)
- [ ] Could I describe it in one sentence?
- [ ] Does it do ONE thing and do it well?
- [ ] Can I extract complex logic into helper methods?

**Example:**
```java
// ❌ Poor - Too many responsibilities
public void processOrder(Order order) {
    // Validate order (lines 1-5)
    // Calculate taxes (lines 6-10)
    // Apply discounts (lines 11-15)
    // Process payment (lines 16-20)
    // Send email confirmation (lines 21-25)
}

// ✅ Good - Each method has one responsibility
public void processOrder(Order order) {
    validateOrder(order);
    calculateOrderTotals(order);
    processPayment(order);
    sendConfirmationEmail(order);
}

private void validateOrder(Order order) {
    // Only validation logic
}
```

---

## 3. Conditionals & Logic ✓

### Readable Conditions
- [ ] Are conditions easy to read and understand?
- [ ] Have complex conditions been extracted to named methods?
- [ ] Do I use meaningful constants instead of magic numbers?
- [ ] Are negative conditionals avoided where possible?

**Example:**
```java
// ❌ Poor - Hard to read
if (user.role == 1 && order.total > 100 && order.status == 0 && !order.cancelled) {
    applyDiscount();
}

// ✅ Good - Clear intent
if (isUserAdmin() && isOrderEligibleForDiscount(order)) {
    applyDiscount();
}

private boolean isUserAdmin() {
    return user.role == UserRole.ADMIN;
}

private boolean isOrderEligibleForDiscount(Order order) {
    return order.total > MINIMUM_DISCOUNT_THRESHOLD 
        && order.isPending() 
        && !order.isCancelled();
}
```

---

### Null Handling
- [ ] Are nulls checked before use?
- [ ] Are null pointers handled gracefully?
- [ ] Could I use Optional instead of null checks?

**Example:**
```java
// ❌ Poor - NullPointerException risk
User user = userRepository.findById(id);
String email = user.getEmail();  // Crashes if user is null

// ✅ Good - Safe null handling
User user = userRepository.findById(id).orElse(null);
if (user != null) {
    String email = user.getEmail();
}

// ✅ Better - Using Optional
userRepository.findById(id)
    .ifPresent(user -> sendEmail(user.getEmail()));
```

---

## 4. Error Handling ✓

### Exception Messages
- [ ] Are error messages helpful to the user?
- [ ] Do they explain what went wrong?
- [ ] Do they suggest how to fix it?
- [ ] Are they not exposing sensitive information?

**Example:**
```java
// ❌ Poor - Unhelpful message
throw new Exception("Error");
throw new NullPointerException("null");
throw new RuntimeException("Failed");

// ✅ Good - Helpful messages
throw new UserAlreadyExistsException(
    "Email address already registered. Please use a different email or reset your password.");

throw new InvalidCredentialsException(
    "Login failed. Please verify your email and password are correct.");

throw new ResourceNotFoundException(
    "Booking with ID " + bookingId + " not found.");
```

---

### Try-Catch Blocks
- [ ] Am I catching specific exceptions (not generic Exception)?
- [ ] Am I doing something useful in the catch block?
- [ ] Are I re-throwing more meaningful exceptions?

**Example:**
```java
// ❌ Poor - Catches everything, does nothing
try {
    userRepository.save(user);
} catch (Exception e) {
    // Silent failure
}

// ✅ Good - Specific exception handling
try {
    userRepository.save(user);
} catch (DataIntegrityViolationException e) {
    if (e.getMessage().contains("constraint")) {
        throw new UserAlreadyExistsException("Email already in use");
    }
    throw e;
}
```

---

## 5. Testing ✓

### Testability
- [ ] Is this code testable? Can I write unit tests?
- [ ] Are dependencies injected (not hardcoded)?
- [ ] Would tests for this be easy to write?
- [ ] Do I have test cases for edge cases?
- [ ] Am I testing both happy path and error cases?

**Example - Testable Code:**
```java
// ✅ Good - Easy to test
@Service
public class BookingService {
    private final BookingRepository repository;
    private final PaymentService paymentService;
    
    public BookingService(BookingRepository repository, 
                         PaymentService paymentService) {
        this.repository = repository;
        this.paymentService = paymentService;
    }
    
    public Booking createBooking(BookingRequest request) {
        // Can mock repository and paymentService
    }
}

// Test becomes easy
@Test
void testCreateBookingProcessesPayment() {
    // Arrange
    Booking mockBooking = new Booking();
    when(bookingRepository.save(any())).thenReturn(mockBooking);
    
    // Act
    Booking result = bookingService.createBooking(request);
    
    // Assert
    verify(paymentService).processPayment(mockBooking);
    assertNotNull(result);
}
```

---

## 6. Performance ✓

### Database Queries
- [ ] Am I running queries in loops? (N+1 problem)
- [ ] Could I use batch operations?
- [ ] Are there unnecessary queries?
- [ ] Are indexes being used?

**Example:**
```java
// ❌ Poor - N+1 query problem
List<Booking> bookings = bookingRepository.findAll();
for (Booking booking : bookings) {
    User user = userRepository.findById(booking.getUserId());  // Query in loop!
    processBooking(booking, user);
}

// ✅ Good - Single query with join
List<BookingDTO> bookings = bookingRepository.findAllWithUserDetails();
for (BookingDTO booking : bookings) {
    processBooking(booking);
}
```

---

### Memory Usage
- [ ] Am I loading entire datasets unnecessarily?
- [ ] Could I use pagination or streaming?
- [ ] Are I creating unnecessary objects?

---

## 7. Security ✓

### Input Validation
- [ ] Am I validating all user inputs?
- [ ] Are SQL injections prevented (using parameterized queries)?
- [ ] Are XSS attacks prevented?
- [ ] Are file uploads validated?

**Example:**
```java
// ❌ Poor - Vulnerable to SQL injection
String query = "SELECT * FROM users WHERE email = '" + email + "'";

// ✅ Good - Parameterized query
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
```

---

### Sensitive Data
- [ ] Are passwords encrypted/hashed?
- [ ] Are PII fields not logged?
- [ ] Are API keys/secrets not hardcoded?
- [ ] Are error messages not exposing internals?

---

## 8. Code Comments ✓

### When to Comment
- [ ] Is this a complex algorithm that needs explanation?
- [ ] Is there a business rule that isn't obvious?
- [ ] Are there performance considerations to note?

**Good Comments Explain:**
- WHY (not WHAT)
- Business context
- Non-obvious workarounds
- References to bug tickets or requirements

**Example:**
```java
// ❌ Poor - States the obvious
count++;  // Increment count

// ✅ Good - Explains why
// User eligible for referral bonus only in first 30 days
// to prevent gaming the system. See ticket PROJ-1234
if (daysSinceSignup <= 30) {
    applyReferralBonus(user);
}
```

---

### When NOT to Comment
- If the code is self-explanatory, don't add comments
- If the name is clear, don't add comments
- Don't comment out old code (use git history)

---

## 9. Consistency ✓

### Code Style
- [ ] Does my code follow project conventions?
- [ ] Is indentation consistent (4 spaces or tabs)?
- [ ] Are naming conventions consistent?
- [ ] Are class/method organization consistent?

### Import Statements
- [ ] Are imports organized and clean?
- [ ] Are wildcard imports avoided?
- [ ] Are unused imports removed?

---

## 10. Documentation ✓

### JavaDoc
- [ ] Public methods have JavaDoc?
- [ ] Complex logic explained in JavaDoc?
- [ ] Parameters and return values documented?

**Example:**
```java
/**
 * Validates user input and sends verification email.
 * 
 * @param email the email address to validate and verify
 * @return true if email was valid and notification sent, false otherwise
 * @throws InvalidEmailFormatException if email format is invalid
 * @throws EmailServiceException if notification service fails
 */
public boolean validateAndVerifyEmail(String email) {
    // Implementation
}
```

---

## Quick Checklist (Before Commit)

Run through these quickly:

- [ ] **Naming:** Variables/methods/classes have clear, descriptive names
- [ ] **Size:** Functions < 20 lines, files < 400 lines
- [ ] **Logic:** Conditionals are readable, no deep nesting
- [ ] **Testing:** Code is testable, dependencies injected
- [ ] **Errors:** Exceptions are specific and informative
- [ ] **Security:** Input validated, no hardcoded secrets
- [ ] **Performance:** No N+1 queries, efficient algorithms
- [ ] **Comments:** Only where necessary, explain WHY
- [ ] **Style:** Follows project conventions
- [ ] **Documentation:** Important methods have JavaDoc

---

## Code Review Reminders

When reviewing others' code:
1. Be kind - assume positive intent
2. Focus on code, not person
3. Ask why if something seems wrong
4. Praise good decisions
5. Suggest improvements, not demands

---

**Last Updated:** February 20, 2026  
**Version:** 1.0  
**Status:** Standard for Project

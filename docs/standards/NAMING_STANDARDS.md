# Naming Conventions for Human-First Code

## Overview
This document establishes naming standards that make code self-documenting and easier for human developers to understand at a glance.

## Variables & Fields

### ❌ Avoid (Poor):
```java
String data;              // What data? Where does it come from?
Object value;             // Vague - could be anything
String temp;              // Temporary? For what?
User obj;                 // Not descriptive
UserDTO dto;              // Acronym instead of meaning
HttpServletRequest req;   // Abbreviation
HttpServletResponse res;  // Abbreviation
```

### ✅ Use (Good):
```java
String userEmailAddress;           // Clear what it contains
BigDecimal invoiceTotal;           // Obvious purpose and type
String temporaryAuthenticationCode; // Context-specific
User currentAuthenticatedUser;     // Self-explanatory
AuthenticationRequest request;     // Full word, clear meaning
```

---

## Methods/Functions

### ❌ Avoid (Poor):
```java
public void process() { }          // Process what?
public void handle() { }           // Handle what?
public void doWork() { }           // What kind of work?
public void execute() { }          // Execute what?
public void init() { }             // Initialize what?
```

### ✅ Use (Good):
```java
public void calculateAndApplyDiscountToInvoice() { }
public void validateUserInputAndSanitize() { }
public void sendEmailNotificationToUser() { }
public void retryFailedPaymentTransaction() { }
public void synchronizeInventoryWithWarehouse() { }
```

---

## Boolean Variables

### ❌ Avoid (Poor):
```java
boolean flag;              // Flag for what?
boolean status;            // What status? True = success?
boolean check;             // Check what?
boolean valid;             // Result-based, not state-based
```

### ✅ Use (Good):
```java
boolean isActive;                  // Current state (is it active?)
boolean hasAdminPermission;        // Does it have permission?
boolean canDeleteRecord;           // Can it be deleted?
boolean isEmailVerified;           // State of email verification
boolean shouldRetryOnFailure;      // Intent of the check
boolean isFirstTimeUser;           // First time or returning?
```

---

## Classes

### ❌ Avoid (Poor):
```
UserManager.java        // Too vague - what does it manage?
SystemUtil.java         // Utilities for what system aspect?
CommonHelper.java       // Helper for what?
GenericService.java     // Service for what?
DataProcessor.java      // Process what kind of data?
```

### ✅ Use (Good):
```
BookingService.java                 // Clear responsibility
EmailNotificationSender.java        // Specific action
AuthenticationTokenValidator.java   // What it validates
UserRepositoryJPA.java              // Implementation detail visible
PaymentProcessingOrchestrator.java  // Coordinates payment process
```

---

## Database Columns

### ❌ Avoid (Poor):
```sql
col1           -- What is this?
attr           -- What attribute?
status         -- What status?
data           -- What data?
field1         -- Which field?
```

### ✅ Use (Good):
```sql
created_at               -- When was it created?
is_active                -- Boolean: is it active?
payment_status           -- What payment status?
user_email               -- User's email field
last_login_timestamp     -- When did they last login?
retry_count              -- How many retries?
```

---

## Enums

### ❌ Avoid (Poor):
```java
enum Status { A, B, C }                    // What do A, B, C mean?
enum Type { TYPE_1, TYPE_2, TYPE_3 }      // Meaningless
```

### ✅ Use (Good):
```java
enum PaymentStatus { 
    PENDING, 
    COMPLETED, 
    FAILED, 
    REFUNDED 
}

enum UserRole {
    PATIENT,
    TECHNICIAN,
    MEDICAL_OFFICER,
    ADMIN
}
```

---

## Constants

### ❌ Avoid (Poor):
```java
private static final int MAX = 100;              // Max what?
private static final String API_KEY = "test";   // Which API?
private static final long TIMEOUT = 5000;       // Timeout for what?
```

### ✅ Use (Good):
```java
private static final int MAXIMUM_LOGIN_ATTEMPTS = 5;
private static final String OAUTH_GOOGLE_API_KEY = "test";
private static final long HTTP_REQUEST_TIMEOUT_MILLISECONDS = 5000;
private static final String EMAIL_VERIFICATION_TOKEN_PREFIX = "email_verify_";
```

---

## Package Names

### ✅ Proper Convention:
```
com.healthcare.labtestbooking.controller   -- HTTP handlers
com.healthcare.labtestbooking.service      -- Business logic
com.healthcare.labtestbooking.repository   -- Data access
com.healthcare.labtestbooking.security     -- Auth/security
com.healthcare.labtestbooking.entity       -- JPA entities
com.healthcare.labtestbooking.dto          -- Transfer objects
com.healthcare.labtestbooking.exception    -- Custom exceptions
com.healthcare.labtestbooking.config       -- Configuration
```

---

## Naming Checklist

Before committing code, verify:

- [ ] Can I read the variable name out loud and understand its purpose?
- [ ] Does the method name start with a verb (create, validate, calculate, send)?
- [ ] Are booleans prefaced with "is", "has", "can", or "should"?
- [ ] Do class names describe their primary responsibility?
- [ ] Would a new developer understand this without comments?
- [ ] Is it longer but clearer rather than shorter but vague?
- [ ] No acronyms unless they're universally known (HTTP, JWT, API)?

---

## Examples - Before & After

### Example 1: Variable Declaration
**Before:**
```java
String s = user.getVal();
if (s != null) {
    processData(s);
}
```

**After:**
```java
String userEmailAddress = user.getEmailAddress();
if (userEmailAddress != null) {
    sendVerificationEmailToUser(userEmailAddress);
}
```

### Example 2: Method Parameter
**Before:**
```java
public void process(Object obj, String str) {
    // 10 lines of confusion
}
```

**After:**
```java
public void validateAndSaveUserRegistration(User newUser, String verificationToken) {
    // Clear intent from method signature
}
```

### Example 3: Class Structure
**Before:**
```java
public class UserUtil {
    public static boolean check(User u) {
        return u.getStatus() == 1;
    }
}
```

**After:**
```java
public class UserActivationValidator {
    public boolean isUserActiveAndVerified(User user) {
        return user.isActive() && user.isEmailVerified();
    }
}
```

---

## Benefits

✅ **Improved Readability** - Code is easier to understand  
✅ **Reduced Maintenance** - Less time deciphering variable names  
✅ **Better Onboarding** - New team members productive faster  
✅ **Fewer Bugs** - Self-documenting code catches errors early  
✅ **Easier Debugging** - Clear names make stack traces helpful  
✅ **Consistent Style** - Team follows same conventions  

---

## References

- Robert C. Martin's "Clean Code" - Chapter 2: Meaningful Names
- Google's Java Style Guide - Section on Naming Conventions
- Microsoft's C# Coding Conventions - Naming Guidelines

---

**Last Updated:** February 20, 2026  
**Version:** 1.0  
**Status:** Official Standard for Project

# Developer Quick Reference - Healthcare Lab Test Booking API

## 🚀 Quick Links to Standards

| Standard | Location | Purpose |
|----------|----------|---------|
| **Naming Conventions** | [NAMING_STANDARDS.md](NAMING_STANDARDS.md) | How to name variables, methods, classes, databases |
| **Code Structure** | [PACKAGE_STRUCTURE.md](PACKAGE_STRUCTURE.md) | Where code belongs, layer responsibilities |
| **Quality Checklist** | [CODE_QUALITY_CHECKLIST.md](CODE_QUALITY_CHECKLIST.md) | Before-commit verification (5 min) |
| **Configuration** | [application-properties-template.md](application-properties-template.md) | How to organize application.properties |
| **Refactoring Guide** | [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) | Complete overview of all improvements |

---

## 📝 Naming Quick Reference

### Variables
```java
// String - describe what it contains
String userEmailAddress;              // ✅ Good
String userPassword;                  // ✅ Good
String data;                          // ❌ Avoid

// Numbers - include what you're counting
int retryAttemptCount;                // ✅ Good
int maximumLoginAttempts;             // ✅ Good
int val;                              // ❌ Avoid

// Booleans - use is/has/can/should
boolean isActive;                     // ✅ Good
boolean hasAdminPermission;           // ✅ Good
boolean canDeleteBooking;             // ✅ Good
boolean active;                       // ❌ Avoid
```

### Methods
```java
// Action verb + what it does
public void validateUserEmailAndSendVerification() { }  // ✅ Good
public Booking calculateAndSaveBookingCost() { }        // ✅ Good
public void process() { }                               // ❌ Avoid
public void handle() { }                                // ❌ Avoid
```

### Classes
```java
// Specific business term (no Manager, Util, Helper)
class BookingService { }                // ✅ Good
class EmailNotificationSender { }       // ✅ Good
class BookingValidator { }              // ✅ Good
class UserManager { }                   // ❌ Avoid
class DataProcessor { }                 // ❌ Avoid
```

### Database Columns
```sql
created_at            -- ✅ Timestamp
updated_at            -- ✅ Timestamp
is_active             -- ✅ Boolean
payment_status        -- ✅ Status
col1                  -- ❌ Avoid
attr                  -- ❌ Avoid
```

---

## 🏗️ Package Structure Quick Reference

```
com.healthcare.labtestbooking/
├── controller/          ← HTTP handlers (max 15 lines/method)
├── service/             ← Business logic (max 30 lines/method)
├── repository/          ← Data access (JpaRepository)
├── entity/              ← JPA models
├── dto/                 ← API request/response validation
├── security/            ← JWT, authentication
├── config/              ← Spring configuration
├── exception/           ← Custom exceptions
├── filter/              ← Request filters
├── aspect/              ← AOP cross-cutting concerns
└── util/                ← Shared utilities
```

### Layer Communication
```
Controller    Service    Repository
    ↓            ↓           ↓
   HTTP    Business Logic   Database
   
✅ ALLOWED: Controller → Service → Repository
❌ FORBIDDEN: Controller → Repository (skip Service)
❌ FORBIDDEN: Repository → Repository (no chaining)
```

---

## ✅ Pre-Commit Checklist (5 Minutes)

Run this before every `git commit`:

```
☐ Method names describe what they do (verb + action)
☐ Variable names are descriptive (no data, temp, value, obj)
☐ No functions longer than 20 lines
☐ Boolean variables start with is/has/can/should
☐ No null pointers (checked or used Optional)
☐ Specific exception handling (not generic Exception)
☐ Comments explain WHY not WHAT
☐ No hardcoded secrets or API keys
☐ No N+1 database queries
☐ Following PACKAGE_STRUCTURE.md layer organization
```

---

## 🔐 Security Checklist

```
☐ All user input validated (@Valid, manual checks)
☐ Using parameterized queries (no SQL injection)
☐ Passwords hashed with BCryptPasswordEncoder
☐ JWT tokens only in Authorization header
☐ Sensitive data not logged (passwords, PII)
☐ Error messages don't expose internals
☐ No hardcoded database credentials
☐ CORS configured properly (8 origins max)
```

---

## 🧪 Testing Quick Reference

### What to Test
```java
// Test happy path (normal flow)
@Test
void testCreateBookingWithValidData() { }

// Test unhappy path (errors)
@Test
void testCreateBookingThrowsExceptionForInvalidDate() { }

// Test edge cases (boundaries)
@Test
void testCreateBookingWith6CharacterPassword() { }  // Our minimum
```

### Test Types
```
WebMvcTest       ← Test Controllers (@MockMvc)
ExtendWith       ← Test Services (mock dependencies)
DataJpaTest      ← Test Repositories (real database)
SpringBootTest   ← Integration tests (full context)
```

---

## 📊 Health Check Endpoints

After deployment, verify these endpoints return 200:

```bash
# Simple check (load balancer)
curl http://localhost:8080/api/health/live
# → {"status": "UP", "timestamp": "..."}

# Detailed check (monitoring)
curl http://localhost:8080/api/health
# → {"status": "UP", "version": "1.0.0", ...}

# Public check (CI/CD pipelines)
curl http://localhost:8080/api/health/public
# → {"message": "Service is available"}
```

---

## 🔧 Common Tasks

### Add New Endpoint
1. Read [PACKAGE_STRUCTURE.md](PACKAGE_STRUCTURE.md) → Controller section
2. Create Controller method (max 15 lines)
3. Call Service method (max 30 lines)
4. Use DTO for request/response
5. Add error handling (specific exceptions)
6. Document with JavaDoc and Swagger annotations
7. Write tests (WebMvcTest + unit tests)
8. Use [CODE_QUALITY_CHECKLIST.md](CODE_QUALITY_CHECKLIST.md) before commit

### Fix Bug in Service
1. Write test that reproduces bug
2. Fix business logic in Service
3. Check if Repository query correct
4. Verify no side effects
5. Run all tests
6. Update changelog

### Refactor Existing Code
1. Keep original behavior (test-drive changes)
2. Use small, reviewable commits
3. Update naming per [NAMING_STANDARDS.md](NAMING_STANDARDS.md)
4. Follow [PACKAGE_STRUCTURE.md](PACKAGE_STRUCTURE.md) patterns
5. Verify [CODE_QUALITY_CHECKLIST.md](CODE_QUALITY_CHECKLIST.md)
6. Document WHY in commit message

---

## 🐛 Debugging Tips

### Check Application Database Connection
```bash
# Application logs should show:
# ✓ HikariPool initialized
# ✓ CategoryInitializer started
# ✓ 8 test categories loaded
```

### Test JWT Authentication
```bash
# 1. Login to get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"password123"}'

# 2. Use token in Authorization header
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Should return 200 with user profile
```

### Database Check
```sql
-- Check test categories (8 should exist)
SELECT COUNT(*) FROM test_categories;

-- Check test users (3 should exist)
SELECT COUNT(*) FROM users;

-- Check recent bookings
SELECT * FROM bookings ORDER BY created_date DESC LIMIT 5;
```

---

## 📈 Performance Tips

### Avoid N+1 Queries
```java
// ❌ BAD - Loop loads user for each booking
List<Booking> bookings = bookingRepository.findAll();
for (Booking b : bookings) {
    User user = userRepository.findById(b.getUserId());  // Query in loop!
}

// ✅ GOOD - Join fetch in single query
List<Booking> bookings = bookingRepository.findAllWithUserEager();
```

### Use Pagination for Large Lists
```java
// ❌ BAD - Load all 10,000 bookings into memory
List<Booking> all = bookingRepository.findAll();

// ✅ GOOD - Load 20 at a time
Page<Booking> page = bookingRepository.findAll(PageRequest.of(0, 20));
```

### Cache Repeated Queries
```java
// ✅ Use @Cacheable for read-heavy data
@Cacheable("testCategories")
public List<TestCategory> getAllCategories() {
    return testCategoryRepository.findAll();
}
```

---

## 🚫 Anti-Patterns to Avoid

### 1. God Class (Does Too Much)
```java
// ❌ BAD
class UserManager {
    public void validateUser() { }
    public void sendEmail() { }
    public void saveToDatabase() { }
    public void generateReport() { }  // Too many responsibilities!
}

// ✅ GOOD - Separate concerns
class UserValidator { public void validate() { } }
class EmailService { public void send() { } }
class UserRepository { public void save() { } }
class ReportGenerator { public void generate() { } }
```

### 2. Service Locator (Poor Dependency Injection)
```java
// ❌ BAD - Hard to test, hidden dependencies
class BookingService {
    public void createBooking() {
        UserRepository repo = ServiceLocator.getRepository();  // Hidden!
    }
}

// ✅ GOOD - Inject dependencies
@Service
class BookingService {
    private final UserRepository userRepository;
    
    public BookingService(UserRepository userRepository) {
        this.userRepository = userRepository;  // Clear dependency
    }
}
```

### 3. Tight Coupling
```java
// ❌ BAD - Creates new instances (can't test)
class BookingService {
    public void create(Booking booking) {
        EmailService email = new EmailService();  // Hard to test!
        email.send(booking);
    }
}

// ✅ GOOD - Inject dependency
@Service
class BookingService {
    private final EmailService emailService;  // Can mock in tests
    
    @Autowired
    BookingService(EmailService emailService) {
        this.emailService = emailService;
    }
}
```

---

## 📚 Learning Resources

- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) - Robert C. Martin
- [Spring Boot Best Practices](https://spring.io/guides)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- [JWT.io Documentation](https://jwt.io/)

---

## 🤝 Code Review Tips

### When Reviewing Others' Code
✅ Be kind (assume positive intent)  
✅ Focus on code, not person  
✅ Ask "why?" if something is unclear  
✅ Praise good design decisions  
✅ Suggest improvements, not demands  
✅ Reference standards (link to these docs)  

### When Code is Reviewed
✅ Listen to feedback  
✅ Explain your reasoning  
✅ Make suggested improvements  
✅ Ask for clarification if confused  
✅ Thank reviewers for their time  

---

## 🆘 Getting Help

**Questions about standards?**  
→ Check [NAMING_STANDARDS.md](NAMING_STANDARDS.md), [PACKAGE_STRUCTURE.md](PACKAGE_STRUCTURE.md)

**Need code example?**  
→ See [JwtTokenProvider.java.improved](JwtTokenProvider.java.improved) or [HealthController.java](src/main/java/com/healthcare/labtestbooking/controller/HealthController.java)

**Need architecture guidance?**  
→ Read [PACKAGE_STRUCTURE.md](PACKAGE_STRUCTURE.md) layers section

**Code quality issues?**  
→ Use [CODE_QUALITY_CHECKLIST.md](CODE_QUALITY_CHECKLIST.md) before commit

**Configuration help?**  
→ See [application-properties-template.md](application-properties-template.md)

---

**Last Updated:** February 20, 2026  
**Status:** ✅ Current  
**Version:** 1.0

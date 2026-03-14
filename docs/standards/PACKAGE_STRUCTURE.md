# Clean Package Structure - Human-First Organization

## Directory Structure Overview

```
src/main/java/com/healthcare/labtestbooking/
│
├── controller/              # HTTP Endpoint Handlers
│   ├── AuthController.java
│   ├── BookingController.java
│   ├── UserController.java
│   └── HealthController.java
│
├── service/                 # Business Logic Layer
│   ├── BookingService.java
│   ├── AuthenticationService.java
│   ├── EmailNotificationService.java
│   └── ReportGenerationService.java
│
├── repository/              # Data Access Layer
│   ├── UserRepository.java
│   ├── BookingRepository.java
│   └── TestCategoryRepository.java
│
├── entity/                  # JPA Entity Models
│   ├── User.java
│   ├── Booking.java
│   ├── TestCategory.java
│   └── enums/
│       ├── UserRole.java
│       ├── BookingStatus.java
│       └── PaymentStatus.java
│
├── dto/                     # Data Transfer Objects (API Contracts)
│   ├── request/
│   │   ├── RegisterRequest.java
│   │   ├── BookingRequest.java
│   │   └── PaymentRequest.java
│   └── response/
│       ├── UserResponse.java
│       ├── BookingResponse.java
│       └── ApiResponse.java
│
├── security/                # Authentication & Authorization
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   ├── UserDetailsServiceImpl.java
│   └── JwtAuthenticationEntryPoint.java
│
├── config/                  # Configuration Classes
│   ├── SecurityConfig.java
│   ├── CategoryInitializer.java
│   ├── DataInitializer.java
│   └── CacheConfig.java
│
├── filter/                  # Request/Response Filters
│   ├── RateLimitingFilter.java
│   └── LoggingFilter.java
│
├── exception/               # Custom Exceptions & Global Error Handling
│   ├── GlobalExceptionHandler.java
│   ├── UserAlreadyExistsException.java
│   ├── InvalidCredentialsException.java
│   └── ResourceNotFoundException.java
│
├── util/ (Use Sparingly)    # Truly Reusable Utilities
│   └── DateTimeUtility.java
│
└── LabTestBookingApplication.java  # Main Application Entry Point
```

---

## Layer Responsibilities

### 1. Controller Layer
**Responsibility:** HTTP request/response handling  
**Should Contain:**
- Route mapping (`@GetMapping`, `@PostMapping`)
- Parameter validation (via Spring validation)
- Response formatting (HTTP status codes)
- Error mapping to HTTP responses

**Should NOT Contain:**
- Business logic
- Database queries
- Complex calculations

**Example:**
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        User user = userService.findUserById(userId);  // Delegate to service
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }
}
```

---

### 2. Service Layer
**Responsibility:** Business logic implementation  
**Should Contain:**
- Use case implementation
- Business rule validation
- Orchestration of repositories
- Transaction management
- Business calculations

**Should NOT Contain:**
- HTTP concerns
- Database queries (use repository)
- Framework-specific code

**Example:**
```java
@Service
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final SlotService slotService;
    private final PaymentService paymentService;
    
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        // Business logic: validate slot availability
        Slot availableSlot = slotService.findAvailableSlot(request.getTestId());
        
        if (availableSlot == null) {
            throw new SlotNotAvailableException("No slots available");
        }
        
        // Create booking using repository
        Booking booking = new Booking();
        booking.setSlot(availableSlot);
        booking.setStatus(BookingStatus.PENDING);
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Trigger payment if needed
        if (request.isPaymentRequired()) {
            paymentService.initiatePayment(savedBooking);
        }
        
        return BookingResponse.fromEntity(savedBooking);
    }
}
```

---

### 3. Repository Layer
**Responsibility:** Data access abstraction  
**Should Contain:**
- Database query methods
- Query customization (sorting, filtering)
- Custom finder methods
- Data access logic

**Should NOT Contain:**
- Business logic
- Multiple entity types (one repo per entity)
- HTTP or service concerns

**Example:**
```java
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserIdAndBookingDateBetween(
        Long userId, 
        LocalDate startDate, 
        LocalDate endDate
    );
    
    List<Booking> findByStatusAndCreatedAtBefore(
        BookingStatus status, 
        LocalDateTime dateTime
    );
    
    Optional<Booking> findByIdAndUserId(Long bookingId, Long userId);
}
```

---

### 4. Entity Layer
**Responsibility:** JPA entity definitions  
**Should Contain:**
- Database column mappings
- Relationships (OneToMany, ManyToOne)
- Entity validation (minimal)
- Basic getters/setters

**Should NOT Contain:**
- Business logic
- HTTP concerns
- External service calls

---

### 5. DTO Layer
**Responsibility:** API contract definition  
**Should Contain:**
- Request/Response field definitions
- Validation annotations
- Transformation methods (toEntity, fromEntity)
- API-specific fields (not all entity fields exposed)

**Should NOT Contain:**
- Business logic
- Database concerns
- Entity relationships

**Example:**
```java
@Data
@NoArgsConstructor
public class BookingResponse {
    private Long bookingId;
    private String testName;
    private LocalDate appointmentDate;
    private BookingStatus status;
    
    // Transform from entity to response
    public static BookingResponse fromEntity(Booking booking) {
        return BookingResponse.builder()
            .bookingId(booking.getId())
            .testName(booking.getSlot().getTest().getTestName())
            .appointmentDate(booking.getSlot().getSlotDate())
            .status(booking.getStatus())
            .build();
    }
}
```

---

### 6. Security Layer
**Responsibility:** Authentication & authorization  
**Should Contain:**
- JWT token generation/validation
- User details loading
- Authentication filters
- Security exception handling

**Should NOT Contain:**
- Business logic
- Database queries (except loading user details)

---

### 7. Config Layer
**Responsibility:** Application configuration  
**Should Contain:**
- Spring bean definitions
- Security configurations
- Data initialization
- Third-party service setup

**Should NOT Contain:**
- Business logic
- New technical concerns

---

### 8. Exception Layer
**Responsibility:** Error handling & custom exceptions  
**Should Contain:**
- Custom exception classes
- Global exception handler
- Error response formatting

**Example:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleUserAlreadyExists(
        UserAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiResponse.error("User with email already exists"));
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
        ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("Resource not found"));
    }
}
```

---

## Layering Principles

### ✅ DO:
1. **Keep layers thin** - Controllers max 15 lines, Services focused on one use case
2. **One responsibility per class** - Max 300-400 lines of code
3. **Dependency injection** - Never instantiate dependencies manually
4. **Data validation** - Validate at entry point (Controller with DTOs)
5. **Logging at appropriate levels** - Service level for business logic
6. **Service composition** - Services call other services as needed

### ❌ DON'T:
1. **Skip layers** - Don't call repository from controller
2. **Share business logic** - Don't duplicate logic across services
3. **Mix concerns** - Service shouldn't know about HTTP
4. **Create God classes** - One class doing too much
5. **Use static methods excessively** - Prefer instance methods for DI
6. **Expose entities in API** - Always use DTOs for responses

---

## Communication Between Layers

### Controller → Service
```java
// Controller calls service
BookingResponse response = bookingService.createBooking(bookingRequest);
return ResponseEntity.ok(response);
```

### Service → Repository
```java
// Service uses repository to access data
Booking savedBooking = bookingRepository.save(booking);
```

### Service → Service
```java
// Service can call other services for orchestration
if (paymentService.initiatePayment(booking)) {
    bookingService.confirmBooking(booking);
}
```

### NO Direct Calls:
```java
// ❌ WRONG: Controller calling repository directly
Booking booking = bookingRepository.findById(id);  // Skips service layer

// ❌ WRONG: Repository accessing external services
emailService.sendConfirmation();  // Repositories should only do data access

// ❌ WRONG: Entity with business logic
booking.processPayment();  // Entities should be dumb data containers
```

---

## Testing Strategy by Layer

### Controller Tests
```java
@WebMvcTest(BookingController.class)
void testCreateBookingReturnsCreatedStatus() {
    // Mock the service layer
    // Test only HTTP concerns
}
```

### Service Tests
```java
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    // Mock repositories
    // Test business logic in isolation
}
```

### Repository Tests
```java
@DataJpaTest
class BookingRepositoryTest {
    // Test database queries
    // Use TestContainer or H2 for testing
}
```

---

## Benefits of This Structure

✅ **Easy to Navigate** - Know exactly where to find code  
✅ **Clear Responsibilities** - Each class has one job  
✅ **Testable** - Each layer can be tested independently  
✅ **Scalable** - Easy to add new features  
✅ **Maintainable** - Changes isolated to correct layer  
✅ **Consistent** - Team follows same patterns  

---

## Anti-Patterns to Avoid

### ❌ God Class (Uber Service)
```java
@Service
public class SystemService {
    public void doEverything() { }     // 5000+ lines
}
```

### ❌ Anemic Data Model
```java
// Entity with NO business logic, all logic in service
@Entity
public class Order {
    private BigDecimal total;
    // No methods, just getters/setters
}
```

### ❌ Service Locator Pattern
```java
// Finding dependencies at runtime
Service service = ServiceLocator.getService(BookingService.class);
```

### ❌ Tight Coupling
```java
// Direct instantiation instead of DI
public class BookingService {
    private UserRepository userRepository = new UserRepositoryImpl();
}
```

---

**Last Updated:** February 20, 2026  
**Version:** 1.0  
**Status:** Standard Architecture for Project

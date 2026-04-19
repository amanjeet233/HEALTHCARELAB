# VIVA 1: Java Annotations Audit Report
**Project:** HEALTHCARELAB Backend  
**Generated:** April 17, 2026  
**Purpose:** Comprehensive explanation of every Java annotation used in the codebase

---

## Table of Contents
- [Spring Core Annotations](#spring-core-annotations)
- [Spring Security Annotations](#spring-security-annotations)
- [Spring Data / JPA Annotations](#spring-data--jpa-annotations)
- [Lombok Annotations](#lombok-annotations)
- [Validation Annotations](#validation-annotations)
- [Swagger / OpenAPI Annotations](#swagger--openapi-annotations)
- [JPA Lifecycle Annotations](#jpa-lifecycle-annotations)

---

# Spring Core Annotations

## @SpringBootApplication
**Package:** `org.springframework.boot.autoconfigure.SpringBootApplication`  
**Type:** Class-level  
**Why used in this project:** Marks `LabTestBookingApplication.java` as the main Spring Boot application entry point. It combines `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan` in one annotation.  
**What if removed:** Spring Boot would not recognize this as a bootable application. The application would fail to start with no context configuration.  
**Real-life analogy:** Like the main() method in a traditional Java program - the starting point of the entire application.  
**Used in files:** `LabTestBookingApplication.java` line 12  
**Code example from project:**
```java
@SpringBootApplication
public class LabTestBookingApplication {
    public static void main(String[] args) {
        SpringApplication.run(LabTestBookingApplication.class, args);
    }
}
```
**Viva answer:** If asked "why only one @SpringBootApplication?"  
→ Spring Boot requires exactly one main application class with this annotation to bootstrap the entire context. Multiple would cause context loading conflicts.

---

## @RestController
**Package:** `org.springframework.web.bind.annotation.RestController`  
**Type:** Class-level  
**Why used in this project:** Marks a class as a REST controller. Combines `@Controller` and `@ResponseBody` - every method automatically returns JSON/XML instead of view names. Used on all 50+ controllers like `BookingController`, `UserController`, etc.  
**What if removed:** You would need to add `@ResponseBody` to every method manually, or Spring would try to resolve view names and return 404 errors.  
**Real-life analogy:** A waiter who automatically serves food instead of taking orders to the kitchen and waiting for response.  
**Used in files:** `BookingController.java` line 29, `UserController.java` line 23, `AuthController.java` line 22  
**Code example from project:**
```java
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        // Automatically returns JSON
    }
}
```
**Viva answer:** If asked "why not @Controller?"  
→ @Controller is for traditional MVC returning views (HTML pages). @RestController is for APIs returning JSON directly. Since this is a backend API serving a React frontend, @RestController is the correct choice.

---

## @RequestMapping
**Package:** `org.springframework.web.bind.annotation.RequestMapping`  
**Type:** Class-level / Method-level  
**Why used in this project:** Defines the base URL path for all endpoints in a controller. Used at class level to avoid repeating the path on every method. Also used method-level for mapping multiple HTTP methods to one endpoint.  
**What if removed:** You would need to specify the full path on every method, leading to code duplication.  
**Real-life analogy:** Like a department prefix in a phone system - all extensions in "Sales" start with "2000".  
**Used in files:** `BookingController.java` line 30, `UserController.java` line 24, `BookingController.java` line 208 (method-level)  
**Code example from project:**
```java
@RequestMapping("/api/bookings")
public class BookingController {
    // Method-level for legacy route support
    @RequestMapping(value = { "/{id}/cancel", "/cancel/{id}" }, 
                    method = { RequestMethod.PUT, RequestMethod.POST })
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        // Maps both PUT /api/bookings/123/cancel and POST /api/bookings/cancel/123
    }
}
```
**Viva answer:** If asked "why at class level vs method level?"  
→ Class-level defines the common prefix for all methods in that controller. Method-level is used when you need to map multiple HTTP methods or paths to a single method (like supporting both PUT and POST for cancellation).

---

## @GetMapping
**Package:** `org.springframework.web.bind.annotation.GetMapping`  
**Type:** Method-level  
**Why used in this project:** Maps HTTP GET requests to handler methods. Used for retrieving data (fetching bookings, getting user profile, listing tests).  
**What if removed:** The endpoint would not respond to GET requests, resulting in 405 Method Not Allowed errors.  
**Real-life analogy:** A read-only operation - like browsing a catalog without buying anything.  
**Used in files:** `BookingController.java` line 50, `UserController.java` line 32, `LabTestController.java` line 39  
**Code example from project:**
```java
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
    return ResponseEntity.ok(bookingService.getBookingById(id));
}
```
**Viva answer:** If asked "why use @GetMapping instead of @RequestMapping(method=GET)?"  
→ @GetMapping is a shortcut annotation that's more readable and type-safe. It's the Spring 4.3+ recommended way for HTTP method-specific mappings.

---

## @PostMapping
**Package:** `org.springframework.web.bind.annotation.PostMapping`  
**Type:** Method-level  
**Why used in this project:** Maps HTTP POST requests to handler methods. Used for creating resources (booking a test, registering user, adding to cart).  
**What if removed:** The endpoint would not accept POST requests, clients would get 405 errors when trying to create data.  
**Real-life analogy:** Submitting a form to create a new record in a database.  
**Used in files:** `BookingController.java` line 47, `AuthController.java` line 42, `CartController.java` line 59  
**Code example from project:**
```java
@PostMapping
public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
    return ResponseEntity.ok(bookingService.createBooking(request));
}
```
**Viva answer:** If asked "POST vs PUT for creation?"  
→ POST is used for creation where the server generates the ID. PUT is used for updates where the client specifies the resource ID. Since booking IDs are auto-generated by the database, POST is correct.

---

## @PutMapping
**Package:** `org.springframework.web.bind.annotation.PutMapping`  
**Type:** Method-level  
**Why used in this project:** Maps HTTP PUT requests for updating resources. Used for full updates (updating profile, rescheduling booking).  
**What if removed:** Update endpoints would not work, clients would get 405 errors.  
**Real-life analogy:** Replacing an entire file with a new version.  
**Used in files:** `UserController.java` line 44, `BookingController.java` line 59, `LabTestPricingController.java` line 43  
**Code example from project:**
```java
@PutMapping("/profile")
public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody UserResponse request) {
    return ResponseEntity.ok(userService.updateProfile(request));
}
```
**Viva answer:** If asked "PUT vs PATCH?"  
→ PUT replaces the entire resource. PATCH does a partial update. We use PUT when the client sends the complete object, PATCH would be used if only specific fields are being updated.

---

## @DeleteMapping
**Package:** `org.springframework.web.bind.annotation.DeleteMapping`  
**Type:** Method-level  
**Why used in this project:** Maps HTTP DELETE requests for removing resources. Used for deleting bookings, removing cart items, canceling orders.  
**What if removed:** Delete operations would fail with 405 errors.  
**Real-life analogy:** Throwing a document in the shredder.  
**Used in files:** `BookingController.java` line 70, `CartController.java` line 108, `OrderController.java` line 106  
**Code example from project:**
```java
@DeleteMapping("/{id}")
public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
    orderService.deleteOrder(id);
    return ResponseEntity.ok().build();
}
```
**Viva answer:** If asked "why return 204 No Content instead of 200?"  
→ DELETE operations typically return 204 No Content when successful, indicating the resource no longer exists. Returning the deleted object in the response is optional and not RESTful best practice.

---

## @PathVariable
**Package:** `org.springframework.web.bind.annotation.PathVariable`  
**Type:** Parameter-level  
**Why used in this project:** Extracts values from the URL path (e.g., `/api/bookings/123` extracts `123` as booking ID). Used for identifying specific resources.  
**What if removed:** You would need to use `@RequestParam` with query strings like `/api/bookings?id=123`, which is less RESTful.  
**Real-life analogy:** Like a file path - `/documents/2024/report.pdf` directly identifies the specific file.  
**Used in files:** `BookingController.java` line 50, `UserController.java` line 81, `LabTestController.java` line 101  
**Code example from project:**
```java
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
    // URL: /api/bookings/123 → id = 123
}
```
**Viva answer:** If asked "why not @RequestParam for IDs?"  
→ @PathVariable is more RESTful for resource identification. URLs like `/api/bookings/123` are cleaner and cacheable. @RequestParam is better for filtering and pagination (e.g., `/api/bookings?status=PENDING&page=1`).

---

## @RequestParam
**Package:** `org.springframework.web.bind.annotation.RequestParam`  
**Type:** Parameter-level  
**Why used in this project:** Extracts query parameters from URL (e.g., `/api/tests?search=blood&page=1`). Used for filtering, pagination, and optional parameters.  
**What if removed:** You would need to parse query strings manually from HttpServletRequest, which is error-prone.  
**Real-life analogy:** Like search filters in an e-commerce site - you can add/remove filters without changing the base URL structure.  
**Used in files:** `LabTestController.java` line 68, `BookingController.java` line 107, `PackagesController.java` line 33  
**Code example from project:**
```java
@GetMapping
public ResponseEntity<ApiResponse<List<LabTestDTO>>> searchTests(
    @RequestParam(required = false) String search,
    @RequestParam(required = false) List<String> category,
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "18") int limit) {
    // URL: /api/tests?search=blood&category=hematology&page=1&limit=18
}
```
**Viva answer:** If asked "when to use @RequestParam vs @PathVariable?"  
→ Use @PathVariable for required, hierarchical identifiers (IDs, slugs). Use @RequestParam for optional filters, pagination, sorting, and non-hierarchical data. @PathVariable changes the URL structure, @RequestParam doesn't.

---

## @RequestBody
**Package:** `org.springframework.web.bind.annotation.RequestBody`  
**Type:** Parameter-level  
**Why used in this project:** Binds HTTP request body to a Java object. Jackson deserializes JSON to the specified DTO/entity. Used for POST/PUT requests sending complex data.  
**What if removed:** You would need to manually parse JSON from request body and map to objects, or use @RequestParam for each field which is impractical for complex objects.  
**Real-life analogy:** Like filling out a form - the entire form data comes as one package, not as individual questions.  
**Used in files:** `BookingController.java` line 47, `AuthController.java` line 42, `MedicalOfficerController.java` line 85  
**Code example from project:**
```java
@PostMapping
public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
    // Jackson converts JSON: {"testId": 1, "date": "2024-04-17"} → BookingRequest object
}
```
**Viva answer:** If asked "how does Jackson deserialization work?"  
→ Spring Boot auto-configures Jackson ObjectMapper. When a request with Content-Type: application/json arrives, Jackson reads the JSON stream, matches JSON fields to Java object fields (using getters/setters or direct field access), and creates the object. @Valid then triggers validation.

---

## @ResponseBody
**Package:** `org.springframework.web.bind.annotation.ResponseBody`  
**Type:** Method-level  
**Why used in this project:** NOT EXPLICITLY USED - because @RestController includes it implicitly. If we used @Controller instead, we would need this on every method to return JSON instead of view names.  
**What if removed (from @RestController):** Methods would try to resolve view names and return 404 or template errors.  
**Real-life analogy:** Like a sign saying "output goes here" vs assuming it goes to the default location.  
**Used in files:** None (implicit in @RestController)  
**Code example from project:**
```java
// NOT used in this project because @RestController includes it
// If using @Controller, would need:
@Controller
public class MyController {
    @GetMapping("/data")
    @ResponseBody  // Required to return JSON instead of view
    public MyData getData() {
        return new MyData();
    }
}
```
**Viva answer:** If asked "why not use @ResponseBody?"  
→ @RestController is a composed annotation that includes @Controller + @ResponseBody. Using it eliminates the need to add @ResponseBody to every method. It's cleaner and the Spring Boot recommended practice for REST APIs.

---

## @CrossOrigin
**Package:** `org.springframework.web.bind.annotation.CrossOrigin`  
**Type:** Class-level / Method-level  
**Why used in this project:** Enables Cross-Origin Resource Sharing (CORS) to allow the React frontend (running on different port/domain) to call backend APIs. Without this, browsers block cross-origin requests for security.  
**What if removed:** Frontend running on localhost:5173 would get CORS errors when calling backend on localhost:8080. Browser console would show "Access-Control-Allow-Origin" errors.  
**Real-life analogy:** Like a visitor pass - without it, security guards block entry from other buildings.  
**Used in files:** `LabTestController.java` line 33, `CartController.java` line 24, `TestPackageController.java` line 36  
**Code example from project:**
```java
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
@RestController
@RequestMapping("/api/lab-tests")
public class LabTestController {
    // Allows React frontend on these origins to call these endpoints
}
```
**Viva answer:** If asked "why needed for local development?"  
→ Even on localhost, different ports (5173 for React, 8080 for Spring) are considered different origins by browser security. CORS is a browser security feature, not a server one. The server must explicitly allow which origins can access it.

---

## @Bean
**Package:** `org.springframework.context.annotation.Bean`  
**Type:** Method-level  
**Why used in this project:** Declares a method that creates and returns a Spring bean. Used in configuration classes to create custom beans like PasswordEncoder, SecurityFilterChain, RedisTemplate, etc.  
**What if removed:** Spring wouldn't know about these custom beans, would try to use default auto-configured ones or fail with NoSuchBeanDefinitionException.  
**Real-life analogy:** Like a factory method that produces a specific product on demand.  
**Used in files:** `SecurityConfig.java` lines 48, 56, 61, 66, 107; `RedisConfig.java` line 13; `OpenAPIConfig.java` line 23  
**Code example from project:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Custom security configuration bean
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```
**Viva answer:** If asked "why not just @Component?"  
→ @Bean is used in @Configuration classes for programmatic bean creation when you need to execute logic to create the bean. @Component is for class-level bean declaration. @Bean methods can call other @Bean methods, enabling bean dependencies.

---

## @Configuration
**Package:** `org.springframework.context.annotation.Configuration`  
**Type:** Class-level  
**Why used in this project:** Marks a class as a source of bean definitions. Used for centralized configuration like SecurityConfig, RedisConfig, OpenAPIConfig, CorsConfig, etc.  
**What if removed:** @Bean methods inside wouldn't be processed, configuration would be ignored, leading to default behavior or startup failures.  
**Real-life analogy:** Like a configuration file that tells the system how to set itself up.  
**Used in files:** `SecurityConfig.java` line 32, `RedisConfig.java` line 10, `OpenAPIConfig.java` line 13, `CorsConfig.java` line 15  
**Code example from project:**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        // Security configuration
    }
}
```
**Viva answer:** If asked "why separate config classes?"  
→ Separation of concerns - each configuration class handles one aspect (security, Redis, CORS, OpenAPI). This makes code maintainable, testable, and follows single responsibility principle. Also allows conditional loading using @Conditional annotations.

---

## @Component
**Package:** `org.springframework.stereotype.Component`  
**Type:** Class-level  
**Why used in this project:** Generic Spring bean annotation. Used for classes that don't fit @Service, @Repository, or @Controller stereotypes - filters, listeners, health indicators, etc.  
**What if removed:** These classes wouldn't be auto-detected by component scanning, couldn't be autowired, and wouldn't function.  
**Real-life analogy:** Like a utility tool - not specifically a service, repository, or controller, but still a useful component.  
**Used in files:** `JwtAuthenticationFilter.java` line 22, `JwtTokenProvider.java` line 14, `RateLimitingFilter.java` line 22  
**Code example from project:**
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain chain) {
        // JWT validation logic
    }
}
```
**Viva answer:** If asked "why not just @Service for everything?"  
→ Stereotype annotations provide semantic meaning. @Component is the generic parent. Using specific stereotypes (@Service, @Repository, @Controller) allows Spring to apply special behaviors (like exception translation for @Repository, @ResponseBody for @Controller). Use @Component when none of the specific stereotypes apply.

---

## @Service
**Package:** `org.springframework.stereotype.Service`  
**Type:** Class-level  
**Why used in this project:** Marks a class as a service layer component. Contains business logic. Used on all service classes like BookingService, UserService, PaymentService, etc.  
**What if removed:** Services wouldn't be Spring beans, couldn't be autowired into controllers, application would fail with NoSuchBeanDefinitionException.  
**Real-life analogy:** Like a business department - handles the actual work logic separate from the customer interface (controller) and data storage (repository).  
**Used in files:** `BookingService.java` line 45, `UserService.java` line 22, `AuthService.java` line 26  
**Code example from project:**
```java
@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final UserService userService;
    
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        // Business logic for booking creation
    }
}
```
**Viva answer:** If asked "why not just @Component?"  
→ @Service is a specialized @Component that provides semantic meaning - indicates this class contains business logic. While functionally identical to @Component, it allows for better code organization and potential future AOP targeting of service-layer-specific concerns.

---

## @Repository
**Package:** `org.springframework.stereotype.Repository`  
**Type:** Class-level  
**Why used in this project:** Marks a class as a Data Access Object (DAO). Used on all repository interfaces extending JpaRepository. Enables exception translation - converts database-specific exceptions to Spring's DataAccessException hierarchy.  
**What if removed:** Repositories wouldn't be Spring beans, couldn't be autowired, and database exceptions wouldn't be translated, leading to raw SQLExceptions.  
**Real-life analogy:** Like a librarian - manages access to the data storage (database).  
**Used in files:** `BookingRepository.java` line 18, `UserRepository.java` line 16, `LabTestRepository.java` line 17  
**Code example from project:**
```java
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @EntityGraph(attributePaths = {"patient", "test", "testPackage"})
    Optional<Booking> findById(Long id);
    
    List<Booking> findByPatientId(Long patientId);
}
```
**Viva answer:** If asked "what does Spring do differently for DB exceptions?"  
→ @Repository enables automatic exception translation. Without it, you'd get raw SQLExceptions or HibernateExceptions. With it, Spring converts these to unchecked DataAccessException hierarchy (like DataIntegrityViolationException), making exception handling consistent across different JPA providers.

---

# Spring Security Annotations

## @PreAuthorize
**Package:** `org.springframework.security.access.prepost.PreAuthorize`  
**Type:** Method-level / Class-level  
**Why used in this project:** Method-level security that checks authorization before method execution. Used to restrict endpoints based on roles (ADMIN, PATIENT, TECHNICIAN, MEDICAL_OFFICER).  
**What if removed:** Authorization checks would need to be done manually in each method, or only URL-based security would apply, which is less granular.  
**Real-life analogy:** Like a bouncer checking ID before letting someone into a VIP section.  
**Used in files:** `AdminController.java` line 41, `BookingController.java` line 133, `ReportController.java` line 54  
**Code example from project:**
```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> getAllUsers() {
    // Only accessible by users with ADMIN role
}

@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
public ResponseEntity<ApiResponse<Booking>> getBookingById(@PathVariable Long id) {
    // Accessible by multiple roles
}
```
**Viva answer:** If asked "why @PreAuthorize not in SecurityConfig?"  
→ Method-level security allows per-method granularity vs blanket URL rules in SecurityConfig. SecurityConfig defines URL patterns (e.g., `/api/admin/**` requires ADMIN), while @PreAuthorize can secure specific methods with complex logic (e.g., `hasRole('ADMIN') or #id == authentication.principal.id` for resource ownership checks).

---

## @EnableMethodSecurity
**Package:** `org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity`  
**Type:** Configuration-class-level  
**Why used in this project:** Enables Spring Security's method-level security annotations like @PreAuthorize, @PostAuthorize, @Secured. Configured with `prePostEnabled = true` to use SpEL expressions.  
**What if removed:** @PreAuthorize annotations would be ignored, no method-level security would be enforced.  
**Real-life analogy:** Like turning on the security system - without it, all the individual security sensors are inactive.  
**Used in files:** `SecurityConfig.java` line 34, `TestSecurityConfig.java` line 17  
**Code example from project:**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    // Security configuration
}
```
**Viva answer:** If asked "what does prePostEnabled=true do?"  
→ Enables support for @PreAuthorize and @PostAuthorize annotations which use Spring Expression Language (SpEL). Setting it to false would only enable simpler @Secured annotation without expression support.

---

## @EnableWebSecurity
**Package:** `org.springframework.security.config.annotation.web.configuration.EnableWebSecurity`  
**Type:** Configuration-class-level  
**Why used in this project:** Enables Spring Security's web security support and provides the SecurityFilterChain bean. Required to customize security configuration.  
**What if removed:** Spring Security would use default configuration (all endpoints secured with basic auth), custom SecurityFilterChain bean wouldn't be processed.  
**Real-life analogy:** Like installing a security system in a building - without it, there's no security infrastructure.  
**Used in files:** `SecurityConfig.java` line 33, `TestSecurityConfig.java` line 16  
**Code example from project:**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Custom security configuration
    }
}
```
**Viva answer:** If asked "what chain does it configure?"  
→ It configures the filter chain that processes every HTTP request. The chain includes filters for CSRF protection, CORS, authentication (JWT filter), authorization (role checks), exception handling, session management, etc. The SecurityFilterChain bean defines the order and behavior of these filters.

---

## @SecurityRequirement
**Package:** `io.swagger.v3.oas.annotations.security.SecurityRequirement`  
**Type:** Class-level / Method-level  
**Why used in this project:** Swagger/OpenAPI annotation to document that an endpoint requires authentication. Shows a lock icon in Swagger UI and includes the security scheme in API documentation.  
**What if removed:** Swagger UI would not show which endpoints require authentication, making it harder for API consumers to understand security requirements.  
**Real-life analogy:** Like a "Staff Only" sign on a door - documentation of security, not enforcement.  
**Used in files:** `UserController.java` line 27, `BookingController.java` line 34, `ReportController.java` line 41  
**Code example from project:**
```java
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/users")
public class UserController {
    // All endpoints in this controller show lock icon in Swagger UI
}
```
**Viva answer:** If asked "why Swagger doc annotation, not enforced?"  
→ This is documentation only. Actual enforcement is done by Spring Security (@PreAuthorize, SecurityFilterChain). Swagger uses this annotation to display the security requirement in the UI and include it in the OpenAPI spec, but it doesn't affect runtime behavior.

---

# Spring Data / JPA Annotations

## @Entity
**Package:** `jakarta.persistence.Entity`  
**Type:** Class-level  
**Why used in this project:** Marks a class as a JPA entity mapped to a database table. Used on all domain entities like Booking, User, LabTest, etc. Hibernate maps these to database tables.  
**What if removed:** Hibernate wouldn't recognize the class as an entity, wouldn't create table mapping, couldn't persist or query instances.  
**Real-life analogy:** Like a blueprint - defines the structure that will be built in the database.  
**Used in files:** `Booking.java` line 18, `User.java` line 15, `LabTest.java` line 21  
**Code example from project:**
```java
@Entity
@Table(name = "bookings")
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Mapped to "bookings" table
}
```
**Viva answer:** If asked "what does Hibernate do with this class?"  
→ Hibernate scans @Entity classes, generates SQL DDL (CREATE TABLE statements) based on fields and annotations, creates the mapping between Java objects and database rows, and provides CRUD operations through repositories. It also manages the entity lifecycle (transient, persistent, detached, removed).

---

## @Table
**Package:** `jakarta.persistence.Table`  
**Type:** Class-level  
**Why used in this project:** Specifies the database table name for the entity. Used when table name differs from class name (e.g., `LabTest` → `tests` table, `User` → `users` table). Also defines indexes and unique constraints.  
**What if removed:** Hibernate would use class name as table name (e.g., `LabTest` → `labtest` table), causing table name mismatches with existing schema.  
**Real-life analogy:** Like a label on a folder - the folder name might differ from the document name inside.  
**Used in files:** `LabTest.java` line 23, `Booking.java` line 20, `User.java` line 17  
**Code example from project:**
```java
@Entity
@Table(name = "tests", indexes = {
    @Index(name = "idx_test_slug", columnList = "slug", unique = true),
    @Index(name = "idx_test_category", columnList = "category")
})
public class LabTest {
    // Class name "LabTest" but table name "tests"
}
```
**Viva answer:** If asked "why different from class name, the CONFLICT?"  
→ Database naming conventions often use lowercase, plural table names (tests, users, bookings), while Java uses PascalCase singular class names (LabTest, User, Booking). Also, some table names are reserved SQL keywords or have historical naming. @Table resolves this naming conflict.

---

## @Column
**Package:** `jakarta.persistence.Column`  
**Type:** Field-level  
**Why used in this project:** Specifies column mapping details - name, nullability, length, precision. Used to override default column naming and add database constraints.  
**What if removed:** Hibernate would use field name as column name, default constraints (nullable=true, no length limits), potentially violating database schema requirements.  
**Real-life analogy:** Like specifying the exact dimensions and material for each part in a blueprint.  
**Used in files:** `Booking.java` lines 31, 44, 59, 62, `LabTest.java` lines 40, 43, 46  
**Code example from project:**
```java
@Column(nullable = false, unique = true, length = 20)
private String bookingReference;

@Column(name = "patient_display_name", length = 150)
private String patientDisplayName;

@Column(nullable = false, precision = 10, scale = 2)
private BigDecimal totalAmount;
```
**Viva answer:** If asked "DB constraint vs application validation?"  
→ @Column creates database-level constraints (NOT NULL in DDL, column length in VARCHAR). This is the last line of defense - even if application validation is bypassed, the database enforces these rules. Application validation (@NotBlank, @Size) provides better error messages but database constraints ensure data integrity.

---

## @Id
**Package:** `jakarta.persistence.Id`  
**Type:** Field-level  
**Why used in this project:** Marks a field as the primary key of the entity. Every entity must have exactly one @Id field for identification.  
**What if removed:** Hibernate wouldn't know which field is the primary key, couldn't generate proper SQL, would throw mapping exception.  
**Real-life analogy:** Like a Social Security Number or Employee ID - the unique identifier for a record.  
**Used in files:** `Booking.java` line 27, `User.java` line 27, `LabTest.java` line 36  
**Code example from project:**
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```
**Viva answer:** If asked "why exactly one?"  
→ JPA requires exactly one primary key per entity to uniquely identify each row. Composite primary keys are possible using @IdClass or @EmbeddedId, but there's still conceptually one identifier. Without a primary key, Hibernate can't perform CRUD operations or track entity state.

---

## @GeneratedValue
**Package:** `jakarta.persistence.GeneratedValue`  
**Type:** Field-level  
**Why used in this project:** Specifies how the primary key is generated. Used with strategy=GenerationType.IDENTITY for auto-increment database columns.  
**What if removed:** You would need to manually set ID values before persisting, leading to conflicts and key management complexity.  
**Real-life analogy:** Like an automatic ticket dispenser - you don't assign numbers, the system does.  
**Used in files:** `Booking.java` line 28, `User.java` line 28, `LabTest.java` line 37  
**Code example from project:**
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```
**Viva answer:** If asked "IDENTITY vs AUTO?"  
→ IDENTITY relies on database auto-increment (MySQL AUTO_INCREMENT, PostgreSQL SERIAL). AUTO lets JPA provider choose the strategy (TABLE, SEQUENCE, or IDENTITY). IDENTITY is simpler and widely supported, but has limitations with batch inserts. AUTO is more portable but less predictable.

---

## @ManyToOne
**Package:** `jakarta.persistence.ManyToOne`  
**Type:** Field-level  
**Why used in this project:** Defines a many-to-one relationship where many entities reference one entity. Used for relationships like Bookings→User, Bookings→LabTest, Payments→Booking.  
**What if removed:** Hibernate wouldn't know the relationship, couldn't lazy load related entities, wouldn't create foreign keys in database.  
**Real-life analogy:** Like many employees belonging to one department.  
**Used in files:** `Booking.java` lines 34-35, 47-48, `Payment.java` lines 31-32, `CartItem.java` lines 29-30  
**Code example from project:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "patient_id", nullable = false)
private User patient;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "test_id")
private LabTest test;
```
**Viva answer:** If asked "each relationship type?"  
→ @ManyToOne: Many records point to one (many bookings → one user). @OneToMany: One record has many children (one user → many bookings). @ManyToMany: Both sides have many (tests ↔ packages). @OneToOne: One-to-one exclusive relationship (user ↔ profile). Each represents different cardinality in data modeling.

---

## @OneToMany
**Package:** `jakarta.persistence.OneToMany`  
**Type:** Field-level  
**Why used in this project:** Defines a one-to-many relationship where one entity has many child entities. Used for relationships like User→Bookings, LabTest→TestParameters, Report→ReportResults.  
**What if removed:** Hibernate wouldn't load child collections, couldn't cascade operations, wouldn't manage bidirectional relationships.  
**Real-life analogy:** Like one order containing many order items.  
**Used in files:** `User.java` lines 128, 135, 142, `LabTest.java` lines 175, 182, `Report.java` line 121  
**Code example from project:**
```java
@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
private List<Booking> bookings;
```
**Viva answer:** If asked "why mappedBy?"  
→ mappedBy specifies the field name on the child entity that owns the relationship. In a bidirectional relationship, one side is the "owner" (has @JoinColumn), the other uses mappedBy to indicate it's the inverse side. This prevents duplicate foreign key columns and confusion about which side manages the relationship.

---

## @ManyToMany
**Package:** `jakarta.persistence.ManyToMany`  
**Type:** Field-level  
**Why used in this project:** Defines a many-to-many relationship with a join table. Used for relationships like Tests↔TestPackages, Tests↔Categories.  
**What if removed:** Hibernate wouldn't create the join table, couldn't manage the relationship, would require manual join table entity.  
**Real-life analogy:** Like students and courses - many students take many courses.  
**Used in files:** `LabTest.java` line 196, `TestPackage.java` lines 184-188  
**Code example from project:**
```java
@ManyToMany(fetch = FetchType.LAZY)
@JoinTable(
    name = "package_tests",
    joinColumns = @JoinColumn(name = "package_id"),
    inverseJoinColumns = @JoinColumn(name = "test_id")
)
private Set<LabTest> tests;
```
**Viva answer:** If asked "how is the join table created?"  
→ Hibernate automatically creates a join table (e.g., `package_tests`) with two foreign key columns (package_id, test_id). @JoinTable lets you customize the table name and column names. The join table stores the many-to-many relationships without requiring a separate entity class.

---

## @JoinColumn
**Package:** `jakarta.persistence.JoinColumn`  
**Type:** Field-level  
**Why used in this project:** Specifies the foreign key column for relationship mapping. Defines the column name, nullability, and uniqueness of the join column.  
**What if removed:** Hibernate would use default column names (e.g., `user_id` for User field), which might not match the database schema.  
**Real-life analogy:** Like the connecting link between two related documents.  
**Used in files:** `Booking.java` lines 35, 48, 54, `CartItem.java` lines 30, 40, 50, `TestPackage.java` lines 187-188  
**Code example from project:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "patient_id", nullable = false)
private User patient;

@JoinTable(
    name = "package_tests",
    joinColumns = @JoinColumn(name = "package_id"),
    inverseJoinColumns = @JoinColumn(name = "test_id")
)
```
**Viva answer:** If asked "what FK it creates?"  
→ Creates a foreign key constraint in the database. For example, `@JoinColumn(name = "patient_id")` creates a column `patient_id` in the bookings table with a foreign key reference to `users(id)`. This ensures referential integrity - you can't have a booking with a non-existent patient_id.

---

## @OneToOne
**Package:** `jakarta.persistence.OneToOne`  
**Type:** Field-level  
**Why used in this project:** Defines a one-to-one relationship where one entity is exclusively related to another. Used for Booking↔ReportVerification, User↔UserHealthData, User↔MedicalHistory.  
**What if removed:** Hibernate wouldn't enforce the one-to-one constraint, wouldn't lazy load efficiently, might allow multiple related records.  
**Real-life analogy:** Like a person and their passport - one person has one passport.  
**Used in files:** `Booking.java` lines 142, 147, `ReportVerification.java` lines 24-25, `UserHealthData.java` lines 25-26  
**Code example from project:**
```java
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "booking_id", nullable = false)
private ReportVerification reportVerification;

@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false, unique = true)
private UserHealthData healthData;
```
**Viva answer:** If asked "where used (Booking ↔ ReportVerification)?"  
→ Each booking has exactly one report verification record (medical officer's approval). The verification contains the digital signature, approval status, and clinical notes. This is @OneToOne because a booking shouldn't have multiple verifications - only the latest/final verification matters.

---

## @Transactional
**Package:** `org.springframework.transaction.annotation.Transactional`  
**Type:** Method-level / Class-level  
**Why used in this project:** Defines transaction boundaries for database operations. Ensures atomicity - all operations succeed or all roll back. Used on service methods that modify data.  
**What if removed:** Each database operation would run in its own transaction, leading to partial updates on failures, data inconsistency, and potential deadlocks.  
**Real-life analogy:** Like a bank transfer - both debit and credit must succeed, or neither should happen.  
**Used in files:** `BookingService.java` lines 103, 288, 302, `PaymentService.java` lines 57, 101, 137, `UserService.java` lines 34, 106, 149  
**Code example from project:**
```java
@Transactional
public BookingResponse createBooking(BookingRequest request) {
    // All these operations are in one transaction:
    Booking booking = new Booking();
    bookingRepository.save(booking);
    paymentService.createPayment(booking);
    notificationService.sendConfirmation(booking);
    // If any fails, all roll back
}

@Transactional(readOnly = true)
public List<Booking> getUserBookings(Long userId) {
    // Read-only transaction - better performance
}
```
**Viva answer:** If asked "why on service methods, not controllers?"  
→ Transactions should be at the service layer, not controller layer. Controllers handle HTTP concerns, services handle business logic and transactions. Placing @Transactional on controllers would make transactions too broad (spanning multiple service calls) and harder to test. Service-level transactions provide better granularity and separation of concerns.

---

# Lombok Annotations

## @Data
**Package:** `lombok.Data`  
**Type:** Class-level  
**Why used in this project:** Generates getter, setter, equals, hashCode, toString, and requiredArgsConstructor methods. Eliminates boilerplate code. Used on all entities, DTOs, and request/response classes.  
**What if removed:** You would need to manually write ~50 lines of boilerplate per class (getters, setters, equals, hashCode, toString).  
**Real-life analogy:** Like a template that auto-fills standard paperwork.  
**Used in files:** `Booking.java` line 21, `User.java` line 21, `LabTest.java` line 30, `BookingRequest.java` line 14  
**Code example from project:**
```java
@Data
@Entity
public class Booking {
    private Long id;
    private String bookingReference;
    // Lombok generates: getId(), setId(), getBookingReference(), setBookingReference(),
    // equals(), hashCode(), toString(), and constructor for final fields
}
```
**Viva answer:** If asked "what methods it generates?"  
→ @Data is a shortcut for @Getter, @Setter, @RequiredArgsConstructor, @EqualsAndHashCode, and @ToString. It generates:
- Getter for all fields
- Setter for all non-final fields
- equals() and hashCode() using all non-transient fields
- toString() using all non-transient fields
- Constructor for all final fields (required arguments)

---

## @Builder
**Package:** `lombok.Builder`  
**Type:** Class-level  
**Why used in this project:** Implements the Builder pattern for object construction. Provides fluent API for creating objects with optional parameters. Used on User, Booking, and complex DTOs.  
**What if removed:** You would need to write manual builder classes or use telescoping constructors, both of which are verbose and error-prone.  
**Real-life analogy:** Like ordering a custom pizza - choose each topping step by step instead of remembering a long list.  
**Used in files:** `User.java` line 24, `Booking.java` line 24, `LabTest.java` line 33, `BookingRequest.java` line 17  
**Code example from project:**
```java
@Data
@Builder
public class User {
    private Long id;
    private String name;
    private String email;
    private String phone;
}

// Usage:
User user = User.builder()
    .name("John Doe")
    .email("john@example.com")
    .phone("9876543210")
    .build();
```
**Viva answer:** If asked "what pattern it implements, why used on User, Booking?"  
→ It implements the Gang of Four Builder pattern. Used on User and Booking because these objects have many optional fields (User has address, blood group, etc.; Booking has technician, medical officer, report, etc.). Builder pattern makes object creation readable and handles optional parameters gracefully without null checks in constructors.

---

## @NoArgsConstructor
**Package:** `lombok.NoArgsConstructor`  
**Type:** Class-level  
**Why used in this project:** Generates a no-argument constructor. Required by JPA/Hibernate for entity instantiation, and by frameworks that use reflection.  
**What if removed:** Hibernate couldn't instantiate entities (requires no-arg constructor), Jackson couldn't deserialize JSON, application would fail at runtime.  
**Real-life analogy:** Like a default template - creates an empty object that can be filled later.  
**Used in files:** `ErrorResponse.java` line 15 (combined with @AllArgsConstructor), various DTOs  
**Code example from project:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
}
```
**Viva answer:** If asked "why both needed with @Builder?"  
→ @Builder generates a private all-args constructor. JPA requires a public/proected no-arg constructor to instantiate entities when loading from database. @NoArgsConstructor provides this. @AllArgsConstructor is for other use cases like testing or manual construction. With @Builder, you typically need all three: @NoArgsConstructor (for JPA), @Builder (for fluent construction), @AllArgsConstructor (for completeness).

---

## @AllArgsConstructor
**Package:** `lombok.AllArgsConstructor`  
**Type:** Class-level  
**Why used in this project:** Generates a constructor with all fields as parameters. Useful for immutable objects, testing, and when you need to set all fields at once.  
**What if removed:** You would need to manually write constructors or use setter methods, which is less convenient for creating fully-initialized objects.  
**Real-life analogy:** Like a pre-filled form - all fields are set at creation time.  
**Used in files:** `ErrorResponse.java` line 16, various DTOs combined with @NoArgsConstructor  
**Code example from project:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
}

// Usage:
ErrorResponse error = new ErrorResponse(404, "Not Found", LocalDateTime.now());
```
**Viva answer:** If asked "why both needed with @Builder?"  
→ @Builder generates a private constructor. @AllArgsConstructor generates a public constructor with all parameters. This is useful for:
1. Testing - you can create objects in one line
2. Frameworks that require all-args constructors
3. When you don't want the builder pattern overhead
4. Creating immutable objects (with @Value instead of @Data)

---

## @RequiredArgsConstructor
**Package:** `lombok.RequiredArgsConstructor`  
**Type:** Class-level  
**Why used in this project:** Generates a constructor for final fields (and @NonNull fields). Used in controllers and services for constructor-based dependency injection instead of @Autowired field injection.  
**What if removed:** You would need to manually write constructor injection code or use @Autowired on fields, which is less testable and harder to make fields final.  
**Real-life analogy:** Like a checklist - the constructor ensures all required items are provided before the object can be created.  
**Used in files:** `BookingController.java` line 31, `UserService.java` line 23, `AuthService.java` line 27  
**Code example from project:**
```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;
    private final UserService userService;
    
    // Lombok generates:
    // public BookingController(BookingService bookingService, UserService userService) {
    //     this.bookingService = bookingService;
    //     this.userService = userService;
    // }
}
```
**Viva answer:** If asked "why used in controllers instead of @Autowired?"  
→ Constructor injection with @RequiredArgsConstructor is preferred over @Autowired field injection because:
1. Fields can be final (immutable)
2. Dependencies are explicitly required (can't create controller without them)
3. Easier to test (can mock dependencies in constructor)
4. No need for Spring-specific annotations in business code
5. Prevents circular dependencies at compile time

---

## @Slf4j
**Package:** `lombok.extern.slf4j.Slf4j`  
**Type:** Class-level  
**Why used in this project:** Generates a SLF4J logger field named `log`. Provides logging capabilities without manual logger declaration. Used in almost all service and controller classes.  
**What if removed:** You would need to manually declare: `private static final Logger log = LoggerFactory.getLogger(ClassName.class);` in every class.  
**Real-life analogy:** Like having a built-in notebook - you don't need to bring your own.  
**Used in files:** `BookingService.java` line 47, `BookingController.java` line 32, `AuthService.java` line 28  
**Code example from project:**
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {
    // Lombok generates: private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    
    public BookingResponse createBooking(BookingRequest request) {
        log.info("Creating booking for user: {}", request.getUserId());
        // Logging code
    }
}
```
**Viva answer:** If asked "what logger it creates, log.info vs log.debug?"  
→ Creates an SLF4J Logger backed by Logback (Spring Boot default). log.info() is for general informational messages that are always useful. log.debug() is for detailed troubleshooting information, only enabled in debug mode. log.warn() for warning conditions, log.error() for error conditions. SLF4J allows parameterized logging like `log.info("User {} booked test {}", userId, testId)` which only converts objects to string if the log level is enabled.

---

# Validation Annotations

## @Valid
**Package:** `jakarta.validation.Valid`  
**Type:** Parameter-level  
**Why used in this project:** Triggers validation of annotated object cascades. When placed on @RequestBody, it validates the DTO and nested objects. Used on all POST/PUT endpoints.  
**What if removed:** Request bodies would not be validated, invalid data could reach service layer, causing database constraint violations or business logic errors.  
**Real-life analogy:** Like a security checkpoint - validates everything before letting it through.  
**Used in files:** `BookingController.java` line 47, `AuthController.java` line 42, `CartController.java` line 62  
**Code example from project:**
```java
@PostMapping
public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
    // Validates BookingRequest and all nested objects
    // If validation fails, returns 400 with error messages
}
```
**Viva answer:** If asked "where placed and what it triggers?"  
→ Placed on method parameters (typically @RequestBody). It triggers the Jakarta Bean Validation (JSR 380) framework, which validates the object against annotations like @NotBlank, @NotNull, @Size, @Email, etc. If validation fails, Spring automatically returns HTTP 400 with field-level error messages. It also validates nested objects if they have @Valid annotation.

---

## @NotBlank
**Package:** `jakarta.validation.constraints.NotBlank`  
**Type:** Field-level  
**Why used in this project:** Validates that a String field is not null and contains at least one non-whitespace character. Used on required string fields like name, email, booking reference.  
**What if removed:** Empty strings or strings with only spaces would be accepted, causing data quality issues and potential downstream errors.  
**Real-life analogy:** Like requiring actual content, not just a blank form.  
**Used in files:** `RegisterRequest.java` lines 24, 28, 32, `LoginRequest.java` lines 18, 22, `BookingRequest.java` line 40  
**Code example from project:**
```java
@NotBlank(message = "Name is required")
private String name;

@NotBlank(message = "Email is required")
@Email(message = "Email should be valid")
private String email;
```
**Viva answer:** If asked "difference vs @NotNull vs @NotEmpty?"  
→ @NotNull: Field cannot be null (but can be empty string or empty collection)
→ @NotEmpty: Field cannot be null and must have at least one element (for collections/arrays/strings)
→ @NotBlank: String-specific - cannot be null, empty, or contain only whitespace. For strings, @NotBlank is the strictest - it rejects "", "   ", null. @NotNull rejects only null. @NotEmpty rejects null and "".

---

## @NotNull
**Package:** `jakarta.validation.constraints.NotNull`  
**Type:** Field-level  
**Why used in this project:** Validates that a field cannot be null. Used on required fields of any type (Long, BigDecimal, enums, objects).  
**What if removed:** Null values would be accepted, potentially causing NullPointerExceptions or database constraint violations.  
**Real-life analogy:** Like a required field on a form - must be filled.  
**Used in files:** `BookedSlotRequest.java` lines 15, 19, `CartRequest.java` lines 17, 30, 39, `BookingRequest.java` line 35  
**Code example from project:**
```java
@NotNull(message = "Slot ID is required")
private Long slotId;

@NotNull(message = "Booking date is required")
private LocalDate bookingDate;
```
**Viva answer:** If asked "difference vs @NotBlank vs @NotEmpty?"  
→ @NotNull is the most general - works on any type (String, Long, BigDecimal, custom objects). It only checks for null. For strings, @NotBlank is better because it also checks for empty/whitespace. For collections, @NotEmpty is better because it checks for null and empty. Use @NotNull when you need to ensure a non-null value regardless of content.

---

## @NotEmpty
**Package:** `org.hibernate.validator.constraints.NotEmpty`  
**Type:** Field-level  
**Why used in this project:** Validates that collections, arrays, or strings are not null and have at least one element/character. Used on lists, sets, and string collections.  
**What if removed:** Empty collections would be accepted, potentially causing issues when iterating or processing.  
**Real-life analogy:** Like requiring at least one item in a shopping cart.  
**Used in files:** `ReportResultRequest.java` line 24 (on List), various DTOs with collection fields  
**Code example from project:**
```java
@NotEmpty(message = "At least one result item is required")
@Valid
private List<ResultItem> results;
```
**Viva answer:** If asked "difference vs @NotNull vs @NotBlank?"  
→ @NotEmpty is specifically for collections, arrays, maps, and strings. It checks both null and empty. For a List<String>, @NotNull allows null list but not empty list, @NotEmpty rejects both null and empty. @NotBlank is string-specific and also rejects whitespace-only strings. Use @NotEmpty for collections when you need at least one element.

---

## @Size
**Package:** `jakarta.validation.constraints.Size`  
**Type:** Field-level  
**Why used in this project:** Validates the size of strings, collections, arrays, or maps. Used to enforce length limits aligned with database column constraints.  
**What if removed:** Values exceeding database limits would cause SQL errors, or very long values could cause performance issues.  
**Real-life analogy:** Like character limits on text fields.  
**Used in files:** `RegisterRequest.java` lines 18, 21, 25, 33, `DoctorTestRequest.java` lines 20, 24, 27, `BookingRequest.java` line 41  
**Code example from project:**
```java
@Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
private String firstName;

@Size(max = 250, message = "Address must be at most 250 characters")
private String address;

@Size(min = 1, message = "At least one test ID is required")
private List<Long> testIds;
```
**Viva answer:** If asked "DB constraint alignment?"  
→ @Size should match database column constraints. If @Column has length=250, @Size(max=250) ensures application validation catches the error before it reaches the database. This provides better error messages and prevents SQL exceptions. For collections, @Size(min=1) ensures NOT NULL and non-empty, aligning with business rules.

---

## @Email
**Package:** `org.hibernate.validator.constraints.Email`  
**Type:** Field-level  
**Why used in this project:** Validates that a string field is a valid email address format. Used on email fields in user registration, contact info, etc.  
**What if removed:** Invalid email formats would be accepted, causing delivery failures for notifications and emails.  
**Real-life analogy:** Like an email format checker.  
**Used in files:** `RegisterRequest.java` line 29, `UserResponse.java` line 22, `OrderRequest.java` line 32  
**Code example from project:**
```java
@NotBlank(message = "Email is required")
@Email(message = "Email should be valid")
private String email;
```
**Viva answer:** If asked "what regex it validates?"  
→ Hibernate Validator's @Email uses a regex pattern based on RFC 5322 email specification. It checks for basic email format (local-part@domain). It's not perfect - doesn't check if the email actually exists, but catches obvious formatting errors like "invalid-email", "user@", "@example.com". For stricter validation, you might add custom regex or use a verification service.

---

## @Pattern
**Package:** `jakarta.validation.constraints.Pattern`  
**Type:** Field-level  
**Why used in this project:** Validates that a string matches a regular expression pattern. Used for phone numbers, blood groups, time formats, and other formatted strings.  
**What if removed:** Invalid formats would be accepted, causing data quality issues and downstream processing errors.  
**Real-life analogy:** Like a template that ensures data follows a specific pattern.  
**Used in files:** `RegisterRequest.java` lines 34, 37, 40, 56, `BookingRequest.java` line 44, `SlotConfigRequest.java` lines 20, 24  
**Code example from project:**
```java
@Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).{8,}$", 
         message = "Password must contain at least one uppercase letter and one number")
private String password;

@Pattern(regexp = "^[6-9]\\d{9}$", 
         message = "Invalid Indian phone number")
private String phone;

@Pattern(regexp = "^(O|A|B|AB)[+-]?$", 
         message = "Invalid blood group")
private String bloodGroup;

@Pattern(regexp = "^([0-1][0-9]|2[0-3]):[0-5][0-9]$", 
         message = "Start time must be in HH:mm format")
private String startTime;
```
**Viva answer:** If asked "where used for Indian phone numbers?"  
→ Used in RegisterRequest.java line 40 with pattern `^[6-9]\\d{9}$`. This validates 10-digit Indian mobile numbers starting with 6, 7, 8, or 9 (valid prefixes as per TRAI regulations). The pattern ensures:
- ^ - start of string
- [6-9] - first digit must be 6-9
- \\d{9} - exactly 9 more digits (total 10)
- $ - end of string

---

# Swagger / OpenAPI Annotations

## @Tag
**Package:** `io.swagger.v3.oas.annotations.tags.Tag`  
**Type:** Class-level  
**Why used in this project:** Groups endpoints in Swagger UI by functional area. Used to organize controllers into logical groups like "Users", "Bookings", "Reports", "Payments".  
**What if removed:** All endpoints would appear under one default group in Swagger UI, making it harder to navigate and understand the API structure.  
**Real-life analogy:** Like chapter headings in a book - organizes content into logical sections.  
**Used in files:** `UserController.java` line 26, `BookingController.java` line 28, `ReportController.java` line 40  
**Code example from project:**
```java
@Tag(name = "Users", description = "User profile and management")
@RestController
@RequestMapping("/api/users")
public class UserController {
    // All endpoints appear under "Users" tag in Swagger UI
}

@Tag(name = "Reports", description = "Lab test results and reports management")
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    // All endpoints appear under "Reports" tag
}
```
**Viva answer:** If asked "grouping in Swagger UI?"  
→ Swagger UI displays a dropdown or sidebar with tags as group names. Each tag contains all endpoints from controllers with that @Tag. This organizes the API documentation into logical sections, making it easier for developers to find relevant endpoints. The description field provides additional context about what that group of endpoints does.

---

## @Operation
**Package:** `io.swagger.v3.oas.annotations.Operation`  
**Type:** Method-level  
**Why used in this project:** Documents individual API endpoints with summary and description. Used on each controller method to explain what the endpoint does.  
**What if removed:** Swagger UI would show generic endpoint names without descriptions, making the API documentation less useful for consumers.  
**Real-life analogy:** Like a function comment - explains what the function does.  
**Used in files:** `UserController.java` lines 33, 45, 59, `BookingController.java` lines 38, 47, `ReportController.java` lines 55, 66  
**Code example from project:**
```java
@Operation(summary = "Get user profile", 
           description = "Retrieve the authenticated user's profile information")
@GetMapping("/profile")
public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
    // Swagger UI shows: "Get user profile" with the description
}

@Operation(summary = "Create booking", 
           description = "Create a new lab test booking with the provided details")
@PostMapping
public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
    // Detailed documentation for the endpoint
}
```
**Viva answer:** If asked "method documentation?"  
→ @Operation provides human-readable documentation for each endpoint. The summary is a short one-line description shown in the endpoint list. The description provides detailed information about what the endpoint does, parameters, return values, and any important notes. This documentation appears in Swagger UI and is exported in the OpenAPI spec for API consumers.

---

## @SecurityRequirement
**Package:** `io.swagger.v3.oas.annotations.security.SecurityRequirement`  
**Type:** Class-level / Method-level  
**Why used in this project:** Documents that an endpoint requires authentication. Shows a lock icon in Swagger UI and includes the security scheme in the OpenAPI spec.  
**What if removed:** Swagger UI wouldn't indicate which endpoints require authentication, making it harder for API consumers to understand security requirements.  
**Real-life analogy:** Like a "Staff Only" sign - documentation, not enforcement.  
**Used in files:** `UserController.java` line 27, `BookingController.java` line 34, `ReportController.java` line 41  
**Code example from project:**
```java
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/users")
public class UserController {
    // All endpoints show lock icon in Swagger UI
    // "Authorize" button in Swagger UI lets users enter JWT token
}
```
**Viva answer:** If asked "shows lock icon in Swagger?"  
→ Yes, @SecurityRequirement adds a lock icon next to each endpoint in Swagger UI. It also enables the "Authorize" button in Swagger UI where users can enter their JWT token (bearerAuth). This token is then included in the Authorization header for all API calls made through the Swagger UI "Try it out" feature. Note: This is purely documentation - actual enforcement is by Spring Security.

---

# JPA Lifecycle Annotations

## @PrePersist
**Package:** `jakarta.persistence.PrePersist`  
**Type:** Method-level  
**Why used in this project:** Callback method invoked before entity is persisted to database. Used to set createdAt timestamps, generate default values, initialize collections.  
**What if removed:** Timestamps would need to be set manually before every save, leading to inconsistent data and potential null values.  
**Real-life analogy:** Like initialization code that runs before an object is saved.  
**Used in files:** `Booking.java` line 167, `User.java` line 163, `ReportVerification.java` line 74, `Cart.java` line 86  
**Code example from project:**
```java
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    bookingReference = generateBookingReference();
    status = BookingStatus.PENDING;
}

@PrePersist
protected void onCreate() {
    if (createdAt == null) {
        createdAt = LocalDateTime.now();
    }
}
```
**Viva answer:** If asked "why used to set createdAt?"  
→ @PrePersist ensures createdAt is automatically set right before the entity is first saved to the database. This guarantees:
1. Consistency - every record has a creation timestamp
2. No manual intervention - developers don't forget to set it
3. Accuracy - timestamp is set at the exact moment of persistence, not when the object was created in memory
4. Immutability - createdAt is only set once and never changes

---

## @PreUpdate
**Package:** `jakarta.persistence.PreUpdate`  
**Type:** Method-level  
**Why used in this project:** Callback method invoked before entity is updated in database. Used to set updatedAt timestamps, track changes, maintain audit trails.  
**What if removed:** updatedAt would need to be set manually before every update, leading to stale timestamps and missed updates.  
**Real-life analogy:** Like a "last modified" timestamp that updates automatically.  
**Used in files:** `User.java` line 169, `ReportVerification.java` line 83, `ReportAiAnalysis.java` line 83, `LabTest.java` line 206  
**Code example from project:**
```java
@PreUpdate
protected void onUpdate() {
    updatedAt = LocalDateTime.now();
}

@PreUpdate
protected void onUpdate() {
    updatedAt = LocalDateTime.now();
    version++;
}
```
**Viva answer:** If asked "why used to set updatedAt?"  
→ @PreUpdate ensures updatedAt is automatically updated every time the entity is modified and saved. This provides:
1. Audit trail - know when a record was last changed
2. Cache invalidation - use timestamp to invalidate cached data
3. Concurrency control - detect stale data with optimistic locking
4. Synchronization - frontend can poll for changes based on timestamp
5. Debugging - track when records change for troubleshooting

---

# Summary

This audit report covers **50+ annotations** used across the HEALTHCARELAB backend project:

- **Spring Core (13 annotations):** @SpringBootApplication, @RestController, @RequestMapping, @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PathVariable, @RequestParam, @RequestBody, @CrossOrigin, @Bean, @Configuration, @Component, @Service, @Repository
- **Spring Security (4 annotations):** @PreAuthorize, @EnableMethodSecurity, @EnableWebSecurity, @SecurityRequirement
- **Spring Data/JPA (11 annotations):** @Entity, @Table, @Column, @Id, @GeneratedValue, @ManyToOne, @OneToMany, @ManyToMany, @JoinColumn, @OneToOne, @Transactional
- **Lombok (6 annotations):** @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor, @RequiredArgsConstructor, @Slf4j
- **Validation (7 annotations):** @Valid, @NotBlank, @NotNull, @NotEmpty, @Size, @Email, @Pattern
- **Swagger/OpenAPI (3 annotations):** @Tag, @Operation, @SecurityRequirement
- **JPA Lifecycle (2 annotations):** @PrePersist, @PreUpdate

Each annotation serves a specific purpose in the application architecture, from web layer routing to security enforcement, data persistence, code generation, validation, documentation, and lifecycle management.

---

**End of VIVA 1 Annotations Audit Report**

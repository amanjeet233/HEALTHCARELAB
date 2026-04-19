# VIVA 5: Architecture & Design Patterns - HEALTHCARELAB

---

# ARCHITECTURE PATTERNS

## Layered Architecture (Controller → Service → Repository)

**Where used in this project:**
- `AdminController.java` → `DashboardService.java` → `BookingRepository.java`
- `AuthController.java` → `AuthService.java` → `UserRepository.java`
- All backend endpoints follow this 3-layer pattern

**Why this pattern was chosen:**
Separation of concerns. Each layer has a single responsibility:
- Controller: HTTP handling, request/response mapping, validation
- Service: Business logic, transactions, orchestration
- Repository: Data access, SQL generation, entity management

Without layers, controllers would contain SQL queries and business logic mixed together, making code unmaintainable and untestable.

**What @Controller should NOT contain:**
- Business logic (no complex calculations or rules)
- Database queries (no SQL, no EntityManager)
- Transaction management (@Transactional belongs in service)
- Direct entity manipulation beyond DTO mapping

Controllers should only: receive HTTP request, call service, wrap response in ApiResponse, return ResponseEntity.

**What @Service should NOT contain:**
- HTTP-specific code (no HttpServletRequest, no @RequestMapping)
- View/JSON formatting logic (DTOs handle this)
- Database connection management (Spring handles this)
- Response status codes (controller handles HTTP concerns)

Services should only: business logic, transaction boundaries, orchestrate multiple repositories.

**Why Repository is never called from Controller directly:**
Violates separation of concerns. Controller shouldn't know about data access details. If you call repository from controller, you can't add business logic (validation, caching, logging) without touching controller. Service layer provides abstraction - can switch from JPA to MongoDB without changing controllers.

**Real-life analogy:**
Restaurant kitchen: Waiter (Controller) takes order → Chef (Service) cooks food → Pantry (Repository) provides ingredients. Waiter doesn't go to pantry directly. Chef decides what ingredients to use and how to cook.

**Code example from project:**
```java
// Controller - AdminController.java line 54-59
@GetMapping("/stats")
public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
    log.info("GET /api/admin/stats");
    Map<String, Object> stats = dashboardService.getAdminDashboardStats(); // Only calls service
    return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
}

// Service - DashboardService.java line 84-111
public Map<String, Object> getAdminDashboardStats() {
    Map<String, Object> stats = new HashMap<>();
    long totalBookings = bookingRepository.countByStatusNot(BookingStatus.CANCELLED); // Only calls repository
    long totalUsers = userRepository.count();
    // Business logic here
    return stats;
}
```

**Viva Q&A:**
Q: What if business logic is simple - can I skip service layer?
A: No. Even simple logic may grow. Service layer provides consistency, testability, and transaction boundaries. Skipping it creates technical debt.

Q: Why not call repository from service if it's just a simple query?
A: Service layer should call repository. This is correct. The question might mean "why not call repository from controller" - which is wrong because it violates separation.

---

## REST API Design

**Where used in this project:**
- All endpoints follow REST conventions: `/api/bookings/{id}`, `/api/admin/stats`
- HTTP verbs: GET (read), POST (create), PUT (update), DELETE (delete)
- Resource-based URLs, not action-based

**Why this pattern was chosen:**
REST is standard, stateless, cacheable. Uniform interface makes API predictable. Clients can use standard HTTP tools. No proprietary protocol needed.

**What makes an API RESTful:**
- Stateless: each request contains all context (JWT token)
- Resource-based: URLs identify resources (bookings, users), not actions
- HTTP verbs: GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
- Standard status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found

**Why /api/bookings/{id}/status not /api/update-booking-status:**
`/api/bookings/{id}/status` is resource-based (sub-resource). `/api/update-booking-status` is RPC-style (action-based). REST uses resource identifiers. To update status, use `PUT /api/bookings/{id}` with status in body, or `PATCH /api/bookings/{id}` with partial update. Action-based URLs break REST principles.

**Why GET vs POST for read operations:**
GET is idempotent, cacheable, bookmarkable. POST is not cacheable, creates resources. For reads, always use GET. Only use POST for: creating resources, complex queries that don't fit URL parameters, or operations with side effects.

**Why PUT not PATCH for full updates in this project:**
PUT replaces entire resource. PATCH updates partial resource. This project uses PUT for full updates (e.g., update user role) because it's simpler and more explicit. PATCH requires specifying which fields changed. For simple CRUD, PUT is sufficient. PATCH is used when you want to update only specific fields without sending entire object.

**Real-life analogy:**
Library catalog: REST is like using standard call numbers to find books. Non-REST is like asking librarian "give me the red book about chemistry" - inconsistent, requires human interpretation.

**Code example from project:**
```java
// RESTful - AdminController.java line 94-119
@PutMapping("/users/{userId}/role") // Resource-based URL
public ResponseEntity<ApiResponse<String>> updateUserRole(
        @PathVariable Long userId,
        @RequestBody Map<String, String> body) {
    // PUT for full update of user role
}

// RESTful - AdminController.java line 54-59
@GetMapping("/stats") // GET for read operation
public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
    Map<String, Object> stats = dashboardService.getAdminDashboardStats();
    return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
}
```

**Viva Q&A:**
Q: Why use ResponseEntity instead of returning ApiResponse directly?
A: ResponseEntity allows setting HTTP status codes, headers, and body. ApiResponse is the body. Together they provide full HTTP control. Returning ApiResponse directly would default to 200 OK always, which is wrong for errors.

Q: Can I use POST for read operations with complex filters?
A: Yes, if filters are too long for URL. But this breaks REST caching. Better use GET with query params or POST to a search endpoint that returns results (like POST /api/bookings/search). Trade-off: caching vs URL length.

---

## JWT Stateless Authentication

**Where used in this project:**
- `JwtService.java` generates and validates tokens
- `JwtAuthenticationFilter` intercepts requests, extracts token
- `SecurityConfig.java` configures stateless session management
- Frontend `api.ts` stores token in localStorage, adds Authorization header

**Why this pattern was chosen:**
JWT is stateless - no server-side session storage. Scalable across multiple servers. Works well with SPA (React) and mobile apps. Self-contained token contains user info. No database lookup needed for each request (after validation).

**What the token contains:**
```json
{
  "sub": "user@example.com",  // Subject (email)
  "role": "ADMIN",           // User role for authorization
  "iat": 1234567890,         // Issued at timestamp
  "exp": 1234654290          // Expiration timestamp
}
```

From `JwtService.java` line 49-53:
```java
public String generateToken(String username, String role) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);  // Role embedded in token
    return buildToken(claims, username, accessTokenExpiration);
}
```

**Why role in JWT token, not just database lookup:**
Performance - no DB query for authorization on every request. Scalability - authorization decision made from token, no database hit. Security - token is signed, can't be tampered. If role changes, user must re-login (acceptable trade-off). Database lookup adds latency and database load.

**Token refresh flow explained:**
1. Access token expires (15 minutes in this project)
2. Frontend sends refresh token to `/api/auth/refresh-token`
3. Backend validates refresh token (longer expiry: 7 days)
4. Backend issues new access token
5. Frontend stores new access token, retries failed request
6. If refresh fails (expired/invalid), user logged out

From `AuthService.java` line 275-321:
```java
public AuthResponse refreshToken(String refreshToken) {
    if (!jwtService.isTokenValid(rawToken)) {
        throw new InvalidCredentialsException("Invalid or expired refresh token");
    }
    String username = jwtService.extractUsername(rawToken);
    User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired refresh token"));
    String newAccessToken = jwtService.generateToken(user.getEmail(), roleName);
    return AuthResponse.builder().accessToken(newAccessToken).build();
}
```

**Where token stored (localStorage) and why not httpOnly cookie here:**
localStorage stores token. Frontend reads it, adds to Authorization header. Not using httpOnly cookie because: easier to implement for SPA, works with mobile apps, no need for cookie configuration. Trade-off: vulnerable to XSS. Mitigated by sanitizing input, using CSP headers. httpOnly cookie is more secure but harder to implement with custom auth flow.

**Real-life analogy:**
JWT is like a VIP pass with photo and expiry date. Show it at entrance, no need to check guest list each time. Session-based auth is like checking guest list at every door - slower, requires centralized list.

**Code example from project:**
```java
// JwtService.java line 49-53 - Token generation
public String generateToken(String username, String role) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);
    return buildToken(claims, username, accessTokenExpiration);
}

// api.ts line 115-135 - Token attachment
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
});
```

**Viva Q&A:**
Q: Why not store refresh token in localStorage?
A: Refresh token is more sensitive (long-lived). In production, store in httpOnly cookie. This project uses localStorage for simplicity in development. Trade-off: XSS can steal refresh token.

Q: What happens if JWT secret is leaked?
A: Attacker can forge tokens for any user. Change secret immediately (invalidate all tokens). Force all users to re-login. Rotate secrets periodically. Store secret in environment variable, not code.

---

## RBAC (Role-Based Access Control)

**Where used in this project:**
- `SecurityConfig.java` line 153: `.requestMatchers("/api/admin/**").hasRole('ADMIN')`
- `AdminController.java` line 41: `@PreAuthorize("hasRole('ADMIN')")`
- `ProtectedRoute.tsx` line 7: `allowedRoles?: Array<'PATIENT' | 'MEDICAL_OFFICER' | 'TECHNICIAN' | 'ADMIN'>`

**Why this pattern was chosen:**
Simple, scalable authorization. Roles map to job functions. Easy to add new roles. Centralized security rules. Declarative security with annotations.

**4 roles explained with responsibilities:**
- **PATIENT**: Book tests, view reports, manage profile, cart operations. No access to admin/staff features.
- **TECHNICIAN**: View assigned bookings, update collection status, upload reports, reject specimens. No access to admin controls.
- **MEDICAL_OFFICER**: Verify reports, provide clinical notes, view patient history. No access to admin controls.
- **ADMIN**: Full system access - manage users, view all bookings, configure tests, audit logs. Can create staff accounts.

From `UserRole.java`:
```java
public enum UserRole {
    PATIENT,
    TECHNICIAN,
    MEDICAL_OFFICER,
    ADMIN
}
```

**Why @PreAuthorize not URL-based security only:**
@PreAuthorize is method-level security. More granular than URL-level. Can check complex conditions (e.g., `@PreAuthorize("#userId == authentication.principal.id")`). URL-based security is coarse-grained. Combined: URL security for general access, @PreAuthorize for specific method restrictions. Defense in depth.

**Role hierarchy: ADMIN can do what TECHNICIAN can do?**
No explicit hierarchy in this project. Each role has specific permissions. ADMIN has admin-specific endpoints. TECHNICIAN has technician-specific endpoints. They don't overlap. If hierarchy needed, could use `@PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")` or configure role hierarchy in Spring Security.

**Real-life analogy:**
Hospital ID badges: Different color badges for different staff. Red badge (admin) opens all doors. Blue badge (technician) opens lab doors. Green badge (patient) opens only patient areas. Badge reader checks role before granting access.

**Code example from project:**
```java
// SecurityConfig.java line 153 - URL-based security
.requestMatchers("/api/admin/**").hasRole('ADMIN')

// AdminController.java line 41 - Method-level security
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    // All methods require ADMIN role
}

// ProtectedRoute.tsx line 50-57 - Frontend role check
if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(currentUser.role as any)) {
        if (role === 'ADMIN') return <Navigate to="/admin" replace />;
        // Redirect to appropriate dashboard
    }
}
```

**Viva Q&A:**
Q: Why check roles on both frontend and backend?
A: Defense in depth. Frontend check provides good UX (prevents unauthorized navigation). Backend check is security boundary (prevents API abuse). Never trust frontend - always validate on backend.

Q: Can a user have multiple roles?
A: Not in this project. UserRole is single enum. If needed, could use Set<Role> and check with `hasAnyRole()`. Current design: one user = one role for simplicity.

---

# DESIGN PATTERNS

## Builder Pattern (@Builder)

**Where used in this project:**
- `User.java` line 24: `@Builder`
- `Booking.java` line 24: `@Builder`
- `AuthResponse.java` line 263: `AuthResponse.builder().accessToken().role().build()`
- `ApiResponse.java` line 66: `ApiResponse.success(message, data)` (factory method, similar concept)

**Why this pattern was chosen:**
Readability for objects with many fields. Optional parameters without constructor overloading. Fluent API. Immutable objects (with @AllArgsConstructor). Avoids telescoping constructor problem.

**Why User.builder().email().role().build() not new User(email, role):**
User has 20+ fields. Constructor would need 20 parameters or many overloads. Builder allows setting only needed fields. Self-documenting code (field names visible). Can validate after build() before returning object.

From `AuthService.java` line 263-272:
```java
return AuthResponse.builder()
        .accessToken(accessToken)
        .refreshToken(refreshToken)
        .tokenType("Bearer")
        .userId(user.getId())
        .name(user.getName())
        .email(user.getEmail())
        .role(roleName)
        .message("Login successful")
        .build();
```

**What alternative was rejected and why:**
Telescoping constructors (many overloaded constructors). Rejected because: hard to read, parameter order confusion, still need many constructors for all combinations. Setter methods: Rejected because: not immutable, requires multiple lines, can forget to set required fields.

**Real-life analogy:**
Ordering pizza: Builder pattern = "I want a large pizza with pepperoni, extra cheese, thin crust" (specify what you want). Constructor = "Pizza(size, topping1, topping2, crust, sauce, cheese)" (must know order and provide all).

**Code example from project:**
```java
// User.java line 24
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String name;
    private String email;
    private UserRole role;
    // ... 20+ more fields
}

// Usage in AuthService.java line 74-89
User user = new User();
user.setEmail(email);
user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
user.setName(fullName);
// ... setting 10+ fields one by one
// With Builder: User.builder().email().password().name()...build()
```

**Viva Q&A:**
Q: Why @NoArgsConstructor and @AllArgsConstructor with @Builder?
A: @Builder generates builder class. @NoArgsConstructor for JPA (entity instantiation). @AllArgsConstructor for @Builder to work. Lombok generates both for convenience.

Q: Can I use builder for required fields validation?
A: Yes, can add validation in build() method or use @Builder.Default with validation. Or use separate constructor with required fields, builder for optional fields.

---

## Singleton Pattern (Spring @Bean)

**Where used in this project:**
- All Spring beans are singletons by default
- `JwtService.java` line 23: `@Service` (singleton)
- `SecurityConfig.java` line 62: `@Bean public PasswordEncoder passwordEncoder()` (singleton)
- `SecurityConfig.java` line 49: `@Bean public AuthenticationProvider authenticationProvider()` (singleton)

**Why this pattern was chosen:**
Spring's default bean scope. Efficient - one instance shared across application. Thread-safe for stateless services. Saves memory. Consistent state across application.

**Why JwtService is singleton (stateless, just reads config):**
JwtService has no instance state (only reads from @Value fields). Stateless = safe to share. All requests use same instance. Config properties loaded once at startup. No concurrency issues.

**Why BCryptPasswordEncoder is singleton:**
BCryptPasswordEncoder is thread-safe. Expensive to create (config cost). One instance shared across application. Consistent hashing behavior. PasswordEncoder is stateless - just algorithm configuration.

**What alternative was rejected and why:**
Prototype scope (new instance per request). Rejected because: wasteful (creates many objects), unnecessary for stateless services, slower. Singleton is default and appropriate for this use case.

**Real-life analogy:**
Library has one catalog (singleton). Every patron uses same catalog. Don't create new catalog for each patron. Catalog is stateless reference material.

**Code example from project:**
```java
// SecurityConfig.java line 62 - Singleton bean
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(); // One instance for entire app
}

// JwtService.java line 23 - Singleton service
@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secretKey; // Config loaded once
    // No instance state - safe to be singleton
}
```

**Viva Q&A:**
Q: What if service has state (e.g., counter)?
A: Then singleton is wrong. Use @Scope("prototype") or request-scoped bean. Or use thread-safe state management (AtomicInteger). But most services should be stateless - business logic, not state.

Q: How does Spring ensure singleton thread-safety?
A: Spring doesn't make singletons thread-safe. You must ensure your bean is thread-safe. For stateless beans (no mutable fields), thread-safety is automatic. For stateful beans, use synchronization or concurrent collections.

---

## Factory Pattern (ApiResponse.success() / ApiResponse.error())

**Where used in this project:**
- `ApiResponse.java` line 66-92: Static factory methods
- `ApiResponse.success(message, data)` - creates success response
- `ApiResponse.error(message)` - creates error response
- `ApiResponse.successPaginated(...)` - creates paginated response

**Why static factory methods not constructors:**
Descriptive names (success vs error) vs generic constructors. Can return subtypes or cached instances. Can enforce invariants (e.g., error response always has null data). Can hide complex construction logic.

From `ApiResponse.java` line 66-92:
```java
public static <T> ApiResponse<T> success(String message, T data) {
    return new ApiResponse<>(true, message, data);
}

public static <T> ApiResponse<T> error(String message) {
    return new ApiResponse<>(false, message, null); // Always null data for error
}
```

**How it enforces consistent response shape:**
All API responses follow same structure: `{success, message, data}`. Factory methods ensure this consistency. Developers can't accidentally create malformed response. Type-safe generic parameter T for data field.

**What alternative was rejected and why:**
Direct constructor calls (`new ApiResponse<>(true, msg, data)`). Rejected because: less readable, can create inconsistent responses (e.g., success=true but data=null), no validation. Factory methods provide controlled creation.

**Real-life analogy:**
Car factory: You don't build car from parts. You ask factory for "red sedan" or "blue SUV". Factory ensures correct assembly. You don't accidentally put truck engine in sedan.

**Code example from project:**
```java
// ApiResponse.java line 66-75
public static <T> ApiResponse<T> success(String message, T data) {
    return new ApiResponse<>(true, message, data);
}

public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(true, "Success", data);
}

// Usage in AdminController.java line 58
return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
// vs: return ResponseEntity.ok(new ApiResponse<>(true, "Stats fetched", stats));
```

**Viva Q&A:**
Q: Why not use Builder pattern for ApiResponse?
A: ApiResponse has only 3-5 fields. Builder is overkill. Factory methods are simpler. Builder is better for 10+ optional fields. Factory is better for 2-3 variants (success/error).

Q: Can factory method return null?
A: Yes, but shouldn't. Factory methods should never return null - defeats purpose. Return error response or throw exception. Null breaks type safety and requires null checks everywhere.

---

## Observer Pattern (CustomEvent in frontend)

**Where used in this project:**
- `AuthContext.tsx` line 156: `window.dispatchEvent(new CustomEvent('auth:login:success'))`
- `api.ts` line 55: `window.dispatchEvent(new CustomEvent('auth:logout'))`
- `CartContext.tsx` line 99: `window.addEventListener('auth:logout', clearCart)`
- `AuthModal.tsx` line 39: `window.addEventListener('auth:login:success', handleRedirect)`

**Why this pattern was chosen:**
Decoupled communication. Components don't need direct references. One-to-many notification. AuthContext doesn't know about CartContext or AuthModal. Clean separation of concerns.

**auth:login:success event: who fires, who listens:**
- **Fires**: AuthContext.tsx line 156 after successful login
- **Listens**: AuthModal.tsx line 39 (redirects based on role)
- **Purpose**: Notify UI components that user logged in, trigger role-based redirect without tight coupling

**auth:logout event: CartContext listening to clear cache:**
- **Fires**: api.ts line 55 when token refresh fails
- **Listens**: CartContext.tsx line 99 (clears cart from localStorage)
- **Purpose**: Clear user-specific data when session expires. CartContext doesn't call AuthContext - just listens for event.

**Why events instead of direct function calls:**
Loose coupling. Components don't import each other. Can add new listeners without modifying event source. Event-driven architecture fits React's component model. Direct calls would create circular dependencies (CartContext importing AuthContext importing CartContext).

**Real-life analogy:**
Airport announcement system: When flight lands (event), multiple parties listen (baggage claim, customs, ground transport). Flight doesn't call each directly. Announces, everyone reacts independently.

**Code example from project:**
```java
// AuthContext.tsx line 156 - Fire event
window.dispatchEvent(new CustomEvent('auth:login:success', {
    detail: { role: authRole || user.role }
}));

// AuthModal.tsx line 39 - Listen for event
useEffect(() => {
    const handleRedirect = (e: any) => {
        const role = e.detail.role;
        if (role === 'ADMIN') navigate('/admin');
        // ...
    };
    window.addEventListener('auth:login:success', handleRedirect);
    return () => window.removeEventListener('auth:login:success', handleRedirect);
}, []);
```

**Viva Q&A:**
Q: Why use window.addEventListener instead of React context?
A: Cross-context communication. AuthContext and CartContext are separate. Event bus allows communication without importing each other. React context would require nesting or context merging.

Q: What if event listener not removed?
A: Memory leak. Component unmounts but listener remains. Always remove in cleanup function (return of useEffect). This project correctly removes listeners.

---

## Repository Pattern

**Where used in this project:**
- `UserRepository.java` extends `JpaRepository<User, Long>`
- `BookingRepository.java` extends `JpaRepository<Booking, Long>`
- All repositories are interfaces, no implementation

**Why Spring Data JPA repository interfaces not direct SQL:**
Abstraction over JDBC. No boilerplate SQL for CRUD. Method name query generation. Pagination support. Type-safe. Easy to mock for testing. Switch database without changing code.

From `UserRepository.java` line 19-39:
```java
Optional<User> findByEmail(String email);  // Generates: SELECT * FROM users WHERE email = ?
List<User> findByRole(UserRole role);      // Generates: SELECT * FROM users WHERE role = ?
Boolean existsByEmail(String email);       // Generates: SELECT COUNT(*) > 0 FROM users WHERE email = ?
```

**What findByEmail generates (the SQL query behind the method name):**
Spring Data JPA parses method name "findByEmail" and generates:
```sql
SELECT u FROM User u WHERE u.email = :email
```
Parameter binding handled automatically. Returns Optional<User> (null-safe). No SQL writing needed.

**Why @Query when method name is not enough:**
Complex queries beyond simple findBy. Joins, aggregations, subqueries. Custom JPQL or native SQL. Performance optimization (specific query plan). Method name would be unreadable for complex queries.

From `UserRepository.java` line 46-52:
```java
@Query("select function('date', u.createdAt), count(u) "
        + "from User u "
        + "where u.createdAt between :start and :end "
        + "group by function('date', u.createdAt) "
        + "order by function('date', u.createdAt)")
List<Object[]> countUsersByDateRange(@Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end);
```

**What alternative was rejected and why:**
Direct JDBC with PreparedStatement. Rejected because: verbose, manual result mapping, connection management, error-prone. JPA handles all this automatically.

**Real-life analogy:**
Repository pattern is like library catalog. You ask librarian for "book by author Smith" (findByAuthor). Librarian finds it. You don't go to shelves yourself. Librarian knows how catalog is organized.

**Code example from project:**
```java
// UserRepository.java line 19 - Method name query
Optional<User> findByEmail(String email);

// Usage in AuthService.java line 207
User user = userRepository.findByEmail(normalizedEmail)
        .orElseThrow(() -> new RuntimeException("User not found"));

// UserRepository.java line 46-52 - Custom query
@Query("select function('date', u.createdAt), count(u) from User u where u.createdAt between :start and :end group by function('date', u.createdAt)")
List<Object[]> countUsersByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
```

**Viva Q&A:**
Q: Why JpaRepository not CrudRepository?
A: JpaRepository extends CrudRepository. Adds pagination, sorting, batch operations. This project needs pagination (admin user list). JpaRepository provides these features out of the box.

Q: Can I use native SQL in @Query?
A: Yes, add `nativeQuery = true`. Use for database-specific features or complex queries not expressible in JPQL. Trade-off: loses database portability.

---

# FRONTEND ARCHITECTURE

## Component Architecture

**Where used in this project:**
- `MainLayout.tsx` - Header, Footer, persistent layout
- `AnimatedRoutes.tsx` - Route configuration
- Pages: `LandingPage.tsx`, `AdminDashboard.tsx`, etc.
- Components: `Header.tsx`, `LoadingSpinner.tsx`, `GlassCard.tsx`

**Why split Header/Footer/Layout vs embedding in every page:**
DRY principle. Don't repeat header/footer code in every page. Consistent navigation across app. Easy to update header in one place. Better UX (persistent navigation, no re-render on route change). Separation of concerns: layout vs page content.

**Why Pages don't contain business logic (services do):**
Separation of concerns. Components = UI rendering. Services = API calls, data transformation. Components are testable (mock services). Services are reusable across components. Business logic changes don't require component changes.

From `AdminDashboard.tsx`:
```typescript
// Component only renders UI, calls service
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    
    useEffect(() => {
        adminService.getSystemStats().then(data => setStats(data));
    }, []);
    
    return <div>{/* render stats */}</div>;
};
```

**Real-life analogy:**
Restaurant: Layout is dining room (tables, chairs, menu). Pages are different meals. You don't rebuild dining room for each meal. Layout stays, meal changes. Business logic (cooking) happens in kitchen (services), not dining room.

**Code example from project:**
```typescript
// MainLayout.tsx - Reusable layout
const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Outlet /> {/* Page content rendered here */}
            </main>
            <Footer />
        </div>
    );
};

// AnimatedRoutes.tsx - Uses MainLayout
<Route element={<MainLayout />}>
    <Route path="/" element={<LandingPage />} />
    <Route path="/lab-tests" element={<TestListingPage />} />
</Route>
```

**Viva Q&A:**
Q: What if some pages need different layout?
A: Create multiple layout components (e.g., AuthLayout, AdminLayout). Wrap routes in appropriate layout. This project uses MainLayout for most pages, can add AuthLayout for login pages.

Q: Why use Outlet component?
A: Outlet renders child route content. Allows nested routing. MainLayout wraps all child routes. Without Outlet, child routes wouldn't render. React Router v6 feature.

---

## Context API vs Redux

**Where used in this project:**
- `AuthContext.tsx` - Authentication state
- `CartContext.tsx` - Shopping cart state
- `ModalContext.tsx` - Modal state

**Why Context for auth/cart (global, small state):**
Simple API (createContext, useContext). Built into React (no extra library). Good for global state that doesn't change frequently. Auth and cart are global, accessed from many components. No complex state management needed.

**Why not Redux (boilerplate not justified for this scale):**
Redux requires: actions, reducers, store, dispatch, selectors, middleware. Overkill for simple auth/cart state. Context is simpler. This project has 2-3 global state contexts, not 50. Redux shines for complex state, time-travel debugging, middleware. Not needed here.

**What alternative was rejected and why:**
Redux Toolkit. Rejected because: additional dependency, learning curve, boilerplate. State is simple enough for Context. If app grows significantly, can migrate to Redux later.

**Real-life analogy:**
Context is like a bulletin board in office. Everyone can see/read/modify. Redux is like a formal document management system with approval workflows, versioning, audit trails. For simple notes, bulletin board is sufficient.

**Code example from project:**
```typescript
// AuthContext.tsx - Simple context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    const login = async (credentials) => {
        // login logic
    };
    
    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Usage in component
const { currentUser, login } = useAuth();
```

**Viva Q&A:**
Q: When would you migrate to Redux?
A: If state becomes complex (nested objects, many reducers), need time-travel debugging, require middleware (logging, persistence), or have frequent state updates across many components. Currently, state is flat and simple.

Q: Why not use React Query for server state?
A: React Query is great for caching, deduplication. This project uses simple axios with manual caching in localStorage. Could add React Query for better caching, refetching, optimistic updates. Not critical for current scale.

---

## Code Splitting (React.lazy + Suspense)

**Where used in this project:**
- `AnimatedRoutes.tsx` line 34-78: All pages lazy-loaded
- `const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'))`
- `Suspense` wrapper with LoadingSpinner fallback

**Why AdminDashboard loaded lazily:**
Admin dashboard is heavy (charts, data fetching). Not every user needs it. Lazy loading reduces initial bundle size. Faster initial page load. Code loaded only when needed (on-demand). Better perceived performance.

**What happens without lazy loading (bundle size impact):**
All pages in one bundle. Initial load downloads entire app (2-3 MB). Slow on slow connections. Wasted bandwidth for pages user never visits. Higher memory usage. Lazy loading splits into chunks, loads only needed route.

From `AnimatedRoutes.tsx` line 34-78:
```typescript
const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));
const TechnicianDashboardPage = lazy(() => import('../../pages/technician/TechnicianDashboardPage'));
// 30+ pages lazy-loaded

<Suspense fallback={<LoadingSpinner />}>
    <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
</Suspense>
```

**Real-life analogy:**
Lazy loading is like on-demand video streaming. Don't download entire movie upfront. Download chunks as you watch. Faster start, less bandwidth. Without lazy loading: download entire movie before watching.

**Code example from project:**
```typescript
// AnimatedRoutes.tsx line 34-40
const LandingPage = lazy(() => import('../../pages/LandingPage'));
const TestListingPage = lazy(() => import('../../pages/TestListingPage'));
const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));

// AnimatedRoutes.tsx line 86
<Suspense fallback={<LoadingSpinner />}>
    <Routes>
        {/* Routes with lazy-loaded components */}
    </Routes>
</Suspense>
```

**Viva Q&A:**
Q: What is lazyWithRetry?
A: Custom wrapper in AnimatedRoutes.tsx line 9-30. Catches dynamic import failures. Reloads page on network error. Prevents permanent white screen if chunk fails to load. Production safety net.

Q: Does lazy loading affect SEO?
A: Yes, for initial page. Landing page should not be lazy-loaded (or use SSR). This project lazy-loads LandingPage - could improve by loading it eagerly for SEO. Trade-off: bundle size vs SEO.

---

## Service Layer in Frontend

**Where used in this project:**
- `services/adminService.ts` - Admin API calls
- `services/api.ts` - Axios instance with interceptors
- `services/booking.ts` - Booking API calls
- Components call services, not api.ts directly

**Why api.ts not called directly in components:**
Abstraction layer. Components don't know endpoint URLs. Can change API structure without touching components. Centralized error handling, token management, retry logic. Reusable API calls across components.

**What adminService.getSystemStats() abstracts from the component:**
Component calls `adminService.getSystemStats()`. Service internally calls `api.get('/api/admin/stats')`. Component doesn't know URL. If endpoint changes to `/api/dashboard/stats`, only service needs update. Component code unchanged.

From `services/adminService.ts`:
```typescript
export const adminService = {
    getSystemStats: async () => {
        const response = await api.get('/api/admin/stats');
        return response.data.data;
    },
    // ... other methods
};
```

**How this enables easy endpoint URL changes:**
Change URL in one place (service file). All components using that service automatically use new URL. No search-and-replace across codebase. Reduces bugs from missed updates. Centralized API contract.

**Real-life analogy:**
Service layer is like restaurant waiter. You order "steak" (service method). Waiter knows kitchen details (which chef, which station). You don't need to know. If kitchen reorganizes, waiter adapts, your order stays same.

**Code example from project:**
```typescript
// services/adminService.ts
export const adminService = {
    getSystemStats: async () => {
        const response = await api.get('/api/admin/stats');
        return response.data.data;
    }
};

// Component usage
const AdminDashboard = () => {
    useEffect(() => {
        adminService.getSystemStats().then(setStats);
    }, []);
    // Component doesn't know URL is /api/admin/stats
};
```

**Viva Q&A:**
Q: Why not just call api.get() in component?
A: Tight coupling. If 10 components call `/api/admin/stats` and URL changes, must update 10 files. With service, update 1 file. Also, service can add caching, transformation, error handling.

Q: What about query parameters?
A: Service methods accept parameters: `getUsers(page, size, role)`. Service constructs URL with params. Component just passes data. Abstraction maintained.

---

## Protected Routes

**Where used in this project:**
- `ProtectedRoute.tsx` - Route wrapper component
- `AnimatedRoutes.tsx` line 123-174 - Wraps protected routes
- `allowedRoles` prop for role-based access

**What ProtectedRoute checks before rendering:**
1. Is user authenticated? (from AuthContext)
2. Is user loading? (show spinner)
3. Does user have required role? (if allowedRoles specified)
4. If any check fails, redirect to appropriate page

From `ProtectedRoute.tsx` line 44-58:
```typescript
if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
}

if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(currentUser.role as any)) {
        if (role === 'ADMIN') return <Navigate to="/admin" replace />;
        // Redirect to appropriate dashboard
    }
}
```

**Why Navigate not window.location.href:**
Navigate is React Router component. Preserves app state, doesn't reload page. Faster, better UX. window.location.href causes full page reload, loses state. Navigate is SPA-friendly.

**Why allowedRoles prop, not hardcoded in each page:**
Reusable component. Different routes need different roles. Pass role requirement as prop. No code duplication. Easy to change role requirements. Centralized auth logic in ProtectedRoute.

From `AnimatedRoutes.tsx` line 123-135:
```typescript
<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/bookings" element={<AdminBookingsPage />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={['TECHNICIAN']} />}>
    <Route path="/technician" element={<TechnicianDashboardPage />} />
</Route>
```

**Real-life analogy:**
Protected route is like security checkpoint with ID scanner. Scanner checks if you have badge. If badge is red (admin), opens all doors. If blue (technician), opens lab doors. Scanner doesn't know about specific rooms - just checks badge.

**Code example from project:**
```typescript
// ProtectedRoute.tsx
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, currentUser, isLoading } = useAuth();
    
    if (!isAuthenticated || !currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/admin" replace />; // or appropriate dashboard
    }
    
    return <Outlet />;
};

// Usage in AnimatedRoutes.tsx
<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
    <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

**Viva Q&A:**
Q: What about loading timeout?
A: ProtectedRoute has 5-second timeout (line 10, 24-32). If auth loading hangs, force redirect to login. Failsafe to prevent infinite spinner. Good UX, prevents stuck screen.

Q: Why preserve location state on redirect?
A: After login, redirect user to intended destination. User tried to access `/admin/users`, redirected to login, after login should go back to `/admin/users`. Better UX than always redirecting to home.

---

# SECURITY ARCHITECTURE

## Why BCrypt not MD5/SHA256 for passwords

**Where used in this project:**
- `SecurityConfig.java` line 62: `new BCryptPasswordEncoder()`
- `AuthService.java` line 76: `passwordEncoder.encode(request.getPassword())`
- `AuthService.java` line 232: `passwordEncoder.matches(password, user.getPassword())`

**Salt rounds: what they prevent (rainbow table attacks):**
BCrypt automatically generates random salt for each password. Salt is combined with password before hashing. Prevents rainbow table attacks (precomputed hash tables). Same password hashes differently each time. Salt stored with hash (BCrypt format includes salt). 10 rounds in this project (configurable).

**Why BCrypt is intentionally slow:**
Slows down brute force attacks. 10 rounds = ~100ms per hash. Attacker can try 10 passwords/second instead of 10,000/second. Legitimate login unaffected (one hash per login). Computation cost is acceptable for security benefit.

From `SecurityConfig.java` line 62:
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(); // Default 10 rounds
}
```

**What alternative was rejected and why:**
MD5/SHA-256. Rejected because: fast (vulnerable to brute force), no built-in salt (rainbow table attacks), not designed for passwords. BCrypt is password-specific hashing algorithm.

**Real-life analogy:**
BCrypt is like a slow lock that takes 10 seconds to open. Thief can only try 6 locks per minute. MD5 is like instant lock - thief can try thousands per minute. For legitimate user (has key), 10 seconds is acceptable.

**Code example from project:**
```java
// AuthService.java line 76 - Hash password on registration
user.setPassword(passwordEncoder.encode(request.getPassword().trim()));

// AuthService.java line 232 - Verify password on login
if (!passwordEncoder.matches(password, user.getPassword())) {
    loginAttemptService.recordFailedAttempt(normalizedEmail);
    throw new InvalidCredentialsException("Invalid email or password");
}
```

**Viva Q&A:**
Q: Why not use SHA-256 with random salt manually?
A: Possible but error-prone. Must generate salt, store it, combine correctly. BCrypt handles this automatically. BCrypt includes adaptive cost factor (can increase rounds as hardware improves). Manual implementation risks bugs.

Q: What if BCrypt is too slow for your use case?
A: Can reduce rounds (e.g., 8 rounds) for faster hashing. Trade-off: less security. For web apps, 10 rounds is standard. For high-throughput systems, consider Argon2 (newer, GPU-resistant).

---

## CORS Configuration

**Where used in this project:**
- `SecurityConfig.java` line 67-105: `corsConfigurationSource()`
- Allowed origins: localhost:3000, 5173, 5174, 127.0.0.1:5173

**Why localhost:3000 and 5173 both allowed:**
Development uses multiple ports. 3000 = CRA (Create React App). 5173 = Vite (this project). Developer might switch between setups. Both allowed for flexibility. Production would use single domain.

From `SecurityConfig.java` line 45-46:
```java
@Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5173}")
private String allowedOriginsCsv;
```

**What preflight request is:**
OPTIONS request sent before actual request (for non-simple requests). Browser asks server: "Can I send POST with Authorization header from this origin?" Server responds with allowed methods, headers, origin. If allowed, browser sends actual request. CORS security check.

From `SecurityConfig.java` line 82-83:
```java
configuration.setAllowedMethods(Arrays.asList(
    "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
```

**Why * is dangerous in production:**
Allows any origin to access API. Any website can call your API from user's browser. CSRF vulnerability. Data theft. User's cookies/tokens exposed to malicious sites. Must whitelist specific origins in production.

**Real-life analogy:**
CORS is like guest list at party. Preflight = "Can I come in?" check. Whitelist = specific names on list. Wildcard * = "Anyone can come in" - dangerous, crashers can enter. Whitelist = only invited guests.

**Code example from project:**
```java
// SecurityConfig.java line 67-105
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    List<String> allowedOrigins = Arrays.stream(allowedOriginsCsv.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
    
    configuration.setAllowedOrigins(allowedOrigins); // Whitelist, not *
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**Viva Q&A:**
Q: Why setAllowCredentials(true)?
A: Allows sending cookies, Authorization headers. Required for JWT token in Authorization header. Without this, browser won't send credentials even if included in request. Trade-off: can't use * with credentials (must specify origins).

Q: What is exposedHeaders?
A Headers that browser can read in response. By default, only 6 simple headers exposed. Custom headers (X-Total-Count for pagination) must be explicitly exposed or browser can't read them. From SecurityConfig.java line 92-97.

---

## Data Validation at 3 levels

**Where used in this project:**
1. Frontend: Yup schema in forms
2. Backend: @Valid, @NotBlank on DTOs
3. Database: @Column(nullable = false) constraints

**1. Frontend (Yup schema) — user experience, fast feedback:**
Validates form before sending to server. Instant feedback to user. Reduces server load (invalid requests rejected early). Better UX (no round-trip for validation errors).

**2. Backend DTO (@Valid, @NotBlank) — security boundary:**
Second line of defense. Validates incoming API requests. Prevents malformed data from reaching business logic. Security boundary - don't trust client validation.

**3. Database (@Column constraints) — last line of defense:**
Final data integrity check. Prevents invalid data in database even if backend validation bypassed. Referential integrity (FK constraints). Data model enforcement.

From `User.java` line 31-38:
```java
@Column(nullable = false, length = 100)
private String name;

@Column(nullable = false, unique = true, length = 100)
private String email;

@Column(nullable = false)
private String password;
```

**Why all 3 needed, not just one:**
Defense in depth. Each layer serves different purpose:
- Frontend: UX, performance
- Backend: Security, business rules
- Database: Data integrity, consistency

Frontend can be bypassed (curl, Postman). Backend can have bugs. Database constraints ensure data model integrity regardless of application bugs.

**Real-life analogy:**
Three security checkpoints: Front door lock (frontend), security guard (backend), vault lock (database). Thief might pick front lock, must still pass guard. Guard might fall asleep, vault still locked. Multiple layers = better security.

**Code example from project:**
```java
// Database level - User.java
@Column(nullable = false, unique = true)
private String email;

// Backend DTO level - RegisterRequest.java
@NotBlank(message = "Email is required")
@Email(message = "Invalid email format")
private String email;

// Frontend level - Form validation (Yup)
email: yup.string().email('Invalid email').required('Email is required')
```

**Viva Q&A:**
Q: What if validation rules differ between layers?
A: Should be consistent. Database is source of truth. Backend should match database. Frontend should match backend. Inconsistencies cause bugs (valid on frontend, rejected by backend). Keep validation logic in sync.

Q: Why not just rely on database constraints?
A. Poor UX. User fills form, submits, gets 500 error from database constraint violation. No helpful error message. Frontend validation gives instant feedback. Backend validation gives meaningful error messages. Database is last resort.

---

# COMMUNICATION PATTERNS

## Frontend → Backend Request Flow

**Full example end-to-end with code snippets at each step:**

**1. Component calls adminService.getSystemStats()**
```typescript
// AdminDashboard.tsx
const AdminDashboard = () => {
    useEffect(() => {
        adminService.getSystemStats().then(data => setStats(data));
    }, []);
};
```

**2. adminService calls api.get('/api/admin/stats')**
```typescript
// services/adminService.ts
getSystemStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data.data;
};
```

**3. api.ts adds Authorization: Bearer {token} header**
```typescript
// services/api.ts line 115-135
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
});
```

**4. Spring JwtAuthenticationFilter intercepts request**
```java
// JwtAuthenticationFilter.java (not shown, but exists)
// Extracts token from Authorization header
// Validates token using JwtService
// Sets SecurityContext with authentication
```

**5. Filter validates token, sets SecurityContext**
```java
// JwtService.java line 185-199
public boolean isTokenValid(String token) {
    try {
        Jwts.parserBuilder()
            .setSigningKey(getSignInKey())
            .build()
            .parseClaimsJws(token);
        return !isTokenExpired(token);
    } catch (JwtException | IllegalArgumentException e) {
        return false;
    }
}
```

**6. @PreAuthorize("hasRole('ADMIN')") checks SecurityContext**
```java
// SecurityConfig.java line 153
.requestMatchers("/api/admin/**").hasRole('ADMIN')

// AdminController.java line 41
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
```

**7. AdminController.getStats() called**
```java
// AdminController.java line 54-59
@GetMapping("/stats")
public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
    log.info("GET /api/admin/stats");
    Map<String, Object> stats = dashboardService.getAdminDashboardStats();
    return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
}
```

**8. DashboardService.getAdminDashboardStats() called**
```java
// DashboardService.java line 84-111
public Map<String, Object> getAdminDashboardStats() {
    Map<String, Object> stats = new HashMap<>();
    long totalBookings = bookingRepository.countByStatusNot(BookingStatus.CANCELLED);
    long totalUsers = userRepository.count();
    // ... business logic
    return stats;
}
```

**9. BookingRepository.count() + UserRepository.count() queries**
```java
// UserRepository.java line 44
long countByIsActiveTrue();

// BookingRepository.java (similar)
long countByStatusNot(BookingStatus status);
```

**10. Response wrapped in ApiResponse.success(data)**
```java
// AdminController.java line 58
return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
```

**11. JSON returned, axios resolves promise**
```typescript
// api.ts line 139-145
api.interceptors.response.use((response) => {
    if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} => ${response.status}`);
    }
    return response;
});
```

**12. Component sets state, UI re-renders**
```typescript
// AdminDashboard.tsx
const [stats, setStats] = useState(null);
adminService.getSystemStats().then(data => setStats(data));
// React re-renders with new stats data
```

---

## Error handling chain

**DB error → Repository throws → Service wraps → GlobalExceptionHandler catches → ApiResponse.error returned → api.ts intercepts 4xx/5xx → toast.error shown in UI**

**1. DB error - Repository throws exception**
```java
// UserRepository.java (implicit)
// If database constraint violated, Spring Data throws DataIntegrityViolationException
userRepository.save(user); // throws if email already exists
```

**2. Service wraps in custom exception**
```java
// AuthService.java line 95-97
try {
    savedUser = userRepository.save(user);
} catch (org.springframework.dao.DataIntegrityViolationException ex) {
    throw new UserAlreadyExistsException("Email or phone already registered");
}
```

**3. GlobalExceptionHandler catches**
```java
// GlobalExceptionHandler.java (not shown but exists)
@ExceptionHandler(UserAlreadyExistsException.class)
public ResponseEntity<ApiResponse<String>> handleUserAlreadyExists(UserAlreadyExistsException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(ex.getMessage()));
}
```

**4. ApiResponse.error returned**
```json
{
    "success": false,
    "message": "Email or phone already registered",
    "data": null
}
```

**5. api.ts intercepts 4xx/5xx**
```typescript
// api.ts line 146-181
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token refresh logic
        }
        if (error.response?.status === 429) {
            // Rate limit retry
        }
        return Promise.reject(error);
    }
);
```

**6. toast.error shown in UI**
```typescript
// AuthService in frontend (auth context)
catch (error: unknown) {
    const errorMsg = axios.isAxiosError(error)
        ? (error.response?.data?.message || error.message)
        : (error instanceof Error ? error.message : 'Authentication failed.');
    toast.error(errorMsg);
}
```

---

# VIVA MASTER QUESTIONS

## Q: Why Spring Boot not Node.js for this project?
A: Spring Boot provides enterprise-grade features out of the box: security, JPA, dependency injection, validation. Team has Java expertise. Strong typing catches errors at compile-time. Mature ecosystem for healthcare (HIPAA compliance libraries). Node.js would require manual implementation of many features Spring provides.

## Q: Why PostgreSQL not MongoDB?
A: Relational data model fits healthcare domain (users, bookings, reports with relationships). ACID transactions critical for bookings and payments. Complex queries needed (joins, aggregations). PostgreSQL's JSONB supports flexible data where needed. Strong referential integrity prevents orphaned records. Better for structured medical data.

## Q: Why React not Angular or Vue?
A: React's component model is flexible and widely adopted. Large ecosystem and community support. Virtual DOM performance. Team's existing React expertise. Unidirectional data flow easier to reason about. Angular is opinionated and heavy. Vue is less popular in enterprise.

## Q: Why JWT not Session-based auth?
A: JWT is stateless - no server-side session storage. Scalable across multiple servers. Works well with SPA (React) and mobile apps. Self-contained token contains user info. No database lookup needed for each request (after validation). Session-based would require session storage and session replication across servers.

## Q: What is CORS and why does it affect this project?
A: CORS (Cross-Origin Resource Sharing) is browser security feature. Frontend (localhost:5173) calling backend (localhost:8080) is cross-origin. Browser blocks requests unless server allows origin. This project configures allowed origins in SecurityConfig.java line 67-105. Without CORS config, API calls fail with CORS error.

## Q: What is N+1 query problem? Where could it occur here?
A: Loading bookings with patient name triggers N+1: 1 query for bookings + N queries for patients. Could occur in BookingRepository if not using JOIN FETCH. Fixed by using @EntityGraph or @Query with JOIN FETCH. Example: BookingRepository.findAll() would lazy-load patients, causing N+1. Solution: `@Query("SELECT b FROM Booking b JOIN FETCH b.patient")`

## Q: Why is the AdminController missing /api/admin/** causing 404 not 403?
A: If @RequestMapping("/api/admin") is missing, Spring doesn't map the controller to /api/admin. Requests to /api/admin/stats return 404 (not found) instead of 403 (forbidden). 404 = endpoint doesn't exist. 403 = endpoint exists but access denied. AdminController.java line 40 has @RequestMapping("/api/admin"), so this is not an issue.

## Q: What is the difference between @RestController and @Controller?
A: @RestController combines @Controller and @ResponseBody. Automatically serializes return objects to JSON. @Controller requires @ResponseBody on each method. This project uses @RestController for all API controllers (line 39 in AdminController). @Controller is for view controllers (returning HTML), not used in this SPA.

## Q: How does Spring know to inject UserRepository into UserService?
A: Constructor injection with @RequiredArgsConstructor (Lombok). Spring detects UserRepository bean in application context. Matches by type. Autowires into constructor parameter. @RequiredArgsConstructor generates constructor with final fields. From DashboardService.java line 16-17: `@RequiredArgsConstructor private final UserRepository userRepository;`

## Q: Why is Flyway used instead of running SQL manually?
A: Version-controlled database migrations. Automatic migration on startup. Prevents drift between environments. Team collaboration - everyone has same schema. Rollback capability. Manual SQL is error-prone, hard to track changes. Flyway provides audit trail of schema changes.

## Q: What would happen if JWT secret was leaked?
A: Attacker can forge tokens for any user. Can impersonate any role (ADMIN). Full system compromise. Must change secret immediately (invalidates all tokens). Force all users to re-login. Rotate secrets periodically. Store secret in environment variable, not in code. From JwtService.java line 27-40, secret is validated at startup.

## Q: Why does logout clear localStorage instead of calling backend?
A: JWT is stateless - no server session to invalidate. Client-side token removal is sufficient logout. Backend logout endpoint would need token blacklist (adds complexity). Trade-off: token remains valid until expiry (15 minutes). Acceptable for this project. Could add logout endpoint to invalidate refresh token.

## Q: What is React Lazy Loading and why is it in AnimatedRoutes?
A. Code splitting - load route components on-demand. Reduces initial bundle size. Faster page load. In AnimatedRoutes.tsx line 34-78, all pages are lazy-loaded with `lazy(() => import(...))`. Suspense wrapper shows LoadingSpinner while loading. Without lazy loading, entire app in one bundle, slow initial load.

## Q: Why does useEffect have an empty dependency array []?
A. Empty array means effect runs once on mount. No re-run on prop/state changes. Used for initialization (e.g., fetch data on mount). From AuthContext.tsx line 47-95, empty array ensures auth hydration runs once. If dependency omitted, effect runs every render (infinite loop). If dependencies added, effect re-runs when they change.

## Q: What is RBAC and how is it implemented here?
A. Role-Based Access Control. Users assigned roles (PATIENT, TECHNICIAN, MEDICAL_OFFICER, ADMIN). Roles determine permissions. Backend: @PreAuthorize("hasRole('ADMIN')") in SecurityConfig.java line 153 and AdminController.java line 41. Frontend: ProtectedRoute.tsx line 50-57 checks allowedRoles. Database: UserRole enum in UserRole.java. Defense in depth - checked on both frontend and backend.

---

**End of VIVA 5: Architecture & Design Patterns**

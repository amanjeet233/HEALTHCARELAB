# VIVA 6: API Flows - HEALTHCARELAB

---

# FLOW 1: User Registration

## Step-by-Step Flow

### 1. Frontend: RegisterForm.tsx onSubmit
```typescript
// RegisterForm.tsx (or AuthModal.tsx registration form)
const handleSubmit = async (data) => {
    try {
        await authContext.register({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "Password123",
            phoneNumber: "9876543210"
        });
        // On success: redirect to login or dashboard
    } catch (error) {
        // Show error toast
    }
};
```

### 2. Frontend: AuthContext.register()
```typescript
// AuthContext.tsx line 172-217
const register = async (userData: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    const { success, message, data } = response.data;
    
    if (!success) {
        throw new Error(message || 'Registration failed');
    }
    
    const token = data.accessToken;
    const refreshToken = data.refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    let user = data.user || await userService.getProfile();
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    
    window.dispatchEvent(new CustomEvent('auth:login:success', {
        detail: { role: user.role }
    }));
};
```

### 3. HTTP: POST /api/auth/register
```
POST /api/auth/register
Content-Type: application/json

{
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "phoneNumber": "9876543210",
    "phone": "9876543210",
    "role": "PATIENT"
}
```

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

### 4. Backend: JWT Filter NOT Active
**Why JWT filter not active:** Registration endpoint is public. SecurityConfig.java line 117: `.requestMatchers("/api/auth/**").permitAll()`. No token required for registration.

### 5. Backend: AuthController.register()
```java
// AuthController.java line 35-47
@PostMapping("/register")
public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
    log.info("Received registration request");
    AuthResponse response = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("User registered successfully", response));
}
```

### 6. Backend: Validation Steps (@Valid annotation)
**Frontend validation (Yup):** Email format, password complexity (8+ chars, 1 uppercase, 1 number), phone 10 digits.

**Backend DTO validation (RegisterRequest.java):**
- `@NotBlank` on email, password, name
- `@Email` on email
- `@Size(min=8, pattern="(?=.*[A-Z])(?=.*\\d).{8,}$")` on password
- `@Pattern(regexp="^\\d{10}$")` on phoneNumber

**If validation fails:** Spring returns 400 Bad Request with field errors:
```json
{
    "success": false,
    "message": "Validation failed",
    "data": {
        "email": "Email should be valid",
        "password": "Password must contain at least one uppercase letter and one number"
    }
}
```

### 7. Backend: AuthService.registerUser()
```java
// AuthService.java line 50-121
public AuthResponse registerUser(RegisterRequest request) {
    validateRegistrationRequest(request);
    
    String email = request.getEmail().trim().toLowerCase();
    String fullName = request.getFirstName() + " " + request.getLastName();
    
    if (userRepository.existsByEmail(email)) {
        return AuthResponse.builder()
                .message("User registered successfully. Please check your email for verification.")
                .build();
    }
    
    User user = new User();
    user.setEmail(email);
    user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
    user.setName(fullName);
    user.setPhone(request.getPhoneNumber().trim());
    user.setRole(UserRole.PATIENT);
    user.setIsActive(true);
    user.setIsVerified(false);
    
    User savedUser = userRepository.save(user);
    
    sendVerificationEmail(savedUser);
    
    String accessToken = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());
    String refreshToken = jwtService.generateRefreshToken(savedUser.getEmail());
    
    return AuthResponse.builder()
            .userId(savedUser.getId())
            .email(savedUser.getEmail())
            .name(savedUser.getName())
            .role(savedUser.getRole().name())
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .message("User registered successfully")
            .build();
}
```

### 8. Database: User Saved to users Table
```sql
INSERT INTO users (name, email, password, phone, role, is_active, is_verified, created_at, updated_at)
VALUES (
    'John Doe',
    'john@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- BCrypt hash
    '9876543210',
    'PATIENT',
    true,
    false,
    NOW(),
    NOW()
);
```

**Note:** Password is BCrypt hashed, not plain text.

### 9. Backend: JWT Generated
```java
// JwtService.java line 49-53
public String generateToken(String username, String role) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);
    return buildToken(claims, username, accessTokenExpiration);
}
```

**Token payload:**
```json
{
    "sub": "john@example.com",
    "role": "PATIENT",
    "iat": 1234567890,
    "exp": 1234654290
}
```

### 10. Response: JSON Shape
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "userId": 123,
        "email": "john@example.com",
        "name": "John Doe",
        "role": "PATIENT",
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "tokenType": "Bearer"
    }
}
```

### 11. Frontend: State Changes
```typescript
// AuthContext.tsx
localStorage.setItem('token', accessToken);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(user));
setCurrentUser(user);

// Fire event for role-based redirect
window.dispatchEvent(new CustomEvent('auth:login:success', {
    detail: { role: 'PATIENT' }
}));
```

### 12. Frontend: What Renders
- AuthModal.tsx listens for `auth:login:success` event
- Redirects to `/` (landing page) or dashboard based on role
- Toast notification: "Registration successful. Welcome!"
- Header shows user name, logout button appears

---

## Error Scenarios

### Scenario 1: Email Already Exists
**HTTP Status:** 400 Bad Request
**Response JSON:**
```json
{
    "success": false,
    "message": "Email or phone already registered",
    "data": null
}
```
**Frontend:** Toast error "Email or phone already registered"

### Scenario 2: Validation Failure (Weak Password)
**HTTP Status:** 400 Bad Request
**Response JSON:**
```json
{
    "success": false,
    "message": "Password must be at least 8 characters and include one uppercase letter and one number",
    "data": null
}
```
**Frontend:** Toast error with validation message

### Scenario 3: What Fails if name is Sent but firstName is Expected
**RegisterRequest.java has both fields:**
- `name` (required, 2-100 chars) - used as display name
- `firstName` and `lastName` (optional, 2-50 chars each) - used to construct full name

**If only `name` sent:** Registration succeeds. `name` field is used directly.
**If only `firstName` sent:** Validation fails because `name` is `@NotBlank`.
**If both sent:** AuthService constructs `fullName = firstName + " " + lastName`, but also uses `request.getName()` if populated.

**Best practice:** Send both `firstName`, `lastName`, and `name` (full name) to satisfy all validation rules.

---

## Security Checkpoints

**Which filter runs:** None (public endpoint). SecurityConfig.java line 117: `/api/auth/**` is `permitAll()`.

**Which annotation enforces the role:** None (public endpoint). No `@PreAuthorize` on registration.

**What token claim is checked:** None (no token required yet).

---

# FLOW 2: User Login + Role Redirect

## Step-by-Step Flow

### 1. Frontend: LoginForm.tsx onSubmit
```typescript
// LoginForm.tsx
const handleSubmit = async (data) => {
    try {
        await authContext.login({
            email: "john@example.com",
            password: "Password123"
        });
    } catch (error) {
        // Show error toast
    }
};
```

### 2. Frontend: AuthContext.login()
```typescript
// AuthContext.tsx line 108-170
const login = async (credentials: LoginRequest) => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    const { success, message, data } = response.data;
    
    if (!success) {
        throw new Error(message || 'Authentication failed');
    }
    
    clearAllUserData();
    setCurrentUser(null);
    
    const token = data.accessToken;
    const refreshToken = data.refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    let user = await userService.getProfile();
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    
    window.dispatchEvent(new CustomEvent('auth:login:success', {
        detail: { role: authRole || user.role }
    }));
    
    toast.success(message || `Welcome back, ${user.name}!`);
};
```

### 3. HTTP: POST /api/auth/login
```
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "Password123"
}
```

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Note:** No Authorization header (user doesn't have token yet).

### 4. Backend: JWT Filter NOT Active
**Why JWT filter not active:** Login endpoint is public. SecurityConfig.java line 117: `.requestMatchers("/api/auth/**").permitAll()`. No token required for login.

### 5. Backend: AuthController.login()
```java
// AuthController.java line 49-61
@PostMapping("/login")
public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
    log.info("Received login request");
    AuthResponse response = authService.login(request);
    return ResponseEntity.ok(ApiResponse.success("Login successful", response));
}
```

### 6. Backend: AuthService.authenticateUser()
```java
// AuthService.java line 181-273
public AuthResponse authenticateUser(LoginRequest request) {
    String email = safeTrim(request.getEmail());
    String password = request.getPassword();
    
    // Check account lockout
    if (loginAttemptService.isAccountLocked(normalizedEmail)) {
        throw new InvalidCredentialsException("Account temporarily locked due to multiple failed login attempts.");
    }
    
    // Look up user (generic message to prevent email enumeration)
    User user = userRepository.findByEmail(normalizedEmail)
            .orElseGet(() -> {
                loginAttemptService.recordFailedAttempt(normalizedEmail);
                return null;
            });
    
    if (user == null) {
        throw new InvalidCredentialsException("Invalid email or password");
    }
    
    // Active account check
    if (user.getIsActive() == null || !user.getIsActive()) {
        throw new InvalidCredentialsException("Account disabled");
    }
    
    // BCrypt password comparison
    if (!passwordEncoder.matches(password, user.getPassword())) {
        loginAttemptService.recordFailedAttempt(normalizedEmail);
        throw new InvalidCredentialsException("Invalid email or password");
    }
    
    // Clear failed attempts on success
    loginAttemptService.clearFailedAttempts(normalizedEmail);
    
    // Generate tokens
    String roleName = user.getRole().name();
    String accessToken = jwtService.generateToken(user.getEmail(), roleName);
    String refreshToken = jwtService.generateRefreshToken(user.getEmail());
    
    // Update last login timestamp
    user.setLastLoginAt(LocalDateTime.now());
    userRepository.save(user);
    
    // Audit trail
    auditService.logAction(
            user.getId(), user.getEmail(), roleName,
            "USER_LOGIN", "AUTH", String.valueOf(user.getId()),
            "User logged in successfully");
    
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
}
```

### 7. Database: BCrypt.matches() Query
```sql
-- BCrypt comparison happens in memory after fetching user
SELECT * FROM users WHERE email = 'john@example.com';
-- Then: BCrypt.checkpw(inputPassword, storedHash)
```

### 8. Backend: JWT Generated with Role Claim
```java
// JwtService.java line 49-53
public String generateToken(String username, String role) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", role);
    return buildToken(claims, username, accessTokenExpiration);
}
```

**Token payload includes:**
```json
{
    "sub": "john@example.com",
    "role": "PATIENT",
    "iat": 1234567890,
    "exp": 1234654290
}
```

### 9. Response: JSON Shape
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "tokenType": "Bearer",
        "userId": 123,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "PATIENT"
    }
}
```

### 10. Frontend: localStorage.setItem
```typescript
// AuthContext.tsx line 127-130
localStorage.setItem('token', token);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(user));
setCurrentUser(user);
```

### 11. Frontend: auth:login:success Event
```typescript
// AuthContext.tsx line 156-158
window.dispatchEvent(new CustomEvent('auth:login:success', {
    detail: { role: authRole || user.role }
}));
```

### 12. Frontend: AuthModal.tsx Listener
```typescript
// AuthModal.tsx line 39
useEffect(() => {
    const handleRedirect = (e: any) => {
        const role = e.detail.role;
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'TECHNICIAN') navigate('/technician');
        else if (role === 'MEDICAL_OFFICER') navigate('/medical-officer');
        else navigate('/');
    };
    window.addEventListener('auth:login:success', handleRedirect);
    return () => window.removeEventListener('auth:login:success', handleRedirect);
}, []);
```

### 13. Frontend: What Renders
- Redirect based on role:
  - ADMIN → `/admin`
  - TECHNICIAN → `/technician`
  - MEDICAL_OFFICER → `/medical-officer`
  - PATIENT → `/`
- Toast notification: "Welcome back, John Doe!"
- Header shows user name, logout button appears
- Auth modal closes

---

## Error Scenarios

### Scenario 1: Invalid Email or Password
**HTTP Status:** 400 Bad Request
**Response JSON:**
```json
{
    "success": false,
    "message": "Invalid email or password",
    "data": null
}
```
**Frontend:** Toast error "Invalid email or password"

### Scenario 2: Account Locked (Too Many Failed Attempts)
**HTTP Status:** 400 Bad Request
**Response JSON:**
```json
{
    "success": false,
    "message": "Account temporarily locked due to multiple failed login attempts. Try again in 15 minutes or reset your password.",
    "data": null
}
```
**Frontend:** Toast error with lockout message

### Scenario 3: Account Disabled
**HTTP Status:** 400 Bad Request
**Response JSON:**
```json
{
    "success": false,
    "message": "Account disabled",
    "data": null
}
```
**Frontend:** Toast error "Account disabled. Please contact support."

---

## Security Checkpoints

**Which filter runs:** None (public endpoint). SecurityConfig.java line 117: `/api/auth/**` is `permitAll()`.

**Which annotation enforces the role:** None (public endpoint).

**What token claim is checked:** None (no token required yet).

---

# FLOW 3: Lab Test Search + Booking

## Step-by-Step Flow

### 1. Frontend: TestListingPage → searchTerm Typed
```typescript
// TestListingPage.tsx
const handleSearch = (searchTerm: string) => {
    fetchTests(searchTerm, selectedCategory);
};

const fetchTests = async (search: string, category: string[]) => {
    const response = await labTestService.advancedSearch({
        search: search,
        category: category
    });
    setTests(response.data);
};
```

### 2. Frontend: labTestService.advancedSearch()
```typescript
// services/labTestService.ts
export const labTestService = {
    advancedSearch: async (params: AdvancedSearchParams) => {
        const response = await api.get('/api/lab-tests/advanced', { params });
        return response.data;
    }
};
```

### 3. HTTP: GET /api/lab-tests/advanced
```
GET /api/lab-tests/advanced?search=CBC&category=Hematology&page=1&limit=18
Accept: application/json
```

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Note:** No Authorization header required (public endpoint). SecurityConfig.java line 132: `.requestMatchers(HttpMethod.GET, "/api/lab-tests/**").permitAll()`.

### 4. Backend: LabTestController.getAdvancedTests()
```java
// LabTestController.java line 65-84
@GetMapping("/advanced")
public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getAdvancedTests(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) List<String> category,
        @RequestParam(required = false) String subCategory,
        @RequestParam(required = false) Boolean isTopDeal,
        @RequestParam(required = false) Boolean isTopBooked,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(name = "sort_by", required = false) String sortBy,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "18") int limit
) {
    Page<LabTestDTO> response = labTestService.getAdvancedSearchTests(
        search, category, subCategory, isTopDeal, isTopBooked, minPrice, maxPrice, sortBy, page, limit);
    return ResponseEntity.ok(ApiResponse.success("Advanced search results retrieved", response));
}
```

### 5. Database: LIKE Query (Not Exact Match)
```sql
-- LabTestRepository query (generated by Spring Data JPA)
SELECT * FROM lab_tests 
WHERE is_active = true 
  AND (test_name ILIKE '%CBC%' OR description ILIKE '%CBC%')
  AND category IN ('Hematology')
ORDER BY test_name
LIMIT 18 OFFSET 0;
```

**Why LIKE not exact match:** ILIKE (case-insensitive LIKE) allows partial matches. User types "CBC" → matches "Complete Blood Count (CBC)". Exact match would require user to type full name. Better UX with partial matching.

### 6. Response: List of LabTestDTOs
```json
{
    "success": true,
    "message": "Advanced search results retrieved",
    "data": {
        "content": [
            {
                "id": 1,
                "testCode": "cbc",
                "testName": "Complete Blood Count (CBC)",
                "description": "Measures red blood cells, white blood cells, platelets",
                "category": "Hematology",
                "price": 350.00,
                "discountedPrice": 280.00,
                "sampleType": "Blood",
                "fastingRequired": false,
                "isActive": true
            }
        ],
        "pageable": {
            "pageNumber": 0,
            "pageSize": 18,
            "totalElements": 1,
            "totalPages": 1
        }
    }
}
```

### 7. Frontend: Add to Cart → CartContext.addItem()
```typescript
// CartContext.tsx
const addToCart = async (testId: number, quantity: number) => {
    try {
        await cartService.addTestToCart({ testId, quantity });
        fetchCart(); // Refresh cart state
        toast.success("Test added to cart");
    } catch (error) {
        toast.error("Failed to add to cart");
    }
};
```

### 8. HTTP: POST /api/cart/add-test
```
POST /api/cart/add-test
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "testId": 1,
    "quantity": 1
}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT token>
```

### 9. Backend: JWT Filter Validates Token
```java
// JwtAuthenticationFilter intercepts request
// Extracts token from Authorization header
// Validates token signature and expiry
// Sets SecurityContext with authentication
```

### 10. Backend: CartController.addTestToCart()
```java
// CartController.java line 59-68
@PostMapping("/add-test")
@PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
public ResponseEntity<ApiResponse<CartResponse>> addTestToCart(
        @Valid @RequestBody AddTestToCart request,
        @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = getUserId(userDetails);
    CartResponse response = cartService.addTestToCart(userId, request);
    return new ResponseEntity<>(ApiResponse.success("Test added to cart", response), HttpStatus.CREATED);
}
```

### 11. Database: Cart Saved to cart Table
```sql
-- Insert or update cart
INSERT INTO carts (user_id, subtotal, discount_amount, total_price, status, item_count, created_at, expiry_at)
VALUES (123, 280.00, 0.00, 280.00, 'ACTIVE', 1, NOW(), NOW() + INTERVAL '30 days')
ON CONFLICT (user_id) DO UPDATE SET
    subtotal = carts.subtotal + 280.00,
    total_price = carts.total_price + 280.00,
    item_count = carts.item_count + 1;

-- Insert cart item
INSERT INTO cart_items (cart_id, lab_test_id, item_type, item_name, quantity, unit_price, discount_amount, final_price, added_at)
VALUES (cart_id, 1, 'LAB_TEST', 'Complete Blood Count (CBC)', 1, 280.00, 0.00, 280.00, NOW());
```

### 12. Response: CartResponse
```json
{
    "success": true,
    "message": "Test added to cart",
    "data": {
        "cartId": 456,
        "subtotal": 280.00,
        "discountAmount": 0.00,
        "totalPrice": 280.00,
        "itemCount": 1,
        "status": "ACTIVE",
        "items": [
            {
                "cartItemId": 789,
                "itemName": "Complete Blood Count (CBC)",
                "quantity": 1,
                "unitPrice": 280.00,
                "finalPrice": 280.00
            }
        ]
    }
}
```

### 13. Frontend: BookingPage → Form Filled
```typescript
// BookingPage.tsx
const handleBooking = async (bookingData: BookingFormData) => {
    try {
        const response = await bookingService.createBooking({
            labTestId: 1,
            bookingDate: "2026-04-20",
            timeSlot: "09:00-10:00",
            collectionType: "LAB"
        });
        toast.success("Booking created successfully");
        navigate('/my-bookings');
    } catch (error) {
        toast.error("Failed to create booking");
    }
};
```

### 14. HTTP: POST /api/bookings/create
```
POST /api/bookings/create
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "testId": 1,
    "bookingDate": "2026-04-20",
    "timeSlot": "09:00-10:00",
    "collectionType": "LAB"
}
```

### 15. Backend: BookingController.createBooking()
```java
// BookingController.java line 39-52
@PostMapping({ "", "/create" })
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
    log.info("Create booking request: {}", request);
    BookingResponse response = bookingService.createBooking(request);
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Booking created successfully", response));
}
```

### 16. Backend: BookingService.createBooking()
```java
// BookingService.java line 104-150+
@Transactional
public BookingResponse createBooking(BookingRequest request) {
    User patient = getCurrentUser();
    
    LabTest labTest = labTestRepository.findById(request.getTestId())
            .orElseThrow(() -> new RuntimeException("Lab test not found"));
    
    if (!labTest.getIsActive()) {
        throw new RuntimeException("Lab test is currently not available");
    }
    
    Booking booking = new Booking();
    booking.setBookingReference("BK-" + UUID.randomUUID().toString().substring(0, 8));
    booking.setPatient(patient);
    booking.setTest(labTest);
    booking.setBookingDate(request.getBookingDate());
    booking.setTimeSlot(request.getTimeSlot());
    booking.setCollectionType(request.getCollectionType());
    booking.setStatus(BookingStatus.BOOKED);
    booking.setTotalAmount(labTest.getDiscountedPrice() != null 
            ? labTest.getDiscountedPrice() 
            : labTest.getPrice());
    booking.setFinalAmount(booking.getTotalAmount());
    booking.setCreatedAt(LocalDateTime.now());
    booking.setUpdatedAt(LocalDateTime.now());
    
    Booking savedBooking = bookingRepository.save(booking);
    
    // Clear cart
    cartService.clearCart(patient.getId());
    
    return mapToResponse(savedBooking);
}
```

### 17. Database: Booking Saved with BOOKED Status
```sql
INSERT INTO bookings (
    booking_reference, patient_id, test_id, booking_date, time_slot, 
    collection_type, status, total_amount, final_amount, created_at, updated_at
)
VALUES (
    'BK-a1b2c3d4',
    123,
    1,
    '2026-04-20',
    '09:00-10:00',
    'LAB',
    'BOOKED',
    280.00,
    280.00,
    NOW(),
    NOW()
);
```

### 18. Response: BookingResponse
```json
{
    "success": true,
    "message": "Booking created successfully",
    "data": {
        "id": 1001,
        "bookingReference": "BK-a1b2c3d4",
        "patientName": "John Doe",
        "testName": "Complete Blood Count (CBC)",
        "bookingDate": "2026-04-20",
        "timeSlot": "09:00-10:00",
        "collectionType": "LAB",
        "status": "BOOKED",
        "totalAmount": 280.00,
        "finalAmount": 280.00
    }
}
```

### 19. Frontend: State Changes
```typescript
// BookingPage.tsx
toast.success("Booking created successfully");
navigate('/my-bookings');
// Cart is cleared automatically by backend
// CartContext will refetch cart on next mount
```

### 20. Frontend: What Renders
- Redirect to `/my-bookings`
- MyBookingsPage fetches and displays new booking
- Toast notification: "Booking created successfully"
- Cart badge updates (item count = 0)

---

## Error Scenarios

### Scenario 1: Test Not Found
**HTTP Status:** 500 Internal Server Error (or 400 if validation catches it)
**Response JSON:**
```json
{
    "success": false,
    "message": "Lab test not found with id: 999",
    "data": null
}
```
**Frontend:** Toast error "Lab test not found"

### Scenario 2: Test Not Active
**HTTP Status:** 500 Internal Server Error
**Response JSON:**
```json
{
    "success": false,
    "message": "Lab test is currently not available",
    "data": null
}
```
**Frontend:** Toast error "This test is currently unavailable"

### Scenario 3: Unauthorized (No Token)
**HTTP Status:** 401 Unauthorized
**Response JSON:**
```json
{
    "success": false,
    "message": "Unauthorized",
    "data": null
}
```
**Frontend:** Redirects to login page

---

## Security Checkpoints

**Which filter runs:** JwtAuthenticationFilter (for cart and booking endpoints).

**Which annotation enforces the role:**
- Cart: `@PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")` (CartController.java line 28)
- Booking: `@PreAuthorize("isAuthenticated()")` (BookingController.java line 209)

**What token claim is checked:**
- `sub` (email) - to identify user
- `role` - to check authorization (PATIENT or ADMIN for cart, any authenticated for booking)

---

# FLOW 4: Technician Marks Sample Collected

## Step-by-Step Flow

### 1. Frontend: TechnicianDashboardPage → "Mark Collected" Clicked
```typescript
// TechnicianDashboardPage.tsx
const handleMarkCollected = async (bookingId: number) => {
    try {
        await technicianService.updateCollectionStatus(bookingId);
        toast.success("Sample marked as collected");
        fetchBookings(); // Refresh list
    } catch (error) {
        toast.error("Failed to mark as collected");
    }
};
```

### 2. Frontend: technicianService.updateCollectionStatus()
```typescript
// services/technicianService.ts
export const technicianService = {
    updateCollectionStatus: async (bookingId: number) => {
        const response = await api.put(`/api/bookings/${bookingId}/collection`);
        return response.data;
    }
};
```

### 3. HTTP: PUT /api/bookings/{id}/collection
```
PUT /api/bookings/1001/collection
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Headers:**
```
Authorization: Bearer <JWT token with role=TECHNICIAN>
Content-Type: application/json
```

### 4. Backend: JWT Filter Validates TECHNICIAN Role
```java
// JwtAuthenticationFilter intercepts request
// Extracts token from Authorization header
// Validates token signature and expiry
// Extracts role claim from token
// Sets SecurityContext with authentication containing role
```

### 5. Backend: BookingController.markCollected()
```java
// BookingController.java line 157-169
@PutMapping("/{id}/collection")
@PreAuthorize("hasRole('TECHNICIAN')")
public ResponseEntity<ApiResponse<BookingResponse>> markCollected(@PathVariable Long id) {
    log.info("Marking booking {} as collected", id);
    try {
        BookingResponse booking = bookingService.markCollected(id);
        return ResponseEntity.ok(ApiResponse.success("Sample marked as collected", booking));
    } catch (BadRequestException ex) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(ex.getMessage()));
    }
}
```

### 6. Backend: BookingService.markCollected()
```java
// BookingService.java
public BookingResponse markCollected(Long bookingId) {
    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
    
    // Validate status transition
    BookingStatus currentStatus = booking.getStatus();
    if (currentStatus != BookingStatus.BOOKED && currentStatus != BookingStatus.CONFIRMED) {
        throw new BadRequestException("Cannot mark as collected: booking is not in BOOKED or CONFIRMED status");
    }
    
    booking.setStatus(BookingStatus.SAMPLE_COLLECTED);
    booking.setUpdatedAt(LocalDateTime.now());
    
    Booking savedBooking = bookingRepository.save(booking);
    
    // Audit log
    auditService.logAction(
            getCurrentUser().getId(), getCurrentUser().getEmail(), "TECHNICIAN",
            "SAMPLE_COLLECTED", "BOOKING", String.valueOf(bookingId),
            "Sample marked as collected", request.getRemoteAddr());
    
    return mapToResponse(savedBooking);
}
```

### 7. What Happens if Wrong Status
**If booking status is SAMPLE_COLLECTED already:**
- Throws `BadRequestException: Cannot mark as collected: booking is not in BOOKED or CONFIRMED status`
- HTTP 400 Bad Request
- Frontend shows error toast

**If booking status is CANCELLED:**
- Same error - cannot collect sample for cancelled booking

**If booking status is PROCESSING:**
- Same error - sample already collected and being processed

### 8. Database: Booking Status Updated
```sql
UPDATE bookings 
SET status = 'SAMPLE_COLLECTED', 
    updated_at = NOW()
WHERE id = 1001 
  AND status IN ('BOOKED', 'CONFIRMED');
```

### 9. Response: Updated BookingResponse
```json
{
    "success": true,
    "message": "Sample marked as collected",
    "data": {
        "id": 1001,
        "bookingReference": "BK-a1b2c3d4",
        "patientName": "John Doe",
        "testName": "Complete Blood Count (CBC)",
        "bookingDate": "2026-04-20",
        "timeSlot": "09:00-10:00",
        "status": "SAMPLE_COLLECTED",
        "technicianName": "Dr. Smith",
        "collectionType": "LAB"
    }
}
```

### 10. Frontend: State Changes
```typescript
// TechnicianDashboardPage.tsx
toast.success("Sample marked as collected");
fetchBookings(); // Refresh list to show updated status
```

### 11. Frontend: What Renders
- Booking card status changes from "BOOKED" to "SAMPLE_COLLECTED"
- Status badge color changes (yellow → green)
- "Mark Collected" button disabled (action already completed)
- "Upload Report" button enabled (next action)
- Toast notification: "Sample marked as collected"

---

## Error Scenarios

### Scenario 1: Wrong Status Transition
**HTTP Status:** 400 Bad Request
**Response JSON:**
```json
{
    "success": false,
    "message": "Cannot mark as collected: booking is not in BOOKED or CONFIRMED status",
    "data": null
}
```
**Frontend:** Toast error "Cannot mark as collected: booking is not in correct status"

### Scenario 2: Booking Not Found
**HTTP Status:** 500 Internal Server Error
**Response JSON:**
```json
{
    "success": false,
    "message": "Booking not found",
    "data": null
}
```
**Frontend:** Toast error "Booking not found"

### Scenario 3: Unauthorized (Not Technician)
**HTTP Status:** 403 Forbidden
**Response JSON:**
```json
{
    "success": false,
    "message": "Access Denied",
    "data": null
}
```
**Frontend:** Toast error "You don't have permission to perform this action"

---

## Security Checkpoints

**Which filter runs:** JwtAuthenticationFilter.

**Which annotation enforces the role:** `@PreAuthorize("hasRole('TECHNICIAN')")` (BookingController.java line 158).

**What token claim is checked:**
- `role` claim must be "TECHNICIAN"
- If role is PATIENT or ADMIN, returns 403 Forbidden

---

# FLOW 5: Technician Uploads Report

## Step-by-Step Flow

### 1. Frontend: TechnicianDashboardPage → File Selected
```typescript
// TechnicianDashboardPage.tsx
const handleFileUpload = async (bookingId: number, file: File) => {
    const formData = new FormData();
    formData.append('bookingId', bookingId.toString());
    formData.append('file', file);
    
    try {
        await reportService.uploadReport(formData);
        toast.success("Report uploaded successfully");
        fetchBookings();
    } catch (error) {
        toast.error("Failed to upload report");
    }
};
```

### 2. Frontend: FormData Created
```typescript
const formData = new FormData();
formData.append('bookingId', '1001');
formData.append('file', fileObject); // File object from <input type="file">
```

### 3. HTTP: POST /api/reports/upload (multipart/form-data)
```
POST /api/reports/upload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

------WebKitFormBoundary...
Content-Disposition: form-data; name="bookingId"

1001
------WebKitFormBoundary...
Content-Disposition: form-data; name="file"; filename="report.pdf"
Content-Type: application/pdf

<PDF binary data>
------WebKitFormBoundary...--
```

**Why multipart not base64 JSON:**
- Multipart/form-data is standard for file uploads
- Base64 encoding increases file size by ~33%
- Multipart streams file directly, more memory efficient
- Better for large files (PDF reports can be several MB)
- Standard HTTP specification, widely supported

### 4. Backend: JWT Filter Validates TECHNICIAN Role
```java
// JwtAuthenticationFilter intercepts request
// Validates token, extracts role
// Sets SecurityContext
```

### 5. Backend: ReportController.uploadReport()
```java
// ReportController.java line 73-90
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("hasRole('TECHNICIAN')")
public ResponseEntity<ApiResponse<Report>> uploadReport(
        @RequestParam("bookingId") Long bookingId,
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal UserDetails principal,
        HttpServletRequest request) {
    log.info("Uploading PDF report for booking ID: {}", bookingId);
    Report report = reportService.uploadReport(bookingId, file);
    
    String uploader = principal != null ? principal.getUsername() : "UNKNOWN";
    auditService.logAction(
            null, uploader, "TECHNICIAN",
            "REPORT_UPLOADED", "REPORT", String.valueOf(bookingId),
            "PDF report uploaded for booking " + bookingId,
            request.getRemoteAddr());
    
    return ResponseEntity.ok(ApiResponse.success("Report uploaded successfully", report));
}
```

### 6. Backend: ReportService.uploadReport()
```java
// ReportService.java (pseudocode based on pattern)
@Transactional
public Report uploadReport(Long bookingId, MultipartFile file) {
    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
    
    // Validate file type
    if (!file.getContentType().equals("application/pdf")) {
        throw new RuntimeException("Only PDF files are allowed");
    }
    
    // Save file to configured path
    String fileName = "report-" + bookingId + "-" + System.currentTimeMillis() + ".pdf";
    String filePath = uploadPath + fileName;
    Files.copy(file.getInputStream(), Paths.get(filePath));
    
    // Create report record
    Report report = new Report();
    report.setBooking(booking);
    report.setReportPdfPath(filePath);
    report.setReportPdf(Files.readAllBytes(Paths.get(filePath)));
    report.setStatus(ReportStatus.PENDING_VERIFICATION);
    report.setUploadedAt(LocalDateTime.now());
    
    Report savedReport = reportRepository.save(report);
    
    // Update booking status
    booking.setStatus(BookingStatus.PENDING_VERIFICATION);
    booking.setUpdatedAt(LocalDateTime.now());
    bookingRepository.save(booking);
    
    // Create verification record
    ReportVerification verification = new ReportVerification();
    verification.setBooking(booking);
    verification.setStatus(VerificationStatus.PENDING);
    verification.setCreatedAt(LocalDateTime.now());
    reportVerificationRepository.save(verification);
    
    return savedReport;
}
```

### 7. Database: File Saved to Configured Path
```bash
# File saved to: /uploads/reports/report-1001-1713567890123.pdf
# Path stored in database
```

### 8. Database: Report Record Created
```sql
INSERT INTO reports (
    booking_id, report_pdf_path, report_pdf, status, uploaded_at, created_at
)
VALUES (
    1001,
    '/uploads/reports/report-1001-1713567890123.pdf',
    <binary PDF data>,
    'PENDING_VERIFICATION',
    NOW(),
    NOW()
);
```

### 9. Database: Booking Status Updated
```sql
UPDATE bookings 
SET status = 'PENDING_VERIFICATION', 
    updated_at = NOW()
WHERE id = 1001;
```

### 10. Database: ReportVerification Record Created
```sql
INSERT INTO report_verifications (
    booking_id, status, created_at
)
VALUES (
    1001,
    'PENDING',
    NOW()
);
```

### 11. Response: Report Metadata
```json
{
    "success": true,
    "message": "Report uploaded successfully",
    "data": {
        "id": 5001,
        "bookingId": 1001,
        "reportPdfPath": "/uploads/reports/report-1001-1713567890123.pdf",
        "status": "PENDING_VERIFICATION",
        "uploadedAt": "2026-04-20T10:30:00"
    }
}
```

### 12. Frontend: State Changes
```typescript
// TechnicianDashboardPage.tsx
toast.success("Report uploaded successfully");
fetchBookings(); // Refresh to show updated status
```

### 13. Frontend: What Renders
- Booking status changes from "SAMPLE_COLLECTED" to "PENDING_VERIFICATION"
- Status badge color changes (green → orange)
- "Upload Report" button disabled
- Toast notification: "Report uploaded successfully"

---

## Error Scenarios

### Scenario 1: Invalid File Type
**HTTP Status:** 500 Internal Server Error
**Response JSON:**
```json
{
    "success": false,
    "message": "Only PDF files are allowed",
    "data": null
}
```
**Frontend:** Toast error "Only PDF files are allowed"

### Scenario 2: File Too Large
**HTTP Status:** 500 Internal Server Error (or Spring's MaxUploadSizeExceededException)
**Response JSON:**
```json
{
    "success": false,
    "message": "File size exceeds maximum limit",
    "data": null
}
```
**Frontend:** Toast error "File is too large"

### Scenario 3: Unauthorized (Not Technician)
**HTTP Status:** 403 Forbidden
**Response JSON:**
```json
{
    "success": false,
    "message": "Access Denied",
    "data": null
}
```
**Frontend:** Toast error "You don't have permission to upload reports"

---

## Security Checkpoints

**Which filter runs:** JwtAuthenticationFilter.

**Which annotation enforces the role:** `@PreAuthorize("hasRole('TECHNICIAN')")` (ReportController.java line 74).

**What token claim is checked:**
- `role` claim must be "TECHNICIAN"
- Only technicians can upload reports

---

# FLOW 6: Medical Officer Verifies Report

## Step-by-Step Flow

### 1. Frontend: MedicalOfficerDashboardPage → "Verify" Clicked
```typescript
// MedicalOfficerDashboardPage.tsx
const handleVerify = async (bookingId: number) => {
    try {
        await medicalOfficerService.verifyReport(bookingId, {
            verificationNotes: "Results within normal range",
            status: "APPROVED"
        });
        toast.success("Report verified successfully");
        fetchPendingVerifications();
    } catch (error) {
        toast.error("Failed to verify report");
    }
};
```

### 2. Frontend: medicalOfficerService.verifyReport()
```typescript
// services/medicalOfficerService.ts
export const medicalOfficerService = {
    verifyReport: async (bookingId: number, data: VerificationRequest) => {
        const response = await api.post(`/api/mo/verify/${bookingId}`, data);
        return response.data;
    }
};
```

### 3. HTTP: POST /api/mo/verify/{bookingId}
```
POST /api/mo/verify/1001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
    "verificationNotes": "Results within normal range",
    "status": "APPROVED",
    "digitalSignature": "MO_SIGNATURE_HASH_HERE"
}
```

### 4. Why 400 Error if digitalSignature Missing (@NotBlank Conflict)
**ReportVerification entity has:**
```java
@Column(nullable = false)
private String digitalSignature;
```

**If digitalSignature is null:**
- Database constraint violation: `digitalSignature` is `@Column(nullable = false)`
- Hibernate throws `DataIntegrityViolationException`
- Spring translates to 500 Internal Server Error (or 400 if caught)

**@NotBlank conflict:** If DTO has `@NotBlank` but entity allows null initially, validation passes at DTO level but fails at database level. In this project, entity requires it, so validation should be in DTO too.

**Solution:** Ensure DTO has `@NotBlank` on digitalSignature field to catch validation early (400 Bad Request) instead of database error (500 Internal Server Error).

### 5. Backend: JWT Filter Validates MEDICAL_OFFICER Role
```java
// JwtAuthenticationFilter intercepts request
// Validates token, extracts role
// Sets SecurityContext
```

### 6. Backend: MedicalOfficerController.verifyReport()
```java
// MedicalOfficerController.java line 81-90
@PostMapping({"/verify/{bookingId}", "/verify/{reportId}"})
public ResponseEntity<ApiResponse<ReportVerificationResponse>> verifyReport(
        @PathVariable(value = "bookingId", required = false) Long bookingId,
        @PathVariable(value = "reportId", required = false) Long reportId,
        @Valid @RequestBody ReportVerificationRequest request) {
    
    Long idToUse = bookingId != null ? bookingId : reportId;
    ReportVerificationResponse response = medicalOfficerService.verifyReport(idToUse, request);
    return ResponseEntity.ok(ApiResponse.success("Report verified", response));
}
```

### 7. Backend: MedicalOfficerService.verifyReport()
```java
// MedicalOfficerService.java (pseudocode based on pattern)
@Transactional
public ReportVerificationResponse verifyReport(Long bookingId, ReportVerificationRequest request) {
    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
    
    ReportVerification verification = reportVerificationRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new RuntimeException("Verification record not found"));
    
    // Update verification
    verification.setMedicalOfficer(getCurrentUser());
    verification.setVerificationDate(LocalDateTime.now());
    verification.setClinicalNotes(request.getVerificationNotes());
    verification.setDigitalSignature(request.getDigitalSignature());
    verification.setStatus(VerificationStatus.VERIFIED);
    verification.setUpdatedAt(LocalDateTime.now());
    
    reportVerificationRepository.save(verification);
    
    // Update booking status
    booking.setStatus(BookingStatus.VERIFIED);
    booking.setMedicalOfficer(getCurrentUser());
    booking.setUpdatedAt(LocalDateTime.now());
    bookingRepository.save(booking);
    
    // Update report status
    Report report = reportRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
    report.setStatus(ReportStatus.VERIFIED);
    report.setVerifiedAt(LocalDateTime.now());
    reportRepository.save(report);
    
    // Trigger AI analysis (if implemented)
    aiAnalysisService.analyzeReport(bookingId);
    
    return mapToVerificationResponse(verification);
}
```

### 8. What Changes in DB: 3 Tables Updated

**Table 1: report_verifications**
```sql
UPDATE report_verifications 
SET medical_officer_id = 456,
    verification_date = NOW(),
    clinical_notes = 'Results within normal range',
    digital_signature = 'MO_SIGNATURE_HASH_HERE',
    status = 'VERIFIED',
    updated_at = NOW()
WHERE booking_id = 1001;
```

**Table 2: bookings**
```sql
UPDATE bookings 
SET status = 'VERIFIED',
    medical_officer_id = 456,
    updated_at = NOW()
WHERE id = 1001;
```

**Table 3: reports**
```sql
UPDATE reports 
SET status = 'VERIFIED',
    verified_at = NOW()
WHERE booking_id = 1001;
```

### 9. AI Analysis Triggered (If Implemented)
```java
// AIAnalysisService.analyzeReport(bookingId)
// Analyzes report results
// Generates health insights
// Stores in ai_analysis table
// Returns AIAnalysisResponse
```

### 10. Response: ReportVerificationResponse
```json
{
    "success": true,
    "message": "Report verified",
    "data": {
        "id": 6001,
        "bookingId": 1001,
        "medicalOfficerName": "Dr. Johnson",
        "verificationDate": "2026-04-20T11:00:00",
        "clinicalNotes": "Results within normal range",
        "status": "VERIFIED"
    }
}
```

### 11. Frontend: State Changes
```typescript
// MedicalOfficerDashboardPage.tsx
toast.success("Report verified successfully");
fetchPendingVerifications(); // Refresh list
```

### 12. Frontend: What Renders
- Verification card removed from "Pending" list
- Moves to "Verified" section
- Status badge changes (orange → green)
- Toast notification: "Report verified successfully"

---

## Error Scenarios

### Scenario 1: digitalSignature Missing
**HTTP Status:** 400 Bad Request (if DTO validation) or 500 Internal Server Error (if DB constraint)
**Response JSON:**
```json
{
    "success": false,
    "message": "digitalSignature is required",
    "data": null
}
```
**Frontend:** Toast error "Digital signature is required"

### Scenario 2: Booking Not in PENDING_VERIFICATION Status
**HTTP Status:** 500 Internal Server Error
**Response JSON:**
```json
{
    "success": false,
    "message": "Cannot verify report: booking is not in PENDING_VERIFICATION status",
    "data": null
}
```
**Frontend:** Toast error "Cannot verify report in current status"

### Scenario 3: Unauthorized (Not Medical Officer)
**HTTP Status:** 403 Forbidden
**Response JSON:**
```json
{
    "success": false,
    "message": "Access Denied",
    "data": null
}
```
**Frontend:** Toast error "Only Medical Officers can verify reports"

---

## Security Checkpoints

**Which filter runs:** JwtAuthenticationFilter.

**Which annotation enforces the role:** `@PreAuthorize("hasRole('MEDICAL_OFFICER')")` (MedicalOfficerController.java line 29 - class-level) and line 81 (method-level).

**What token claim is checked:**
- `role` claim must be "MEDICAL_OFFICER"
- Only medical officers can verify reports

---

# FLOW 7: Patient Downloads Report

## Step-by-Step Flow

### 1. Frontend: ReportsPage → GET /api/reports/my
```typescript
// ReportsPage.tsx
useEffect(() => {
    const fetchReports = async () => {
        try {
            const response = await reportService.getMyReports();
            setReports(response.data);
        } catch (error) {
            toast.error("Failed to fetch reports");
        }
    };
    fetchReports();
}, []);
```

### 2. Frontend: reportService.getMyReports()
```typescript
// services/reportService.ts
export const reportService = {
    getMyReports: async () => {
        const response = await api.get('/api/reports/my');
        return response.data;
    }
};
```

### 3. HTTP: GET /api/reports/my
```
GET /api/reports/my
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

### 4. Backend: JWT Filter Gets patientId from Token
```java
// JwtAuthenticationFilter intercepts request
// Validates token, extracts subject (email)
// Sets SecurityContext with authentication
// UserDetailsService loads user by email
```

### 5. Backend: ReportController.getMyReports()
```java
// ReportController.java line 109-115
@GetMapping("/my")
@PreAuthorize("hasRole('PATIENT')")
public ResponseEntity<ApiResponse<List<PatientReportItemDto>>> getMyReports() {
    log.info("Fetching reports for current patient");
    List<PatientReportItemDto> reports = reportService.getMyPatientReports();
    return ResponseEntity.ok(ApiResponse.success("Reports fetched successfully", reports));
}
```

### 6. Backend: ReportService.getMyPatientReports()
```java
// ReportService.java
public List<PatientReportItemDto> getMyPatientReports() {
    User currentUser = getCurrentUser();
    
    // Query bookings for current user
    List<Booking> bookings = bookingRepository.findByPatientId(currentUser.getId());
    
    // Filter only completed/verified bookings
    List<Booking> verifiedBookings = bookings.stream()
            .filter(b -> b.getStatus() == BookingStatus.VERIFIED || b.getStatus() == BookingStatus.COMPLETED)
            .toList();
    
    // Map to DTOs
    return verifiedBookings.stream()
            .map(this::mapToPatientReportItemDto)
            .toList();
}
```

### 7. Database: Queries Where patientId = Current User
```sql
SELECT * FROM bookings 
WHERE patient_id = 123 
  AND status IN ('VERIFIED', 'COMPLETED')
ORDER BY booking_date DESC;
```

### 8. Why This Never Returns Other Patients' Reports
- `getCurrentUser()` gets authenticated user from SecurityContext
- SecurityContext set by JwtAuthenticationFilter from token
- Token's `sub` claim is the user's email
- Query filters by `patient_id = currentUser.getId()`
- Database foreign key constraint ensures patient_id is valid
- Row-level security enforced at query level (WHERE clause)
- Even if hacker changes patient_id in request, query still uses authenticated user's ID

### 9. Response: List of Report Metadata
```json
{
    "success": true,
    "message": "Reports fetched successfully",
    "data": [
        {
            "id": 5001,
            "bookingId": 1001,
            "bookingReference": "BK-a1b2c3d4",
            "testName": "Complete Blood Count (CBC)",
            "bookingDate": "2026-04-20",
            "status": "VERIFIED",
            "verifiedDate": "2026-04-20T11:00:00"
        }
    ]
}
```

### 10. Frontend: "Download" Clicked
```typescript
// ReportsPage.tsx
const handleDownload = async (bookingId: number) => {
    try {
        const response = await reportService.downloadReport(bookingId);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        toast.error("Failed to download report");
    }
};
```

### 11. HTTP: GET /api/reports/{bookingId}/download
```
GET /api/reports/1001/download
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/pdf
```

### 12. Backend: ReportController.downloadReportByBooking()
```java
// ReportController.java line 117-131
@GetMapping("/{bookingId}/download")
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
public ResponseEntity<byte[]> downloadReportByBooking(@PathVariable Long bookingId) {
    Report report = reportService.getDownloadableReportByBooking(bookingId);
    String filename = resolveDownloadFilename(report, bookingId);
    ContentDisposition disposition = ContentDisposition.attachment()
            .filename(filename)
            .build();
    
    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
            .contentType(MediaType.APPLICATION_PDF)
            .body(report.getReportPdf());
}
```

### 13. Backend: ReportService.getDownloadableReportByBooking()
```java
// ReportService.java
public Report getDownloadableReportByBooking(Long bookingId) {
    User currentUser = getCurrentUser();
    
    Report report = reportRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    
    // Patient can only download their own reports
    if (currentUser.getRole() == UserRole.PATIENT) {
        if (!report.getBooking().getPatient().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Report not found");
        }
        if (report.getStatus() != ReportStatus.VERIFIED) {
            throw new ResourceNotFoundException("Report not ready");
        }
    }
    
    return report;
}
```

### 14. Database: Query Report PDF
```sql
SELECT * FROM reports 
WHERE booking_id = 1001;
```

### 15. Response: Content-Type: application/pdf, Content-Disposition: attachment
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename=report-booking-1001.pdf
Content-Length: 123456

<PDF binary data>
```

### 16. Frontend: window.open(blob URL) or Anchor Click
```typescript
const blob = new Blob([response.data], { type: 'application/pdf' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `report-${bookingId}.pdf`;
a.click();
```

### 17. Frontend: What Renders
- Browser downloads PDF file
- File saved to user's Downloads folder
- Toast notification: "Report downloaded successfully"

---

## Error Scenarios

### Scenario 1: Report Not Found
**HTTP Status:** 404 Not Found
**Response JSON:**
```json
{
    "success": false,
    "message": "Report not found",
    "data": null
}
```
**Frontend:** Toast error "Report not found"

### Scenario 2: Report Not Ready (Not Verified)
**HTTP Status:** 404 Not Found
**Response JSON:**
```json
{
    "success": false,
    "message": "Report not ready",
    "data": null
}
```
**Frontend:** Toast error "Report is not ready yet"

### Scenario 3: Unauthorized (Not Owner)
**HTTP Status:** 404 Not Found (not 403 - security by obscurity)
**Response JSON:**
```json
{
    "success": false,
    "message": "Report not found",
    "data": null
}
```
**Frontend:** Toast error "Report not found" (doesn't reveal it belongs to someone else)

---

## Security Checkpoints

**Which filter runs:** JwtAuthenticationFilter.

**Which annotation enforces the role:** `@PreAuthorize("hasRole('PATIENT')")` for getMyReports (line 110), `@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")` for download (line 118).

**What token claim is checked:**
- `sub` (email) - to identify user
- `role` - to check authorization (PATIENT for getMyReports)
- For download: additional check that patient can only download their own reports (service-level check)

---

# FLOW 8: Admin Creates Staff Account

## Step-by-Step Flow

### 1. Frontend: AdminDashboard → Staff Management → "Add Staff" Form
```typescript
// AdminStaffPage.tsx
const handleCreateStaff = async (staffData: StaffFormData) => {
    try {
        await adminService.createStaff({
            name: "Dr. Smith",
            email: "smith@lab.com",
            password: "Password123",
            role: "TECHNICIAN",
            phone: "9876543210"
        });
        toast.success("Staff account created successfully");
        fetchStaff();
    } catch (error) {
        toast.error("Failed to create staff account");
    }
};
```

### 2. Frontend: adminService.createStaff()
```typescript
// services/adminService.ts
export const adminService = {
    createStaff: async (staffData: StaffFormData) => {
        const response = await api.post('/api/admin/staff', staffData);
        return response.data;
    }
};
```

### 3. HTTP: POST /api/admin/staff
```
POST /api/admin/staff
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
    "name": "Dr. Smith",
    "email": "smith@lab.com",
    "password": "Password123",
    "role": "TECHNICIAN",
    "phone": "9876543210"
}
```

### 4. Backend: JWT Filter Validates ADMIN Role
```java
// JwtAuthenticationFilter intercepts request
// Validates token, extracts role
// Sets SecurityContext
```

### 5. Backend: AdminController.createStaff()
```java
// AdminController.java line 300-355
@PostMapping("/staff")
public ResponseEntity<ApiResponse<Map<String, Object>>> createStaff(
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal UserDetails principal,
        HttpServletRequest request) {
    log.info("POST /api/admin/staff - creating staff account");
    
    String name = body.getOrDefault("name", "").trim();
    String email = body.getOrDefault("email", "").trim().toLowerCase();
    String password = body.getOrDefault("password", "password123");
    String roleStr = body.getOrDefault("role", "").trim().toUpperCase();
    String phone = body.getOrDefault("phone", "").trim();
    
    if (name.isEmpty() || email.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Name and email are required"));
    }
    
    if (!roleStr.equals("TECHNICIAN") && !roleStr.equals("MEDICAL_OFFICER")) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Role must be TECHNICIAN or MEDICAL_OFFICER"));
    }
    
    if (userRepository.existsByEmail(email)) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Email already registered: " + email));
    }
    
    UserRole role = UserRole.valueOf(roleStr);
    User staff = new User();
    staff.setName(name);
    staff.setEmail(email);
    staff.setPassword(passwordEncoder.encode(password));
    staff.setRole(role);
    staff.setPhone(phone.isEmpty() ? "0000000000" : phone);
    staff.setIsActive(true);
    staff.setIsVerified(true);
    staff.setCreatedAt(LocalDateTime.now());
    staff.setUpdatedAt(LocalDateTime.now());
    
    User saved = userRepository.save(staff);
    
    User admin = userRepository.findByEmail(principal.getUsername()).orElse(null);
    auditService.logAction(
            admin != null ? admin.getId() : null,
            principal.getUsername(), "ADMIN",
            "STAFF_CREATED", "USER", String.valueOf(saved.getId()),
            "Created " + roleStr + " account for " + email,
            request.getRemoteAddr());
    
    Map<String, Object> result = new HashMap<>();
    result.put("id", saved.getId());
    result.put("name", saved.getName());
    result.put("email", saved.getEmail());
    result.put("role", saved.getRole().name());
    result.put("message", role.name() + " account created successfully");
    
    return ResponseEntity.ok(ApiResponse.success("Staff created", result));
}
```

### 6. Backend: Validates Role is TECHNICIAN or MEDICAL_OFFICER
```java
// AdminController.java line 317-320
if (!roleStr.equals("TECHNICIAN") && !roleStr.equals("MEDICAL_OFFICER")) {
    return ResponseEntity.badRequest()
        .body(ApiResponse.error("Role must be TECHNICIAN or MEDICAL_OFFICER"));
}
```

**Why not PATIENT or ADMIN:**
- PATIENT accounts are self-registered via `/api/auth/register`
- ADMIN accounts should not be created via this endpoint (security risk)
- Only TECHNICIAN and MEDICAL_OFFICER are staff roles created by admin

### 7. Backend: User Saved with passwordEncoder.encode()
```java
// AdminController.java line 330
staff.setPassword(passwordEncoder.encode(password));
```

### 8. Why Password Not Stored Plain
**Security reasons:**
- Plain text passwords vulnerable to database breach
- Insider threat (DBA can see passwords)
- Compliance violation (HIPAA, GDPR require password hashing)
- BCrypt adds salt - prevents rainbow table attacks
- BCrypt is slow - prevents brute force
- Industry standard for password storage

### 9. Database: User Inserted
```sql
INSERT INTO users (
    name, email, password, phone, role, is_active, is_verified, created_at, updated_at
)
VALUES (
    'Dr. Smith',
    'smith@lab.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- BCrypt hash
    '9876543210',
    'TECHNICIAN',
    true,
    true,
    NOW(),
    NOW()
);
```

### 10. Response: Staff Account Created
```json
{
    "success": true,
    "message": "Staff created",
    "data": {
        "id": 456,
        "name": "Dr. Smith",
        "email": "smith@lab.com",
        "role": "TECHNICIAN",
        "message": "TECHNICIAN account created successfully"
    }
}
```

### 11. Frontend: State Changes
```typescript
// AdminStaffPage.tsx
toast.success("Staff account created successfully");
fetchStaff(); // Refresh staff list
```

### 12. Frontend: What Renders
- New staff entry appears in staff list
- Staff table shows: Name, Email, Role, Status
- Toast notification: "TECHNICIAN account created successfully"

---

## Error Scenarios

### Scenario 1: Invalid Role
**HTTP Status:** 400 Bad Request
**Response JSON:**
```json
{
    "success": false,
    "message": "Role must be TECHNICIAN or MEDICAL_OFFICER",
    "data": null
}
```
**Frontend:** Toast error "Role must be TECHNICIAN or MEDICAL_OFFICER"

### Scenario 2: Email Already Exists
**HTTP Status:** 400 Bad Request
**Response JSON:**
```json
{
    "success": false,
    "message": "Email already registered: smith@lab.com",
    "data": null
}
```
**Frontend:** Toast error "Email already registered"

### Scenario 3: Unauthorized (Not Admin)
**HTTP Status:** 403 Forbidden
**Response JSON:**
```json
{
    "success": false,
    "message": "Access Denied",
    "data": null
}
```
**Frontend:** Toast error "Only admins can create staff accounts"

---

## Security Checkpoints

**Which filter runs:** JwtAuthenticationFilter.

**Which annotation enforces the role:** `@PreAuthorize("hasRole('ADMIN')")` (AdminController.java line 41 - class-level).

**What token claim is checked:**
- `role` claim must be "ADMIN"
- Only admins can create staff accounts

---

# SUMMARY: SECURITY CHECKPOINTS ACROSS ALL FLOWS

| Flow | Filter Runs | Role Annotation | Token Claim Checked |
|------|-------------|-----------------|---------------------|
| 1. Registration | None (public) | None | None |
| 2. Login | None (public) | None | None |
| 3. Search + Booking | JWT (for cart/booking) | PATIENT/ADMIN (cart), Authenticated (booking) | role, sub |
| 4. Mark Collected | JWT | TECHNICIAN | role |
| 5. Upload Report | JWT | TECHNICIAN | role |
| 6. Verify Report | JWT | MEDICAL_OFFICER | role |
| 7. Download Report | JWT | PATIENT (getMyReports), Multiple (download) | role, sub |
| 8. Create Staff | JWT | ADMIN | role |

---

**End of VIVA 6: API Flows**

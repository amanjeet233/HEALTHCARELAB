# Viva-Style Backend File Audit
## HEALTHCARELAB Backend - Comprehensive File-by-File Analysis

---

# CONTROLLERS

## AuthController.java
**Package:** com.healthcare.labtestbooking.controller
**Type:** Controller
**Purpose:** Handles all authentication-related operations including registration, login, password management, and token operations.
**Why this file exists:** Centralizes all authentication endpoints for security and separation of concerns. Without it, auth logic would be scattered across controllers, making security harder to maintain.
**Key methods/fields:**
- `register(RegisterRequest)` - Creates new user account with email verification
- `login(LoginRequest)` - Authenticates user and returns JWT tokens
- `forgotPassword(String email)` - Initiates password reset flow
- `resetPassword(ResetPasswordRequest)` - Completes password reset with token
- `refreshToken(String refreshToken)` - Issues new access token from refresh token
- `verifyEmail(String token)` - Verifies user email address
- `resendVerificationEmail(String email)` - Resends verification email
- `changePassword(ChangePasswordRequest)` - Changes password for authenticated user
- `logout(HttpServletRequest)` - Blacklists current JWT token
- `logoutAll(HttpServletRequest)` - Blacklists all user tokens
**Depends on:** AuthService, EmailVerificationService, TokenBlacklistService, AuditService, UserRepository
**Used by:** Frontend auth pages (login, register, password reset)
**Real-life analogy:** Like a reception desk at a building - handles entry/exit, credential verification, and access control
**Viva questions this file answers:**
- Q: Why is AuthController separate from UserController?
  A: AuthController handles authentication (login, register, password reset) while UserController handles profile management after authentication. Separation follows Single Responsibility Principle and allows different security rules (auth endpoints often public, profile endpoints require authentication).
- Q: Why does logout need to blacklist tokens?
  A: JWTs are stateless by design. Without blacklisting, a stolen valid token could be used until expiration. Blacklisting provides immediate revocation capability for security.
- Q: Why have separate refresh-token endpoint?
  A: Access tokens have short expiration (15-30 min) for security, while refresh tokens have longer expiration (7 days). This allows continuous access without forcing frequent re-login while maintaining security.

---

## BookingController.java
**Package:** com.healthcare.labtestbooking.controller
**Type:** Controller
**Purpose:** Manages lab test booking lifecycle from creation to completion including status transitions and technician assignment.
**Why this file exists:** Booking logic is complex with multiple states, role-based permissions, and business rules. Centralizing this ensures consistent validation and state management.
**Key methods/fields:**
- `createBooking(BookingRequest)` - Creates new booking for authenticated patient
- `getMyBookings(Pageable)` - Returns paginated bookings for current user
- `getTechnicianBookings()` - Returns bookings assigned to authenticated technician
- `getTechnicianTodayBookings()` - Returns technician's bookings for today
- `getBookingById(Long id)` - Returns specific booking by ID
- `getAvailableSlots(String date, Long testId)` - Returns available time slots for booking
- `getAllowedTransitions(Long id)` - Returns valid next statuses for a booking
- `updateBookingStatus(Long id, BookingStatus status)` - Updates booking status with validation
- `markCollected(Long id)` - Marks sample as collected (TECHNICIAN only)
- `rejectSpecimen(Long id, SpecimenRejectionRequest)` - Rejects specimen with reason
- `assignTechnician(Long id, AssignTechnicianRequest)` - Assigns technician to booking
- `getUnassignedBookings()` - Returns bookings without technician assignment
- `cancelBooking(Long id)` - Cancels an existing booking
- `getAllBookings(patientName, status, pageable)` - Admin endpoint for all bookings
- `adminUpdateBookingStatus(Long id, Map payload)` - Admin can force any status
- `getUpcomingBookings()` - Returns future bookings for patient
- `getBookingHistory()` - Returns past/completed bookings
- `rescheduleBooking(Long id, String date, String timeSlot)` - Changes booking date/time
**Depends on:** BookingService
**Used by:** Patient booking pages, technician dashboard, admin booking management
**Real-life analogy:** Like a hospital appointment desk - schedules, reschedules, cancels, and tracks appointment status
**Viva questions this file answers:**
- Q: Why split booking methods by role (admin vs patient vs technician)?
  A: Different roles have different permissions and data needs. Patients see only their bookings, technicians see assigned ones, admins see all. Role-based methods ensure proper authorization and return only relevant data.
- Q: Why have separate adminUpdateBookingStatus vs updateBookingStatus?
  A: Regular status update follows state transition rules (e.g., can't go from BOOKED to COMPLETED directly). Admin can force any status including CANCELLED from any state for emergency overrides.
- Q: Why is getAvailableSlots a GET endpoint not part of booking creation?
  A: Allows frontend to show available slots before user commits to booking, improving UX by preventing booking failures due to slot unavailability.

---

## CartController.java
**Package:** com.healthcare.labtestbooking.controller
**Type:** Controller
**Purpose:** Manages shopping cart for lab tests and packages before checkout.
**Why this file exists:** Cart is a temporary holding area for users to accumulate tests before payment. Separate from bookings because cart items are not yet confirmed/scheduled.
**Key methods/fields:**
- `getCart(UserDetails)` - Returns current user's cart with items and pricing
- `getQuickCartInfo(UserDetails)` - Returns item count and total for header display
- `addTestToCart(AddTestToCart, UserDetails)` - Adds lab test to cart
- `addPackageToCart(AddPackageToCart, UserDetails)` - Adds test package to cart
- `addMultipleTests(AddMultipleTests, UserDetails)` - Adds multiple tests at once
- `updateQuantity(Long cartItemId, UpdateQuantity, UserDetails)` - Updates item quantity
- `removeFromCart(Long cartItemId, UserDetails)` - Removes specific item
- `clearCart(UserDetails)` - Removes all items from cart
- `applyCoupon(ApplyCoupon, UserDetails)` - Applies discount coupon
- `removeCoupon(UserDetails)` - Removes applied coupon
- `isTestInCart(Long testId, UserDetails)` - Checks if test is already in cart
- `isPackageInCart(Long packageId, UserDetails)` - Checks if package is already in cart
**Depends on:** CartService, UserRepository
**Used by:** Shopping cart page, test catalog add-to-cart functionality
**Real-life analogy:** Like a physical shopping cart in a store - holds items before checkout
**Viva questions this file answers:**
- Q: Why is cart session-tied to JWT user?
  A: Cart data must persist across page refreshes and browser sessions. Tying to JWT user (not session) allows cart to survive browser close and work across devices for the same user.
- Q: Why not just create bookings directly without cart?
  A: Cart allows users to browse, add multiple tests, apply coupons, and review total before committing. This improves conversion rate and user experience compared to immediate checkout.

---

## DashboardController.java
**Package:** com.healthcare.labtestbooking.controller
**Type:** Controller
**Purpose:** Provides role-specific dashboard statistics and summaries.
**Why this file exists:** Dashboards aggregate data from multiple sources. Centralizing dashboard endpoints keeps role-specific logic organized and prevents controller bloat.
**Key methods/fields:**
- `getPatientStats()` - Returns patient's booking counts and recent activity
- `getTechnicianStats()` - Returns technician's assignment counts and today's work
- `getTechnicianRejectedSpecimens()` - Returns specimens rejected by technician
- `getMedicalOfficerStats()` - Returns pending verifications and processing reports
- `getAdminStats()` - Returns system-wide statistics (users, bookings, revenue)
**Depends on:** DashboardService, BookingService
**Used by:** Role-specific dashboard pages (patient, technician, medical officer, admin)
**Real-life analogy:** Like a command center dashboard - shows key metrics and alerts for different operational roles
**Viva questions this file answers:**
- Q: Why not merge dashboard endpoints into each role controller?
  A: Dashboard endpoints aggregate data from multiple services (bookings, users, reports). Merging into role controllers would create circular dependencies and violate separation of concerns. DashboardService provides a clean aggregation layer.

---

## MedicalOfficerController.java
**Package:** com.healthcare.labtestbooking.controller
**Type:** Controller
**Purpose:** Handles medical officer operations including report verification, delta checks, and technician assignment suggestions.
**Why this file exists:** Medical officers have specialized responsibilities (verifying reports, flagging critical results) that differ from technicians and admins. Separate controller ensures proper authorization and business logic isolation.
**Key methods/fields:**
- `getMOBookings(status, pageable)` - Returns bookings filtered by status
- `getPendingVerifications(filter, pageable)` - Returns pending report verifications with filters (NEW, CRITICAL, RECHECK)
- `flagCritical(Long bookingId)` - Flags booking as critical
- `getPendingVerificationsCount()` - Returns count of pending verifications
- `getDeltaCheck(Long patientId, String testName)` - Returns historical test results for comparison
- `verifyReport(bookingId, reportId, ReportVerificationRequest)` - Verifies and approves report
- `rejectReport(bookingId, Map body)` - Rejects report with reason
- `addICDCodes(bookingId, List<String> icdCodes)` - Adds ICD diagnosis codes
- `createReferral(bookingId, Map body)` - Creates specialist referral
- `assignTechnicianByMo(bookingId, Map body)` - MO suggests technician assignment
- `getUnassignedBookings()` - Returns bookings without technician
- `getTechniciansAvailableForDate(LocalDate date)` - Returns technicians with load info
- `amendReport(reportId, Map body)` - Amends verified report
- `logPanicAlert(Map body)` - Logs emergency panic alert
**Depends on:** MedicalOfficerService, BookingRepository, BookingService
**Used by:** Medical officer dashboard, report verification interface
**Real-life analogy:** Like a pathologist's review station - verifies lab results, flags abnormalities, and suggests follow-up
**Viva questions this file answers:**
- Q: Why /api/mo prefix not /api/medical-officer?
  A: Shorter prefix for brevity in API calls. "mo" is a standard abbreviation for "medical officer" in healthcare systems. Both work, but shorter prefixes reduce URL length and are easier to type.
- Q: Why can MO assign technicians?
  A: MOs have clinical insight into test complexity and urgency. They can suggest appropriate technicians based on specialization, workload, and patient location, improving assignment efficiency.

---

## TechnicianController.java
**Package:** com.healthcare.labtestbooking.controller
**Type:** Controller
**Purpose:** Manages technician availability, location tracking, and assignment operations.
**Why this file exists:** Technician operations (availability lookup, location tracking, auto-assignment) are distinct from booking operations. Separate controller provides clean API for technician management.
**Key methods/fields:**
- `getAvailableTechnicians(LocalDate date, String pincode, pageable)` - Returns available technicians for date and location
- `autoAssignTechnician(Long bookingId)` - Automatically assigns nearest available technician
- `reassignTechnician(Long bookingId, ReassignRequest)` - Reassigns to different technician
- `getTechnicianLocation(Long techId)` - Returns current GPS location of technician
- `getTechniciansForDate(LocalDate date)` - Returns technicians with booking count for load balancing
**Depends on:** TechnicianAssignmentService
**Used by:** Admin technician management, technician assignment interface
**Real-life analogy:** Like a dispatch system for field technicians - tracks availability, location, and assigns jobs
**Viva questions this file answers:**
- Q: What does it delegate to TechnicianAssignmentService?
  A: All business logic for technician finding, distance calculation, availability validation, and assignment persistence. Controller handles HTTP concerns, service handles business rules.

---

## ReportController.java
**Package:** com.healthcare.labtestbooking.controller
**Type:** Controller
**Purpose:** Manages lab report generation, upload, verification, download, and sharing.
**Why this file exists:** Report operations involve file handling, PDF generation, AI analysis, and public sharing - complex logic that should be isolated from booking controller.
**Key methods/fields:**
- `submitReportResults(ReportResultRequest)` - Submits lab test results (TECHNICIAN)
- `getReportByBooking(Long bookingId)` - Retrieves report for specific booking
- `uploadReport(Long bookingId, MultipartFile file)` - Uploads PDF report
- `checkReportExists(Long bookingId)` - Checks if PDF report exists
- `verifyReport(Long id)` - Marks report as verified (MO/ADMIN)
- `getMyReports()` - Returns patient's reports
- `downloadReportByBooking(Long bookingId)` - Downloads report PDF
- `getAiAnalysis(Long bookingId)` - Returns AI-generated diagnostic analysis
- `regenerateAiAnalysis(Long bookingId)` - Triggers AI analysis regeneration (ADMIN)
- `regeneratePdf(Long bookingId)` - Regenerates PDF report (ADMIN/MO)
- `getReportPdf(Long id)` - Generates and returns report PDF
- `getVerificationByBooking(Long bookingId)` - Returns verification details
- `shareReport(Long id)` - Generates public sharing link (7-day expiry)
- `viewPublicReport(String token)` - Views report via public token
- `viewPublicAnalysis(String token)` - Views AI analysis via public token
- `getActiveShares()` - Lists current shared reports
- `revokeShare(Long bookingId)` - Revokes public access
**Depends on:** ReportService, ReportGeneratorService, ReportResultService, ReportVerificationService, AuditService, AIAnalysisService, PdfReportService, ReportRepository
**Used by:** Technician result entry, MO verification, patient report viewing, admin report management
**Real-life analogy:** Like a medical records department - stores, generates, verifies, and releases patient reports
**Viva questions this file answers:**
- Q: Who can access what endpoint and why?
  A: Technicians can submit results and upload PDFs. Medical officers can verify and regenerate. Patients can view/download their verified reports. Admins can regenerate and manage all. This follows principle of least privilege.
- Q: Why have public sharing with tokens?
  A: Patients need to share reports with doctors or family members who don't have system accounts. Token-based sharing provides temporary, revocable access without requiring recipient registration.

---

## UserController.java
**Package:** com.healthcare.labtestbooking.controller
**Type:** Controller
**Purpose:** Manages user profile operations and user administration.
**Why this file exists:** Profile management is separate from authentication. Users need to update their information after login, and admins need to manage user accounts.
**Key methods/fields:**
- `getProfile()` - Returns authenticated user's profile
- `updateProfile(UserResponse)` - Updates user profile information
- `getAllUsers(Pageable)` - Returns all users (ADMIN)
- `updateUserStatus(Long id, Boolean isActive)` - Activates/deactivates user (ADMIN)
- `changePassword(Map request)` - Changes user password
**Depends on:** UserService
**Used by:** Profile settings page, admin user management
**Real-life analogy:** Like a patient registration desk - manages personal information updates and account status
**Viva questions this file answers:**
- Q: Why is profile separate from auth?
  A: AuthController handles initial account creation and login (authentication). UserController handles ongoing profile management (name, address, phone) after authentication. Separation allows different security rules and keeps concerns focused.

---

## AdminController.java
**Package:** com.healthcare.labtestbooking.controller
**Type:** Controller
**Purpose:** Provides administrative operations for system management, analytics, and staff management.
**Why this file exists:** Admin operations require special permissions and access to system-wide data. Separate controller enforces authorization and keeps admin logic isolated.
**Key methods/fields:**
- `getStats()` - Returns admin dashboard statistics
- `getAllUsers(pageable, role)` - Returns paginated users with optional role filter
- `updateUserRole(Long userId, Map body, principal, request)` - Changes user role
- `toggleUserStatus(Long userId, principal, request)` - Activates/deactivates user
- `getChartData(String type)` - Returns chart data (revenue, bookings) for last 7 days
- `getRevenue(String period)` - Returns revenue data for week/month
- `getAuditLogs(page, size, action, userRole, from, to)` - Returns filtered audit logs
- `getBookingTrends()` - Returns booking counts by status
- `getCriticalBookings()` - Returns critical flag bookings
- `createStaff(Map body, principal, request)` - Creates technician/MO account
- `deleteStaff(Long userId, principal, request)` - Deletes staff account
- `getTechniciansOnly()` - Returns active technicians list
- `getAllStaff()` - Returns all non-patient staff
**Depends on:** DashboardService, BookingRepository, AuditLogRepository, UserRepository, PasswordEncoder, AuditLogService, AuditService
**Used by:** Admin dashboard, user management interface, analytics pages
**Real-life analogy:** Like a hospital administration office - manages staff, reviews metrics, and oversees operations
**Viva questions this file answers:**
- Q: What does AdminController add vs DashboardController?
  A: DashboardController returns aggregated statistics for display. AdminController provides administrative actions (create/delete users, change roles, view audit logs) that modify system state. Dashboard is read-only, AdminController is read-write.

---

# SERVICES

## AuthService.java
**Package:** com.healthcare.labtestbooking.service
**Type:** Service
**Purpose:** Handles authentication business logic including registration, login, token generation, and password reset.
**Why this file exists:** Authentication involves complex validation, security checks, password hashing, and JWT token management. Centralizing this ensures consistent security implementation.
**Key methods/fields:**
- `registerUser(RegisterRequest)` - Registers new user with validation and email verification
- `authenticateUser(LoginRequest)` - Authenticates user with lockout protection and returns JWT
- `refreshToken(String refreshToken)` - Issues new access token from valid refresh token
- `requestPasswordReset(String email)` - Generates and emails password reset token
- `resetPassword(ResetPasswordRequest)` - Completes password reset with token validation
- `validateToken(String token)` - Validates JWT token
- `changePassword(String currentPassword, String newPassword)` - Changes authenticated user's password
- `extractEmailFromToken(String token)` - Extracts email from JWT
- `validateRegistrationRequest(RegisterRequest)` - Validates registration input fields
- `sendVerificationEmail(User user)` - Sends email verification link
**Depends on:** UserRepository, PasswordEncoder, JwtService, NotificationService, LoginAttemptService, EmailVerificationService, AuditService
**Used by:** AuthController
**Real-life analogy:** Like a security guard - verifies credentials, issues access passes, and manages entry/exit
**Viva questions this file answers:**
- Q: Login flow step by step: request → JWT → response?
  A: 1) Validate email/password format, 2) Check account lockout status, 3) Lookup user by email, 4) Verify account is active, 5) Check email verification (bypassed for testing), 6) Compare BCrypt-hashed password, 7) Clear failed attempts on success, 8) Generate JWT with email/role claims, 9) Update last login timestamp, 10) Log audit action, 11) Return tokens to client.
- Q: Why have login attempt tracking?
  A: Prevents brute force attacks by locking accounts after multiple failed attempts. After 5 failed attempts, account locks for 30 minutes, protecting against credential stuffing.

---

## BookingService.java
**Package:** com.healthcare.labtestbooking.service
**Type:** Service
**Purpose:** Manages booking business logic including creation, status transitions, validation, and assignment.
**Why this file exists:** Booking lifecycle is complex with state machine validation, pricing calculations, and role-based permissions. Service layer encapsulates these business rules.
**Key methods/fields:**
- `createBooking(BookingRequest)` - Creates booking with price calculation and validation
- `validateStatusTransition(BookingStatus current, BookingStatus new)` - Validates state transitions
- `getAllowedTransitions(Long bookingId)` - Returns valid next statuses
- `getMyBookings(Pageable)` - Returns authenticated user's bookings
- `getTechnicianBookings()` - Returns technician's assigned bookings
- `getTechnicianTodayBookings()` - Returns technician's today's bookings
- `getBookingById(Long id)` - Returns booking by ID
- `getAvailableSlots(String date, Long testId)` - Returns available time slots
- `updateBookingStatus(Long id, BookingStatus status)` - Updates status with validation
- `markCollected(Long id)` - Marks sample as collected
- `rejectSpecimen(Long id, SpecimenRejectionRequest)` - Rejects specimen with reason
- `assignTechnician(Long id, Long technicianId)` - Assigns technician to booking
- `getUnassignedBookings()` - Returns bookings without technician
- `cancelBooking(Long id)` - Cancels booking
- `getAllBookings(patientName, status, pageable)` - Returns all bookings (admin)
- `adminUpdateBookingStatus(Long id, BookingStatus status, String reason)` - Admin force status update
- `getUpcomingBookings()` - Returns future bookings
- `getBookingHistory()` - Returns past bookings
- `rescheduleBooking(Long id, LocalDate date, String timeSlot)` - Changes booking date/time
- `getTechnicianRejectedSpecimens()` - Returns rejected specimens for technician
**Depends on:** BookingRepository, UserRepository, LabTestRepository, TestPackageRepository, FamilyMemberRepository, AuditService, NotificationService, NotificationInboxService, ConsentService
**Used by:** BookingController
**Real-life analogy:** Like a hospital scheduling system - manages appointments, validates availability, tracks status
**Viva questions this file answers:**
- Q: Status validation logic, who can change what?
  A: Status transitions follow state machine: BOOKED→SAMPLE_COLLECTED→PROCESSING→PENDING_VERIFICATION→VERIFIED→COMPLETED. CANCELLED can be set from any state by patient or admin. Technicians can change to SAMPLE_COLLECTED. Medical officers can change to VERIFIED or back to PROCESSING. Admin can force any status.
- Q: Why use EnumMap for ALLOWED_TRANSITIONS?
  A: EnumMap provides O(1) lookup for status transitions and is type-safe. Using enum keys ensures only valid BookingStatus values can be used, preventing invalid transitions at compile time.

---

## DashboardService.java
**Package:** com.healthcare.labtestbooking.service
**Type:** Service
**Purpose:** Aggregates statistics from multiple repositories for role-specific dashboards.
**Why this file exists:** Dashboards need data from multiple sources (bookings, users, tests). Service layer provides clean aggregation without exposing repository complexity to controllers.
**Key methods/fields:**
- `getPatientDashboardStats()` - Returns patient's booking counts and recent activity
- `getTechnicianDashboardStats()` - Returns technician's assignment counts and today's work
- `getMedicalOfficerDashboardStats()` - Returns pending verifications and processing reports
- `getAdminDashboardStats()` - Returns system-wide statistics (users, bookings, revenue, critical alerts)
- `getCurrentUser()` - Retrieves authenticated user from SecurityContext
**Depends on:** BookingRepository, UserRepository, LabTestRepository
**Used by:** DashboardController
**Real-life analogy:** Like a business intelligence service - aggregates data from multiple systems for reporting
**Viva questions this file answers:**
- Q: Why does it use SecurityContext to get current user?
  A: Dashboard stats are user-specific. SecurityContext provides the authenticated user's email from JWT, which is used to fetch user details and filter data by user ID. This ensures each user sees only their own data.

---

## MedicalOfficerService.java
**Package:** com.healthcare.labtestbooking.service
**Type:** Service
**Purpose:** Handles medical officer operations including report verification, delta checks, and technician assignment suggestions.
**Why this file exists:** Medical officer operations involve clinical validation, reflex testing rules, and report sealing. Complex business logic that needs isolation.
**Key methods/fields:**
- `getPendingVerifications(Pageable)` - Returns pending verifications
- `getVerificationsByFilter(String filter, Pageable)` - Returns filtered verifications (NEW, CRITICAL, RECHECK)
- `getPendingVerificationsCount()` - Returns count of pending verifications
- `getDeltaCheck(Long patientId, String testName)` - Returns historical test results for comparison
- `verifyReport(Long bookingId, ReportVerificationRequest)` - Verifies report with clinical notes
- `rejectReport(Long bookingId, String reason)` - Rejects report with reason
- `addICDCodes(Long bookingId, List<String> icdCodes)` - Adds ICD diagnosis codes
- `flagCritical(Long bookingId)` - Flags booking as critical
- `referToSpecialist(Long bookingId, String specialistType, String notes)` - Creates specialist referral
- `suggestTechnician(Long bookingId, Long technicianId)` - Suggests technician assignment
- `getUnassignedBookings()` - Returns unassigned bookings
- `getTechniciansAvailableForDate(LocalDate date)` - Returns technicians with load info
- `amendReport(Long reportId, String reason, Map<Long, String> newValues)` - Amends verified report
- `logPanicAlert(Long bookingId, String physicianName, String channel, String instructions)` - Logs emergency alert
- `validateMedicalOfficerAccess()` - Validates user has MEDICAL_OFFICER role
**Depends on:** ReportVerificationRepository, BookingRepository, ReportRepository, ReportResultRepository, UserRepository, TechnicianRepository, BookingService, AuditService, NotificationInboxService, PdfReportService, ReflexTestingService, AIAnalysisService, ReportSealingService, PanicAlertLogRepository
**Used by:** MedicalOfficerController
**Real-life analogy:** Like a pathologist's review service - validates results, compares with history, flags abnormalities
**Viva questions this file answers:**
- Q: Why does verifyReport need a ReportVerification entity?
  A: ReportVerification stores the medical officer's clinical notes, digital signature, verification timestamp, and ICD codes separately from the raw report. This provides audit trail, allows amendments, and maintains clinical documentation distinct from technical results.

---

## TechnicianAssignmentService.java
**Package:** com.healthcare.labtestbooking.service
**Type:** Service
**Purpose:** Handles technician availability lookup, location tracking, and auto-assignment algorithms.
**Why this file exists:** Technician assignment involves geographic calculations, availability validation, and load balancing. Complex algorithmic logic that should be isolated.
**Key methods/fields:**
- `getAvailableTechnicians(LocalDate date, String pincode)` - Returns available technicians for date and location
- `autoAssignTechnician(Long bookingId)` - Automatically assigns nearest available technician
- `reassignTechnician(Long bookingId, Long newTechnicianId)` - Reassigns to different technician
- `getTechnicianLocation(Long techId)` - Returns current GPS location
- `getTechniciansWithLoadForDate(LocalDate date)` - Returns technicians with booking count for load balancing
- `formatWorkingHours(Technician tech)` - Formats technician working hours
- `formatLocation(Technician tech)` - Formats technician location
**Depends on:** TechnicianRepository, BookingRepository
**Used by:** TechnicianController
**Real-life analogy:** Like a dispatch algorithm - finds nearest available worker based on location, skills, and schedule
**Viva questions this file answers:**
- Q: Auto-assign algorithm?
  A: 1) Find all active technicians, 2) Filter by service pincode match, 3) Check working hours for date, 4) If today, check current time within shift, 5) Select first available technician (can be enhanced to use distance calculation), 6) Assign to booking, 7) Return assignment details with estimated arrival.

---

## LabTestService.java
**Package:** com.healthcare.labtestbooking.service
**Type:** Service
**Purpose:** Manages lab test catalog operations including search, filtering, and DTO conversion.
**Why this file exists:** Lab test data needs caching, search optimization, and transformation from entity to DTO. Service layer provides these capabilities.
**Key methods/fields:**
- `getPopularTests()` - Returns top 5 popular tests
- `getAllActiveTests()` - Returns all active tests
- `getTestById(Long id)` - Returns test by ID
- `getTestByCode(String testCode)` - Returns test by code
- `getTestsByCategory(Long categoryId)` - Returns tests by category
- `getTestsByType(TestType testType)` - Returns tests by type
- `searchTests(String keyword)` - Searches tests by name/code/tags
- `getTestsByPriceRange(BigDecimal min, BigDecimal max)` - Returns tests in price range
- `convertToDTO(LabTest test)` - Converts entity to DTO
**Depends on:** LabTestRepository, TestCategoryRepository, TestParameterRepository
**Used by:** Lab test catalog pages, search functionality
**Real-life analogy:** Like a product catalog service - manages inventory, search, and categorization
**Viva questions this file answers:**
- Q: Why does advanced search use LIKE not exact match?
  A: Users may not know exact test names or codes. LIKE with wildcards (%keyword%) allows partial matches (e.g., "blood" matches "Complete Blood Count", "Blood Sugar"). This improves discoverability and user experience.

---

## UserService.java
**Package:** com.healthcare.labtestbooking.service
**Type:** Service
**Purpose:** Manages user profile operations including updates, settings, and user administration.
**Why this file exists:** User profile management involves field validation, duplicate checking, and settings persistence. Service layer ensures data integrity.
**Key methods/fields:**
- `getCurrentUserProfile()` - Returns authenticated user's profile
- `updateCurrentUserProfile(UserResponse)` - Updates user profile with validation
- `getCurrentUserSettings()` - Returns user notification and privacy settings
- `updateCurrentUserSettings(UserSettingsDTO)` - Updates user settings
- `getAllUsers(Pageable)` - Returns paginated users (ADMIN only)
- `updateUserStatus(Long userId, Boolean isActive)` - Activates/deactivates user
- `changePassword(String currentPassword, String newPassword)` - Changes user password
- `getCurrentUser()` - Retrieves authenticated user from SecurityContext
- `mapToResponse(User user)` - Converts entity to DTO
**Depends on:** UserRepository, PasswordEncoder
**Used by:** UserController
**Real-life analogy:** Like a patient records service - manages personal information updates and preferences
**Viva questions this file answers:**
- Q: Why is getAllUsers paginated?
  A: User table can grow to thousands of records. Loading all at once causes memory issues and slow responses. Pagination (default 20 per page) reduces database load, improves response time, and provides better UX with scrollable results.

---

# REPOSITORIES

## UserRepository.java
**Package:** com.healthcare.labtestbooking.repository
**Type:** Repository (JPA)
**Purpose:** Provides database access for User entity with custom query methods.
**Why this file exists:** Spring Data JPA repositories provide type-safe database access. Custom methods encapsulate common queries.
**Key methods/fields:**
- `findByEmail(String email)` - Finds user by email
- `findByPhone(String phone)` - Finds user by phone
- `findByResetPasswordToken(String token)` - Finds user by password reset token
- `findByVerificationToken(String token)` - Finds user by verification token
- `findByEmailAndPassword(String email, String password)` - Finds user by email and password
- `existsByEmail(String email)` - Checks if email exists
- `existsByPhone(String phone)` - Checks if phone exists
- `findByRole(UserRole role)` - Finds users by role
- `findByRole(UserRole role, Pageable)` - Finds users by role with pagination
- `findByIsActiveTrue()` - Finds all active users
- `findByRoleAndIsActiveTrue(UserRole role)` - Finds active users by role
- `findByEmailWithoutRelationships(String email)` - Finds user without loading relationships
- `countByIsActiveTrue()` - Counts active users
- `countUsersByDateRange(LocalDateTime start, LocalDateTime end)` - Counts users by date range
- `countUsersByMonth(LocalDateTime start, LocalDateTime end)` - Counts users by month
**Depends on:** User entity
**Used by:** AuthService, UserService, DashboardService, various controllers
**Real-life analogy:** Like a user database table - stores and retrieves user records
**Viva questions this file answers:**
- Q: Why used instead of findById in JWT filter?
  A: findByEmail is more direct when we have the email from JWT token. findById would require knowing the user ID first. Email is the natural key for authentication lookups.
- Q: Spring Data query derivation explained?
  A: Spring Data derives SQL from method names. `findByRole(UserRole role)` becomes `SELECT * FROM users WHERE role = ?`. `findByIsActiveTrue()` becomes `SELECT * FROM users WHERE is_active = true`. No SQL needed - method name defines the query.
- Q: Why soft delete not hard delete?
  A: Soft delete (isActive flag) preserves data for audit trails, reporting, and potential reactivation. Hard delete would lose booking history, payment records, and audit logs associated with the user.

---

## BookingRepository.java
**Package:** com.healthcare.labtestbooking.repository
**Type:** Repository (JPA)
**Purpose:** Provides database access for Booking entity with complex query methods for analytics and reporting.
**Why this file exists:** Booking queries are complex involving joins, aggregations, and date ranges. Repository encapsulates this complexity.
**Key methods/fields:**
- `findByBookingReference(String bookingReference)` - Finds booking by reference
- `findDetailedById(Long id)` - Finds booking with loaded relationships
- `findByPatientId(Long patientId)` - Finds bookings by patient
- `findByPatientId(Long patientId, Pageable)` - Finds bookings by patient with pagination
- `findByTestId(Long testId)` - Finds bookings by test
- `findByStatus(BookingStatus status)` - Finds bookings by status
- `findByPatientIdAndStatus(Long patientId, BookingStatus status)` - Finds patient bookings by status
- `findByBookingDate(LocalDate bookingDate)` - Finds bookings by date
- `findByBookingDateBetween(LocalDate startDate, LocalDate endDate)` - Finds bookings in date range
- `findByTechnicianId(Long technicianId)` - Finds bookings by technician
- `findByTechnicianIsNullAndStatusIn(List<BookingStatus> statuses)` - Finds unassigned bookings
- `findByMedicalOfficerId(Long medicalOfficerId)` - Finds bookings by medical officer
- `findByBookingDateAndTimeSlot(LocalDate bookingDate, String timeSlot)` - Finds bookings by date and slot
- `countByBookingDateBetween(LocalDate startDate, LocalDate endDate)` - Counts bookings in date range
- `countByStatusAndBookingDateBetween(BookingStatus status, LocalDate startDate, LocalDate endDate)` - Counts bookings by status and date range
- `countByStatus(BookingStatus status)` - Counts bookings by status
- `countByStatusNot(BookingStatus status)` - Counts bookings not in status
- `countByStatusIn(List<BookingStatus> statuses)` - Counts bookings in statuses
- `countByCriticalFlagTrueAndStatusNot(BookingStatus status)` - Counts critical bookings
- `countByTestId(Long testId)` - Counts bookings by test
- `countByTestPackageId(Long testPackageId)` - Counts bookings by package
- `countByTechnicianIdAndBookingDateAndTimeSlot(Long technicianId, LocalDate bookingDate, String timeSlot)` - Counts technician bookings by date and slot
- `countByTechnicianIdAndBookingDate(Long technicianId, LocalDate bookingDate)` - Counts technician bookings by date
- `countBookingsByCreatedDateRange(LocalDate start, LocalDate end)` - Counts bookings by creation date
- `findTopBookedTests(Pageable pageable)` - Finds most booked tests
- `sumRevenueByCreatedDateRange(LocalDate start, LocalDate end)` - Sums revenue by date
- `sumTotalRevenue()` - Sums total revenue
- `sumTotalBookedRevenue()` - Sums total booked revenue
- `findByStatusAndPatientDisplayNameContainingIgnoreCase(BookingStatus status, String patientName, Pageable)` - Searches bookings by status and patient name
- `findByPatientDisplayNameContainingIgnoreCase(String patientName, Pageable)` - Searches bookings by patient name
- `findByCriticalFlagTrueAndStatusNotOrderByCreatedAtDesc(BookingStatus status)` - Finds critical bookings
- `findUnassignedBookingsByStatuses(List<BookingStatus> statuses)` - Finds unassigned bookings sorted by date
- `countBookingsByTechnicianForDate(LocalDate date)` - Counts bookings per technician for date
**Depends on:** Booking entity
**Used by:** BookingService, DashboardService, AdminController
**Real-life analogy:** Like a booking database table - stores and retrieves appointment records
**Viva questions this file answers:**
- Q: Why not query by user instead of patientId?
  A: Booking uses patientId (foreign key to User table) for clarity and consistency with domain language. "Patient" is the role context for bookings. Using patientId makes the relationship explicit in the schema.
- Q: Why count not findAll for stats?
  A: count() returns a single number from database (SELECT COUNT(*)), which is much faster than loading all records into memory (SELECT *). For dashboard stats, we only need counts, not the actual booking data.
- Q: How technician assignment works?
  A: `findByTechnicianIsNullAndStatusIn` finds bookings without technician in BOOKED/CONFIRMED status. `countByTechnicianIdAndBookingDate` shows technician workload for a date. These queries together enable load-balanced assignment.

---

## LabTestRepository.java
**Package:** com.healthcare.labtestbooking.repository
**Type:** Repository (JPA)
**Purpose:** Provides database access for LabTest entity with search and filtering capabilities.
**Why this file exists:** Lab test searches need flexible matching (name, code, tags, category). Repository provides optimized queries for these operations.
**Key methods/fields:**
- `findByTestCode(String testCode)` - Finds test by code
- `findByIsActiveTrue()` - Finds all active tests
- `findByIsActiveTrue(Pageable)` - Finds active tests with pagination
- `findByCategoryNameAndIsActiveTrue(String categoryName)` - Finds tests by category
- `findByCategoryNameAndIsActiveTrue(String categoryName, Pageable)` - Finds tests by category with pagination
- `findByCategoryNameIn(List<String> categories, Pageable)` - Finds tests in multiple categories
- `searchTests(String keyword, Pageable)` - Searches tests by keyword (name, code, tags)
- `searchTests(String keyword)` - Searches tests by keyword (list)
- `findByCategoryOrTag(String category, Pageable)` - Finds tests by category or tag
- `findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice)` - Finds tests in price range
- `findByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable)` - Finds tests in price range with pagination
- `findAllCategories()` - Returns all unique categories
- `findAllTestTypes()` - Returns all test types
- `countByCategory(String categoryName)` - Counts tests by category
- `findByCategoryNameLike(String categoryName, Pageable)` - Case-insensitive category search
- `existsByTestCode(String testCode)` - Checks if test code exists
- `findByCategoryNameAndIsActiveTrueQuery(String categoryName)` - Query version of category search
- `findByTestNameContainingIgnoreCaseAndIsActiveTrue(String testName)` - Case-insensitive name search
- `findByIsTrendingTrue(Pageable)` - Finds trending tests
- `findByIsTrendingTrueAndIsPackageFalse(Pageable)` - Finds trending individual tests
**Depends on:** LabTest entity
**Used by:** LabTestService
**Real-life analogy:** Like a product catalog database - stores and retrieves test catalog items
**Viva questions this file answers:**
- Q: Why tests need isActive flag?
  A: Tests may be discontinued, out of stock, or under maintenance. isActive flag allows soft deactivation without deleting data. This preserves historical booking data while preventing new bookings for unavailable tests.
- Q: How filtering works?
  A: Category filtering uses `@Query` with WHERE clause on categoryName. Price filtering uses BETWEEN clause. Search uses LIKE with wildcards on multiple columns (testName, testCode, tagsJson). These are optimized with database indexes on category and slug columns.

---

# ENTITIES

## User.java
**Package:** com.healthcare.labtestbooking.entity
**Type:** Entity
**Purpose:** Represents a user in the system with authentication, profile, and preference data.
**Why this file exists:** Central user data structure needed for authentication, authorization, and profile management across the application.
**Key fields:**
- `id` - Primary key
- `name` - Full name of user
- `email` - Unique email address (login credential)
- `password` - BCrypt-hashed password
- `role` - UserRole enum (PATIENT, TECHNICIAN, MEDICAL_OFFICER, ADMIN)
- `phone` - Unique phone number
- `firstName` - First name (optional, for display)
- `lastName` - Last name (optional, for display)
- `secondaryPhone` - Alternate contact number
- `alternateEmail` - Alternate email address
- `maritalStatus` - Marital status
- `address` - Physical address
- `dateOfBirth` - Date of birth
- `gender` - Gender enum
- `bloodGroup` - Blood type
- `languagePreference` - Preferred language (en, hi, etc.)
- `communicationChannel` - Preferred communication (email, sms, both)
- `notificationsEnabled` - Email notification preference
- `marketingEmails` - Marketing email consent
- `whatsappNotifications` - WhatsApp notification preference
- `twoFactorAuth` - 2FA enabled flag
- `privacyMode` - Privacy mode flag
- `themePreference` - UI theme (light, dark)
- `isActive` - Account active flag (soft delete)
- `isVerified` - Email verified flag
- `resetPasswordToken` - Password reset JWT
- `resetPasswordTokenExpiry` - Reset token expiry
- `verificationToken` - Email verification JWT
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp
- `lastLoginAt` - Last successful login timestamp
**Depends on:** UserRole enum, Gender enum
**Used by:** UserRepository, AuthService, UserService
**Real-life analogy:** Like a patient record card - contains all personal and account information
**Viva questions this file answers:**
- Q: Why name not firstName+lastName (the conflict)?
  A: Single `name` field is required for backward compatibility with existing database schema. firstName and lastName are optional fields added later for display purposes. Using both avoids breaking existing data while supporting new UI requirements.
- Q: Why isActive?
  A: Soft delete pattern. Instead of deleting user record (which would lose booking history, audit logs, and reports), isActive=false deactivates account. User cannot login but data is preserved for reporting and compliance.

---

## Booking.java
**Package:** com.healthcare.labtestbooking.entity
**Type:** Entity
**Purpose:** Represents a lab test booking with scheduling, pricing, status, and assignment information.
**Why this file exists:** Booking is the core entity that ties together patients, tests, technicians, and reports. Central entity for the business domain.
**Key fields:**
- `id` - Primary key
- `bookingReference` - Unique booking ID (e.g., HLTH-ABC12345)
- `patient` - User entity (many-to-one)
- `legacyUserId` - Legacy user_id column for backward compatibility
- `test` - LabTest entity (many-to-one, optional)
- `testPackage` - TestPackage entity (many-to-one, optional)
- `bookingDate` - Scheduled date for sample collection
- `timeSlot` - Scheduled time slot (e.g., "09:00-10:00")
- `familyMemberId` - ID if booking for family member
- `parentBookingId` - Parent booking ID for reflex tests
- `patientDisplayName` - Display name (for family member bookings)
- `status` - BookingStatus enum (BOOKED, CONFIRMED, SAMPLE_COLLECTED, PROCESSING, PENDING_VERIFICATION, VERIFIED, COMPLETED, CANCELLED)
- `technician` - Assigned technician (many-to-one)
- `assignmentType` - AssignmentType enum (AUTO, MANUAL, MO_SUGGESTED)
- `medicalOfficer` - Assigned medical officer (many-to-one)
- `collectionType` - CollectionType enum (LAB, HOME)
- `collectionAddress` - Address for home collection
- `notes` - Additional notes
- `homeCollectionCharge` - Additional charge for home collection
- `totalAmount` - Base price
- `discount` - Discount amount
- `finalAmount` - Final payable amount
- `paymentStatus` - PaymentStatus enum
- `paymentId` - Payment gateway transaction ID
- `criticalFlag` - Critical result flag
- `cancellationReason` - Reason for cancellation
- `specimenRejectionReason` - Specimen rejection reason code
- `specimenRejectionNotes` - Detailed rejection notes
- `rejectedAt` - Rejection timestamp
- `createdAt` - Booking creation timestamp
- `updatedAt` - Last update timestamp
**Depends on:** User, LabTest, TestPackage, BookingStatus, CollectionType, AssignmentType, PaymentStatus
**Used by:** BookingRepository, BookingService
**Real-life analogy:** Like an appointment form - contains all details about a scheduled lab test
**Viva questions this file answers:**
- Q: Every status enum value and what it means in the real world?
  A: BOOKED - Initial booking created, CONFIRMED - Booking confirmed (payment done), SAMPLE_COLLECTED - Sample collected by technician, PROCESSING - Sample being analyzed in lab, PENDING_VERIFICATION - Results ready for MO review, VERIFIED - Report approved by MO, COMPLETED - Report delivered to patient, CANCELLED - Booking cancelled by user/admin. Each represents a stage in the lab testing workflow.
- Q: Why have both test and testPackage (can be null)?
  A: A booking can be for a single test OR a test package, not both. Using nullable fields with validation ensures only one is set. This design allows flexible pricing and inventory management for both individual tests and bundled packages.

---

## LabTest.java
**Package:** com.healthcare.labtestbooking.entity
**Type:** Entity
**Purpose:** Represents a lab test in the catalog with pricing, categorization, and metadata.
**Why this file exists:** Lab test catalog is the product catalog for the system. Central entity for test management and pricing.
**Key fields:**
- `id` - Primary key
- `testCode` (slug) - Unique test identifier (e.g., "cbc-complete")
- `testName` - Display name of test
- `description` - Detailed description
- `shortDescription` - Brief description for listings
- `categoryName` - Category name (e.g., "Hematology")
- `subCategory` - Sub-category
- `category` - Transient TestCategory entity (for backward compatibility)
- `testType` - Transient TestType enum (legacy)
- `methodology` - Transient methodology field
- `unit` - Transient unit field
- `normalRangeMin` - Transient minimum normal value
- `normalRangeMax` - Transient maximum normal value
- `criticalLow` - Transient critical low value
- `criticalHigh` - Transient critical high value
- `price` - Current price
- `originalPrice` - Original price before discount
- `discountedPrice` - Discounted price
- `sampleType` - Sample type required (blood, urine, etc.)
- `fastingRequired` - Fasting required flag
- `fastingHours` - Hours of fasting required
- `reportTimeHours` - Hours to generate report
- `turnaroundTime` - Human-readable turnaround time
- `isActive` - Active/inactive flag
- `isTopBooked` - Popular test flag
- `isTopDeal` - Discounted test flag
- `isPackage` - Package flag (vs individual test)
- `isTrending` - Trending test flag
- `tagsJson` - JSON string of tags
- `iconUrl` - Icon image URL
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
**Depends on:** TestCategory (transient), TestType enum
**Used by:** LabTestRepository, LabTestService
**Real-life analogy:** Like a product catalog entry - contains pricing, description, and metadata for a lab test
**Viva questions this file answers:**
- Q: Why testName + slug both exist?
  A: `testName` is human-readable display name ("Complete Blood Count"). `slug` (testCode) is URL-friendly unique identifier ("cbc-complete") used in APIs and URLs. Separation allows name changes without breaking API contracts, and provides SEO-friendly URLs.

---

## ReportVerification.java
**Package:** com.healthcare.labtestbooking.entity
**Type:** Entity
**Purpose:** Stores medical officer verification details including clinical notes and approval status.
**Why this file exists:** Report verification is a distinct business process from result entry. Separate entity provides audit trail and allows amendments.
**Key fields:**
- `id` - Primary key
- `booking` - Booking entity (one-to-one)
- `medicalOfficer` - User entity (MO who verified)
- `verificationDate` - Verification timestamp
- `clinicalNotes` - Clinical remarks and observations
- `criticalFlags` - Critical result flags
- `status` - VerificationStatus enum (PENDING, APPROVED, REJECTED)
- `digitalSignature` - MO's digital signature
- `icdCodes` - ICD diagnosis codes
- `requiresSpecialistReferral` - Referral required flag
- `specialistType` - Type of specialist needed
- `previouslyRejected` - Previously rejected flag (for recheck filter)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
**Depends on:** Booking, User, VerificationStatus
**Used by:** ReportVerificationRepository, MedicalOfficerService
**Real-life analogy:** Like a pathologist's sign-off sheet - contains approval, notes, and signature for a report
**Viva questions this file answers:**
- Q: Why 3 separate tables (Report, ReportVerification, ReportResult)?
  A: Separation of concerns: Report stores PDF file and share tokens. ReportResult stores actual test values and parameters. ReportVerification stores MO approval and clinical notes. This allows independent updates (results can be updated without re-verification, verification can be amended without changing results) and provides clear audit trails.

---

## Cart.java
**Package:** com.healthcare.labtestbooking.entity
**Type:** Entity
**Purpose:** Represents a shopping cart for accumulating tests before checkout.
**Why this file exists:** Cart is temporary storage for user selections before payment. Separate from bookings because cart items are not yet confirmed.
**Key fields:**
- `cartId` - Primary key
- `user` - User entity (many-to-one)
- `userId` - User ID column (for queries)
- `items` - List of CartItem entities (one-to-many)
- `subtotal` - Sum of item prices
- `discountAmount` - Applied discount
- `taxAmount` - Tax amount
- `totalPrice` - Final total
- `couponCode` - Applied coupon code
- `couponDiscount` - Coupon discount amount
- `status` - CartStatus enum (ACTIVE, CHECKED_OUT, ABANDONED)
- `itemCount` - Number of items
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
**Depends on:** User, CartItem, CartStatus
**Used by:** CartRepository, CartService
**Real-life analogy:** Like a shopping cart - holds items before checkout
**Viva questions this file answers:**
- Q: Why cart is not just a booking draft?
  A: Cart is temporary and can be abandoned. Booking is a confirmed commitment with scheduled date/time. Cart allows users to browse, compare, and accumulate items without creating actual bookings. Status tracking (ACTIVE/CHECKED_OUT/ABANDONED) enables cart analytics and recovery of abandoned carts.

---

# DTOS

## BookingResponse.java
**Package:** com.healthcare.labtestbooking.dto
**Type:** DTO
**Purpose:** Data transfer object for booking information sent to clients.
**Why this file exists:** Separates API response structure from entity structure. Allows custom field mapping and hides sensitive/internal fields.
**Key fields:**
- `id` - Booking ID
- `bookingReference` - Unique booking reference
- `patientId` - Patient user ID
- `patientName` - Patient display name
- `patientEmail` - Patient email
- `patientPhone` - Patient phone
- `familyMemberId` - Family member ID if applicable
- `parentBookingId` - Parent booking for reflex tests
- `labTestId` - Test ID
- `labTestName` - Test name
- `packageId` - Package ID
- `packageName` - Package name
- `testName` - Combined test/package name
- `bookingDate` - Scheduled date
- `timeSlot` - Scheduled time slot
- `status` - Booking status
- `collectionType` - Collection type (LAB/HOME)
- `collectionAddress` - Collection address
- `homeCollectionCharge` - Home collection fee
- `totalAmount` - Base amount
- `amount` - Alias for totalAmount
- `discount` - Discount amount
- `finalAmount` - Final payable amount
- `notes` - Additional notes
- `paymentStatus` - Payment status
- `reportAvailable` - Report ready flag
- `createdAt` - Creation timestamp
- `technicianId` - Technician ID
- `technicianName` - Technician name
- `assignmentType` - Assignment type
- `cancellationReason` - Cancellation reason
- `rejectionReason` - Specimen rejection reason
- `rejectedAt` - Rejection timestamp
**Depends on:** None (plain POJO)
**Used by:** BookingService, BookingController
**Real-life analogy:** Like a booking confirmation slip - contains all relevant booking details for display
**Viva questions this file answers:**
- Q: Why not return Booking entity directly?
  A: Entity contains internal fields (password, audit timestamps, relationships) that should not be exposed to API. DTO allows selective field exposure, custom field naming (e.g., testName combines test/package name), and prevents accidental exposure of sensitive data. Also breaks circular dependency between entities.

---

## ReportVerificationRequest.java
**Package:** com.healthcare.labtestbooking.dto
**Type:** DTO
**Purpose:** Request DTO for report verification operation.
**Why this file exists:** Encapsulates verification input with validation rules separate from entity structure.
**Key fields:**
- `clinicalNotes` - Clinical remarks (max 1000 chars)
- `digitalSignature` - MO's digital signature (required, max 250 chars)
- `approved` - Approval status (required)
- `icdCodes` - ICD diagnosis codes (max 500 chars)
- `specialistType` - Specialist type if referral needed (required, max 250 chars)
**Depends on:** Validation annotations
**Used by:** MedicalOfficerController, MedicalOfficerService
**Real-life analogy:** Like a verification form - contains fields for MO to complete during report review
**Viva questions this file answers:**
- Q: The @NotBlank fields that break MO verify?
  A: `digitalSignature` and `specialistType` are @NotBlank. MO must provide digital signature for audit trail and specialist type for referral tracking. If these are missing, validation fails at controller level before reaching service layer, preventing incomplete verifications.

---

## LabTestDTO.java
**Package:** com.healthcare.labtestbooking.dto
**Type:** DTO
**Purpose:** Data transfer object for lab test catalog information.
**Why this file exists:** Separates API response from entity structure. Allows field mapping and hides internal fields.
**Key fields:**
- `id` - Test ID
- `testCode` - Unique test code/slug
- `testName` - Display name
- `slug` - URL-friendly identifier
- `categoryName` - Category name
- `categoryId` - Category ID (legacy)
- `testType` - Test type (legacy)
- `methodology` - Testing methodology (transient)
- `unit` - Result unit (transient)
- `normalRangeMin` - Minimum normal value (transient)
- `normalRangeMax` - Maximum normal value (transient)
- `normalRangeText` - Text description of normal range
- `description` - Detailed description
- `shortDescription` - Brief description
- `price` - Current price
- `originalPrice` - Original price
- `sampleType` - Sample type required
- `isActive` - Active flag
- `fastingRequired` - Fasting required flag
- `fastingHours` - Fasting hours
- `reportTimeHours` - Report turnaround hours
- `turnaroundTime` - Human-readable turnaround
- `averageRating` - Average rating
- `totalReviews` - Total reviews count
- `isTopBooked` - Popular test flag
- `isTopDeal` - Discounted test flag
- `parametersCount` - Number of test parameters
- `recommendedFor` - Recommended for description
- `discountPercent` - Discount percentage
- `iconUrl` - Icon image URL
- `isPackage` - Package flag
- `isTrending` - Trending flag
- `subTests` - List of sub-test names
- `tags` - List of tags
- `parameters` - List of test parameters
**Depends on:** TestParameterDTO
**Used by:** LabTestService
**Real-life analogy:** Like a product catalog card - displays test information for user selection
**Viva questions this file answers:**
- Q: The missing isTopBooked, discountPercent fields?
  A: These fields ARE present in LabTestDTO (lines 40, 44). They come from the entity's isTopBooked and are calculated from (originalPrice - price) / originalPrice * 100. The DTO includes all fields needed for frontend display including promotional flags and discount information.

---

## ApiResponse.java
**Package:** com.healthcare.labtestbooking.dto
**Type:** Generic DTO
**Purpose:** Standardized API response wrapper for all endpoints.
**Why this file exists:** Provides consistent response structure across all APIs. Simplifies frontend error handling and response parsing.
**Key fields:**
- `success` - Boolean indicating success/failure
- `message` - Human-readable message
- `data` - Generic payload data
- `totalElements` - Total count for paginated responses
- `totalPages` - Total pages for paginated responses
- `currentPage` - Current page number for paginated responses
**Depends on:** None (generic type T)
**Used by:** All controllers
**Real-life analogy:** Like a standardized envelope - wraps any content with consistent metadata
**Viva questions this file answers:**
- Q: Why generic wrapper used for all responses?
  A: Consistency: Frontend always knows response structure `{success, message, data}`. Error handling: success flag indicates if operation succeeded. Pagination: totalElements/totalPages embedded for easy UI pagination. Type safety: Generic T allows any data type while maintaining structure. Reduces frontend code duplication.

---

# CONFIGS

## SecurityConfig.java
**Package:** com.healthcare.labtestbooking.config
**Type:** Configuration
**Purpose:** Configures Spring Security with JWT authentication, CORS, and endpoint authorization rules.
**Why this file exists:** Security configuration centralizes all access control rules. Without it, security would be scattered across individual controllers.
**Key methods/fields:**
- `authenticationProvider()` - Configures DAO authentication provider
- `authenticationManager(AuthenticationConfiguration)` - Creates authentication manager
- `passwordEncoder()` - BCrypt password encoder bean
- `corsConfigurationSource()` - Configures CORS settings
- `securityFilterChain(HttpSecurity)` - Main security configuration with endpoint rules
**Depends on:** JwtAuthenticationFilter, JwtAuthenticationEntryPoint, UserDetailsServiceImpl, RateLimitingFilter
**Used by:** Spring Security framework
**Real-life analogy:** Like a building security policy - defines who can enter which areas
**Viva questions this file answers:**
- Q: PermitAll list vs authenticated list, why order matters?
  A: Security rules are evaluated in order. More specific rules must come before general rules. If `/api/auth/**` (permitAll) comes after `/**` (authenticated), auth endpoints would require login. Order ensures public endpoints are matched first.
- Q: Why enableMethodSecurity?
  A: Enables method-level security with @PreAuthorize annotations. Allows granular access control at service method level (e.g., `@PreAuthorize("hasRole('ADMIN')")` on specific methods) in addition to URL-level security.

---

## DataInitializer.java
**Package:** com.healthcare.labtestbooking.config
**Type:** Configuration
**Purpose:** Seeds database with initial test data and users on application startup.
**Why this file exists:** Provides test data for development and ensures required users (admin) exist for first login.
**Key methods/fields:**
- `run(String... args)` - Entry point executed after Spring context startup
- `initializeLabTests()` - Seeds lab tests if table is empty
- `initializeTestParameters()` - Seeds test parameters
- `initializeUsers()` - Seeds default users (admin, technician, MO)
- `allocateAvailablePhone(String preferredPhone)` - Finds unused phone number
**Depends on:** LabTestRepository, UserRepository, TestParameterRepository, PasswordEncoder
**Used by:** Spring Boot startup (CommandLineRunner)
**Real-life analogy:** Like a store setup crew - stocks shelves with initial inventory before opening
**Viva questions this file answers:**
- Q: Why not just data.sql?
  A: DataInitializer provides conditional logic (only seed if empty), phone number allocation, and password hashing. data.sql is static SQL that runs every time. DataInitializer is more flexible for complex initialization logic and avoids duplicate data on restarts.

---

## JwtService.java
**Package:** com.healthcare.labtestbooking.security
**Type:** Service
**Purpose:** Generates and validates JWT tokens for authentication.
**Why this file exists:** JWT logic is complex with signature validation, claim extraction, and multiple token types. Centralized service ensures consistent token handling.
**Key methods/fields:**
- `generateToken(String username, String role)` - Generates access token
- `generateRefreshToken(String username)` - Generates refresh token
- `generatePasswordResetToken(String username)` - Generates password reset token (1 hour)
- `isPasswordResetToken(String token)` - Validates reset token type
- `generateVerificationToken(String username)` - Generates email verification token (24 hours)
- `isVerificationToken(String token)` - Validates verification token type
- `validateToken(String token)` - Validates token signature and expiry
- `extractUsername(String token)` - Extracts email from token
- `extractClaim(String token, Function<Claims, T> claimsResolver)` - Generic claim extractor
- `extractAllClaims(String token)` - Extracts all claims
- `buildToken(Map<String, Object> claims, String username, long expiration)` - Builds JWT with claims
- `getSignInKey()` - Returns signing key from secret
**Depends on:** JWT library (jjwt)
**Used by:** AuthService, JwtAuthenticationFilter
**Real-life analogy:** Like a ticket issuer - creates and validates access passes
**Viva questions this file answers:**
- Q: What claims are stored in token (email, role)?
  A: Standard JWT claims: `sub` (subject/email), `role` (user role), `iat` (issued at), `exp` (expiration). Custom claims: `type` (token type: ACCESS, REFRESH, RESET, VERIFY) to prevent token type confusion. Email is the subject for user lookup, role for authorization.

---

# FILTERS

## JwtAuthenticationFilter.java
**Package:** com.healthcare.labtestbooking.security
**Type:** Filter
**Purpose:** Intercepts HTTP requests to validate JWT tokens and set security context.
**Why this file exists:** JWT validation must happen before controller execution. Filter provides cross-cutting concern handling.
**Key methods/fields:**
- `shouldNotFilter(HttpServletRequest request)` - Skips filter for public endpoints
- `doFilterInternal(HttpServletRequest, HttpServletResponse, FilterChain)` - Main filter logic
- `getJwtFromRequest(HttpServletRequest request)` - Extracts JWT from Authorization header
**Depends on:** JwtUtil, UserDetailsServiceImpl, TokenBlacklistService
**Used by:** Spring Security filter chain
**Real-life analogy:** Like a ticket checker at event entrance - validates tickets before allowing entry
**Viva questions this file answers:**
- Q: The request lifecycle: request → filter → context?
  A: 1) Request arrives, 2) shouldNotFilter checks if endpoint is public, 3) If not public, extract JWT from Authorization header, 4) Check if token is blacklisted, 5) Validate token signature/expiry, 6) Extract email from token, 7) Load user details from database, 8) Create Authentication object with authorities, 9) Set in SecurityContext, 10) Continue to controller. Context is available to controllers via SecurityContextHolder.

---

## RateLimitingFilter.java
**Package:** com.healthcare.labtestbooking.filter
**Type:** Filter
**Purpose:** Prevents API abuse by limiting request rate per IP address.
**Why this file exists:** Protects against DoS attacks and brute force attempts. Rate limiting is a security best practice.
**Key methods/fields:**
- `doFilterInternal(HttpServletRequest, HttpServletResponse, FilterChain)` - Main filter logic
- `isExemptedEndpoint(String path)` - Checks if endpoint is exempt from rate limiting
- `getClientId(HttpServletRequest request)` - Extracts client IP address
- `getMaxRequestsForPath(String path)` - Returns rate limit for specific endpoint
**Depends on:** Spring OncePerRequestFilter
**Used by:** Spring filter chain
**Real-life analogy:** Like a bouncer counting entrants - limits how many requests can enter per minute
**Viva questions this file answers:**
- Q: How it counts per IP, why after JWT filter?
  A: Uses ConcurrentHashMap with IP as key and RateLimitInfo as value storing request count and reset time. After JWT filter ensures rate limiting applies even to authenticated users (prevents account abuse). If before JWT, anonymous users could bypass by not sending token. Order: Rate limiting after auth prevents both anonymous and authenticated abuse.

---

# EXCEPTIONS

## GlobalExceptionHandler.java
**Package:** com.healthcare.labtestbooking.exception
**Type:** Exception Handler
**Purpose:** Centralizes exception handling for all controllers to provide consistent error responses.
**Why this file exists:** Without centralized handling, each controller would need try-catch blocks. Global handler reduces code duplication and ensures consistent error format.
**Key methods/fields:**
- `handleAuthenticationException(AuthenticationException, HttpServletRequest)` - Handles auth failures
- `handleAccessDeniedException(AccessDeniedException, HttpServletRequest)` - Handles authorization failures
- `handleValidationException(MethodArgumentNotValidException, HttpServletRequest)` - Handles validation errors
- `handleNotFoundException(NoHandlerFoundException, HttpServletRequest)` - Handles 404 errors
- `handleResourceNotFoundException(ResourceNotFoundException, HttpServletRequest)` - Handles resource not found
- `handleIllegalArgumentException(IllegalArgumentException, HttpServletRequest)` - Handles invalid arguments
- `handleUserAlreadyExistsException(UserAlreadyExistsException, HttpServletRequest)` - Handles duplicate user
- `handleInvalidCredentialsException(InvalidCredentialsException, HttpServletRequest)` - Handles invalid login
- `handleDataAccessException(DataAccessException, HttpServletRequest)` - Handles database errors
- `handleGlobalException(Exception, HttpServletRequest)` - Handles all uncaught exceptions
**Depends on:** Spring @RestControllerAdvice
**Used by:** All controllers (automatic)
**Real-life analogy:** Like an error desk - handles all problems and provides consistent responses
**Viva questions this file answers:**
- Q: @ControllerAdvice, every @ExceptionHandler?
  A: @ControllerAdvice makes this class apply to all controllers. Each @ExceptionHandler method handles specific exception types. When any controller throws an exception, Spring routes it to the matching handler method here. This provides single point of error handling without modifying individual controllers.

---

## UserAlreadyExistsException.java
**Package:** com.healthcare.labtestbooking.exception
**Type:** Custom Exception
**Purpose:** Indicates user registration failed due to duplicate email or phone.
**Why this file exists:** Custom exception allows specific handling in GlobalExceptionHandler. Generic RuntimeException would not distinguish this error type.
**Key methods/fields:**
- `UserAlreadyExistsException(String message)` - Constructor with message
- `UserAlreadyExistsException(String message, Throwable cause)` - Constructor with message and cause
**Depends on:** RuntimeException
**Used by:** AuthService, GlobalExceptionHandler
**Real-life analogy:** Like a "duplicate record" error card - specific error for duplicate registration
**Viva questions this file answers:**
- Q: Why custom vs generic RuntimeException?
  A: Custom exception enables specific handling in GlobalExceptionHandler (returns 409 CONFLICT status instead of 500 INTERNAL_SERVER_ERROR). Also provides semantic clarity - code intent is clear when throwing UserAlreadyExistsException vs generic RuntimeException. Frontend can show specific error message ("Email already registered") instead of generic error.

---

# END OF AUDIT

# VIVA 3: Frontend Files - HEALTHCARELAB

---

# CONTEXTS (State Management Core)

## AuthContext.tsx
**Location:** frontend/src/context/AuthContext.tsx
**Type:** Context
**Purpose:** Global authentication state management
**Why this file exists:** Without it, every component would need to fetch user data independently, causing duplicate API calls and state inconsistency
**Key logic inside:** Hydrate context on mount, login/logout with localStorage management, token refresh handling
**Props/State:** currentUser, isAuthenticated, isLoading, login, register, logout functions
**Connected to backend:** POST /api/auth/login, POST /api/auth/register, GET /api/users/me
**Imports explained:**
- createContext, useState, useEffect, useContext: React hooks for state management
- axios: HTTP client for API calls
- toast: User notifications
**Real-life analogy:** Like a hotel reception desk - knows who's checked in, can check guests in/out, all rooms (components) ask reception about guest status
**Viva Q&A:**
Q: Why Context not Redux for auth?
A: Auth state is simple (user, token, loading). Redux adds boilerplate (actions, reducers, dispatch) not justified for this scale. Context API is built into React, simpler for global auth state.
Q: What does hydrateContext do and WHY it calls backend not just localStorage?
A: hydrateContext validates token by calling backend (GET /api/users/me). localStorage can be stale (expired token, user changed). Backend call ensures fresh, valid data.
Q: Why login() clears localStorage BEFORE setting new user?
A: Prevents data leak between sessions. If previous user's data remains, new user might see old data. clearAllUserData() wipes all user-specific keys before storing new session.
Q: What does auth:login:success event do?
A: Fired after successful login. AuthModal.tsx listens for it to redirect to appropriate dashboard based on role. Decouples login logic from navigation logic.
Q: Difference between isAuthenticated and currentUser !== null?
A: isAuthenticated is derived from currentUser (line 281: `!!currentUser`). currentUser holds actual user object. isAuthenticated is boolean convenience flag for conditional rendering.

## CartContext.tsx
**Location:** frontend/src/context/CartContext.tsx
**Type:** Context
**Purpose:** Shopping cart state management with offline-first support
**Why this file exists:** Without it, cart would be lost on page refresh. Also enables offline cart when backend unavailable
**Key logic inside:** Sync with localStorage, offline fallback for 401/403 errors, add/remove/update items
**Props/State:** cart, loading, error, isCartOpen, addTest, addPackage, removeItem, updateQuantity, clearCart, isInCart
**Connected to backend:** GET /api/cart, POST /api/cart/add-test, POST /api/cart/add-package, DELETE /api/cart/item/{id}, PUT /api/cart/item/{id}, DELETE /api/cart/clear
**Imports explained:**
- createContext, useContext, useState, useEffect, useCallback: React hooks for state and side effects
- api: Axios instance for API calls
- toast: User notifications
**Real-life analogy:** Like a physical shopping cart - you can add items while walking through store (offline), cashier syncs final cart at checkout (backend)
**Viva Q&A:**
Q: Why cart lives in Context not in a service?
A: Service handles API calls. Context holds UI state (isCartOpen, loading). Cart needs both - service for persistence, context for reactive UI updates.
Q: Why medsync_cart_cache key clears on logout?
A: Prevents cross-user data leak. If User A logs out and User B logs in on same browser, User B shouldn't see User A's cart. auth:logout event triggers clear.
Q: How does cart sync with backend on page load?
A: useEffect on mount (line 114-128) reads from localStorage if token exists. Then fetchCart() (line 153-173) calls backend to sync. Backend response overwrites localStorage cache.

## ModalContext.tsx
**Location:** frontend/src/context/ModalContext.tsx
**Type:** Context
**Purpose:** Global modal state management
**Why this file exists:** Without it, each component would need its own modal state, causing duplicate code and modal conflicts
**Key logic inside:** Manage activeModal type, modalProps, authModalTab state
**Props/State:** activeModal, modalProps, authModalTab, openModal, closeModal, openAuthModal, setAuthModalTab
**Connected to backend:** None (UI state only)
**Imports explained:**
- createContext, useContext, useState: React hooks for state
**Real-life analogy:** Like a stage manager - knows which curtain (modal) is open, tells actors (components) when to enter/exit stage
**Viva Q&A:**
Q: Why is auth modal global state not local?
A: Auth modal can be triggered from anywhere (header, protected route redirect, booking page). Global state allows any component to open it without prop drilling through component tree.

---

# HOOKS

## useAuth.ts
**Location:** frontend/src/hooks/useAuth.ts
**Type:** Hook
**Purpose:** Convenience hook to access AuthContext
**Why this file exists:** Avoids importing AuthContext directly everywhere, provides error if used outside provider
**Key logic inside:** useContext(AuthContext) with error check
**Props/State:** Returns AuthContextType (currentUser, login, logout, etc.)
**Connected to backend:** Indirectly via AuthContext
**Imports explained:**
- useContext: Hook to consume context
- AuthContext: Context to consume
**Real-life analogy:** Like a remote control - gives you access to TV (AuthContext) without going to the TV set yourself
**Viva Q&A:**
Q: Why not import AuthContext directly everywhere?
A: useAuth provides error handling ("must be used within AuthProvider"). Also abstracts context implementation - if AuthContext changes, only useAuth needs updating, not all consumers.

## useCart.ts
**Location:** frontend/src/hooks/useCart.ts
**Type:** Hook
**Purpose:** Convenience hook to access CartContext
**Why this file exists:** Provides consistent access to cart state with error handling
**Key logic inside:** useContext(CartContext) with error check
**Props/State:** Returns CartContextType (cart, addTest, removeItem, etc.)
**Connected to backend:** Indirectly via CartContext
**Imports explained:**
- useContext: Hook to consume context
- CartContext: Context to consume
**Real-life analogy:** Like a cart handle - gives you grip on cart without touching the cart itself
**Viva Q&A:**
Q: Why abstraction over CartContext?
A: Same as useAuth - error handling if used outside provider, centralizes cart access pattern.

---

# SERVICES

## api.ts
**Location:** frontend/src/services/api.ts
**Type:** Service
**Purpose:** Axios instance with interceptors for JWT, error handling, token refresh
**Why this file exists:** Without it, every component would need to add Authorization header, handle 401 errors, manage token refresh. Centralizes HTTP configuration
**Key logic inside:** Request interceptor adds JWT, response interceptor handles 401/refresh token, retry logic
**Props/State:** None (singleton Axios instance)
**Connected to backend:** All backend endpoints via this instance
**Imports explained:**
- axios: HTTP client library
**Real-life analogy:** Like a mailroom - all outgoing mail (requests) goes through it, stamps (adds Authorization), handles returned mail (responses), manages delivery failures (retries)
**Viva Q&A:**
Q: Why axios not fetch?
A: Axios has interceptors (add headers globally), automatic JSON parsing, request/response transformation, better error handling. Fetch requires manual header addition, JSON parsing, error handling.
Q: What does request interceptor add?
A: Authorization header with Bearer token from localStorage (line 124). Ensures every request includes authentication.
Q: What does response interceptor do?
A: Handles 401 errors (token refresh or logout), 429 rate limit (retry with delay), shows toast notifications for errors (line 146-181).
Q: Why is api.ts imported by all services not called directly?
A: Abstraction layer. Components call services (adminService, bookingService), services call api. If endpoint changes, only service file needs update. Also enables centralized error handling, logging.

## adminService.ts
**Location:** frontend/src/services/adminService.ts
**Type:** Service
**Purpose:** Admin-specific API calls
**Why this file exists:** Separates admin API logic from other services, organizes admin endpoints
**Key logic inside:** getSystemStats, getUsers, updateUserRole, getAuditLogs, reference range management
**Props/State:** None (exported functions)
**Connected to backend:** GET /api/admin/stats, GET /api/admin/users, PUT /api/admin/users/{id}/role, GET /api/admin/audit-logs, /api/reference-ranges
**Imports explained:**
- api: Axios instance
**Real-life analogy:** Like an admin dashboard remote - contains buttons for admin-specific actions (manage users, view logs, configure system)
**Viva Q&A:**
Q: Every method and which endpoint it calls?
A: getSystemStats → GET /api/admin/stats, getUsersPage → GET /api/admin/users, updateUserRole → PUT /api/admin/users/{id}/role, getRevenueData → GET /api/admin/revenue, getAuditLogsPage → GET /api/admin/audit-logs, getReferenceRanges → GET /api/reference-ranges, assignTechnician → PUT /api/bookings/{id}/technician.

## booking.ts
**Location:** frontend/src/services/booking.ts
**Type:** Service
**Purpose:** Booking-related API calls
**Why this file exists:** Centralizes booking operations, normalizes response data
**Key logic inside:** getMyBookings, createBooking, cancelBooking, rescheduleBooking, data normalization
**Props/State:** None (exported functions)
**Connected to backend:** GET /api/users/bookings, GET /api/users/bookings/{id}, POST /api/bookings, PUT /api/bookings/{id}/cancel, PUT /api/users/bookings/{id}/reschedule
**Imports explained:**
- api: Axios instance
- BookingResponse, CreateBookingRequest, BookingSearchParams: TypeScript types
**Real-life analogy:** Like a booking agent - handles all reservation operations, confirms availability, processes cancellations
**Viva Q&A:**
Q: getMyBookings params: page, size, sort explained?
A: page: which page of results (0-indexed), size: items per page (default 20), sort: field to sort by (default bookingDate). Pagination reduces load, sort orders results.

## technicianService.ts
**Location:** frontend/src/services/technicianService.ts
**Type:** Service
**Purpose:** Technician-specific API calls
**Why this file exists:** Separates technician operations from other services
**Key logic inside:** getTechnicianBookings, updateCollectionStatus, uploadReport, rejectSpecimen
**Props/State:** None (exported functions)
**Connected to backend:** GET /api/bookings/technician, PUT /api/bookings/{id}/collection, POST /api/reports/upload, POST /api/bookings/{id}/reject-specimen
**Imports explained:**
- api: Axios instance
**Real-life analogy:** Like a technician's work tablet - shows assigned tasks, marks collection complete, uploads results
**Viva Q&A:**
Q: updateCollectionStatus vs updateBookingCompletedStatus?
A: updateCollectionStatus marks SAMPLE_COLLECTED (line 23-31). updateBookingCompletedStatus is alias that sets COMPLETED status (line 50-52). Two different workflow steps.

## doctorService.ts
**Location:** frontend/src/services/doctorService.ts
**Type:** Service
**Purpose:** Medical Officer API calls
**Why this file exists:** Separates medical officer operations (verification, approvals)
**Key logic inside:** verifyReport, rejectReport, getPendingApprovals, getPatientBookings
**Props/State:** None (exported functions)
**Connected to backend:** POST /api/mo/verify/{id}, POST /api/mo/reject/{id}, GET /api/mo/pending, GET /api/patients/{id}/bookings
**Imports explained:**
- api: Axios instance
**Real-life analogy:** Like a doctor's prescription pad - contains verification actions, patient history access, approval workflows
**Viva Q&A:**
Q: Why named doctorService for MedicalOfficer role?
A: Historical naming - initially called "doctor" but role is "MEDICAL_OFFICER" in backend. Naming mismatch but functional. Should be medicalOfficerService for consistency.

## reportService.ts
**Location:** frontend/src/services/reportService.ts
**Type:** Service
**Purpose:** Report download and AI analysis API calls
**Why this file exists:** Handles report downloads (blob handling), AI analysis retrieval
**Key logic inside:** getMyReports, downloadReport, getAIAnalysis, blob URL creation
**Props/State:** None (exported functions)
**Connected to backend:** GET /api/reports/my, GET /api/reports/{id}/download, GET /api/reports/{id}/ai-analysis
**Imports explained:**
- api: Axios instance
**Real-life analogy:** Like a medical records clerk - retrieves reports, creates downloadable copies, fetches AI analysis
**Viva Q&A:**
Q: download flow: blob URL creation explained?
A: GET request with responseType: 'blob' (line 95). Create Blob from response.data (line 97). Create object URL with URL.createObjectURL (line 98). Create anchor element, set href, click to download (line 103-107). Revoke URL after 10s to free memory (line 109).

---

# KEY COMPONENTS

## AnimatedRoutes.tsx
**Location:** frontend/src/components/layout/AnimatedRoutes.tsx
**Type:** Component
**Purpose:** Route configuration with lazy loading and animations
**Why this file exists:** Centralizes routing, enables code splitting for performance
**Key logic inside:** lazy() for code splitting, Suspense for loading state, ProtectedRoute wrapping
**Props/State:** None (renders Routes based on path)
**Connected to backend:** None (routing only)
**Imports explained:**
- Routes, Route: React Router routing
- lazy, Suspense: React code splitting
- AnimatedRoutes: Framer Motion animations
**Real-life analogy:** Like a traffic controller - directs cars (components) to correct roads (routes), uses traffic lights (loading states) to manage flow
**Viva Q&A:**
Q: What does PageTransition do?
A: Wraps route content with Framer Motion animation (fade/slide). Provides smooth transition between pages.
Q: Why lazy() and Suspense used?
A: lazy() code-splits - loads route component only when needed. Reduces initial bundle size. Suspense shows loading state while component loads. Without lazy: entire app in one bundle = slow initial load.
Q: How does ProtectedRoute wrap role-specific routes?
A: Routes 123-135: <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}> wraps admin routes. ProtectedRoute checks authentication and role before rendering child routes.

## ProtectedRoute.tsx
**Location:** frontend/src/components/layout/ProtectedRoute.tsx
**Type:** Component
**Purpose:** Route protection with role-based access control
**Why this file exists:** Prevents unauthorized access to protected pages, handles loading states
**Key logic inside:** Check isAuthenticated, check allowedRoles, redirect on failure, loading timeout
**Props/State:** allowedRoles prop, Outlet for child routes
**Connected to backend:** None (uses AuthContext for auth state)
**Imports explained:**
- Navigate, Outlet: React Router navigation and nested routes
- useAuth: Auth context hook
**Real-life analogy:** Like a security checkpoint - checks ID (auth), checks clearance level (role), allows or denies entry
**Viva Q&A:**
Q: isLoading timeout: why 5000ms failsafe?
A: If auth loading hangs indefinitely (network issue, bug), timeout forces redirect to login after 5 seconds. Prevents infinite spinner, provides fallback UX.
Q: allowedRoles prop: how role redirect works?
A: If user role not in allowedRoles (line 51), redirect to appropriate dashboard based on role (line 53-56). ADMIN → /admin, TECHNICIAN → /technician, etc.
Q: Why Navigate not useNavigate here?
A: Navigate is component (renders to navigate). useNavigate is hook (must be called in component). ProtectedRoute is component, so Navigate is correct choice for rendering redirect.

## Header.tsx
**Location:** frontend/src/components/layout/Header.tsx
**Type:** Component
**Purpose:** Navigation header with role-based menu
**Why this file exists:** Provides consistent navigation across app, shows cart count, auth status
**Key logic inside:** Role-based nav rendering, cart badge from CartContext, logout handler
**Props/State:** None (reads from context)
**Connected to backend:** None (reads from context)
**Imports explained:**
- useAuth: Auth context
- useCartContext: Cart context
**Real-life analogy:** Like a restaurant menu - shows options based on who you are (role), displays cart items, allows logout
**Viva Q&A:**
Q: Role-based nav: why conditional rendering not separate components?
A: Conditional rendering (if role === ADMIN) is simpler than separate Header components. Single component easier to maintain, consistent styling, less code duplication.
Q: Cart count: how it updates from CartContext?
A: useCartContext() provides cart state (line 13). cart.itemCount displayed in badge. CartContext updates cart state on add/remove, Header re-renders automatically.

## AuthModal.tsx
**Location:** frontend/src/components/auth/AuthModal.tsx
**Type:** Component
**Purpose:** Login/Register modal with animations and role-based redirect
**Why this file exists:** Provides consistent auth UI across app, handles role-based post-login redirect
**Key logic inside:** Listen for auth:login:success event, role-based navigation, tab switching
**Props/State:** None (reads from ModalContext)
**Connected to backend:** None (LoginForm/RegisterForm handle API calls)
**Imports explained:**
- useModal: Modal context
- LoginForm, RegisterForm: Auth form components
**Real-life analogy:** Like a reception desk - single place for check-in/check-out, directs guests to appropriate room after check-in
**Viva Q&A:**
Q: auth:login:success event listener: why window event not prop?
A: Decoupling - AuthContext fires event, AuthModal listens. AuthContext doesn't need to know about AuthModal. Any component can listen for login success. Window events work across component boundaries.
Q: Role-based redirect after login?
A: Event listener (line 18-28) gets role from event detail. Navigate to /admin for ADMIN, /technician for TECHNICIAN, etc. Directs user to appropriate dashboard based on role.

---

# PAGES

## LandingPage.tsx
**Location:** frontend/src/pages/LandingPage.tsx
**Type:** Page
**Purpose:** Public landing page with hero section, features, test catalog
**Why this file exists:** First impression for unauthenticated users, provides navigation to registration
**Key logic inside:** Renders hero section, popular tests, features. Calls GET /api/lab-tests/popular on load
**Props/State:** None (static content with dynamic test listing)
**Connected to backend:** GET /api/lab-tests/popular
**Imports explained:**
- React: Component rendering
- useNavigate: Navigation
**Real-life analogy:** Like a store window display - shows products, welcomes customers, invites them inside
**Viva Q&A:**
Q: What sections render?
A: Hero section (CTA buttons), Popular Tests (api call), Features grid, Footer.
Q: Which APIs called on load?
A: GET /api/lab-tests/popular to display trending tests.

## AdminDashboard.tsx
**Location:** frontend/src/pages/admin/AdminDashboard.tsx
**Type:** Page
**Purpose:** Admin dashboard with stats, user management, audit logs
**Why this file exists:** Central admin control panel for system management
**Key logic inside:** Loads stats, users, audit logs in parallel using Promise.all
**Props/State:** stats, users, auditLogs state
**Connected to backend:** GET /api/admin/stats, GET /api/admin/users, GET /api/admin/audit-logs
**Imports explained:**
- useState, useEffect: State management
- adminService: API calls
**Real-life analogy:** Like a control room - monitors system health, manages users, views activity logs
**Viva Q&A:**
Q: Why Promise.all for parallel data loading?
A: Loads stats, users, audit logs simultaneously instead of sequentially. Reduces total load time from 3 sequential requests to 1 parallel batch.
Q: getMyBookings params: page, size, sort explained?
A: page: result page number (0-indexed), size: items per page, sort: sort field. Pagination reduces server load.

## TechnicianDashboardPage.tsx
**Location:** frontend/src/pages/technician/TechnicianDashboardPage.tsx
**Type:** Page
**Purpose:** Technician dashboard with TODAY/UPCOMING/COMPLETED filter logic
**Why this file exists:** Central work interface for technicians to manage collections
**Key logic inside:** Filter bookings by status (TODAY, UPCOMING, COMPLETED), mark collected, upload reports
**Props/State:** bookings, filter state, loading
**Connected to backend:** GET /api/bookings/technician, PUT /api/bookings/{id}/collection, POST /api/reports/upload
**Imports explained:**
- useState, useEffect: State management
- technicianService: API calls
**Real-life analogy:** Like a technician's work queue - shows today's tasks, upcoming jobs, completed work
**Viva Q&A:**
Q: TODAY/UPCOMING/COMPLETED filter logic?
A: TODAY: bookings with collectionDate === today. UPCOMING: collectionDate > today. COMPLETED: status in [SAMPLE_COLLECTED, PROCESSING, VERIFIED].

## MedicalOfficerDashboardPage.tsx
**Location:** frontend/src/pages/medical/MedicalOfficerDashboardPage.tsx
**Type:** Page
**Purpose:** Medical Officer dashboard for report verification
**Why this file exists:** Central interface for MO to verify reports
**Key logic inside:** Load pending verifications, verify with mandatory remarks, reject with reason
**Props/State:** pendingVerifications, loading
**Connected to backend:** GET /api/mo/pending, POST /api/mo/verify/{id}, POST /api/mo/reject/{id}
**Imports explained:**
- useState, useEffect: State management
- doctorService: API calls
**Real-life analogy:** Like a doctor's review desk - shows pending reports to sign off, requires notes for approval/rejection
**Viva Q&A:**
Q: Verify flow with mandatory remarks?
A: POST /api/mo/verify/{id} requires clinicalNotes and digitalSignature. Frontend validates these fields before API call. Backend @NotBlank enforces validation.

## BookingPage.tsx
**Location:** frontend/src/pages/patient/BookingPage.tsx
**Type:** Page
**Purpose:** Multi-step booking form for lab tests
**Why this file exists:** Patient interface to book lab tests with date/time selection
**Key logic inside:** Multi-step form state management, date/time slot selection, payment flow
**Props/State:** bookingData, currentStep, selectedDate, selectedTime
**Connected to backend:** POST /api/bookings/create
**Imports explained:**
- useState, useEffect: State management
- bookingService: API calls
**Real-life analogy:** Like appointment booking wizard - guides through steps: select test → choose date → confirm
**Viva Q&A:**
Q: Multi-step form state management?
A: currentStep state (0: test selection, 1: date/time, 2: confirmation, 3: payment). Each step has validation before proceeding. State persists across steps.

## CartPage.tsx
**Location:** frontend/src/pages/CartPage.tsx
**Type:** Page
**Purpose:** Shopping cart display with promo code application
**Why this file exists:** Allows users to review cart, apply promo codes, proceed to checkout
**Key logic inside:** Render cart items from CartContext, apply/remove promo codes, calculate totals
**Props/State:** Reads from CartContext
**Connected to backend:** POST /api/cart/apply-coupon, DELETE /api/cart/remove-coupon
**Imports explained:**
- useCartContext: Cart state
**Real-life analogy:** Like shopping cart at checkout - shows items, applies discounts, shows total before payment
**Viva Q&A:**
Q: How items render?
A: Map over cart.items from CartContext. Each item shows name, quantity, price, remove button. Totals calculated from cart.subtotal, cart.discountAmount.
Q: Promo code application?
A: Input field for code → POST /api/cart/apply-coupon → updates cart with discounted price.

## ReportsPage.tsx
**Location:** frontend/src/pages/patient/ReportsPage.tsx
**Type:** Page
**Purpose:** Patient report listing with download functionality
**Why this file exists:** Allows patients to view and download their lab reports
**Key logic inside:** Load reports, create blob URL for download
**Props/State:** reports state
**Connected to backend:** GET /api/reports/my, GET /api/reports/{id}/download
**Imports explained:**
- useState, useEffect: State management
- reportService: API calls
**Real-life analogy:** Like medical records portal - shows report history, allows download of PDFs
**Viva Q&A:**
Q: How download button creates blob URL?
A: GET /api/reports/{id}/download with responseType: 'blob' → new Blob([response.data]) → URL.createObjectURL(blob) → anchor.click() → URL.revokeObjectURL().

## ProfilePage.tsx
**Location:** frontend/src/pages/patient/ProfilePage.tsx
**Type:** Page
**Purpose:** User profile management
**Why this file exists:** Allows users to view/edit their profile information
**Key logic inside:** Load user profile, update profile fields
**Props/State:** user profile data, editing state
**Connected to backend:** GET /api/users/me, PUT /api/users/me
**Imports explained:**
- useState, useEffect: State management
- useAuth: Auth context
**Real-life analogy:** Like user settings page - shows personal info, allows updates
**Viva Q&A:**
Q: Why useEffect reloads on every visit not cache?
A: Ensures fresh data from backend. User might update profile from another session. Without reload, stale data would show. Cache could cause data inconsistency.

---

# TYPES

## auth.ts
**Location:** frontend/src/types/auth.ts
**Type:** Type definitions
**Purpose:** TypeScript interfaces for auth-related data structures
**Why this file exists:** Type safety for auth data, prevents runtime errors, enables IntelliSense
**Key logic inside:** User, LoginRequest, RegisterRequest, AuthResponse interfaces
**Props/State:** None (type definitions)
**Connected to backend:** None (type definitions)
**Imports explained:** None
**Real-life analogy:** Like a form template - defines what fields a form must have, data types, which are optional
**Viva Q&A:**
Q: Why role is optional in LoginRequest (backend ignores it)?
A: Backend determines role from database, not from request. Including role in request is redundant. Optional in frontend for flexibility but unused by backend.
Q: Why User interface role is string not enum?
A: Backend returns role as string ("PATIENT", "ADMIN"). Using string matches backend response. Could use enum for stricter typing but string is simpler and matches JSON serialization.

---

# UTILITIES

## toast.ts
**Location:** frontend/src/utils/toast.ts
**Type:** Utility
**Purpose:** Wrapper around react-hot-toast with consistent styling
**Why this file exists:** Provides consistent toast appearance across app, centralizes toast configuration
**Key logic inside:** success, error, info, warning methods with custom styles
**Props/State:** None (exported functions)
**Connected to backend:** None (UI utility)
**Imports explained:**
- toast from react-hot-toast: Toast library
**Real-life analogy:** Like a notification system - consistent format for all messages (success = green, error = red)
**Viva Q&A:**
Q: Why wrapper around react-hot-toast?
A: Consistent styling (green for success, red for error). Without wrapper, each toast call would need style object. Wrapper provides branded, consistent look.

---

# SUMMARY OF API ENDPOINTS BY SERVICE

| Service | Endpoints |
|---------|-----------|
| adminService | /api/admin/stats, /api/admin/users, /api/admin/users/{id}/role, /api/admin/revenue, /api/admin/audit-logs, /api/reference-ranges |
| booking | /api/users/bookings, /api/users/bookings/{id}, /api/bookings, /api/bookings/{id}/cancel, /api/users/bookings/{id}/reschedule |
| technicianService | /api/bookings/technician, /api/bookings/unassigned, /api/bookings/{id}/collection, /api/bookings/{id}/status, /api/reports/upload |
| doctorService | /api/mo/verify/{id}, /api/mo/reject/{id}, /api/mo/pending, /api/patients/{id}/bookings |
| reportService | /api/reports/my, /api/reports/{id}/download, /api/reports/{id}/ai-analysis |

---

**End of VIVA 3: Frontend Files**

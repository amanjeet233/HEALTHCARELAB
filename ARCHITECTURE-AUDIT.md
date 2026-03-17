# Architecture Audit Report

## 1. Project Structure

- Backend Java Files: 297
- Frontend TS/TSX Files: 92
- Entities Found: 32

## 2. Entity Wiring

| Entity | Repository | Service | Controller | Status |
|---|---|---|---|---|
| AuditLog | AuditLogRepository | AuditLogService | AuditLogController | ACTIVE |
| BookedSlot | BookedSlotRepository | SlotService | SlotController | ACTIVE |
| Booking | BookingRepository | TechnicianAssignmentService | TechnicianController | ACTIVE |
| Consultation | ConsultationRepository | ConsultationService | ConsultationController | ACTIVE |
| DoctorAvailability | DoctorAvailabilityRepository | DoctorAvailabilityService | DoctorAvailabilityController | ACTIVE |
| FamilyMember | FamilyMemberRepository | FamilyMemberService | FamilyMemberController | ACTIVE |
| GatewayPayment | GatewayPaymentRepository | PaymentService | PaymentController | ACTIVE |
| HealthScore | HealthScoreRepository | HealthScoreService | HealthScoreController | ACTIVE |
| LabLocation | LabLocationRepository | LabLocationService | LabLocationController | ACTIVE |
| LabPartner | LabPartnerRepository | LabPartnerService | LabPartnerController | ACTIVE |
| LabTest | LabTestRepository | TestService | PackageTestController | ACTIVE |
| LabTestPricing | LabTestPricingRepository | LabTestPricingService | LabTestPricingController | ACTIVE |
| LocationPricing | LocationPricingRepository | LocationPricingService | LocationPricingController | ACTIVE |
| Notification | NotificationRepository | OrderService | OrderController | ACTIVE |
| Order | OrderRepository | TestPackageService | TestPackageController | ACTIVE |
| OrderStatusHistory | OrderStatusHistoryRepository | OrderStatusHistoryService | OrderStatusHistoryController | ACTIVE |
| PackageTest | PackageTestRepository | TestPackageService | TestPackageController | ACTIVE |
| Payment | PaymentRepository | PaymentService | PaymentController | ACTIVE |
| QuizResult | QuizResultRepository | QuizService | QuizResultController | ACTIVE |
| Recommendation | RecommendationRepository | RecommendationService | RecommendationController | ACTIVE |
| ReferenceRange | ReferenceRangeRepository | SmartReportService | SmartReportController | ACTIVE |
| Report | ReportRepository | TestService | SmartReportController | ACTIVE |
| ReportResult | ReportResultRepository | SmartReportService | SmartReportController | ACTIVE |
| ReportVerification | ReportVerificationRepository | ReportVerificationService | ReportVerificationController | ACTIVE |
| SlotConfig | SlotConfigRepository | SlotService | SlotController | ACTIVE |
| Technician | TechnicianRepository | TechnicianService | TechnicianController | ACTIVE |
| TestCategory | TestCategoryRepository | TestCategoryService | TestCategoryController | ACTIVE |
| TestPackage | TestPackageRepository | TestPackageService | TestPackageController | ACTIVE |
| TestParameter | TestParameterRepository | TestParameterService | TestParameterController | ACTIVE |
| TestPopularity | TestPopularityRepository | TestPopularityService | TestPopularityController | ACTIVE |
| User | UserRepository | UserService | UserHealthDataController | ACTIVE |
| UserHealthData | UserHealthDataRepository | UserHealthDataService | UserHealthDataController | ACTIVE |

## 3. API Usage Matrix

| Controller | Endpoint | Method | Called By Frontend | Status |
|---|---|---|---|---|
| AdminAnalyticsController | /api/admin/analytics/daily-bookings | GET | No | BROKEN |
| AdminAnalyticsController | /api/admin/analytics/popular-tests | GET | No | BROKEN |
| AdminAnalyticsController | /api/admin/analytics/revenue | GET | No | BROKEN |
| AdminAnalyticsController | /api/admin/analytics/user-growth | GET | No | BROKEN |
| AdminAnalyticsController | /api/admin/analytics/cancellation-rate | GET | No | BROKEN |
| AuditLogController | /api/admin/audit-logs/user/{username} | GET | No | BROKEN |
| AuditLogController | /api/admin/audit-logs/entity/{entityName}/{entityId} | GET | No | BROKEN |
| AuditLogController | /api/admin/audit-logs/date-range | GET | No | BROKEN |
| AuthController | /api/auth/register | POST | No | BROKEN |
| AuthController | /api/auth/login | POST | No | BROKEN |
| AuthController | /api/auth/forgot-password | POST | No | BROKEN |
| AuthController | /api/auth/reset-password | POST | No | BROKEN |
| BookedSlotController | /api/booked-slots/{id} | GET | No | BROKEN |
| BookedSlotController | /api/booked-slots/{id} | PUT | No | BROKEN |
| BookedSlotController | /api/booked-slots/{id} | DELETE | No | BROKEN |
| BookingController | /api/bookings/my | GET | Yes | ACTIVE |
| BookingController | /api/bookings/technician | GET | Yes | ACTIVE |
| BookingController | /api/bookings/{id} | GET | Yes | ACTIVE |
| BookingController | /api/bookings/slots | GET | No | BROKEN |
| BookingController | /api/bookings/admin/all | GET | No | BROKEN |
| BookingController | /api/bookings/upcoming | GET | No | BROKEN |
| BookingController | /api/bookings/history | GET | No | BROKEN |
| BookingController | /api/bookings/{id}/reschedule | POST | No | BROKEN |
| BookingController | /api/bookings/{id}/status | PUT | No | BROKEN |
| BookingController | /api/bookings/{id}/technician | PUT | No | BROKEN |
| BookingController | /api/bookings/{id}/cancel | PUT | No | BROKEN |
| BookingController | /api/bookings/admin/{id}/status | PUT | No | BROKEN |
| ConsultationController | /api/consultations/{id} | GET | Yes | ACTIVE |
| ConsultationController | /api/consultations/{id} | PUT | Yes | ACTIVE |
| ConsultationController | /api/consultations/{id} | DELETE | Yes | ACTIVE |
| DashboardController | /api/dashboard/patient/stats | GET | No | BROKEN |
| DashboardController | /api/dashboard/technician/stats | GET | Yes | ACTIVE |
| DashboardController | /api/dashboard/medical-officer/stats | GET | Yes | ACTIVE |
| DashboardController | /api/dashboard/admin/stats | GET | Yes | ACTIVE |
| DoctorAvailabilityController | /api/doctor-availabilitys/{id} | GET | No | BROKEN |
| DoctorAvailabilityController | /api/doctor-availabilitys/{id} | PUT | No | BROKEN |
| DoctorAvailabilityController | /api/doctor-availabilitys/{id} | DELETE | No | BROKEN |
| FamilyMemberController | /api/family-members/{id} | DELETE | No | BROKEN |
| GatewayPaymentController | /api/gateway-payments/{id} | GET | No | BROKEN |
| GatewayPaymentController | /api/gateway-payments/{id} | PUT | No | BROKEN |
| GatewayPaymentController | /api/gateway-payments/{id} | DELETE | No | BROKEN |
| HealthController | /api/health/live | GET | No | BROKEN |
| HealthController | /api/health/public | GET | No | BROKEN |
| HealthController | /api/health/ready | GET | No | BROKEN |
| HealthScoreController | /api/health-scores/{id} | GET | No | BROKEN |
| HealthScoreController | /api/health-scores/{id} | PUT | No | BROKEN |
| HealthScoreController | /api/health-scores/{id} | DELETE | No | BROKEN |
| LabLocationController | /api/lab-locations/{id} | GET | Yes | ACTIVE |
| LabLocationController | /api/lab-locations/{id} | PUT | Yes | ACTIVE |
| LabLocationController | /api/lab-locations/{id} | DELETE | Yes | ACTIVE |
| LabPartnerController | /api/labs/{id} | GET | No | BROKEN |
| LabPartnerController | /api/labs/nearby | GET | No | BROKEN |
| LabPartnerController | /api/labs/city/{city} | GET | No | BROKEN |
| LabPartnerController | /api/labs/compare/{testId} | GET | No | BROKEN |
| LabPartnerController | /api/labs/best-deal/{testId} | GET | No | BROKEN |
| LabTestController | /api/lab-tests/{id} | GET | Yes | ACTIVE |
| LabTestController | /api/lab-tests/code/{testCode} | GET | No | BROKEN |
| LabTestController | /api/lab-tests/category/{categoryId} | GET | No | BROKEN |
| LabTestController | /api/lab-tests/type/{testType} | GET | No | BROKEN |
| LabTestController | /api/lab-tests/search | GET | No | BROKEN |
| LabTestController | /api/lab-tests/price-range | GET | No | BROKEN |
| LabTestController | /api/lab-tests/types | GET | No | BROKEN |
| LabTestController | /api/lab-tests/packages | GET | Yes | ACTIVE |
| LabTestController | /api/lab-tests/packages/{id} | GET | Yes | ACTIVE |
| LabTestController | /api/lab-tests/packages/code/{packageCode} | GET | No | BROKEN |
| LabTestController | /api/lab-tests/packages/best-deals | GET | Yes | ACTIVE |
| LabTestPricingController | /api/lab-test-pricings/{id} | GET | No | BROKEN |
| LabTestPricingController | /api/lab-test-pricings/{id} | PUT | No | BROKEN |
| LabTestPricingController | /api/lab-test-pricings/{id} | DELETE | No | BROKEN |
| LocationPricingController | /api/location-pricings/{id} | GET | No | BROKEN |
| LocationPricingController | /api/location-pricings/{id} | PUT | No | BROKEN |
| LocationPricingController | /api/location-pricings/{id} | DELETE | No | BROKEN |
| MedicalOfficerController | /api/mo/pending | GET | Yes | ACTIVE |
| MedicalOfficerController | /api/mo/pending/count | GET | Yes | ACTIVE |
| MedicalOfficerController | /api/mo/verify/{bookingId} | POST | Yes | ACTIVE |
| MedicalOfficerController | /api/mo/reject/{bookingId} | POST | Yes | ACTIVE |
| MedicalOfficerController | /api/mo/icd-codes/{bookingId} | POST | No | BROKEN |
| MedicalOfficerController | /api/mo/referral/{bookingId} | POST | No | BROKEN |
| NotificationController | /api/notifications/unread | GET | No | BROKEN |
| NotificationController | /api/notifications/unread-count | GET | Yes | ACTIVE |
| NotificationController | /api/notifications/{id}/read | PUT | No | BROKEN |
| NotificationController | /api/notifications/read-all | PUT | Yes | ACTIVE |
| NotificationController | /api/notifications/{id} | DELETE | Yes | ACTIVE |
| OrderController | /api/orders/{id} | GET | No | BROKEN |
| OrderController | /api/orders/{id}/timeline | GET | No | BROKEN |
| OrderController | /api/orders/{id}/cancel | PUT | No | BROKEN |
| OrderController | /api/orders/{id}/status | PUT | No | BROKEN |
| OrderStatusHistoryController | /api/order-status-historys/{id} | GET | No | BROKEN |
| OrderStatusHistoryController | /api/order-status-historys/{id} | PUT | No | BROKEN |
| OrderStatusHistoryController | /api/order-status-historys/{id} | DELETE | No | BROKEN |
| PackageTestController | /api/package-tests/{id} | GET | No | BROKEN |
| PackageTestController | /api/package-tests/{id} | PUT | No | BROKEN |
| PackageTestController | /api/package-tests/{id} | DELETE | No | BROKEN |
| PaymentController | /api/payments/booking/{bookingId} | GET | Yes | ACTIVE |
| PaymentController | /api/payments/history/{userId} | GET | Yes | ACTIVE |
| PaymentController | /api/payments/invoice/{paymentId} | GET | No | BROKEN |
| PaymentController | /api/payments/process | POST | Yes | ACTIVE |
| PaymentController | /api/payments/create-order | POST | No | BROKEN |
| PaymentController | /api/payments/webhook | POST | No | BROKEN |
| QuizController | /api/quiz/history | GET | No | BROKEN |
| QuizController | /api/quiz/latest | GET | No | BROKEN |
| QuizController | /api/quiz/recommendations | GET | No | BROKEN |
| QuizController | /api/quiz/submit | POST | No | BROKEN |
| QuizResultController | /api/quiz-results/{id} | GET | No | BROKEN |
| QuizResultController | /api/quiz-results/{id} | PUT | No | BROKEN |
| QuizResultController | /api/quiz-results/{id} | DELETE | No | BROKEN |
| RecommendationController | /api/recommendations/{id} | GET | No | BROKEN |
| RecommendationController | /api/recommendations/{id} | PUT | No | BROKEN |
| RecommendationController | /api/recommendations/{id} | DELETE | No | BROKEN |
| ReferenceRangeController | /api/reference-ranges/{id} | GET | No | BROKEN |
| ReferenceRangeController | /api/reference-ranges/{id} | PUT | No | BROKEN |
| ReferenceRangeController | /api/reference-ranges/{id} | DELETE | No | BROKEN |
| ReportController | /api/reports/booking/{bookingId} | GET | Yes | ACTIVE |
| ReportController | /api/reports/{bookingId} | GET | Yes | ACTIVE |
| ReportController | /api/reports/{id}/pdf | GET | No | BROKEN |
| ReportController | /api/reports/results | POST | Yes | ACTIVE |
| ReportController | /api/reports/upload | POST | Yes | ACTIVE |
| ReportController | /api/reports/{id}/verify | PUT | No | BROKEN |
| ReportResultController | /api/report-results/{id} | GET | No | BROKEN |
| ReportResultController | /api/report-results/{id} | PUT | No | BROKEN |
| ReportResultController | /api/report-results/{id} | DELETE | No | BROKEN |
| ReportVerificationController | /api/report-verifications/{id} | GET | No | BROKEN |
| ReportVerificationController | /api/report-verifications/{id} | PUT | No | BROKEN |
| ReportVerificationController | /api/report-verifications/{id} | DELETE | No | BROKEN |
| SlotConfigController | /api/slot-configs/{id} | GET | No | BROKEN |
| SlotConfigController | /api/slot-configs/{id} | PUT | No | BROKEN |
| SlotConfigController | /api/slot-configs/{id} | DELETE | No | BROKEN |
| SlotController | /api/slots/available | GET | No | BROKEN |
| SlotController | /api/slots/check | GET | No | BROKEN |
| SlotController | /api/slots/book | POST | No | BROKEN |
| SlotController | /api/slots/release | POST | No | BROKEN |
| SmartReportController | /api/reports/{id}/smart | GET | No | BROKEN |
| SmartReportController | /api/reports/{id}/trends/{testId} | GET | No | BROKEN |
| SmartReportController | /api/reports/{id}/critical | GET | No | BROKEN |
| TechnicianController | /api/technicians/available | GET | No | BROKEN |
| TechnicianController | /api/technicians/location/{technicianId} | GET | No | BROKEN |
| TechnicianController | /api/technicians/assign/{bookingId} | POST | No | BROKEN |
| TechnicianController | /api/technicians/reassign/{bookingId} | POST | No | BROKEN |
| TestCategoryController | /api/test-categorys/{id} | GET | No | BROKEN |
| TestCategoryController | /api/test-categorys/{id} | PUT | No | BROKEN |
| TestCategoryController | /api/test-categorys/{id} | DELETE | No | BROKEN |
| TestFilterController | /api/tests/filter | GET | No | BROKEN |
| TestPackageController | /api/test-packages/{id} | GET | No | BROKEN |
| TestPackageController | /api/test-packages/{id} | PUT | No | BROKEN |
| TestPackageController | /api/test-packages/{id} | DELETE | No | BROKEN |
| TestParameterController | /api/test-parameters/{id} | GET | No | BROKEN |
| TestParameterController | /api/test-parameters/{id} | PUT | No | BROKEN |
| TestParameterController | /api/test-parameters/{id} | DELETE | No | BROKEN |
| TestPopularityController | /api/test-popularitys/{id} | GET | No | BROKEN |
| TestPopularityController | /api/test-popularitys/{id} | PUT | No | BROKEN |
| TestPopularityController | /api/test-popularitys/{id} | DELETE | No | BROKEN |
| UserController | /api/users/profile | GET | Yes | ACTIVE |
| UserController | /api/users/change-password | POST | No | BROKEN |
| UserController | /api/users/profile | PUT | Yes | ACTIVE |
| UserController | /api/users/{id}/status | PUT | No | BROKEN |
| UserHealthDataController | /api/user-health-datas/{id} | GET | No | BROKEN |
| UserHealthDataController | /api/user-health-datas/{id} | PUT | No | BROKEN |
| UserHealthDataController | /api/user-health-datas/{id} | DELETE | No | BROKEN |

## 4. React Component Usage

| Component | Imported By | Status |
|---|---|---|
| DNAHelix3D | LandingPage.tsx | ACTIVE |
| MedicalIcons3D | LandingPage.tsx | ACTIVE |
| Microscope3D | LandingPage.tsx | ACTIVE |
| SystemStatsCards | AdminDashboard.tsx | ACTIVE |
| UserManagementTable | AdminDashboard.tsx | ACTIVE |
| BookingTrendChart | AdminDashboard.tsx | ACTIVE |
| GrowthChart | AdminDashboard.tsx | ACTIVE |
| RevenueChart | AdminDashboard.tsx | ACTIVE |
| AuthModal | AppModal.tsx | ACTIVE |
| ForgotPasswordModal | AuthModal.tsx | ACTIVE |
| ResetPasswordModal | AuthModal.tsx | ACTIVE |
| AppModal | App.tsx | ACTIVE |
| AsymmetricCard | ExpertsSection.tsx, TestCarousel.tsx | ACTIVE |
| Card | UserDashboard.tsx, BookingPage.tsx, MyBookingsPage.tsx, TestListingPage.tsx | ACTIVE |
| ConfirmationModal | MyBookingsPage.tsx | ACTIVE |
| ErrorBoundary | App.tsx | ACTIVE |
| FloatingElement | LandingPage.tsx | ACTIVE |
| LoadingSpinner | AuthModal.tsx, ForgotPasswordModal.tsx, ResetPasswordModal.tsx, AnimatedRoutes.tsx, ProtectedRoute.tsx, BookingPage.tsx, PackagesPage.tsx, ReportsPage.tsx | ACTIVE |
| PageTransition | AnimatedRoutes.tsx | ACTIVE |
| StatusBadge | Modals.tsx, UserDashboard.tsx, MyBookingsPage.tsx | ACTIVE |
| Modals | AppModal.tsx | ACTIVE |
| UserDashboard | LandingPage.tsx | ACTIVE |
| ConsultationBookingModal | DoctorAvailabilitySection.tsx | ACTIVE |
| DoctorAvailabilitySection | BookConsultationPage.tsx | ACTIVE |
| ExpertsSection | LandingPage.tsx | ACTIVE |
| HealthQuiz | LandingPage.tsx | ACTIVE |
| AnimatedRoutes | App.tsx | ACTIVE |
| Footer | MainLayout.tsx | ACTIVE |
| Header | MainLayout.tsx | ACTIVE |
| MainLayout | AnimatedRoutes.tsx | ACTIVE |
| ProtectedRoute | AnimatedRoutes.tsx | ACTIVE |
| LabCard | NearbyLabsSection.tsx | ACTIVE |
| LabMap | NearbyLabsSection.tsx | ACTIVE |
| NearbyLabsSection | LandingPage.tsx | ACTIVE |
| NotificationBell | Header.tsx | ACTIVE |
| NotificationToast | NotificationContext.tsx | ACTIVE |
| PackageCard | PackagesPage.tsx | ACTIVE |
| PackageDetailsModal | PackagesPage.tsx | ACTIVE |
| PaymentFailed | BookingPage.tsx | ACTIVE |
| PaymentModal | BookingPage.tsx | ACTIVE |
| PaymentSuccess | BookingPage.tsx | ACTIVE |
| HealthDataForm | ProfilePage.tsx | ACTIVE |
| HealthProfileSection | ProfilePage.tsx | ACTIVE |
| QuizHistorySection | ProfilePage.tsx | ACTIVE |
| QuizResultCard | QuizHistorySection.tsx | ACTIVE |
| ReportCard | ReportsPage.tsx | ACTIVE |
| ReportUploadModal | UserDashboard.tsx, ReportsPage.tsx | ACTIVE |
| ReportViewerModal | ReportsPage.tsx | ACTIVE |
| CategoryBar | LandingPage.tsx | ACTIVE |
| DiagnosticProtocol | LandingPage.tsx | ACTIVE |
| HealthStatsGrid | LandingPage.tsx | ACTIVE |
| LiveStats | LandingPage.tsx | ACTIVE |
| MagneticButton | ExpertsSection.tsx, HealthQuiz.tsx, Header.tsx | ACTIVE |
| PulseSupport | LandingPage.tsx | ACTIVE |
| TestCarousel | LandingPage.tsx | ACTIVE |

## 5. API Integration Status

| Frontend API Call | Backend Endpoint | Status |
|---|---|---|
| GET /dashboard/admin/stats | /dashboard/admin/stats | MATCHED |
| GET /dashboard/admin/charts | - | MISSING |
| GET /admin/audit-logs | - | MISSING |
| GET /users | - | MISSING |
| PUT /users/ | - | MISSING |
| PUT /users/ | - | MISSING |
| GET /bookings/my | /bookings/my | MATCHED |
| GET /bookings/ | /bookings/ | MATCHED |
| POST /bookings | - | MISSING |
| PUT /bookings/ | - | MISSING |
| GET /doctors | - | MISSING |
| GET /doctors/ | - | MISSING |
| GET /consultations/upcoming | - | MISSING |
| GET /doctors/ | - | MISSING |
| POST /consultations | /consultations | MATCHED |
| PUT /doctors/ | - | MISSING |
| DELETE /consultations/ | - | MISSING |
| GET /mo/pending | /mo/pending | MATCHED |
| GET /mo/pending/count | /mo/pending/count | MATCHED |
| GET /mo/pending | - | MISSING |
| GET /bookings | - | MISSING |
| GET /users/patients/search | - | MISSING |
| GET /patients/ | - | MISSING |
| GET /dashboard/medical-officer/stats | /dashboard/medical-officer/stats | MATCHED |
| POST /mo/verify/ | /mo/verify/ | MATCHED |
| POST /mo/reject/ | /mo/reject/ | MATCHED |
| PUT /bookings/ | - | MISSING |
| GET /user-health-data/me | - | MISSING |
| GET /user-health-data/me/history | - | MISSING |
| PUT /user-health-data/me | - | MISSING |
| GET /lab-tests | /lab-tests | MATCHED |
| GET /lab-tests/ | - | MISSING |
| GET /lab-locations/nearby | - | MISSING |
| GET /lab-locations | /lab-locations | MATCHED |
| GET /lab-locations/ | - | MISSING |
| GET /notifications | /notifications | MATCHED |
| GET /notifications/unread-count | /notifications/unread-count | MATCHED |
| PUT /notifications/ | - | MISSING |
| PUT /notifications/read-all | /notifications/read-all | MATCHED |
| DELETE /notifications/ | - | MISSING |
| GET /lab-tests/packages | /lab-tests/packages | MATCHED |
| GET /lab-tests/packages/ | - | MISSING |
| GET /lab-tests/packages/best-deals | /lab-tests/packages/best-deals | MATCHED |
| GET /payments/booking/ | /payments/booking/ | MATCHED |
| GET /payments/history | /payments/history | MATCHED |
| POST /payments/process | /payments/process | MATCHED |
| POST /payments/confirm/ | - | MISSING |
| POST /payments/refund | - | MISSING |
| GET /reports/my | - | MISSING |
| GET /reports/booking/ | /reports/booking/ | MATCHED |
| GET /reports/ | /reports/ | MATCHED |
| GET /reports/ | - | MISSING |
| POST /reports/results | /reports/results | MATCHED |
| POST /reports/upload | /reports/upload | MATCHED |
| PUT /reports/ | - | MISSING |
| GET /bookings/technician | /bookings/technician | MATCHED |
| GET /dashboard/technician/stats | /dashboard/technician/stats | MATCHED |
| GET /bookings/technician/history | - | MISSING |
| PUT /bookings/ | - | MISSING |
| PUT /bookings/ | - | MISSING |
| GET /users/profile | /users/profile | MATCHED |
| PUT /users/profile | - | MISSING |
| PUT /users/profile/password | - | MISSING |
| DELETE /users/profile | - | MISSING |

## 6. Database Usage

| Table | Entity | Repository | Service | Controller | Status |
|---|---|---|---|---|---|

## 7. Broken Flows

| Flow | Frontend | API | Service | Repository | Table | Status |
|---|---|---|---|---|---|---|
| User Registration | AuthModal | /api/auth/register | AuthService | UserRepository | users | COMPLETE |
| Login | AuthModal | /api/auth/login | AuthService | UserRepository | users | COMPLETE |
| Browse Tests | TestList | /api/tests | TestService | TestRepository | lab_tests | BROKEN |
| Booking | BookingPage | /api/bookings | BookingService | BookingRepository | bookings | BROKEN |
| Payment | PaymentModal | /api/payments | PaymentService | PaymentRepository | payments | BROKEN |
| Doctor Approval | DoctorDashboard | /api/reports/verify | ReportService | ReportRepository | reports | BROKEN |
| Technician Collection | TechnicianDashboard | /api/bookings/collection | BookingService | BookingRepository | bookings | BROKEN |
| Report Upload | TechnicianDashboard | /api/reports/upload | ReportService | ReportRepository | reports | PARTIAL |
| Report Viewing | PatientDashboard | /api/reports/my | ReportService | ReportRepository | reports | BROKEN |

## 8. Unused Code

### Unused Entities

### Controllers Without Services
- GlobalExceptionHandler
- HealthController

### Services Without Repositories
- JwtService
- CacheEvictionService
- ChartDataService
- NotificationService

### Repositories Without Entities

### APIs Not Used By Frontend
- GET /api/admin/analytics/daily-bookings (AdminAnalyticsController)
- GET /api/admin/analytics/popular-tests (AdminAnalyticsController)
- GET /api/admin/analytics/revenue (AdminAnalyticsController)
- GET /api/admin/analytics/user-growth (AdminAnalyticsController)
- GET /api/admin/analytics/cancellation-rate (AdminAnalyticsController)
- GET /api/admin/audit-logs/user/{username} (AuditLogController)
- GET /api/admin/audit-logs/entity/{entityName}/{entityId} (AuditLogController)
- GET /api/admin/audit-logs/date-range (AuditLogController)
- POST /api/auth/register (AuthController)
- POST /api/auth/login (AuthController)
- POST /api/auth/forgot-password (AuthController)
- POST /api/auth/reset-password (AuthController)
- GET /api/booked-slots/{id} (BookedSlotController)
- PUT /api/booked-slots/{id} (BookedSlotController)
- DELETE /api/booked-slots/{id} (BookedSlotController)
- GET /api/bookings/slots (BookingController)
- GET /api/bookings/admin/all (BookingController)
- GET /api/bookings/upcoming (BookingController)
- GET /api/bookings/history (BookingController)
- POST /api/bookings/{id}/reschedule (BookingController)
- PUT /api/bookings/{id}/status (BookingController)
- PUT /api/bookings/{id}/technician (BookingController)
- PUT /api/bookings/{id}/cancel (BookingController)
- PUT /api/bookings/admin/{id}/status (BookingController)
- GET /api/dashboard/patient/stats (DashboardController)
- GET /api/doctor-availabilitys/{id} (DoctorAvailabilityController)
- PUT /api/doctor-availabilitys/{id} (DoctorAvailabilityController)
- DELETE /api/doctor-availabilitys/{id} (DoctorAvailabilityController)
- DELETE /api/family-members/{id} (FamilyMemberController)
- GET /api/gateway-payments/{id} (GatewayPaymentController)
- PUT /api/gateway-payments/{id} (GatewayPaymentController)
- DELETE /api/gateway-payments/{id} (GatewayPaymentController)
- GET /api/health/live (HealthController)
- GET /api/health/public (HealthController)
- GET /api/health/ready (HealthController)
- GET /api/health-scores/{id} (HealthScoreController)
- PUT /api/health-scores/{id} (HealthScoreController)
- DELETE /api/health-scores/{id} (HealthScoreController)
- GET /api/labs/{id} (LabPartnerController)
- GET /api/labs/nearby (LabPartnerController)
- GET /api/labs/city/{city} (LabPartnerController)
- GET /api/labs/compare/{testId} (LabPartnerController)
- GET /api/labs/best-deal/{testId} (LabPartnerController)
- GET /api/lab-tests/code/{testCode} (LabTestController)
- GET /api/lab-tests/category/{categoryId} (LabTestController)
- GET /api/lab-tests/type/{testType} (LabTestController)
- GET /api/lab-tests/search (LabTestController)
- GET /api/lab-tests/price-range (LabTestController)
- GET /api/lab-tests/types (LabTestController)
- GET /api/lab-tests/packages/code/{packageCode} (LabTestController)
- GET /api/lab-test-pricings/{id} (LabTestPricingController)
- PUT /api/lab-test-pricings/{id} (LabTestPricingController)
- DELETE /api/lab-test-pricings/{id} (LabTestPricingController)
- GET /api/location-pricings/{id} (LocationPricingController)
- PUT /api/location-pricings/{id} (LocationPricingController)
- DELETE /api/location-pricings/{id} (LocationPricingController)
- POST /api/mo/icd-codes/{bookingId} (MedicalOfficerController)
- POST /api/mo/referral/{bookingId} (MedicalOfficerController)
- GET /api/notifications/unread (NotificationController)
- PUT /api/notifications/{id}/read (NotificationController)
- GET /api/orders/{id} (OrderController)
- GET /api/orders/{id}/timeline (OrderController)
- PUT /api/orders/{id}/cancel (OrderController)
- PUT /api/orders/{id}/status (OrderController)
- GET /api/order-status-historys/{id} (OrderStatusHistoryController)
- PUT /api/order-status-historys/{id} (OrderStatusHistoryController)
- DELETE /api/order-status-historys/{id} (OrderStatusHistoryController)
- GET /api/package-tests/{id} (PackageTestController)
- PUT /api/package-tests/{id} (PackageTestController)
- DELETE /api/package-tests/{id} (PackageTestController)
- GET /api/payments/invoice/{paymentId} (PaymentController)
- POST /api/payments/create-order (PaymentController)
- POST /api/payments/webhook (PaymentController)
- GET /api/quiz/history (QuizController)
- GET /api/quiz/latest (QuizController)
- GET /api/quiz/recommendations (QuizController)
- POST /api/quiz/submit (QuizController)
- GET /api/quiz-results/{id} (QuizResultController)
- PUT /api/quiz-results/{id} (QuizResultController)
- DELETE /api/quiz-results/{id} (QuizResultController)
- GET /api/recommendations/{id} (RecommendationController)
- PUT /api/recommendations/{id} (RecommendationController)
- DELETE /api/recommendations/{id} (RecommendationController)
- GET /api/reference-ranges/{id} (ReferenceRangeController)
- PUT /api/reference-ranges/{id} (ReferenceRangeController)
- DELETE /api/reference-ranges/{id} (ReferenceRangeController)
- GET /api/reports/{id}/pdf (ReportController)
- PUT /api/reports/{id}/verify (ReportController)
- GET /api/report-results/{id} (ReportResultController)
- PUT /api/report-results/{id} (ReportResultController)
- DELETE /api/report-results/{id} (ReportResultController)
- GET /api/report-verifications/{id} (ReportVerificationController)
- PUT /api/report-verifications/{id} (ReportVerificationController)
- DELETE /api/report-verifications/{id} (ReportVerificationController)
- GET /api/slot-configs/{id} (SlotConfigController)
- PUT /api/slot-configs/{id} (SlotConfigController)
- DELETE /api/slot-configs/{id} (SlotConfigController)
- GET /api/slots/available (SlotController)
- GET /api/slots/check (SlotController)
- POST /api/slots/book (SlotController)
- POST /api/slots/release (SlotController)
- GET /api/reports/{id}/smart (SmartReportController)
- GET /api/reports/{id}/trends/{testId} (SmartReportController)
- GET /api/reports/{id}/critical (SmartReportController)
- GET /api/technicians/available (TechnicianController)
- GET /api/technicians/location/{technicianId} (TechnicianController)
- POST /api/technicians/assign/{bookingId} (TechnicianController)
- POST /api/technicians/reassign/{bookingId} (TechnicianController)
- GET /api/test-categorys/{id} (TestCategoryController)
- PUT /api/test-categorys/{id} (TestCategoryController)
- DELETE /api/test-categorys/{id} (TestCategoryController)
- GET /api/tests/filter (TestFilterController)
- GET /api/test-packages/{id} (TestPackageController)
- PUT /api/test-packages/{id} (TestPackageController)
- DELETE /api/test-packages/{id} (TestPackageController)
- GET /api/test-parameters/{id} (TestParameterController)
- PUT /api/test-parameters/{id} (TestParameterController)
- DELETE /api/test-parameters/{id} (TestParameterController)
- GET /api/test-popularitys/{id} (TestPopularityController)
- PUT /api/test-popularitys/{id} (TestPopularityController)
- DELETE /api/test-popularitys/{id} (TestPopularityController)
- POST /api/users/change-password (UserController)
- PUT /api/users/{id}/status (UserController)
- GET /api/user-health-datas/{id} (UserHealthDataController)
- PUT /api/user-health-datas/{id} (UserHealthDataController)
- DELETE /api/user-health-datas/{id} (UserHealthDataController)

### Frontend Components Not Used

### Database Tables Never Referenced

## 9. Missing Components

| Entity | Repository | Status |
|---|---|---|

## 10. Completion Metrics

- Total Flows: 9
- Complete Flows: 2
- Broken Flows: 7
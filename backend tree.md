# File Tree: backend

**Generated:** 4/7/2026, 12:37:17 AM
**Root Path:** `d:\CU\SEM 6\SEM6PP\HEALTHCARELAB\backend`

```
├── 📁 database
│   ├── 📁 migrations
│   │   ├── 📄 V10__add_location_and_health_tables.sql
│   │   ├── 📄 V10__create_audit_logs_table.sql
│   │   ├── 📄 V11__add_missing_columns.sql
│   │   ├── 📄 V12__add_query_indexes.sql
│   │   ├── 📄 V2__create_payments_table.sql
│   │   ├── 📄 V3__create_health_packages_tables.sql
│   │   ├── 📄 V4__create_reports_table.sql
│   │   ├── 📄 V5__create_lab_locations_table.sql
│   │   ├── 📄 V6__create_user_health_data_table.sql
│   │   ├── 📄 V7__create_quiz_results_table.sql
│   │   ├── 📄 V8__create_notifications_table.sql
│   │   └── 📄 V9__create_doctor_availability_table.sql
│   └── 📄 1000_tests_seed.sql
├── 📁 src
│   ├── 📁 main
│   │   ├── 📁 java
│   │   │   └── 📁 com
│   │   │       └── 📁 healthcare
│   │   │           └── 📁 labtestbooking
│   │   │               ├── 📁 aspect
│   │   │               │   └── ☕ LoggingAspect.java
│   │   │               ├── 📁 audit
│   │   │               │   ├── ☕ AuditAspect.java
│   │   │               │   └── ☕ Auditable.java
│   │   │               ├── 📁 config
│   │   │               │   ├── ☕ AdvancedLabTestDataLoader.java
│   │   │               │   ├── ☕ CacheConfig.java
│   │   │               │   ├── ☕ CategoryInitializer.java
│   │   │               │   ├── ☕ CorsConfig.java
│   │   │               │   ├── ☕ DataInitializer.java
│   │   │               │   ├── ☕ DataLoader.java
│   │   │               │   ├── ☕ HealthPackagesDataLoader.java
│   │   │               │   ├── ☕ OpenAPIConfig.java
│   │   │               │   ├── ☕ PackageDataInitializer.java
│   │   │               │   ├── ☕ RateLimitingConfig.java
│   │   │               │   ├── ☕ RateLimitingInterceptor.java
│   │   │               │   ├── ☕ RedisConfig.java
│   │   │               │   ├── ☕ SecurityConfig.java
│   │   │               │   ├── ☕ TestDataInitializer.java
│   │   │               │   └── ☕ TestParametersDataLoader.java
│   │   │               ├── 📁 controller
│   │   │               │   ├── ☕ AuditLogController.java
│   │   │               │   ├── ☕ AuthController.java
│   │   │               │   ├── ☕ BookedSlotController.java
│   │   │               │   ├── ☕ BookingController.java
│   │   │               │   ├── ☕ CartController.java
│   │   │               │   ├── ☕ ConsultationController.java
│   │   │               │   ├── ☕ DashboardController.java
│   │   │               │   ├── ☕ DoctorAvailabilityController.java
│   │   │               │   ├── ☕ DoctorTestController.java
│   │   │               │   ├── ☕ EmailController.java
│   │   │               │   ├── ☕ FamilyMemberController.java
│   │   │               │   ├── ☕ FileUploadController.java
│   │   │               │   ├── ☕ HealthController.java
│   │   │               │   ├── ☕ HealthScoreController.java
│   │   │               │   ├── ☕ LabLocationController.java
│   │   │               │   ├── ☕ LabPartnerController.java
│   │   │               │   ├── ☕ LabTestController.java
│   │   │               │   ├── ☕ LabTestPricingController.java
│   │   │               │   ├── ☕ MedicalOfficerController.java
│   │   │               │   ├── ☕ NotificationController.java
│   │   │               │   ├── ☕ OrderController.java
│   │   │               │   ├── ☕ PaymentController.java
│   │   │               │   ├── ☕ PromoCodeController.java
│   │   │               │   ├── ☕ QuizResultController.java
│   │   │               │   ├── ☕ RecommendationController.java
│   │   │               │   ├── ☕ ReferenceRangeController.java
│   │   │               │   ├── ☕ ReportController.java
│   │   │               │   ├── ☕ SlotConfigController.java
│   │   │               │   ├── ☕ SlotController.java
│   │   │               │   ├── ☕ SmartReportController.java
│   │   │               │   ├── ☕ TechnicianController.java
│   │   │               │   ├── ☕ TestCategoryController.java
│   │   │               │   ├── ☕ TestPackageController.java
│   │   │               │   ├── ☕ TestParameterController.java
│   │   │               │   ├── ☕ TestSearchController.java
│   │   │               │   ├── ☕ UserController.java
│   │   │               │   └── ☕ UserHealthDataController.java
│   │   │               ├── 📁 dto
│   │   │               │   ├── ☕ ApiResponse.java
│   │   │               │   ├── ☕ AuditLogRequest.java
│   │   │               │   ├── ☕ AuditLogResponse.java
│   │   │               │   ├── ☕ AuthRequest.java
│   │   │               │   ├── ☕ AuthResponse.java
│   │   │               │   ├── ☕ BookedSlotRequest.java
│   │   │               │   ├── ☕ BookedSlotResponse.java
│   │   │               │   ├── ☕ BookingRequest.java
│   │   │               │   ├── ☕ BookingResponse.java
│   │   │               │   ├── ☕ CartRequest.java
│   │   │               │   ├── ☕ CartResponse.java
│   │   │               │   ├── ☕ ChangePasswordRequest.java
│   │   │               │   ├── ☕ ChartDataDTO.java
│   │   │               │   ├── ☕ ConsultationRequest.java
│   │   │               │   ├── ☕ ConsultationResponse.java
│   │   │               │   ├── ☕ CreatePaymentOrderRequest.java
│   │   │               │   ├── ☕ DoctorAvailabilityRequest.java
│   │   │               │   ├── ☕ DoctorAvailabilityResponse.java
│   │   │               │   ├── ☕ DoctorTestRequest.java
│   │   │               │   ├── ☕ DoctorTestResponse.java
│   │   │               │   ├── ☕ EmailRequest.java
│   │   │               │   ├── ☕ FamilyMemberRequest.java
│   │   │               │   ├── ☕ FamilyMemberResponse.java
│   │   │               │   ├── ☕ FilterRequestDTO.java
│   │   │               │   ├── ☕ FilterResponseDTO.java
│   │   │               │   ├── ☕ GatewayPaymentRequest.java
│   │   │               │   ├── ☕ GatewayPaymentResponse.java
│   │   │               │   ├── ☕ HealthScoreRequest.java
│   │   │               │   ├── ☕ HealthScoreResponse.java
│   │   │               │   ├── ☕ HealthTrendResponse.java
│   │   │               │   ├── ☕ LabLocationRequest.java
│   │   │               │   ├── ☕ LabLocationResponse.java
│   │   │               │   ├── ☕ LabPartnerNearbyResponse.java
│   │   │               │   ├── ☕ LabPartnerRequest.java
│   │   │               │   ├── ☕ LabPartnerResponse.java
│   │   │               │   ├── ☕ LabTestDTO.java
│   │   │               │   ├── ☕ LabTestPricingRequest.java
│   │   │               │   ├── ☕ LabTestPricingResponse.java
│   │   │               │   ├── ☕ LabTestRequest.java
│   │   │               │   ├── ☕ LabTestResponse.java
│   │   │               │   ├── ☕ LocationPricingRequest.java
│   │   │               │   ├── ☕ LocationPricingResponse.java
│   │   │               │   ├── ☕ LoginRequest.java
│   │   │               │   ├── ☕ NotificationRequest.java
│   │   │               │   ├── ☕ NotificationResponse.java
│   │   │               │   ├── ☕ OrderRequest.java
│   │   │               │   ├── ☕ OrderResponse.java
│   │   │               │   ├── ☕ OrderStatusHistoryRequest.java
│   │   │               │   ├── ☕ OrderStatusHistoryResponse.java
│   │   │               │   ├── ☕ PackageTestRequest.java
│   │   │               │   ├── ☕ PackageTestResponse.java
│   │   │               │   ├── ☕ PaymentInitiationRequest.java
│   │   │               │   ├── ☕ PaymentLinkResponse.java
│   │   │               │   ├── ☕ PaymentRequest.java
│   │   │               │   ├── ☕ PaymentResponse.java
│   │   │               │   ├── ☕ Period.java
│   │   │               │   ├── ☕ QuizResultDTO.java
│   │   │               │   ├── ☕ QuizResultRequest.java
│   │   │               │   ├── ☕ QuizResultResponse.java
│   │   │               │   ├── ☕ QuizSubmitRequest.java
│   │   │               │   ├── ☕ RecommendationRequest.java
│   │   │               │   ├── ☕ RecommendationResponse.java
│   │   │               │   ├── ☕ ReferenceRangeRequest.java
│   │   │               │   ├── ☕ ReferenceRangeResponse.java
│   │   │               │   ├── ☕ RegisterRequest.java
│   │   │               │   ├── ☕ ReportDTO.java
│   │   │               │   ├── ☕ ReportRequest.java
│   │   │               │   ├── ☕ ReportResponse.java
│   │   │               │   ├── ☕ ReportResultDTO.java
│   │   │               │   ├── ☕ ReportResultRequest.java
│   │   │               │   ├── ☕ ReportResultResponse.java
│   │   │               │   ├── ☕ ReportVerificationRequest.java
│   │   │               │   ├── ☕ ReportVerificationResponse.java
│   │   │               │   ├── ☕ ResetPasswordRequest.java
│   │   │               │   ├── ☕ SMSRequest.java
│   │   │               │   ├── ☕ SearchResponseDTO.java
│   │   │               │   ├── ☕ SearchResultDTO.java
│   │   │               │   ├── ☕ SlotConfigRequest.java
│   │   │               │   ├── ☕ SlotConfigResponse.java
│   │   │               │   ├── ☕ SmartReportDTO.java
│   │   │               │   ├── ☕ TechnicianRequest.java
│   │   │               │   ├── ☕ TechnicianResponse.java
│   │   │               │   ├── ☕ TestCategoryRequest.java
│   │   │               │   ├── ☕ TestCategoryResponse.java
│   │   │               │   ├── ☕ TestPackageDTO.java
│   │   │               │   ├── ☕ TestPackageRequest.java
│   │   │               │   ├── ☕ TestPackageResponse.java
│   │   │               │   ├── ☕ TestParameterDTO.java
│   │   │               │   ├── ☕ TestParameterRequest.java
│   │   │               │   ├── ☕ TestParameterResponse.java
│   │   │               │   ├── ☕ TestPopularityRequest.java
│   │   │               │   ├── ☕ TestPopularityResponse.java
│   │   │               │   ├── ☕ TestRequest.java
│   │   │               │   ├── ☕ TestResponse.java
│   │   │               │   ├── ☕ TrendDataDTO.java
│   │   │               │   ├── ☕ UserHealthDataRequest.java
│   │   │               │   ├── ☕ UserHealthDataResponse.java
│   │   │               │   ├── ☕ UserRequest.java
│   │   │               │   ├── ☕ UserResponse.java
│   │   │               │   └── ☕ WhatsAppRequest.java
│   │   │               ├── 📁 entity
│   │   │               │   ├── 📁 enums
│   │   │               │   │   ├── ☕ AbnormalStatus.java
│   │   │               │   │   ├── ☕ AgeGroup.java
│   │   │               │   │   ├── ☕ BookingStatus.java
│   │   │               │   │   ├── ☕ CollectionType.java
│   │   │               │   │   ├── ☕ ConsultationStatus.java
│   │   │               │   │   ├── ☕ ConsultationType.java
│   │   │               │   │   ├── ☕ Gender.java
│   │   │               │   │   ├── ☕ OrderStatus.java
│   │   │               │   │   ├── ☕ PackageTier.java
│   │   │               │   │   ├── ☕ PackageType.java
│   │   │               │   │   ├── ☕ PaymentMethod.java
│   │   │               │   │   ├── ☕ PaymentStatus.java
│   │   │               │   │   ├── ☕ RefundStatus.java
│   │   │               │   │   ├── ☕ ReportStatus.java
│   │   │               │   │   ├── ☕ ResultStatus.java
│   │   │               │   │   ├── ☕ RiskLevel.java
│   │   │               │   │   ├── ☕ TestType.java
│   │   │               │   │   ├── ☕ UserRole.java
│   │   │               │   │   └── ☕ VerificationStatus.java
│   │   │               │   ├── ☕ AuditLog.java
│   │   │               │   ├── ☕ BookedSlot.java
│   │   │               │   ├── ☕ Booking.java
│   │   │               │   ├── ☕ Cart.java
│   │   │               │   ├── ☕ CartItem.java
│   │   │               │   ├── ☕ Consultation.java
│   │   │               │   ├── ☕ Coupon.java
│   │   │               │   ├── ☕ DoctorAvailability.java
│   │   │               │   ├── ☕ FamilyMember.java
│   │   │               │   ├── ☕ GatewayPayment.java
│   │   │               │   ├── ☕ HealthScore.java
│   │   │               │   ├── ☕ LabLocation.java
│   │   │               │   ├── ☕ LabPartner.java
│   │   │               │   ├── ☕ LabTest.java
│   │   │               │   ├── ☕ LabTestPricing.java
│   │   │               │   ├── ☕ LocationPricing.java
│   │   │               │   ├── ☕ LoginAttempt.java
│   │   │               │   ├── ☕ Notification.java
│   │   │               │   ├── ☕ Order.java
│   │   │               │   ├── ☕ OrderStatusHistory.java
│   │   │               │   ├── ☕ PackageTest.java
│   │   │               │   ├── ☕ Payment.java
│   │   │               │   ├── ☕ QuizResult.java
│   │   │               │   ├── ☕ Recommendation.java
│   │   │               │   ├── ☕ ReferenceRange.java
│   │   │               │   ├── ☕ Report.java
│   │   │               │   ├── ☕ ReportResult.java
│   │   │               │   ├── ☕ ReportVerification.java
│   │   │               │   ├── ☕ SlotConfig.java
│   │   │               │   ├── ☕ Technician.java
│   │   │               │   ├── ☕ TestCategory.java
│   │   │               │   ├── ☕ TestPackage.java
│   │   │               │   ├── ☕ TestParameter.java
│   │   │               │   ├── ☕ TestPopularity.java
│   │   │               │   ├── ☕ User.java
│   │   │               │   └── ☕ UserHealthData.java
│   │   │               ├── 📁 exception
│   │   │               │   ├── ☕ AuthenticationException.java
│   │   │               │   ├── ☕ BadRequestException.java
│   │   │               │   ├── ☕ BookingNotFoundException.java
│   │   │               │   ├── ☕ ErrorResponse.java
│   │   │               │   ├── ☕ GlobalExceptionHandler.java
│   │   │               │   ├── ☕ InvalidBookingException.java
│   │   │               │   ├── ☕ InvalidCredentialsException.java
│   │   │               │   ├── ☕ PaymentFailedException.java
│   │   │               │   ├── ☕ RegistrationFailedException.java
│   │   │               │   ├── ☕ ResourceNotFoundException.java
│   │   │               │   ├── ☕ UnauthorizedException.java
│   │   │               │   ├── ☕ UserAlreadyExistsException.java
│   │   │               │   └── ☕ UserNotFoundException.java
│   │   │               ├── 📁 filter
│   │   │               │   └── ☕ RateLimitingFilter.java
│   │   │               ├── 📁 health
│   │   │               │   ├── ☕ DatabaseHealthIndicator.java
│   │   │               │   ├── ☕ PaymentGatewayHealthIndicator.java
│   │   │               │   └── ☕ RedisHealthIndicator.java
│   │   │               ├── 📁 listener
│   │   │               │   ├── ☕ AuditListener.java
│   │   │               │   ├── ☕ AuditLogEvent.java
│   │   │               │   └── ☕ AuditLogProcessor.java
│   │   │               ├── 📁 repository
│   │   │               │   ├── ☕ AuditLogRepository.java
│   │   │               │   ├── ☕ BookedSlotRepository.java
│   │   │               │   ├── ☕ BookingRepository.java
│   │   │               │   ├── ☕ CartItemRepository.java
│   │   │               │   ├── ☕ CartRepository.java
│   │   │               │   ├── ☕ CategoryRepository.java
│   │   │               │   ├── ☕ ConsultationRepository.java
│   │   │               │   ├── ☕ CouponRepository.java
│   │   │               │   ├── ☕ DoctorAvailabilityRepository.java
│   │   │               │   ├── ☕ FamilyMemberRepository.java
│   │   │               │   ├── ☕ GatewayPaymentRepository.java
│   │   │               │   ├── ☕ HealthScoreRepository.java
│   │   │               │   ├── ☕ LabLocationRepository.java
│   │   │               │   ├── ☕ LabPartnerRepository.java
│   │   │               │   ├── ☕ LabTestPricingRepository.java
│   │   │               │   ├── ☕ LabTestRepository.java
│   │   │               │   ├── ☕ LocationPricingRepository.java
│   │   │               │   ├── ☕ LoginAttemptRepository.java
│   │   │               │   ├── ☕ NotificationRepository.java
│   │   │               │   ├── ☕ OrderRepository.java
│   │   │               │   ├── ☕ OrderStatusHistoryRepository.java
│   │   │               │   ├── ☕ PackageTestRepository.java
│   │   │               │   ├── ☕ PaymentRepository.java
│   │   │               │   ├── ☕ QuizResultRepository.java
│   │   │               │   ├── ☕ RecommendationRepository.java
│   │   │               │   ├── ☕ ReferenceRangeRepository.java
│   │   │               │   ├── ☕ ReportRepository.java
│   │   │               │   ├── ☕ ReportResultRepository.java
│   │   │               │   ├── ☕ ReportVerificationRepository.java
│   │   │               │   ├── ☕ SlotConfigRepository.java
│   │   │               │   ├── ☕ TechnicianRepository.java
│   │   │               │   ├── ☕ TestCategoryRepository.java
│   │   │               │   ├── ☕ TestPackageRepository.java
│   │   │               │   ├── ☕ TestParameterRepository.java
│   │   │               │   ├── ☕ TestPopularityRepository.java
│   │   │               │   ├── ☕ UserHealthDataRepository.java
│   │   │               │   └── ☕ UserRepository.java
│   │   │               ├── 📁 scheduler
│   │   │               ├── 📁 security
│   │   │               │   ├── ☕ CustomUserDetailsService.java
│   │   │               │   ├── ☕ JwtAuthenticationEntryPoint.java
│   │   │               │   ├── ☕ JwtAuthenticationFilter.java
│   │   │               │   ├── ☕ JwtService.java
│   │   │               │   ├── ☕ JwtTokenProvider.java
│   │   │               │   ├── ☕ JwtUtil.java
│   │   │               │   └── ☕ UserDetailsServiceImpl.java
│   │   │               ├── 📁 seed
│   │   │               │   ├── ☕ TestsSeedData.java
│   │   │               │   └── ☕ TestsSeeder.java
│   │   │               ├── 📁 service
│   │   │               │   ├── ☕ AnalyticsService.java
│   │   │               │   ├── ☕ AuditLogService.java
│   │   │               │   ├── ☕ AuthService.java
│   │   │               │   ├── ☕ BookedSlotService.java
│   │   │               │   ├── ☕ BookingService.java
│   │   │               │   ├── ☕ CartService.java
│   │   │               │   ├── ☕ ConsultationService.java
│   │   │               │   ├── ☕ DashboardService.java
│   │   │               │   ├── ☕ DoctorAvailabilityService.java
│   │   │               │   ├── ☕ DoctorTestManagementService.java
│   │   │               │   ├── ☕ EmailService.java
│   │   │               │   ├── ☕ EmailVerificationService.java
│   │   │               │   ├── ☕ FamilyMemberService.java
│   │   │               │   ├── ☕ FilterService.java
│   │   │               │   ├── ☕ GatewayPaymentService.java
│   │   │               │   ├── ☕ HealthScoreService.java
│   │   │               │   ├── ☕ LabLocationService.java
│   │   │               │   ├── ☕ LabPartnerService.java
│   │   │               │   ├── ☕ LabService.java
│   │   │               │   ├── ☕ LabTestPricingService.java
│   │   │               │   ├── ☕ LabTestService.java
│   │   │               │   ├── ☕ LocationPricingService.java
│   │   │               │   ├── ☕ LoginAttemptService.java
│   │   │               │   ├── ☕ MedicalOfficerService.java
│   │   │               │   ├── ☕ NotificationInboxService.java
│   │   │               │   ├── ☕ NotificationService.java
│   │   │               │   ├── ☕ OrderPaymentService.java
│   │   │               │   ├── ☕ OrderService.java
│   │   │               │   ├── ☕ OrderStatusHistoryService.java
│   │   │               │   ├── ☕ PackageTestService.java
│   │   │               │   ├── ☕ PaymentService.java
│   │   │               │   ├── ☕ QuizResultService.java
│   │   │               │   ├── ☕ RazorpayService.java
│   │   │               │   ├── ☕ RecommendationService.java
│   │   │               │   ├── ☕ ReferenceRangeService.java
│   │   │               │   ├── ☕ ReportGeneratorService.java
│   │   │               │   ├── ☕ ReportResultService.java
│   │   │               │   ├── ☕ ReportService.java
│   │   │               │   ├── ☕ ReportVerificationService.java
│   │   │               │   ├── ☕ SearchService.java
│   │   │               │   ├── ☕ SlotConfigService.java
│   │   │               │   ├── ☕ SlotService.java
│   │   │               │   ├── ☕ SmartReportService.java
│   │   │               │   ├── ☕ TechnicianAssignmentService.java
│   │   │               │   ├── ☕ TechnicianService.java
│   │   │               │   ├── ☕ TestCategoryService.java
│   │   │               │   ├── ☕ TestPackageService.java
│   │   │               │   ├── ☕ TestParameterService.java
│   │   │               │   ├── ☕ TestPopularityService.java
│   │   │               │   ├── ☕ TestService.java
│   │   │               │   ├── ☕ TokenBlacklistService.java
│   │   │               │   ├── ☕ UserHealthDataService.java
│   │   │               │   └── ☕ UserService.java
│   │   │               └── ☕ LabTestBookingApplication.java
│   │   └── 📁 resources
│   │       ├── 📁 db
│   │       │   └── 📁 migration
│   │       │       ├── 📄 V10__Create_Tests_Tables.sql
│   │       │       ├── 📄 V11__Insert_500_Tests.sql
│   │       │       ├── 📄 V12__Optimize_Tests_Indexes.sql
│   │       │       ├── 📄 V13__Cleanup_And_Verify_Tests.sql
│   │       │       ├── 📄 V14__Insert_88_Common_Tests.sql
│   │       │       ├── 📄 V15__Replace_With_88_Common_Tests.sql
│   │       │       ├── 📄 V16__Add_Test_Parameters_For_88_Tests.sql
│   │       │       ├── 📄 V4__add_indexes.sql
│   │       │       └── 📄 V5__add_constraints.sql
│   │       ├── 📁 templates
│   │       ├── 📄 application.properties
│   │       ├── 📄 data.sql
│   │       └── 📄 schema.sql
│   └── 📁 test
│       ├── 📁 java
│       │   └── 📁 com
│       │       └── 📁 healthcare
│       │           └── 📁 labtestbooking
│       │               ├── 📁 config
│       │               │   └── ☕ TestSecurityConfig.java
│       │               ├── 📁 controller
│       │               │   ├── ☕ AuthControllerTest.java
│       │               │   ├── ☕ BookingControllerTest.java
│       │               │   └── ☕ ReportControllerTest.java
│       │               ├── 📁 repository
│       │               │   ├── ☕ BookingRepositoryTest.java
│       │               │   └── ☕ UserRepositoryTest.java
│       │               ├── 📁 service
│       │               │   ├── ☕ AuthServiceTest.java
│       │               │   ├── ☕ BookingServiceTest.java
│       │               │   ├── ☕ HealthScoreServiceTest.java
│       │               │   └── ☕ ReportServiceTest.java
│       │               ├── 📁 util
│       │               │   └── ☕ TestDataCleaner.java
│       │               ├── ☕ ApiFlowIntegrationTest.java
│       │               ├── ☕ CompilationTest.java
│       │               ├── ☕ ControllerSerializationTest.java
│       │               ├── ☕ LabTestBookingApplicationTests.java
│       │               └── ☕ RedisSerializationTest.java
│       └── 📁 resources
│           └── 📄 application-test.properties
├── ⚙️ .env.example
├── 📝 DB_OPTIMIZATION_REPORT.md
├── 📄 add-geolocation-columns.sql
├── 📄 add-individual-tests-columns.sql
├── 📄 add-quiz-notifications-tables.sql
├── 📄 backend_log.txt
├── 📄 check_layers.ps1
├── 📄 cleanup.sql
├── 📄 compile_error.txt
├── 📄 create-audit-table.sql
├── 📄 fix_repos1.ps1
├── 🐍 generate_1000_tests.py
├── 🐍 generate_layers.py
├── 📄 generate_missing.ps1
├── 📄 insert-sample-tests.sql
├── 📄 kill-port.bat
├── 🐍 parse_schema.py
├── ⚙️ pom.xml
├── 📄 restore_repos.ps1
├── 📄 schema_update.sql
└── 📄 start-backend.bat
```

---
*Generated by FileTree Pro Extension*
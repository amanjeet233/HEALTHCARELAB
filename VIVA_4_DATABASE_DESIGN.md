# VIVA 4: Database Design - HEALTHCARELAB

---

# CORE TABLES

## users (User.java)
**Real-world meaning:** Represents every person in the system - patients, technicians, medical officers, and administrators who use the lab booking platform.

**Why separate table:** Central identity store for all user types. Without it, no authentication, no booking ownership, no role-based access control. All other tables reference this for "who did this".

**Every column explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| id | BIGINT | Primary key, unique identifier for each user | Cannot be null (PK) |
| name | VARCHAR(100) | Display name for UI, reports, and communications | Cannot be null |
| email | VARCHAR(100) | Unique login identifier, password recovery contact | Cannot be null, unique constraint |
| password | VARCHAR | Hashed password for authentication | Cannot be null |
| role | ENUM | RBAC: PATIENT, TECHNICIAN, MEDICAL_OFFICER, ADMIN | Cannot be null, defaults to PATIENT |
| phone | VARCHAR(15) | Contact for sample collection, SMS notifications | Can be null (optional registration) |
| first_name | VARCHAR(100) | Personalization, formal addressing | Can be null (backward compatibility) |
| last_name | VARCHAR(100) | Personalization, formal addressing | Can be null (backward compatibility) |
| dateOfBirth | DATE | Age calculation, pediatric reference ranges | Can be null (optional profile) |
| gender | ENUM | Gender-specific reference ranges | Can be null (optional profile) |
| bloodGroup | VARCHAR(5) | Medical history, cross-matching | Can be null (optional profile) |
| isActive | BOOLEAN | Soft delete - disables account without deleting data | Cannot be null, defaults true |
| isVerified | BOOLEAN | Email verification status - prevents spam accounts | Cannot be null, defaults false |
| createdAt | TIMESTAMP | Audit trail - when account was created | Cannot be null |
| updatedAt | TIMESTAMP | Audit trail - last profile update | Can be null |
| lastLoginAt | TIMESTAMP | Security monitoring, inactive account detection | Can be null |
| resetPasswordToken | VARCHAR(100) | Password recovery token | Can be null (only during reset flow) |
| resetPasswordTokenExpiry | TIMESTAMP | Security - token expiration | Can be null |
| verificationToken | VARCHAR(500) | Email verification token | Can be null (only during verification) |
| verificationTokenExpiry | TIMESTAMP | Security - token expiration | Can be null |

**Foreign keys:** None (this is the root table)

**Indexes:**
- UNIQUE index on email (login queries)
- UNIQUE index on phone (contact uniqueness)

**Real-life analogy:** The master registration book at the lab reception. Every person who walks in - patient, technician, doctor - gets an entry here before they can do anything else.

**Viva Q&A:**
Q: Why soft delete (isActive) not hard delete?
A: Bookings reference users - hard delete breaks referential integrity. Audit trails need history. HIPAA-aligned data retention.

Q: Why isVerified + isActive both exist?
A: isVerified = email confirmation (prevents fake emails). isActive = account suspension (admin can block verified users). Different concerns, separate flags.

Q: Why role as enum not string?
A: Type safety - prevents typos like "TECHNICAIN" or "Technician". Database-level validation. Only 4 valid roles exist.

---

## bookings (Booking.java)
**Real-world meaning:** Represents a lab test appointment - the core transaction between a patient and the lab for a specific test on a specific date.

**Why separate table:** Central transaction table. Without it, no scheduling, no billing, no report generation. Links users, tests, payments, and reports together.

**Every column explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| id | BIGINT | Primary key, unique booking reference | Cannot be null (PK) |
| bookingReference | VARCHAR(20) | Human-readable reference for patients (e.g., BK-12345) | Cannot be null, unique |
| patient_id | BIGINT FK | Who booked the test (foreign key to users) | Cannot be null |
| test_id | BIGINT FK | Which individual test was booked | Can be null (if package booked) |
| package_id | BIGINT FK | Which test package was booked | Can be null (if individual test booked) |
| bookingDate | DATE | When the sample collection is scheduled | Cannot be null |
| timeSlot | VARCHAR(20) | Specific time window for collection | Can be null (walk-in) |
| familyMemberId | BIGINT | If booking for family member, which one | Can be null (booking for self) |
| parentBookingId | BIGINT | Links to parent booking (for package individual tests) | Can be null (not a child booking) |
| patientDisplayName | VARCHAR(150) | Cached name for display (denormalization) | Can be null |
| status | ENUM | BOOKED → CONFIRMED → SAMPLE_COLLECTED → PROCESSING → PENDING_VERIFICATION → VERIFIED → COMPLETED | Cannot be null, defaults BOOKED |
| technician_id | BIGINT FK | Which technician is assigned for sample collection | Can be null (unassigned) |
| assignmentType | ENUM | MANUAL (admin assigned) or AUTO (system assigned) | Can be null |
| medicalOfficer_id | BIGINT FK | Which MO verifies the report | Can be null (not assigned yet) |
| collectionType | ENUM | LAB (visit lab) or HOME (home collection) | Cannot be null, defaults LAB |
| collectionAddress | TEXT | Address for home collection | Can be null (if LAB collection) |
| notes | TEXT | Special instructions from patient | Can be null |
| homeCollectionCharge | DECIMAL | Extra charge for home collection | Cannot be null, defaults 0 |
| totalAmount | DECIMAL | Base price of test/package | Cannot be null |
| discount | DECIMAL | Discount applied | Cannot be null, defaults 0 |
| finalAmount | DECIMAL | Amount patient actually pays | Cannot be null |
| paymentStatus | ENUM | PENDING, COMPLETED, FAILED, REFUNDED | Cannot be null, defaults PENDING |
| reportAvailable | BOOLEAN | Flag for frontend - report ready for download | Cannot be null, defaults false |
| criticalFlag | BOOLEAN | Flag for urgent results requiring immediate attention | Cannot be null, defaults false |
| createdAt | TIMESTAMP | When booking was created | Cannot be null |
| cancellationReason | TEXT | Why booking was cancelled | Can be null (not cancelled) |
| rejectionReason | VARCHAR(255) | Why specimen was rejected | Can be null (not rejected) |
| rejectedAt | TIMESTAMP | When specimen was rejected | Can be null (not rejected) |

**Foreign keys:**
| FK Column | References | Why this relationship |
|-----------|------------|----------------------|
| patient_id | users.id | Every booking belongs to a patient |
| test_id | tests.id | Booking is for a specific test (if not package) |
| package_id | test_packages.id | Booking is for a package (if not individual test) |
| technician_id | users.id | Technician assigned for collection |
| medicalOfficer_id | users.id | MO assigned for verification |

**Indexes:**
- idx_bookings_user_id (filter by patient)
- idx_bookings_status (filter by workflow stage)
- idx_bookings_scheduled_date (date-based queries)
- idx_bookings_user_status (composite: patient's bookings by status)
- idx_bookings_created_at DESC (recent bookings)

**Real-life analogy:** The appointment book at the lab reception. Each entry has patient name, test name, date, time, and status stickers showing progress.

**Viva Q&A:**
Q: Explain every status transition with real-world lab equivalent.
A: 
- BOOKED → Patient submits booking request
- CONFIRMED → Lab confirms slot availability, sends confirmation
- SAMPLE_COLLECTED → Phlebotomist collects blood/sample
- PROCESSING → Lab runs tests on analyzer
- REFLEX_PENDING → Abnormal result triggers additional tests
- PENDING_VERIFICATION → Technician uploads result, awaiting MO sign-off
- VERIFIED → Medical officer approves and signs report
- COMPLETED → Report delivered to patient, booking closed
- CANCELLED → Patient cancels or lab rejects

Q: Why both test_id and package_id nullable?
A: A booking is EITHER for an individual test OR a package. Mutually exclusive. One null, one populated. This is a polymorphic relationship.

Q: Why parentBookingId?
A: When a package is booked, it creates one parent booking. Each test inside the package creates child bookings linked via parentBookingId. This allows tracking package completion status while maintaining individual test results.

---

## tests (LabTest.java)
**Real-world meaning:** The catalog of all lab tests offered - CBC, Lipid Profile, Thyroid, etc. The product catalog of the lab.

**Why separate table:** Central test catalog. Without it, no pricing, no parameters, no booking reference. Tests are reusable entities independent of bookings.

**Every column explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| id | BIGINT | Primary key | Cannot be null (PK) |
| slug (testCode) | VARCHAR | URL-friendly unique identifier (e.g., "cbc", "lipid-profile") | Cannot be null, unique |
| name (testName) | VARCHAR | Human-readable test name | Cannot be null |
| description | TEXT | Detailed explanation of what test does | Can be null |
| shortDescription | VARCHAR | Brief description for UI cards | Can be null |
| category | VARCHAR | Test category (Hematology, Cardiology, etc.) | Can be null |
| subCategory | VARCHAR | Sub-category for filtering | Can be null |
| fastingRequired | BOOLEAN | Does patient need to fast before test? | Can be null |
| consentRequired | BOOLEAN | Does test require special consent (HIV, genetic)? | Cannot be null, defaults false |
| reportTimeHours | INTEGER | How long until report is ready | Can be null |
| recommendedFor | VARCHAR | Who should take this test | Can be null |
| isTopBooked | BOOLEAN | Flag for popular tests UI | Can be null |
| isTopDeal | BOOLEAN | Flag for discounted tests | Can be null |
| subTestsJson | JSON | List of sub-tests included | Can be null |
| tagsJson | JSON | Search tags for discovery | Can be null |
| price | DECIMAL | Current selling price | Can be null |
| originalPrice | DECIMAL | MRP before discount | Can be null |
| discountedPrice | DECIMAL | Price after discount | Can be null |
| discountPercent | INTEGER | Discount percentage | Can be null |
| parametersCount | INTEGER | Number of parameters in test | Can be null |
| sampleType | VARCHAR | Blood, Urine, etc. | Can be null |
| turnaroundTime | VARCHAR | Human-readable turnaround | Can be null |
| isActive | BOOLEAN | Is test currently available? | Can be null |
| iconUrl | VARCHAR | Icon for UI | Can be null |
| isPackage | BOOLEAN | Is this a package or individual test? | Can be null |
| isTrending | BOOLEAN | Flag for trending tests | Can be null |
| createdAt | TIMESTAMP | When test was added to catalog | Cannot be null |
| updatedAt | TIMESTAMP | Last catalog update | Cannot be null |

**Foreign keys:** None (catalog table)

**Indexes:**
- idx_test_category (filter by category)
- idx_test_is_top_booked (popular tests query)
- idx_test_discounted_price (discounted tests query)
- idx_test_slug (lookup by slug)

**Real-life analogy:** The master price list and test catalog displayed at the lab reception. Lists all available tests, prices, and descriptions.

**Viva Q&A:**
Q: Why table name "tests" but entity "LabTest"?
A: Database naming convention uses plural "tests" (standard table naming). Java entity uses singular "LabTest" (standard class naming). JPA @Table(name="tests") maps them.

Q: Why slug column?
A: SEO-friendly URLs (e.g., /tests/cbc instead of /tests/123). Human-readable identifiers. Prevents exposing database IDs in URLs.

Q: Why JSON columns (subTestsJson, tagsJson)?
A: Flexible, schema-less data. Sub-tests vary by test type. Tags for search don't need relational structure. JSONB in PostgreSQL allows querying inside JSON.

---

## test_packages (TestPackage.java)
**Real-world meaning:** Bundled test offerings - "Full Body Checkup", "Diabetes Profile", etc. Multiple tests sold together at a discount.

**Why separate table:** Packages are products themselves with their own pricing, marketing, and metadata. If merged with tests, every test row would need package-specific columns (waste of space). Packages are reusable entities.

**Every column explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| id | BIGINT | Primary key | Cannot be null (PK) |
| packageCode | VARCHAR | Unique package identifier | Cannot be null, unique |
| packageName | VARCHAR | Human-readable package name | Cannot be null |
| description | TEXT | Package description | Can be null |
| packageType | ENUM | HEALTH_CHECKUP, DISEASE_SPECIFIC, etc. | Can be null |
| packageTier | ENUM | BASIC, STANDARD, PREMIUM | Can be null |
| ageGroup | ENUM | ADULT, CHILD, SENIOR | Can be null |
| genderApplicable | ENUM | MALE, FEMALE, BOTH | Can be null |
| professionApplicable | VARCHAR | Target profession | Can be null |
| healthCondition | VARCHAR | Target condition | Can be null |
| totalTests | INTEGER | Number of tests in package | Can be null |
| basePrice | DECIMAL | Sum of individual test prices | Can be null |
| totalPrice | DECIMAL | Package selling price | Can be null |
| discountedPrice | DECIMAL | Final price after discount | Can be null |
| discountPercentage | DECIMAL | Discount percentage | Can be null |
| savingsAmount | DECIMAL | How much patient saves | Can be null |
| turnaroundHours | INTEGER | Package turnaround time | Can be null |
| sampleTypes | VARCHAR | Sample types required | Can be null |
| fastingRequired | BOOLEAN | Fasting required? | Can be null |
| fastingHours | INTEGER | How many hours fasting | Can be null |
| homeCollectionAvailable | BOOLEAN | Home collection available? | Can be null |
| homeCollectionCharges | DECIMAL | Extra charge for home collection | Can be null |
| doctorConsultations | INTEGER | Free consultations included | Can be null |
| imagingIncluded | BOOLEAN | Imaging included? | Can be null |
| geneticTesting | BOOLEAN | Genetic tests included? | Can be null |
| bestFor | TEXT | Who should take this package | Can be null |
| isActive | BOOLEAN | Is package currently available? | Cannot be null, defaults true |
| isPopular | BOOLEAN | Flag for popular packages | Cannot be null, defaults false |
| isRecommended | BOOLEAN | Flag for recommended packages | Cannot be null, defaults false |
| displayOrder | INTEGER | UI display order | Can be null |
| badgeText | VARCHAR | Marketing badge text | Can be null |
| iconUrl | VARCHAR | Icon for UI | Can be null |
| imageUrl | VARCHAR | Package image | Can be null |
| createdAt | TIMESTAMP | When package was created | Cannot be null |
| updatedAt | TIMESTAMP | Last update | Cannot be null |

**Foreign keys:**
| FK Column | References | Why this relationship |
|-----------|------------|----------------------|
| (via @ManyToMany) | tests.id | Package contains multiple tests |

**Indexes:**
- idx_package_type (filter by type)
- idx_package_tier (filter by tier)
- idx_age_group (age-specific packages)
- idx_gender (gender-specific packages)
- idx_is_active (available packages)
- idx_is_popular (popular packages)

**Real-life analogy:** Brochures at the lab advertising bundled health checkups - "Senior Citizen Package", "Diabetes Screening Package" - with bundled pricing and included tests listed.

**Viva Q&A:**
Q: Why separate from tests table?
A: Packages are products with their own pricing, marketing, and metadata. If merged, every test row would need package-specific columns (waste of space). Packages are reusable entities.

Q: Why @ElementCollection for benefits/preparations?
A: Benefits and preparations are lists of strings specific to each package. They don't need their own table with IDs. @ElementCollection creates child tables automatically for collection types.

Q: Why both totalPrice and discountedPrice?
A: totalPrice is the standard package price. discountedPrice is the promotional price. Allows comparing savings and running time-limited promotions.

---

# WORKFLOW TABLES

## report_results (ReportResult.java)
**Real-world meaning:** The actual numerical/text results for each parameter of a test. e.g., "Hemoglobin: 13.5 g/dL" for a CBC test.

**Why separate table:** One booking has many parameters (CBC has 5+ parameters). Storing all results in bookings table violates 1NF. Each parameter result needs its own row for structured querying and reference range checking.

**Every column explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| id | BIGINT | Primary key | Cannot be null (PK) |
| booking_id | BIGINT FK | Which booking this result belongs to | Cannot be null |
| report_id | BIGINT FK | Which report this result belongs to | Can be null (legacy) |
| test_id | BIGINT FK | Which test this parameter belongs to | Can be null |
| parameter_id | BIGINT FK | Which parameter this result is for | Cannot be null |
| value | VARCHAR | Raw result value | Can be null |
| resultValue | VARCHAR | Formatted result value | Can be null |
| unit | VARCHAR | Unit of measurement | Can be null |
| normalRangeMin | DECIMAL | Minimum normal value | Can be null |
| normalRangeMax | DECIMAL | Maximum normal value | Can be null |
| normalRange | VARCHAR | Textual normal range | Can be null |
| notes | TEXT | Technician notes | Can be null |
| comments | TEXT | MO comments | Can be null |
| abnormalStatus | ENUM | HIGH, LOW, NORMAL | Can be null |
| status | ENUM | Result status | Can be null |
| isCritical | BOOLEAN | Is this result critical (life-threatening)? | Cannot be null, defaults false |
| isAbnormal | BOOLEAN | Is this result outside normal range? | Cannot be null, defaults false |
| createdAt | TIMESTAMP | When result was entered | Cannot be null |

**Foreign keys:**
| FK Column | References | Why this relationship |
|-----------|------------|----------------------|
| booking_id | bookings.id | Result belongs to a booking |
| report_id | reports.id | Result belongs to a report |
| test_id | tests.id | Result is for a specific test |
| parameter_id | test_parameters.id | Result is for a specific parameter |

**Indexes:** (none explicitly defined, uses FK indexes)

**Real-life analogy:** The lab report sheet where each parameter has a row with value, unit, and normal range. e.g., "Hemoglobin: 13.5 g/dL (Normal: 13.5-17.5)"

**Viva Q&A:**
Q: Difference from report_verifications?
A: report_results = what the technician entered (raw data). report_verifications = what the MO approved (sign-off, clinical notes). Technician writes results. MO verifies them. Different actors, different data.

Q: Why both exist (technician uploads results, MO verifies them)?
A: Separation of duties. Technicians are not qualified to interpret results medically. MOs are doctors who provide clinical interpretation. Two-step workflow ensures quality control.

Q: Why not store JSON results in booking table?
A: JSONB breaks SQL filtering, prevents reference range checking, makes delta comparison impossible, violates 1NF. Need structured rows for queries like "show all abnormal hemoglobin results".

---

## report_verification (ReportVerification.java)
**Real-world meaning:** The medical officer's sign-off on a report - clinical notes, digital signature, verification status. The final approval step.

**Why separate table:** Verification is a separate workflow step from result entry. Different user role (MO vs technician), different data (clinical notes vs numeric results). One-to-one with booking but distinct concerns.

**Every column explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| id | BIGINT | Primary key | Cannot be null (PK) |
| booking_id | BIGINT FK | Which booking is being verified | Cannot be null |
| medicalOfficer_id | BIGINT FK | Which MO verified this report | Can be null (not verified yet) |
| verificationDate | TIMESTAMP | When verification happened | Cannot be null |
| clinicalNotes | TEXT | MO's clinical interpretation | Can be null |
| criticalFlags | TEXT | Flags for critical findings | Can be null |
| status | ENUM | PENDING, VERIFIED, REJECTED | Cannot be null, defaults PENDING |
| digitalSignature | TEXT | MO's digital signature | Can be null (not verified yet) |
| icdCodes | TEXT | ICD diagnosis codes | Can be null |
| requiresSpecialistReferral | BOOLEAN | Does patient need specialist? | Cannot be null, defaults false |
| specialistType | VARCHAR | Which specialist to refer | Can be null |
| previouslyRejected | BOOLEAN | Was this report rejected before? | Cannot be null, defaults false |
| createdAt | TIMESTAMP | When verification record was created | Cannot be null |
| updatedAt | TIMESTAMP | Last update | Can be null |

**Foreign keys:**
| FK Column | References | Why this relationship |
|-----------|------------|----------------------|
| booking_id | bookings.id | One verification per booking |
| medicalOfficer_id | users.id | Which MO verified |

**Indexes:** (none explicitly defined)

**Real-life analogy:** The doctor's signature page on a lab report with clinical notes like "Mild anemia detected. Recommend iron supplementation."

**Viva Q&A:**
Q: Why status is separate from booking status?
A: Booking status tracks overall workflow (sample collected → processing → completed). Verification status tracks MO approval specifically. A booking can be PROCESSING but verification PENDING. Different granularities.

Q: What does digitalSignature store?
A: Encrypted hash of the MO's approval. In production, this would be a cryptographic signature. Currently stores dummy data. The @NotBlank conflict was a validation error - fixed by making it nullable until verification.

Q: Why clinicalNotes separate from report_results comments?
A: clinicalNotes = MO's high-level interpretation (e.g., "Patient has hyperlipidemia"). report_results comments = technician's parameter-level notes (e.g., "Sample slightly hemolyzed"). Different scopes.

---

## cart / cart_items (Cart.java, CartItem.java)
**Real-world meaning:** Shopping cart for patients to add tests/packages before checkout. Temporary holding area before booking.

**Why 2 tables not 1 (normalization):** Cart is the container (subtotal, coupon, status). CartItem is individual line items. One cart has many items. This is classic master-detail pattern. Merging would duplicate cart-level data (subtotal, coupon) for every item.

**Cart columns explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| cart_id | BIGINT | Primary key | Cannot be null (PK) |
| user_id | BIGINT FK | Who owns this cart | Cannot be null |
| subtotal | DECIMAL | Sum of item prices before discount | Cannot be null, defaults 0 |
| discountAmount | DECIMAL | Applied discount | Cannot be null, defaults 0 |
| taxAmount | DECIMAL | Tax amount | Cannot be null, defaults 0 |
| totalPrice | DECIMAL | Final amount to pay | Cannot be null, defaults 0 |
| couponCode | VARCHAR | Applied coupon code | Can be null |
| couponDiscount | DECIMAL | Coupon discount amount | Can be null |
| status | ENUM | ACTIVE, CHECKED_OUT, ABANDONED, EXPIRED | Cannot be null, defaults ACTIVE |
| itemCount | INTEGER | Number of items in cart | Cannot be null, defaults 0 |
| createdAt | TIMESTAMP | When cart was created | Cannot be null |
| updatedAt | TIMESTAMP | Last update | Cannot be null |
| expiryAt | TIMESTAMP | When cart expires (30 days) | Cannot be null |

**CartItem columns explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| cart_item_id | BIGINT | Primary key | Cannot be null (PK) |
| cart_id | BIGINT FK | Which cart this item belongs to | Cannot be null |
| lab_test_id | BIGINT FK | Which test (if individual test) | Can be null |
| package_id | BIGINT FK | Which package (if package) | Can be null |
| itemType | ENUM | LAB_TEST or TEST_PACKAGE | Cannot be null |
| itemName | VARCHAR | Display name | Cannot be null |
| itemCode | VARCHAR | Test/package code | Can be null |
| description | TEXT | Item description | Can be null |
| quantity | INTEGER | Quantity (usually 1) | Cannot be null, defaults 1 |
| unitPrice | DECIMAL | Price per unit | Cannot be null |
| originalPrice | DECIMAL | MRP | Can be null |
| discountPercentage | DECIMAL | Discount % | Cannot be null, defaults 0 |
| discountAmount | DECIMAL | Discount amount | Cannot be null, defaults 0 |
| finalPrice | DECIMAL | Final line price | Can be null |
| testsIncluded | INTEGER | For packages, number of tests | Can be null |
| fastingRequired | BOOLEAN | Fasting required? | Cannot be null, defaults false |
| sampleType | VARCHAR | Sample type | Can be null |
| turnaroundHours | INTEGER | Turnaround time | Can be null |
| addedAt | TIMESTAMP | When item was added | Cannot be null |
| updatedAt | TIMESTAMP | Last update | Can be null |

**Foreign keys:**
| FK Column | References | Why this relationship |
|-----------|------------|----------------------|
| cart.user_id | users.id | Cart belongs to user |
| cartItem.cart_id | carts.cart_id | Item belongs to cart |
| cartItem.lab_test_id | tests.id | Item is a test |
| cartItem.package_id | test_packages.id | Item is a package |

**Indexes:**
- idx_cart_user (filter by user)
- idx_cart_status (filter by status)
- idx_cart_item_cart (filter items by cart)
- idx_cart_item_test (filter by test)
- idx_cart_item_package (filter by package)

**Real-life analogy:** Shopping cart in e-commerce. Cart holds subtotal, coupon, total. Items are individual products added to cart.

**Viva Q&A:**
Q: Lifecycle: when created, when deleted?
A: Created when user adds first item (or on login for returning users). Deleted when: checkout completes (status → CHECKED_OUT), expires after 30 days (status → EXPIRED), or user clears cart (status → ABANDONED).

Q: Why both lab_test_id and package_id nullable?
A: An item is EITHER a test OR a package. Mutually exclusive. One null, one populated. ItemType enum determines which is populated.

Q: Why store price snapshot in cart_item?
A: Price at time of adding to cart. If test price changes later, cart item keeps original price. Prevents price shock at checkout. Denormalization for correctness.

---

# REFERENCE TABLES

## test_parameters (TestParameter.java)
**Real-world meaning:** The individual parameters that make up a test. e.g., CBC has parameters: WBC, RBC, Hemoglobin, Platelets.

**Why separate from tests (one test has many parameters):** Normalization. One test → many parameters. If stored in tests table, would need JSON or repeated rows. Parameters are reusable entities with their own reference ranges.

**Every column explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| id | BIGINT | Primary key | Cannot be null (PK) |
| test_id | BIGINT FK | Which test this parameter belongs to | Cannot be null |
| parameterName | VARCHAR | Parameter name (e.g., "Hemoglobin") | Cannot be null |
| unit | VARCHAR | Unit of measurement (e.g., "g/dL") | Can be null |
| normalRangeMin | DECIMAL | Minimum normal value | Can be null |
| normalRangeMax | DECIMAL | Maximum normal value | Can be null |
| criticalLow | DECIMAL | Critical low threshold | Can be null |
| criticalHigh | DECIMAL | Critical high threshold | Can be null |
| isCritical | BOOLEAN | Is this parameter critical? | Cannot be null, defaults false |
| normalRangeText | VARCHAR | Textual normal range (e.g., "13.5-17.5") | Can be null |
| displayOrder | INTEGER | Order to display in report | Can be null |
| category | VARCHAR | Parameter category | Can be null |
| createdAt | TIMESTAMP | When parameter was created | Cannot be null |
| updatedAt | TIMESTAMP | Last update | Cannot be null |

**Foreign keys:**
| FK Column | References | Why this relationship |
|-----------|------------|----------------------|
| test_id | tests.id | Parameter belongs to a test |

**Indexes:** (none explicitly defined)

**Real-life analogy:** The parameter list on a lab report form. Each test has a predefined list of parameters with normal ranges.

**Viva Q&A:**
Q: Why separate from tests?
A: One test has many parameters. Storing in tests table would require JSON or repeated rows. Parameters are reusable entities with their own reference ranges. Normalization prevents data duplication.

Q: Why criticalLow/criticalHigh separate from normalRangeMin/Max?
A: Normal ranges = standard reference values. Critical ranges = dangerous values requiring immediate alert. Different concerns. Critical values trigger panic alerts.

---

## reference_ranges (ReferenceRange.java)
**Real-world meaning:** Gender and age-specific normal ranges for parameters. e.g., Hemoglobin normal is 13.5-17.5 for males, 12.0-15.5 for females.

**Why separate from test_parameters (gender/age variants):** A parameter has different normal ranges based on gender and age. If stored in test_parameters, would need complex JSON. Separate table allows one parameter → many reference ranges.

**Every column explained:**
| Column | Type | Why it exists | What happens if null |
|--------|------|---------------|---------------------|
| id | BIGINT | Primary key | Cannot be null (PK) |
| gender | VARCHAR | MALE, FEMALE, or ALL | Cannot be null |
| ageMin | DECIMAL | Minimum age for this range | Can be null |
| ageMax | DECIMAL | Maximum age for this range | Can be null |
| normalRangeMin | DECIMAL | Minimum normal value | Can be null |
| normalRangeMax | DECIMAL | Maximum normal value | Can be null |
| unit | VARCHAR | Unit of measurement | Can be null |
| test_id | BIGINT FK | Which test this range applies to | Can be null |
| parameter_id | BIGINT FK | Which parameter this range applies to | Can be null |
| createdAt | TIMESTAMP | When range was created | Cannot be null |
| updatedAt | TIMESTAMP | Last update | Cannot be null |

**Foreign keys:**
| FK Column | References | Why this relationship |
|-----------|------------|----------------------|
| test_id | tests.id | Range applies to a test |
| parameter_id | test_parameters.id | Range applies to a parameter |

**Indexes:** (none explicitly defined)

**Real-life analogy:** Reference range charts in lab manuals showing different normal values for men, women, children, and seniors.

**Viva Q&A:**
Q: Why separate from test_parameters?
A: A parameter has different normal ranges based on gender and age. If stored in test_parameters, would need complex JSON. Separate table allows one parameter → many reference ranges. Enables queries like "get normal range for hemoglobin for 45-year-old male".

Q: Why both test_id and parameter_id?
A: Flexibility. Can define ranges at test level (all parameters inherit) or parameter level (specific parameter override). Most ranges are at parameter level for precision.

---

# MIGRATION HISTORY (Flyway Version Numbering)

## V4__add_indexes.sql
**What indexes and why this order:**
- Booking indexes first (most queried table)
- Report indexes second (frequent joins)
- Lab test indexes third (catalog queries)
- Payment indexes fourth (transaction queries)
- Notification indexes fifth (user queries)
- Slot configuration indexes (scheduling)
- Login attempts indexes (security)
- Report result indexes (analytics)

Order: From most critical (bookings) to least critical (analytics). Optimizes the hottest queries first.

## V10__Create_Tests_Tables.sql
**What the tests table schema looks like:**
- Core columns: id, name, slug, category, description, price
- Marketing columns: original_price, discounted_price, rating
- Metadata columns: sample_type, fasting_required, turnaround_time
- Indexes on category and slug for fast lookups
- Sample data: 5 common tests (CBC, Lipid Profile, Thyroid, FBS, LFT)

## V11__Insert_500_Tests.sql
**Why this was superseded:**
- Attempted to insert 500 tests from external data source
- Data quality issues: inconsistent naming, missing parameters
- Performance issues: bulk insert was slow
- Replaced by curated 88 tests (V15) for better quality control

## V15__Replace_With_88_Common_Tests.sql
**Why replace not update:**
- DELETE all existing tests first (clean slate)
- INSERT exactly 88 curated, high-quality tests
- Categories: Blood (35), Urine (5), Radiology (10), Infectious Disease (12), Hormones (8), Pregnancy (5), Child (5), Senior (8)
- Replace ensures no orphaned data or inconsistent state
- Reset AUTO_INCREMENT to keep IDs sequential

## V16__Add_Test_Parameters_For_88_Tests.sql
**The link between tests and parameters:**
- INSERT into test_parameters for all 88 tests
- Each test gets 1-15 parameters
- Parameters include: name, unit, normal_range_text, display_order, is_critical
- Links test_id to parameter_id via foreign key
- Enables report generation with structured results

---

# NORMALIZATION EXPLANATION

## Why is Booking split from Report?
**Single Responsibility:** booking = scheduling (when, where, who). report = clinical result (what the values are). Different lifecycle, different concerns. Booking can exist without report (scheduled but not done). Report can exist without booking (legacy uploads). Separation allows independent workflows.

## Why ReportResult AND ReportVerification separate?
**Technician writes result. MO verifies it. Different actors, different data.**
- ReportResult: numeric/text values entered by technician (e.g., "Hemoglobin: 13.5")
- ReportVerification: clinical notes and sign-off by MO (e.g., "Normal range, no action needed")
- Separation of duties ensures quality control. Technicians are not doctors. MOs provide clinical interpretation.
- Different update frequencies: Results entered once. Verification may be rejected and re-verified.

## Why TestPackage AND PackageTest separate?
**A package contains many tests. Many-to-many requires junction table.**
- TestPackage: package metadata (name, price, description)
- PackageTest: junction table linking package_id ↔ test_id
- Allows one test to be in multiple packages (e.g., CBC in both "Full Body" and "Basic Health")
- Allows packages to be reordered without affecting test catalog
- Junction table enables display_order for tests within package

---

# VIVA QUESTIONS WITH ANSWERS

## Q: Why not store JSON results in booking table?
**A:** JSONB breaks SQL filtering, prevents reference range checking, makes delta comparison impossible, violates 1NF. Need structured rows for queries like "show all abnormal hemoglobin results in last 30 days". JSON makes this inefficient or impossible. Relational structure enables complex joins, aggregations, and analytics.

## Q: Why PostgreSQL not MySQL?
**A:** JSONB support (native JSON querying), better indexing for text search (GIN indexes), enum type support (database-level validation), ACID compliance under concurrent booking writes (better MVCC), advanced features like full-text search, array types, and window functions. Team already familiar with PostgreSQL.

## Q: What is N+1 query problem and where could it happen here?
**A:** Loading bookings with patient name - each booking triggers a separate user query. Example: SELECT * FROM bookings (1 query) + for each booking, SELECT * FROM users WHERE id = ? (N queries). Fixed with @ManyToOne EAGER or @Query with JOIN FETCH: "SELECT b FROM Booking b JOIN FETCH b.patient". Also happens with report_results loading parameters.

## Q: Why Flyway not Liquibase?
**A:** SQL-based migrations (Flyway) easier to debug in PostgreSQL. Can run SQL directly in psql to test. Liquibase XML adds abstraction overhead - harder to read, harder to debug when migrations fail. Team already knows SQL. Flyway's versioned SQL files are simple and transparent. No need for XML/JSON abstraction layer.

## Q: Why soft delete (isActive) not hard delete?
**A:** Bookings reference users - hard delete breaks referential integrity (FK constraint violation). Audit trails need history - who booked what when. HIPAA-aligned data retention requires keeping medical records for 7+ years. Analytics need historical data for trends. Reactivation is easier with soft delete (just flip flag).

## Q: Why isVerified + isActive both exist in users table?
**A:** isVerified = email confirmation (prevents fake emails/spam accounts). isActive = account suspension (admin can block verified users for policy violations). Different concerns, separate flags. A user can be verified but suspended (isActive=false). A user can be active but not verified (isVerified=false) - some flows allow limited access before verification.

## Q: Why role as enum not string?
**A:** Type safety - prevents typos like "TECHNICAIN" or "Technician" or "technician". Database-level validation ensures only 4 valid roles exist. Application code gets compile-time checking. Migration safety - enum values are explicit. Performance - enums are stored as integers internally in some databases.

## Q: Explain every status transition in bookings with real-world lab equivalent.
**A:**
- BOOKED → Patient submits booking request online
- CONFIRMED → Lab confirms slot availability, sends SMS/email confirmation
- SAMPLE_COLLECTED → Phlebotomist visits home or patient visits lab, blood drawn
- PROCESSING → Sample loaded into analyzer, tests running
- REFLEX_PENDING → Abnormal result triggers automatic additional tests (e.g., high TSH → add Free T4)
- PENDING_VERIFICATION → Technician uploads results, awaiting MO sign-off
- VERIFIED → Medical officer reviews results, adds clinical notes, digitally signs
- COMPLETED → Report delivered to patient via email/app, booking closed
- CANCELLED → Patient cancels booking or lab rejects specimen

## Q: What does digitalSignature store in report_verification?
**A:** Encrypted hash of the MO's approval. In production, this would be a cryptographic signature using MO's private key, proving authenticity and non-repudiation. Currently stores dummy data during development. The @NotBlank conflict was a validation error - fixed by making it nullable until verification is complete (status = VERIFIED).

## Q: Why both test_id and package_id nullable in bookings?
**A:** A booking is EITHER for an individual test OR a package. Mutually exclusive. One null, one populated. This is a polymorphic relationship. Business logic ensures exactly one is populated. Allows single bookings table to handle both cases without separate booking_tests and booking_packages tables.

## Q: Lifecycle of cart: when created, when deleted?
**A:**
- Created: When user adds first item to cart (or on login for returning users with active cart)
- Deleted: When checkout completes (status → CHECKED_OUT), expires after 30 days (status → EXPIRED), or user manually clears cart (status → ABANDONED)
- Purpose: Temporary holding area before booking conversion to actual bookings

## Q: Why store price snapshot in cart_item?
**A:** Price at time of adding to cart. If test price changes later (promotion ends, price hike), cart item keeps original price. Prevents price shock at checkout. Denormalization for correctness. Ensures user pays what they saw when adding to cart. Historical record of pricing at time of selection.

---

**End of VIVA 4: Database Design**

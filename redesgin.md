# HEALTHCARELAB PLATFORM REDESIGN PLAN

**Document Version:** 1.0  
**Date:** April 2026  
**Status:** Ready for Implementation  
**Scope:** 150+ Health Packages | 500+ Tests | 5 Core Problems | Complete Data Architecture

---

## TABLE OF CONTENTS

1. Executive Summary
2. Problem 1: Expert-Curated Screenings Filter & Navigation
3. Problem 2: Package Listings & Details Pages
 
5. Problem 4: Profile Page Redesign & Editing
6. Problem 5: Secondary Pages Redesign
7. Consolidated Data Schema Proposal
8. API Endpoint Specifications
9. Validation Rules & Edge Cases
10. Phased Deliverables & Timeline
11. Tech Stack & Architecture
12. Database Migration Strategy

---

## 1. EXECUTIVE SUMMARY

### Objectives
- ✓ Fix filter interactions to prevent unrelated tests from opening
- ✓ Implement unified package/test listing and detail architecture
- ✓ Create robust data schema supporting 150+ packages with 4 pricing tiers
- ✓ Redesign profile and secondary pages with full CRUD operations
- ✓ Establish consistent UI/UX patterns across all modules
- ✓ Enable seamless navigation: Screenings → Packages → Tests → Details

### Key Deliverables
1. Complete MongoDB data schema (9 collections)
2. 40+ RESTful API endpoints with full validation
3. React component library for all pages
4. Migration strategy for existing data
5. Security checklist (JWT, encryption, rate limiting)
6. Phased rollout plan (16 weeks)

### Constraints & Scope
- **150+ packages** across 6 categories (Men, Women, Couples, Children, Seniors, Vitamins)
- **4 pricing tiers** per category: Silver, Gold, Platinum, Advanced
- **500+ individual tests** with 2000+ parameters
- **Multi-generational** user base (18-80 years)
- **Family accounts** with linked family members
- **Authentication**: JWT-based with role-based access control

---

## 2. PROBLEM 1: EXPERT-CURATED SCREENINGS FILTER & NAVIGATION

### Objective & Scope

**Issue:** Clicking doctor-designed test cards (e.g., 'Heart', 'Diabetes', 'Kidney') may open unrelated tests or apply global filters incorrectly, causing cross-contamination between screening categories.

**Solution:** Implement unique test IDs with path-based routing and isolated component state.

### Root Cause Analysis

- Filter state managed globally without unique identifiers per card
- Card click handlers not properly mapping to specific test IDs
- Missing query parameter isolation for URL-based state

### UI Components & Design

#### Screening Card Component
```
┌─────────────────────────────────┐
│  [Heart Icon]                   │
│  Heart                          │
│  Lipids & cardiac risk          │
│  12 Tests Included              │
│  ────────────────────────────   │
│     [View Details Button]       │
└─────────────────────────────────┘
```

**Card Properties:**
- ID: `screening_{testId}` (unique, kebab-case)
- Click handler: `onClick={() => navigate(`/test/${test.id}`)}`
- Icon: 8 organ systems (heart, kidney, liver, thyroid, bone, lungs, brain, full-body)
- Title: Test name (40px, bold)
- Subtitle: Description (16px, gray)
- Badge: Test count (optional, top-right corner)

#### Filter Bar Redesign
**Old Approach:** Global filter state → cross-contamination  
**New Approach:** Query parameter-based → `/tests?category=heart&type=expert-curated`

```
┌──────────────────────────────────────────────────────────────┐
│  Category Badges:                                            │
│  [Thyroid] [Heart] [Kidney] [Liver] [Bone] [Lungs] [Brain] │
│                                          [Clear Filters] ×  │
└──────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Each badge toggles a query param, not global state
- URL format: `/screenings?category=heart&type=expert-curated`
- Active badge: blue background + white text
- Clear button: visible only when filters active
- Browser back/forward: works correctly (state in URL)

### Data Schema Changes

```javascript
// tests collection (updated)
{
  _id: ObjectId,
  name: String,                      // "Heart Health Screening"
  code: String,                      // "HRT-001" (unique)
  organSystem: String,               // "heart" | "kidney" | "thyroid" | etc
  shortDescription: String,          // "Lipids & cardiac risk"
  longDescription: String,
  icon: String,                      // "heart.svg"
  testCategoryId: ObjectId,          // Reference to category doc
  parameters: [ObjectId],            // Array of test parameter refs
  packages: [ObjectId],              // Packages that include this test
  reportTurnaroundHours: Number,     // 24-96
  fastingRequired: String,           // "8hr" | "none" | "mixed"
  createdAt: Date,
  updatedAt: Date,
  active: Boolean
}
```

### API Endpoints

#### GET /api/screenings
```
Request:  GET /api/screenings?category=heart&type=expert-curated
Response:
{
  "success": true,
  "data": {
    "screenings": [
      {
        "id": "scr-heart-001",
        "name": "Heart Health Screening",
        "organSystem": "heart",
        "icon": "heart.svg",
        "subtitle": "Lipids & cardiac risk",
        "testCount": 12,
        "parameters": ["lipid-profile", "hs-crp", "troponin"],
        "reportTurnaroundHours": 48,
        "fastingRequired": "8hr"
      }
    ],
    "categories": ["thyroid", "heart", "kidney", "liver", "bone", "lungs", "brain", "full-body"],
    "totalCount": 8
  }
}
```

#### GET /api/tests/{testId}
```
Request:  GET /api/tests/hrt-001
Response:
{
  "success": true,
  "data": {
    "test": {
      "id": "hrt-001",
      "name": "Heart Health Screening",
      "code": "HRT-001",
      "organSystem": "heart",
      "shortDescription": "...",
      "longDescription": "...",
      "parameters": [...],
      "relatedTests": [],
      "packages": [...],
      "reportTurnaroundHours": 48,
      "fastingRequired": "8hr"
    }
  }
}
```

### Frontend Implementation (React)

```javascript
// ScreeningCard.jsx
const ScreeningCard = ({ screening, onNavigate }) => {
  const handleClick = () => {
    onNavigate(`/test/${screening.id}`);
  };

  return (
    <div 
      id={`screening-${screening.id}`}
      onClick={handleClick}
      className="screening-card"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <img src={`/icons/${screening.icon}`} alt={screening.name} />
      <h3>{screening.name}</h3>
      <p>{screening.subtitle}</p>
      <span className="badge">{screening.testCount} Tests</span>
    </div>
  );
};

// ScreeningsPage.jsx
const ScreeningsPage = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useSearchParams().get('category') || 'all';
  
  const handleCategoryChange = (newCategory) => {
    navigate(`/screenings?category=${newCategory}`);
  };

  return (
    <div className="screenings-page">
      <FilterBar category={category} onChange={handleCategoryChange} />
      <div className="screening-grid">
        {screenings.map(s => (
          <ScreeningCard 
            key={s.id} 
            screening={s} 
            onNavigate={navigate}
          />
        ))}
      </div>
    </div>
  );
};
```

### Validation Rules

- ✓ Test ID must exist in database before card renders
- ✓ organSystem must be one of 8 predefined values
- ✓ Filter params must match valid category names
- ✓ No test should appear in multiple organSystems
- ✓ Parameters array must not be empty
- ✓ reportTurnaroundHours: 4-120 (4 hours to 5 days)

### Accessibility (WCAG 2.1 AA)

- ✓ Each card: `aria-label={test.name}`
- ✓ Keyboard navigation: Tab to card, Enter to open
- ✓ Focus indicators: Visible, min 3px width
- ✓ Contrast ratio: >= 4.5:1 for text
- ✓ Skip link to first screening for keyboard users

### Edge Cases & Solutions

| Case | Scenario | Solution |
|------|----------|----------|
| **Loading** | User clicks card while data loading | Disable click handler until test loaded |
| **404** | Test deleted after card loads | Show graceful 404, redirect to /screenings |
| **Rapid clicks** | User clicks same card multiple times | Debounce (300ms) |
| **Invalid URL** | Invalid testId in URL | Redirect to /screenings with error toast |

---

## 3. PROBLEM 2: PACKAGE LISTINGS & DETAILS PAGES

### Objective & Scope

Implement package listing pages for each category (Men, Women, Couples, etc.) with consistent card design. Create package details page showing all included tests, pricing tiers, and fasting requirements. Support 150+ packages with Silver/Gold/Platinum/Advanced variants.

### Package Card Component

```
┌──────────────────────────────────────────────┐
│  [Tier Badge: GOLD]                          │
│  Men's Cardiac Gold Package                  │
│  ₹2999 ──→ ₹1799 (40% off)                   │
│  45+ Tests | 48hr Report | 8hr Fasting       │
│                                              │
│  [View Details]        [Compare]             │
└──────────────────────────────────────────────┘
```

**Card Properties:**
- Package name (e.g., "Men's Cardiac Gold Package")
- Price: Original ₹2999 → Discounted ₹1799
- Tier badge: Silver/Gold/Platinum/Advanced
- Test count: "45+ Tests Included"
- Turnaround: "48hr Report"
- Fasting: "8hr Fasting Required" or "No Fasting"
- Actions: View Details, Compare (checkbox)

### Package Details Page Layout

```
┌────────────────────────────────────────────────────────┐
│ MEN'S CARDIAC GOLD PACKAGE          [GOLD Badge]       │
│ ₹2999 → ₹1799 (40% off)                                │
├────────────────────────────────────────────────────────┤
│ Quick Stats: 45 Tests | 48hrs | 8hr Fasting          │
├────────────────────────────────────────────────────────┤
│ INCLUDED TESTS (Table)                                │
│ ┌────────────────────────────────────────────────────┐│
│ │ Test Name        │ Fasting │ Parameters          ││
│ │ Lipid Profile    │ Yes     │ Cholesterol, LDL... ││
│ │ hs-CRP          │ No      │ CRP                 ││
│ └────────────────────────────────────────────────────┘│
├────────────────────────────────────────────────────────┤
│ SUB-PACKAGES (If Platinum/Advanced)                   │
│ └─ Silver Package (₹1499, 25 tests)                   │
│ └─ Gold Package (₹2999, 45 tests)                     │
├────────────────────────────────────────────────────────┤
│ BENEFITS                                              │
│ ✓ 1 Doctor Consultation                               │
│ ✓ Personalized Diet Plan                              │
│ ✓ 24-48 Hour Report                                   │
├────────────────────────────────────────────────────────┤
│ [Book Now]  [Add to Cart]  [Print Details]            │
└────────────────────────────────────────────────────────┘
```

### Data Schema for Packages

```javascript
// packages collection
{
  _id: ObjectId,
  name: String,                      // "Men's Cardiac Gold Package"
  code: String,                      // "MEN-CARD-GOLD-001" (unique)
  category: String,                  // "men" | "women" | "couples" | etc
  subcategory: String,               // "cardiac" | "diabetes" | "fertility"
  tier: String,                      // "silver" | "gold" | "platinum" | "advanced"
  
  // Pricing (in paise: 1 paise = 0.01 rupees)
  basePriceInPaise: Number,          // 299900 (₹2999.00)
  discountPercentage: Number,        // 40
  finalPrice: Number,                // 179940 (calculated: base * (1 - discount/100))
  minOrderValue: Number,             // Minimum purchase amount
  
  // Metadata
  testCount: Number,                 // 45
  reportTurnaroundHours: Number,     // 48
  fastingRequired: String,           // "8hr" | "none" | "mixed"
  sampleType: String,                // "Blood" | "Urine" | "Multiple"
  
  // Text content
  description: String,               // Short description
  longDescription: String,           // Detailed description
  
  // Relationships
  includedTests: [
    {
      testId: ObjectId,
      testName: String,
      testCode: String,
      parametersIncluded: [String]   // ["lipid-profile", "hs-crp"]
    }
  ],
  includedImaging: [String],         // ["ecg", "2d-echo", "carotid-doppler"]
  subPackages: [ObjectId],           // For Platinum → Silver/Gold
  
  // Content
  benefits: [String],                // ["1 Doctor Consultation", ...]
  contraindications: [String],       // Conditions where NOT recommended
  faq: [
    {
      question: String,
      answer: String,
      order: Number
    }
  ],
  
  // Demographics
  ageGroup: String,                  // "adult" | "senior" | "all" | "18-40" | "40-60"
  gender: String,                    // "both" | "male" | "female"
  
  // Metadata
  metadata: {
    insuranceEligible: Boolean,
    corporateEligible: Boolean,
    familyAccountEligible: Boolean,
    homeCollectionAvailable: Boolean
  },
  
  // Status
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Package Tier Hierarchy

**Design Pattern:** Tier inheritance with explicit relationships

```
SILVER (Basic)
├─ 8 tests
├─ Price: ₹999
└─ No imaging

GOLD (Premium)
├─ All SILVER tests + 4 advanced tests
├─ 12 tests total
├─ Price: ₹2999
├─ Imaging: ECG, 2D Echo
└─ Benefits: 1 Doctor Consultation

PLATINUM (Advanced)
├─ All GOLD tests + imaging
├─ 20 tests total
├─ Price: ₹4999
├─ Imaging: USG, 2D Echo, Mammography
├─ Benefits: 2 Doctor Consultations, Specialist Referral
└─ Sub-packages: [Silver, Gold]

ADVANCED (Ultimate)
├─ All PLATINUM tests + MRI/CT + Genetic
├─ 35+ tests total
├─ Price: ₹8999
├─ Imaging: MRI, CT, Genetic Testing
├─ Benefits: 3+ Consultations, Comprehensive Plan
└─ Sub-packages: [Silver, Gold, Platinum]
```

**Storage Strategy:**
```javascript
// In database:
// Gold package stores: subPackages: [silver_id]
// Platinum stores: subPackages: [silver_id, gold_id]
// Advanced stores: subPackages: [silver_id, gold_id, platinum_id]

// In UI:
// When user views Platinum:
// 1. Show Platinum details
// 2. Show Silver & Gold as "Upgrade Options"
// 3. Allow comparison between tiers
```

### API Endpoints

#### GET /api/packages/category/{category}
```
Request:  GET /api/packages/category/men?tier=gold&sort=price&limit=20
Response:
{
  "success": true,
  "data": {
    "category": "men",
    "packages": [
      {
        "id": "pkg-men-card-gold",
        "name": "Men's Cardiac Gold Package",
        "tier": "gold",
        "basePriceInPaise": 299900,
        "discountPercentage": 40,
        "finalPrice": 179940,
        "testCount": 45,
        "turnaroundHours": 48,
        "fastingRequired": "8hr",
        "icon": "heart.svg"
      }
    ],
    "totalCount": 28,
    "availableTiers": ["silver", "gold", "platinum", "advanced"],
    "priceRange": {
      "min": 999,
      "max": 8999
    }
  }
}
```

#### GET /api/packages/{packageId}/details
```
Request:  GET /api/packages/pkg-men-card-gold/details
Response:
{
  "success": true,
  "data": {
    "package": {
      "id": "pkg-men-card-gold",
      "name": "Men's Cardiac Gold Package",
      "tier": "gold",
      "basePriceInPaise": 299900,
      "discountPercentage": 40,
      "finalPrice": 179940,
      "testCount": 45,
      "reportTurnaroundHours": 48,
      "fastingRequired": "8hr",
      
      "includedTests": [
        {
          "testId": "test-lipid-001",
          "testName": "Lipid Profile Advanced",
          "testCode": "LIPID-ADV-001",
          "fasting": true,
          "parameters": ["total-cholesterol", "ldl", "hdl", "triglycerides"]
        },
        {
          "testId": "test-hscrp-001",
          "testName": "hs-CRP",
          "testCode": "HS-CRP-001",
          "fasting": false,
          "parameters": ["hs-crp"]
        }
      ],
      
      "includedImaging": ["ecg", "2d-echo", "carotid-doppler"],
      
      "subPackages": [
        {
          "id": "pkg-men-card-silver",
          "name": "Men's Cardiac Silver Package",
          "tier": "silver",
          "price": 1499,
          "testCount": 25
        }
      ],
      
      "benefits": [
        "1 Doctor Consultation",
        "Personalized Diet Plan",
        "24-48 Hour Report"
      ],
      
      "faq": [
        {
          "question": "How long to get results?",
          "answer": "Typically 24-48 hours from sample collection"
        }
      ]
    }
  }
}
```

#### GET /api/packages/compare
```
Request:  GET /api/packages/compare?ids=pkg-men-card-silver,pkg-men-card-gold,pkg-men-card-platinum

Response:
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "pkg-men-card-silver",
        "name": "Men's Cardiac Silver",
        "tier": "silver",
        "price": 1499,
        "testCount": 25,
        "imaging": []
      },
      {
        "id": "pkg-men-card-gold",
        "name": "Men's Cardiac Gold",
        "tier": "gold",
        "price": 2999,
        "testCount": 45,
        "imaging": ["ecg", "2d-echo"]
      }
    ],
    "comparison": {
      "testCountDifference": [25, 45, 65],
      "priceDifference": [1499, 2999, 4999],
      "uniqueToGold": ["Carotid Doppler", "Advanced Lipid"],
      "uniqueToPlatinum": ["USG Abdomen", "2D Echo with Doppler"]
    }
  }
}
```

### Package Listing Page Flow

```
1. User navigates to /packages/men
   ↓
2. Load packages by category from API
   ↓
3. Display package cards with filters:
   - Tier: Silver, Gold, Platinum, Advanced
   - Sort: price (asc/desc), name, test-count
   ↓
4. User clicks "View Details" on card
   ↓
5. Navigate to /packages/{packageId}
   ↓
6. Show full details page with:
   - Complete test list
   - Imaging procedures
   - Sub-package hierarchy
   - Benefits
   - FAQs
   ↓
7. User clicks "Compare" checkbox on multiple cards
   ↓
8. Show side-by-side comparison table
   ↓
9. User clicks "Book Now"
   ↓
10. Proceed to cart/checkout with package pre-selected
```

### Validation Rules

- ✓ basePriceInPaise >= 50000 (₹500 minimum)
- ✓ discountPercentage: 0-100
- ✓ finalPrice = basePriceInPaise * (1 - discountPercentage/100)
- ✓ testCount matches length of includedTests array
- ✓ fastingRequired: "8hr" | "none" | "mixed"
- ✓ subPackages references only valid package IDs
- ✓ tier must be: "silver" | "gold" | "platinum" | "advanced"
- ✓ No circular sub-package references

### Edge Cases

| Case | Solution |
|------|----------|
| Package deleted | Show 410 Gone error, suggest related packages |
| Price changed | Show confirmation before checkout |
| Test removed | Notify user, offer refund/rescheduling |
| Empty category | Show helpful message + related categories |
| Price calculation error | Use database transactions to prevent |


## 5. PROBLEM 4: PROFILE PAGE REDESIGN & EDITING

### Objective & Scope

Redesign profile page to include all necessary user information. Enable full profile editing (CRUD) with validation. Add family details section (new) above address book. Support role-based profile variants.

### Current Profile Structure

```
(From Screenshot)
├─ My Profile
├─ Address Book
├─ My Bookings
├─ My Reports
├─ Health Insights
├─ Settings
└─ Logout
```

### Redesigned Profile Page Layout

**NEW STRUCTURE:**

```
PROFILE PAGE (/profile)
├─ 1. PERSONAL INFORMATION (Edit mode)
│  ├─ First Name, Last Name
│  ├─ Date of Birth (18+ validation)
│  ├─ Gender (M/F/Other)
│  ├─ Blood Type (O+, A-, etc)
│  └─ [Edit] button → Toggle edit mode
│
├─ 2. FAMILY DETAILS (NEW SECTION) ★
│  ├─ Spouse: Priya Kumar, DOB: 1992-03-20, Blood: B+
│  ├─ Child: Aarya Kumar, DOB: 2015-06-15
│  ├─ [Add Family Member] button
│  ├─ Edit/Remove buttons per member
│  └─ Status: linked/pending/unlinked
│
├─ 3. ADDRESS & DELIVERY
│  ├─ Default Address (marked with ★)
│  ├─ Home: 123 Main St, Delhi 110001
│  ├─ Work: 456 Office Plaza, Delhi 110002
│  └─ [Add New Address] button
│
├─ 4. MEDICAL HISTORY
│  ├─ Allergies: Penicillin, Shellfish
│  ├─ Chronic Diseases: Diabetes Type 2
│  ├─ Current Medications:
│  │  - Metformin 500mg, 2x daily
│  │  - Aspirin 100mg, 1x daily
│  ├─ Past Surgeries: Appendectomy (2018)
│  └─ Family History: Diabetes (father)
│
├─ 5. EMERGENCY CONTACT
│  ├─ Name: Rajesh Kumar (Father)
│  ├─ Relation: Father
│  └─ Phone: +919876543210
│
└─ 6. PREFERENCES & NOTIFICATIONS
   ├─ Language: English
   ├─ Communication: Email & SMS
   ├─ Notifications: Enabled
   └─ Marketing Emails: Disabled
```

### Data Schema for User Profile

```javascript
// users collection
{
  _id: ObjectId,
  
  // Authentication
  auth: {
    email: String,                   // Unique
    phone: String,                   // Unique, +91XXXXXXXXXX
    passwordHash: String,            // bcrypt
    emailVerified: Boolean,
    phoneVerified: Boolean,
    lastPasswordChange: Date
  },
  
  // Personal Information
  personalInfo: {
    firstName: String,               // Required, 2-50 chars
    lastName: String,                // Required, 2-50 chars
    dateOfBirth: Date,               // Required, 18+ years
    gender: String,                  // "M" | "F" | "Other"
    bloodType: String,               // "O+", "A-", "B+", "AB-", etc
    maritalStatus: String            // "Single" | "Married" | "Widowed"
  },
  
  // Contact Information
  contactInfo: {
    primaryPhone: String,            // +91XXXXXXXXXX
    secondaryPhone: String,
    alternateEmail: String           // For notifications
  },
  
  // Address Information
  addresses: [
    {
      _id: ObjectId,
      type: String,                  // "home" | "work" | "other"
      street: String,                // "123 Main Street"
      city: String,                  // "Delhi"
      state: String,                 // "Delhi"
      postalCode: String,            // "110001"
      country: String,               // Default: "India"
      isDefault: Boolean,            // Only one can be true
      createdAt: Date
    }
  ],
  
  // Family Details (NEW) ★
  familyDetails: [
    {
      _id: ObjectId,
      relation: String,              // "spouse" | "child" | "parent" | "sibling" | "other"
      firstName: String,             // Required
      lastName: String,              // Required
      dateOfBirth: Date,             // Optional
      gender: String,                // "M" | "F" | "Other"
      bloodType: String,             // Optional
      
      // Medical context
      medicalConditions: [String],   // ["Asthma", "Hypertension"]
      allergies: [String],           // ["Penicillin"]
      
      // Account linkage
      accountStatus: String,         // "linked" | "pending" | "unlinked"
      userId: ObjectId,              // Link to their user doc (if account created)
      invitationToken: String,       // For pending invitations
      invitationExpiresAt: Date,     // 7-day expiration
      
      createdAt: Date,
      updatedAt: Date
    }
  ],
  
  // Medical History
  medicalHistory: {
    allergies: [String],             // ["Penicillin", "Shellfish"]
    chronicDiseases: [String],       // ["Diabetes", "Hypertension"]
    medications: [
      {
        _id: ObjectId,
        name: String,                // "Metformin"
        dosage: String,              // "500mg"
        frequency: String,           // "2x daily" | "Once daily"
        reason: String,              // "Diabetes Type 2"
        startDate: Date,
        endDate: Date                // Null if ongoing
      }
    ],
    surgeries: [
      {
        name: String,                // "Appendectomy"
        year: Number,                // 2018
        notes: String
      }
    ],
    familyHistory: [String]          // ["Diabetes (father)", "Cancer (mother)"]
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,                    // Required
    relation: String,                // "Father", "Spouse", etc
    phone: String,                   // +91XXXXXXXXXX
    address: String                  // Optional
  },
  
  // User Preferences
  preferences: {
    languagePreference: String,      // "en" | "hi" | "other"
    communicationChannel: String,    // "email" | "sms" | "both"
    notificationsEnabled: Boolean,
    marketingEmails: Boolean,
    whatsappNotifications: Boolean
  },
  
  // Account & Security
  role: String,                      // "user" | "family-member" | "admin"
  accountStatus: String,             // "active" | "inactive" | "suspended"
  twoFactorEnabled: Boolean,
  loginHistory: [
    {
      timestamp: Date,
      device: String,                // "Chrome on Windows"
      ip: String,
      location: String               // "Delhi, India"
    }
  ],
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

### Profile UI Sections

#### Section 1: Personal Information
```
┌───────────────────────────────────┐
│ PERSONAL INFORMATION              │
├───────────────────────────────────┤
│ First Name: Raj              [Edit]│
│ Last Name: Kumar                   │
│ Date of Birth: 1990-05-15          │
│ Gender: Male                       │
│ Blood Type: O+                     │
└───────────────────────────────────┘

In Edit Mode:
┌───────────────────────────────────┐
│ First Name: [Raj________]         │
│ Last Name: [Kumar_______]         │
│ DOB: [1990-05-15]                 │
│ Gender: [Male ▼]                  │
│ Blood: [O+ ▼]                     │
│         [Save] [Cancel]           │
└───────────────────────────────────┘
```

#### Section 2: Family Details (NEW) ★
```
┌────────────────────────────────────┐
│ FAMILY DETAILS                     │
├────────────────────────────────────┤
│ Spouse: Priya Kumar         [Edit] [Remove]
│   DOB: 1992-03-20                  │
│   Blood: B+                        │
│   Status: Linked ★ (Has Account)   │
│                                    │
│ Child: Aarya Kumar          [Edit] [Remove]
│   DOB: 2015-06-15                  │
│   Blood: AB+                       │
│   Status: Unlinked (Invite)        │
│                                    │
│         [+ Add Family Member]      │
└────────────────────────────────────┘

Add Family Member Modal:
┌────────────────────────────────────┐
│ ADD FAMILY MEMBER                  │
├────────────────────────────────────┤
│ Relation: [Spouse ▼]               │
│ First Name: [__________]           │
│ Last Name: [__________]            │
│ DOB: [YYYY-MM-DD]                  │
│ Gender: [Male ▼]                   │
│ Blood Type: [O+ ▼]                 │
│ Medical Conditions: [________...]  │
│                                    │
│           [Save] [Cancel]          │
└────────────────────────────────────┘
```

#### Section 3: Addresses
```
┌─────────────────────────────────────┐
│ ADDRESSES & DELIVERY                │
├─────────────────────────────────────┤
│ ★ Home Address (Default)    [Edit] │
│   123 Main Street                   │
│   Delhi, Delhi 110001               │
│   [Make Default] [Remove]           │
│                                     │
│ Work Address                [Edit]  │
│   456 Office Plaza                  │
│   Delhi, Delhi 110002               │
│   [Make Default] [Remove]           │
│                                     │
│          [+ Add New Address]        │
└─────────────────────────────────────┘
```

#### Section 4: Medical History
```
┌───────────────────────────────────┐
│ MEDICAL HISTORY                   │
├───────────────────────────────────┤
│ Allergies:                   [Edit]│
│ • Penicillin                       │
│ • Shellfish                       │
│                                   │
│ Chronic Diseases:            [Edit]│
│ • Diabetes Type 2                  │
│ • Hypertension                    │
│                                   │
│ Current Medications:         [Edit]│
│ • Metformin 500mg, 2x daily        │
│ • Aspirin 100mg, 1x daily          │
│                                   │
│ Past Surgeries:              [Edit]│
│ • Appendectomy (2018)              │
│                                   │
│ Family History:              [Edit]│
│ • Diabetes (father)                │
│ • Cancer (mother)                 │
└───────────────────────────────────┘
```

### API Endpoints

#### GET /api/users/profile
```
Request:  GET /api/users/profile
Headers:  Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "usr-001",
      "personalInfo": {
        "firstName": "Raj",
        "lastName": "Kumar",
        "dateOfBirth": "1990-05-15",
        "gender": "M",
        "bloodType": "O+"
      },
      "familyDetails": [
        {
          "id": "fam-001",
          "relation": "spouse",
          "firstName": "Priya",
          "lastName": "Kumar",
          "dateOfBirth": "1992-03-20",
          "gender": "F",
          "bloodType": "B+",
          "accountStatus": "linked",
          "userId": "usr-002"
        }
      ],
      "addresses": [
        {
          "id": "addr-001",
          "type": "home",
          "street": "123 Main St",
          "city": "Delhi",
          "state": "Delhi",
          "postalCode": "110001",
          "isDefault": true
        }
      ],
      "medicalHistory": {
        "allergies": ["Penicillin", "Shellfish"],
        "chronicDiseases": ["Diabetes"],
        "medications": [
          {
            "id": "med-001",
            "name": "Metformin",
            "dosage": "500mg",
            "frequency": "2x daily",
            "reason": "Diabetes Type 2"
          }
        ]
      },
      "emergencyContact": {
        "name": "Rajesh Kumar",
        "relation": "Father",
        "phone": "+919876543210"
      }
    }
  }
}
```

#### PUT /api/users/profile
```
Request:  PUT /api/users/profile
Body: {
  "personalInfo": {
    "firstName": "Raj",
    "lastName": "Kumar",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "bloodType": "O+"
  },
  "medicalHistory": {
    "allergies": ["Penicillin", "Shellfish", "Nuts"]
  }
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

#### POST /api/users/family-members
```
Request:  POST /api/users/family-members
Body: {
  "relation": "spouse",
  "firstName": "Priya",
  "lastName": "Kumar",
  "dateOfBirth": "1992-03-20",
  "gender": "F",
  "bloodType": "B+",
  "medicalConditions": ["Asthma"]
}

Response:
{
  "success": true,
  "data": {
    "familyMember": {
      "id": "fam-001",
      "relation": "spouse",
      "firstName": "Priya",
      "accountStatus": "unlinked",
      "invitationToken": "inv_xyz123",
      "invitationExpiresAt": "2025-02-20T12:00:00Z"
    }
  }
}
```

#### PUT /api/users/family-members/{memberId}
```
Request:  PUT /api/users/family-members/fam-001
Body: {
  "bloodType": "B-",
  "medicalConditions": ["Asthma", "Allergies"]
}

Response:
{
  "success": true,
  "data": {
    "familyMember": { ... }
  }
}
```

#### DELETE /api/users/family-members/{memberId}
```
Request:  DELETE /api/users/family-members/fam-001

Response:
{
  "success": true,
  "message": "Family member removed successfully"
}
```

#### POST /api/users/addresses
```
Request:  POST /api/users/addresses
Body: {
  "type": "home",
  "street": "456 Oak Ave",
  "city": "Bangalore",
  "state": "Karnataka",
  "postalCode": "560001",
  "country": "India",
  "isDefault": false
}

Response:
{
  "success": true,
  "data": {
    "address": {
      "id": "addr-002",
      "type": "home",
      "street": "456 Oak Ave",
      "city": "Bangalore",
      "state": "Karnataka",
      "postalCode": "560001",
      "isDefault": false
    }
  }
}
```

### Form Validation Rules

| Field | Rules |
|-------|-------|
| firstName, lastName | 2-50 chars, letters only, trim |
| dateOfBirth | Must be 18+ years old, valid date |
| phone | +91XXXXXXXXXX (10 digits), unique |
| email | Valid format, unique in system |
| postalCode | 6 digits, valid Indian code |
| bloodType | O+, O-, A+, A-, B+, B-, AB+, AB- |
| gender | M \| F \| Other |
| relation | spouse \| child \| parent \| sibling \| other |
| street | 5-100 chars, alphanumeric + symbols |
| city | 2-50 chars, letters + spaces |

### Edit Mode Behavior

**Entering Edit Mode:**
1. Click [Edit] button on section
2. Fields become editable (inputs, dropdowns)
3. Clear/original value shown in placeholder
4. [Save] & [Cancel] buttons appear

**Validation on Save:**
1. Client-side validation runs first
2. Errors highlighted inline (red border, error message)
3. Submit to API with validation errors
4. Server validates, returns 400 for errors
5. On success: Show "Saved" toast, exit edit mode
6. On error: Show error message, remain in edit mode

### Edge Cases & Constraints

- ✓ Cannot delete primary address if only one exists
- ✓ Family member with linked account: Cannot delete, only unlink
- ✓ Email/phone must be unique, show error if duplicate
- ✓ Changing email/phone: Requires reverification
- ✓ Medical history optional except age-appropriate sections
- ✓ Family members inherit primary address if none specified
- ✓ Max 10 family members per account
- ✓ Family member DOB must be before parent DOB

---

## 6. PROBLEM 5: SECONDARY PAGES REDESIGN

### Objective & Scope

Redesign and implement: My Reports, My Bookings, Health Insights, Settings, and Promotions pages. Create unified data model supporting report views, booking history, personal health metrics, and user preferences.

### Page 1: My Reports

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ MY REPORTS (25 Reports Total)                        │
├──────────────────────────────────────────────────────┤
│ Filters:                                             │
│ [Date Range ▼] [Package Name ▼] [Status ▼]          │
│                                  [Clear Filters ×]   │
├──────────────────────────────────────────────────────┤
│ ✓ Men's Cardiac Gold         | Jan 15, 2025         │
│   Status: Ready              | Download PDF          │
│   Package: Cardiac Risk      | Share | Print         │
│                              | View Details          │
├──────────────────────────────────────────────────────┤
│ ⏳ Women's Health Gold        | Jan 10, 2025         │
│   Status: Processing         | Est. Ready: Jan 12   │
│   Package: Complete Health   | Estimated Time       │
├──────────────────────────────────────────────────────┤
│ No reports yet? Book a test to get started           │
└──────────────────────────────────────────────────────┘
```

**Data Schema - Reports:**

```javascript
// reports collection
{
  _id: ObjectId,
  userId: ObjectId,
  bookingId: ObjectId,               // Link to booking
  packageId: ObjectId,               // Package booked
  testIds: [ObjectId],               // Tests in package
  
  // Status tracking
  reportStatus: String,              // "pending" | "processing" | "ready" | "shared"
  generatedAt: Date,
  estimatedReadyAt: Date,
  
  // Report content
  reportData: {
    parameters: [
      {
        parameterId: ObjectId,
        parameterName: String,
        parameterCode: String,
        value: String,                // Actual measured value
        unit: String,
        normalRange: String,
        normalRangeMin: Number,
        normalRangeMax: Number,
        flagged: Boolean,             // Outside normal range
        interpretation: String,       // "High" | "Normal" | "Low"
        criticalFlag: Boolean         // Requires immediate attention
      }
    ],
    summary: String,                 // Doctor's summary
    recommendations: [String],       // Doctor recommendations
    nextSteps: [String]             // Follow-up suggestions
  },
  
  // Report file
  reportFile: {
    url: String,                     // S3 signed URL
    fileName: String,
    generatedAt: Date,
    expiresAt: Date                  // Link expiration (90 days)
  },
  
  // Sharing
  sharedWith: [
    {
      email: String,
      sharedAt: Date,
      accessType: String             // "view" | "download"
    }
  ],
  
  createdAt: Date,
  updatedAt: Date
}
```

**API:**

```
GET /api/users/reports?status=ready&limit=10&offset=0
GET /api/users/reports/{reportId}
GET /api/users/reports/{reportId}/pdf
POST /api/users/reports/{reportId}/share
  Body: { email, accessType: "view" | "download" }
```

### Page 2: My Bookings

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ MY BOOKINGS (5 Confirmed, 2 Completed)               │
├──────────────────────────────────────────────────────┤
│ Filters: [Status ▼] [Date Range ▼]  [Clear ×]       │
├──────────────────────────────────────────────────────┤
│ UPCOMING                                             │
│ ────────────────────────────────────────────────────│
│ Men's Cardiac Gold    |  Feb 01, 2025, 09:00 AM     │
│ Status: Confirmed    |  Delhi South Collection      │
│ Center: Delhi South  |  [Directions] [Call]         │
│                      |  [Reschedule] [Cancel]       │
│                                                      │
│ Women's Health Gold  |  Feb 05, 2025, 02:00 PM     │
│ Status: Confirmed    |  Bangalore Central           │
├──────────────────────────────────────────────────────┤
│ COMPLETED                                            │
│ ────────────────────────────────────────────────────│
│ Men's Thyroid Silver  |  Jan 12, 2025               │
│ Status: Completed    |  [View Report] [Reorder]    │
│                      |  Report Ready                │
└──────────────────────────────────────────────────────┘
```

**Data Schema - Bookings:**

```javascript
// bookings collection
{
  _id: ObjectId,
  userId: ObjectId,
  packageId: ObjectId,
  orderId: ObjectId,
  
  // Scheduling
  bookedDate: Date,                  // When user booked
  scheduledDate: Date,               // When sample collection scheduled
  scheduledTime: String,             // "09:00 AM"
  
  // Status
  bookingStatus: String,             // "confirmed" | "completed" | "cancelled"
  sampleCollectionStatus: String,    // "scheduled" | "collected" | "failed"
  
  // Collection center
  collectionCenter: {
    centerId: ObjectId,
    name: String,
    address: String,
    city: String,
    state: String,
    phone: String,
    directions: String               // Google Maps URL
  },
  
  // Family
  familyMemberId: ObjectId,          // If booking for family member
  
  // Report
  reportReadyAt: Date,
  reportStatus: String,              // "pending" | "ready"
  
  // Cancellation
  cancellationReason: String,
  refundStatus: String,              // "pending" | "processed"
  refundAmount: Number,              // In paise
  
  createdAt: Date,
  updatedAt: Date
}
```

**API:**

```
POST /api/bookings
  Body: { packageId, familyMemberId, preferredDate, centerId }
GET /api/users/bookings?status=confirmed
GET /api/users/bookings/{bookingId}
PUT /api/users/bookings/{bookingId}/reschedule
  Body: { newDate, newTime }
DELETE /api/users/bookings/{bookingId}
  Body: { reason }
```

### Page 3: Health Insights

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ HEALTH INSIGHTS                                      │
├──────────────────────────────────────────────────────┤
│ Filters: [Metric Type ▼] [Date Range ▼]              │
├──────────────────────────────────────────────────────┤
│ METRICS OVERVIEW                                     │
│ ┌──────────────┬──────────────┬──────────────┐       │
│ │ Total Chol.  │ Blood Sugar  │ Blood Pressure       │
│ │ 220 mg/dL    │ 125 mg/dL    │ 130/85 mmHg         │
│ │ ↑ HIGH       │ → NORMAL     │ ↑ ELEVATED          │
│ └──────────────┴──────────────┴──────────────┘       │
├──────────────────────────────────────────────────────┤
│ TRENDS (Last 6 months)                              │
│ Total Cholesterol                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │              ╱╲                                 │ │
│ │         ╱╲╱  ╲                                │ │
│ │    ╱╲╱        ╲╱╲                            │ │
│ │   ╱              ╲                           │ │
│ │  ╱                ╲╱                         │ │
│ └─────────────────────────────────────────────────┘ │
│ Jan  Feb  Mar  Apr  May  Jun (Values: 200→220→210) │
│                                                     │
│ [Book Lipid Test]  [View Details]                   │
├──────────────────────────────────────────────────────┤
│ RECOMMENDATIONS                                      │
│ • Blood sugar trending up - consider diet change    │
│ • Cholesterol in high range - book cardiac package  │
│ • Blood pressure stable but monitor                 │
└──────────────────────────────────────────────────────┘
```

**Data Schema - Health Metrics:**

```javascript
// health_metrics collection
{
  _id: ObjectId,
  userId: ObjectId,
  metricType: String,                // "cholesterol" | "blood-sugar" | etc
  metricCode: String,                // "CHOL" | "BS" | "BP"
  metricName: String,                // "Total Cholesterol"
  unit: String,                      // "mg/dL"
  
  // Measurements over time
  measurements: [
    {
      reportId: ObjectId,
      value: Number,
      date: Date,
      normalRange: String,
      normalRangeMin: Number,
      normalRangeMax: Number,
      flagged: Boolean,
      trend: String                  // "high" | "normal" | "low"
    }
  ],
  
  // Analysis
  lastMeasuredDate: Date,
  lastMeasuredValue: Number,
  riskLevel: String,                 // "high" | "medium" | "low"
  trend: String,                     // "↑ increasing" | "↓ decreasing" | "→ stable"
  recommendations: [String],
  
  createdAt: Date,
  updatedAt: Date
}
```

**API:**

```
GET /api/users/health-metrics?startDate=...&endDate=...&metricType=cholesterol
GET /api/users/health-metrics/{metricId}
GET /api/users/health-insights (Aggregated view)
```

### Page 4: Settings

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ SETTINGS                                             │
├──────────────────────────────────────────────────────┤
│ ACCOUNT SETTINGS                               [Edit]│
│ • Email: raj.kumar@example.com                       │
│ • Phone: +919876543210                               │
│ • Last Password Changed: 2024-12-15                  │
│ • Two-Factor Auth: Disabled [Enable]                │
├──────────────────────────────────────────────────────┤
│ NOTIFICATION PREFERENCES                       [Edit]│
│ ✓ Email Notifications                               │
│ ✓ SMS Notifications                                 │
│ ✓ Report Ready Alerts                               │
│ ✓ Appointment Reminders (24hr before)               │
│ ✗ Marketing & Promotional Emails                    │
├──────────────────────────────────────────────────────┤
│ APPEARANCE & LANGUAGE                          [Edit]│
│ Theme: Light / Dark / Auto ▼                         │
│ Language: English ▼                                  │
│ Units: Metric (kg, cm) ▼                            │
├──────────────────────────────────────────────────────┤
│ DATA & PRIVACY                                  [Edit]│
│ ✓ Share reports with doctors                        │
│ ✓ Share with family members                         │
│ Data Retention: 3 years [Change]                    │
│ [Download My Data] [Delete Account]                 │
├──────────────────────────────────────────────────────┤
│ HELP & SUPPORT                                       │
│ [FAQs] [Contact Support] [Send Feedback]             │
└──────────────────────────────────────────────────────┘
```

**Settings Schema:**

```javascript
// UserSettings (embedded in users collection)
{
  notifications: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    pushNotifications: Boolean,
    reportReady: Boolean,
    bookingReminder: Boolean,        // Hours before appointment
    healthAlerts: Boolean
  },
  privacy: {
    shareWithDoctor: Boolean,
    shareWithFamily: Boolean,
    dataRetentionDays: Number        // 365, 1095 (3 years), etc
  },
  appearance: {
    theme: String,                   // "light" | "dark" | "auto"
    language: String,                // "en" | "hi"
    units: String                    // "metric" | "imperial"
  }
}
```

### Page 5: Promotions & Offers

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│ PROMOTIONS & SPECIAL OFFERS                          │
├──────────────────────────────────────────────────────┤
│ FEATURED OFFERS                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [Image] Get 40% off on All Gold Packages        │ │
│ │         Valid until: Feb 28, 2025               │ │
│ │         Min Order: ₹1000                        │ │
│ │         [Use Code: GOLD40]  [Shop Now]          │ │
│ └─────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│ OFFERS BY CATEGORY                                   │
│ ┌──────────┬──────────┬──────────┬──────────┐       │
│ │ Cardiac  │ Wellness │ Fertility │ Diabetes │       │
│ │ 30% off  │ 25% off  │ 20% off  │ 35% off  │       │
│ │ Valid    │ Valid    │ Valid    │ Valid    │       │
│ │ until    │ until    │ until    │ until    │       │
│ │ Feb 14   │ Feb 28   │ Mar 01   │ Feb 21   │       │
│ └──────────┴──────────┴──────────┴──────────┘       │
├──────────────────────────────────────────────────────┤
│ MY COUPONS                                           │
│ ✓ FAMILY20 - 20% off family packages                 │
│   Applied: 2 times | Expires: Mar 15, 2025           │
│                                                      │
│ ✓ SENIOR30 - 30% off senior health packages          │
│   Applied: 0 times | Expires: Apr 01, 2025           │
└──────────────────────────────────────────────────────┘
```

**Promotions Schema:**

```javascript
// promotions collection
{
  _id: ObjectId,
  code: String,                      // Promo code (unique)
  title: String,
  description: String,
  
  // Discount
  discountType: String,              // "percentage" | "fixed"
  discountValue: Number,             // 40 (%) or 500 (₹)
  minOrderValue: Number,             // Minimum basket amount
  maxDiscountAmount: Number,         // Cap for percentage discounts
  
  // Validity
  validFrom: Date,
  validUntil: Date,
  
  // Restrictions
  applicablePackages: [ObjectId],    // Empty = all packages
  applicableCategories: [String],    // ["men", "women", etc]
  usageLimit: Number,                // Total uses allowed
  usageCount: Number,                // Current usage count
  userLimit: Number,                 // Uses per user
  
  // Content
  imageUrl: String,
  bannerText: String,
  
  // Status
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Unified Navigation Flow

**Profile Dropdown Menu:**

```
┌──────────────────────────────┐
│ My Profile         [icon]    │
│ My Bookings        [icon]    │
│ My Reports         [icon]    │
│ Health Insights    [icon]    │
│ Settings           [icon]    │
│ ─────────────────────────────│
│ Logout             [icon]    │
└──────────────────────────────┘

User Flow:
My Profile       → /profile
  ├─ Personal Info (EDIT)
  ├─ Family Details (CRUD)
  ├─ Addresses (CRUD)
  └─ Medical History (EDIT)

My Bookings      → /bookings (LIST → DETAIL)
  ├─ Upcoming (RESCHEDULE, CANCEL)
  └─ Completed (VIEW REPORT, REORDER)

My Reports       → /reports (LIST → DETAIL)
  ├─ Filter by status, date, package
  ├─ Download PDF
  ├─ Share report
  └─ Print

Health Insights  → /health-insights (TRENDS)
  ├─ Metric trends over time
  ├─ Risk assessment
  └─ Recommendations

Settings         → /settings (EDIT)
  ├─ Account
  ├─ Notifications
  ├─ Privacy
  ├─ Appearance
  └─ Help

Logout           → Sign out, clear tokens, redirect to login
```

---

## 7. CONSOLIDATED DATA SCHEMA PROPOSAL

### Database Collections Overview

```
9 Core Collections:
1. users              (User profiles, auth, medical history)
2. tests              (Individual tests with parameters)
3. test_parameters   (Parameter definitions and ranges)
4. packages          (Health packages, pricing, tiers)
5. bookings          (Test/package bookings, scheduling)
6. reports           (Generated health reports)
7. health_metrics    (Derived health metrics for insights)
8. promotions        (Discount codes and offers)
9. collection_centers (Lab collection locations)
```

### Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      USERS                              │
├─────────────────────────────────────────────────────────┤
│ auth, personalInfo, familyDetails, addresses,           │
│ medicalHistory, emergencyContact, preferences, role     │
└──────────┬──────────────────────┬──────────────────────┘
           │                      │
           ├──→ FAMILY_MEMBERS   └──→ BOOKINGS
           │   (embedded)             (collection)
           │                          │
           │                          ├──→ REPORTS
           │                          │    └──→ PARAMETERS
           │                          │        (in report)
           │                          │
           │                          └──→ HEALTH_METRICS
           │                               (derived from reports)
           │
           └──→ SETTINGS (embedded)


┌──────────────────────────────┐
│         PACKAGES             │
├──────────────────────────────┤
│ name, tier, price, tests     │
│ includedTests[ ],            │
│ subPackages, benefits        │
└──┬──────────────────────────┘
   │
   ├──→ TESTS (many-to-many)
   │    ├──→ TEST_PARAMETERS
   │    │    └──→ NORMAL_RANGES
   │    │         (age/gender specific)
   │    │
   │    └──→ RELATED_TESTS
   │
   └──→ PROMOTIONS (applicable)
        └──→ COLLECTION_CENTERS (for booking)
```

### Complete Schema Examples

#### Users Collection (Full Document)

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  
  // Authentication
  "auth": {
    "email": "raj.kumar@example.com",
    "phone": "+919876543210",
    "passwordHash": "bcrypt_hash_...",
    "emailVerified": true,
    "phoneVerified": true,
    "lastPasswordChange": ISODate("2024-12-15T00:00:00Z"),
    "twoFactorEnabled": false
  },
  
  // Personal Information
  "personalInfo": {
    "firstName": "Raj",
    "lastName": "Kumar",
    "dateOfBirth": ISODate("1990-05-15"),
    "gender": "M",
    "bloodType": "O+",
    "maritalStatus": "Married"
  },
  
  // Contact
  "contactInfo": {
    "primaryPhone": "+919876543210",
    "secondaryPhone": "+919987654321",
    "alternateEmail": "raj.personal@gmail.com"
  },
  
  // Addresses
  "addresses": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439014"),
      "type": "home",
      "street": "123 Main Street",
      "city": "Delhi",
      "state": "Delhi",
      "postalCode": "110001",
      "country": "India",
      "isDefault": true,
      "createdAt": ISODate("2024-06-01T00:00:00Z")
    }
  ],
  
  // Family Members
  "familyDetails": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439012"),
      "relation": "spouse",
      "firstName": "Priya",
      "lastName": "Kumar",
      "dateOfBirth": ISODate("1992-03-20"),
      "gender": "F",
      "bloodType": "B+",
      "medicalConditions": ["Asthma"],
      "allergies": ["Aspirin"],
      "accountStatus": "linked",
      "userId": ObjectId("507f1f77bcf86cd799439013"),
      "createdAt": ISODate("2024-01-01T00:00:00Z")
    }
  ],
  
  // Medical History
  "medicalHistory": {
    "allergies": ["Penicillin", "Shellfish"],
    "chronicDiseases": ["Diabetes Type 2"],
    "medications": [
      {
        "_id": ObjectId("507f1f77bcf86cd799439015"),
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "2x daily",
        "reason": "Diabetes Type 2",
        "startDate": ISODate("2020-03-15"),
        "endDate": null
      }
    ],
    "surgeries": [
      {
        "name": "Appendectomy",
        "year": 2018,
        "notes": "Uncomplicated"
      }
    ],
    "familyHistory": ["Diabetes (father)", "Hypertension (mother)"]
  },
  
  // Emergency Contact
  "emergencyContact": {
    "name": "Rajesh Kumar",
    "relation": "Father",
    "phone": "+919999999999",
    "address": "..."
  },
  
  // Preferences
  "preferences": {
    "languagePreference": "en",
    "communicationChannel": "both",
    "notificationsEnabled": true,
    "marketingEmails": false
  },
  
  // Account Status
  "role": "user",
  "accountStatus": "active",
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2025-01-15T12:00:00Z"),
  "lastLogin": ISODate("2025-01-15T10:30:00Z")
}
```

#### Packages Collection (Full Document)

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439020"),
  
  "name": "Men's Cardiac Gold Package",
  "code": "MEN-CARD-GOLD-001",
  
  // Categorization
  "category": "men",
  "subcategory": "cardiac",
  "tier": "gold",
  
  // Pricing (in paise)
  "basePriceInPaise": 299900,         // ₹2999.00
  "discountPercentage": 40,
  "finalPrice": 179940,               // ₹1799.40
  
  // Metadata
  "testCount": 45,
  "reportTurnaroundHours": 48,
  "fastingRequired": "8hr",
  "sampleType": "Blood",
  
  // Content
  "description": "Complete cardiac risk assessment for adult males",
  "longDescription": "...",
  
  // Included Tests
  "includedTests": [
    {
      "testId": ObjectId("507f1f77bcf86cd799439030"),
      "testName": "Lipid Profile Advanced",
      "testCode": "LIPID-ADV-001",
      "parametersIncluded": ["total-cholesterol", "ldl", "hdl", "triglycerides"]
    },
    {
      "testId": ObjectId("507f1f77bcf86cd799439031"),
      "testName": "hs-CRP",
      "testCode": "HS-CRP-001",
      "parametersIncluded": ["hs-crp"]
    }
  ],
  
  "includedImaging": ["ecg", "2d-echo"],
  
  // Sub-packages (Tier Hierarchy)
  "subPackages": [
    ObjectId("507f1f77bcf86cd799439021")  // Silver package ID
  ],
  
  "benefits": [
    "1 Doctor Consultation",
    "Personalized Diet Plan",
    "24-48 Hour Report"
  ],
  
  "faq": [
    {
      "question": "How long to get results?",
      "answer": "Typically 24-48 hours...",
      "order": 1
    }
  ],
  
  // Demographics
  "ageGroup": "adult",
  "gender": "male",
  
  // Metadata
  "metadata": {
    "insuranceEligible": true,
    "corporateEligible": true,
    "familyAccountEligible": true,
    "homeCollectionAvailable": true
  },
  
  "active": true,
  "createdAt": ISODate("2024-06-01T00:00:00Z"),
  "updatedAt": ISODate("2025-01-15T00:00:00Z")
}
```

#### Tests Collection (Full Document)

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439030"),
  
  "name": "Lipid Profile Advanced",
  "code": "LIPID-ADV-001",
  "organSystem": "heart",
  
  "shortDescription": "Comprehensive lipid assessment for cardiac risk",
  "longDescription": "...",
  
  "preparationInstructions": "Fasting of 8 hours required. Avoid caffeine and fatty foods.",
  "reportTurnaroundHours": 24,
  "sampleType": "Blood",
  
  // Parameters
  "parameters": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439040"),
      "parameterCode": "CHOL",
      "parameterName": "Total Cholesterol",
      "unit": "mg/dL",
      "normalRangeMin": 150,
      "normalRangeMax": 200,
      "normalRangeText": "150-200 mg/dL",
      "fastingRequired": true,
      "interpretation": "> 200 mg/dL indicates elevated risk",
      "criticalRange": {
        "min": 300,
        "max": 999,
        "alertMessage": "CRITICAL - Seek immediate medical attention"
      }
    },
    {
      "_id": ObjectId("507f1f77bcf86cd799439041"),
      "parameterCode": "LDL",
      "parameterName": "LDL Cholesterol",
      "unit": "mg/dL",
      "normalRangeMin": 0,
      "normalRangeMax": 100,
      "normalRangeText": "0-100 mg/dL",
      "fastingRequired": true
    }
  ],
  
  // Relationships
  "includedInPackages": [
    {
      "packageId": ObjectId("507f1f77bcf86cd799439020"),
      "tier": "gold"
    }
  ],
  
  "relatedTests": [
    {
      "testId": ObjectId("507f1f77bcf86cd799439031"),
      "reason": "Inflammation marker in cardiac risk assessment"
    }
  ],
  
  "faq": [
    {
      "question": "How long to get results?",
      "answer": "Typically 24 hours after sample collection.",
      "order": 1
    }
  ],
  
  // Metadata
  "metadata": {
    "ageGroupRestrictions": "18+",
    "genderRestrictions": "both",
    "specialPrep": false,
    "homeCollectionAvailable": true
  },
  
  "active": true,
  "createdAt": ISODate("2024-05-01T00:00:00Z"),
  "updatedAt": ISODate("2025-01-15T00:00:00Z")
}
```

---

## 8. API ENDPOINT SPECIFICATIONS

### Authentication Endpoints

```
POST /api/auth/register
  Body: { email, phone, password, firstName, lastName, dateOfBirth }
  Response: { token, user: { id, email, role } }

POST /api/auth/login
  Body: { email, password }
  Response: { token, refreshToken, user: { id, email, role } }

POST /api/auth/logout
  Headers: Authorization: Bearer {token}
  Response: { success: true }

POST /api/auth/refresh-token
  Body: { refreshToken }
  Response: { token }

POST /api/auth/verify-email
  Body: { token }
  Response: { success: true }

POST /api/auth/verify-phone
  Body: { otp }
  Response: { success: true }
```

### Package Endpoints (Full Suite)

```
GET /api/packages
  Query: ?category=men&tier=gold&sort=price&limit=20&offset=0
  Response: { packages: [...], total: 25, availableTiers: [...] }

GET /api/packages/{id}
  Response: { package: { id, name, tier, price, ... } }

GET /api/packages/{id}/details
  Response: { package: { ..., includedTests: [...], subPackages: [...] } }

GET /api/packages/category/{category}
  Query: ?tier=gold&sort=price
  Response: { packages: [...], category: "men", tiers: [...] }

GET /api/packages/compare
  Query: ?ids=pkg-id-1,pkg-id-2,pkg-id-3
  Response: { packages: [...], differences: { ... } }

POST /api/packages (ADMIN)
  Body: { name, category, tier, price, includedTests, ... }
  Response: { package: { id, ... } }

PUT /api/packages/{id} (ADMIN)
  Body: { name, price, ... }
  Response: { package: { ... } }

DELETE /api/packages/{id} (ADMIN)
  Response: { success: true }
```

### Test Endpoints (Full Suite)

```
GET /api/tests
  Query: ?organSystem=heart&search=lipid&limit=10
  Response: { tests: [...], total: 45 }

GET /api/tests/{id}
  Response: { test: { id, name, parameters: [...], packages: [...] } }

GET /api/tests/{id}/parameters
  Response: { parameters: [...] }

GET /api/tests/{id}/packages
  Response: { packages: [...] }

GET /api/screenings
  Query: ?category=heart&type=expert-curated
  Response: { screenings: [...], categories: [...] }

POST /api/tests (ADMIN)
  Body: { name, organSystem, parameters: [...] }
  Response: { test: { id, ... } }

PUT /api/tests/{id} (ADMIN)
  Body: { name, description, parameters: [...] }
  Response: { test: { ... } }
```

### User Profile Endpoints

```
GET /api/users/profile
  Headers: Authorization: Bearer {token}
  Response: { user: { personalInfo, familyDetails, addresses, ... } }

PUT /api/users/profile
  Body: { personalInfo: { firstName, lastName, ... } }
  Response: { user: { ... } }

POST /api/users/family-members
  Body: { relation, firstName, lastName, dateOfBirth, ... }
  Response: { familyMember: { id, ... } }

PUT /api/users/family-members/{id}
  Body: { bloodType, medicalConditions, ... }
  Response: { familyMember: { ... } }

DELETE /api/users/family-members/{id}
  Response: { success: true }

POST /api/users/addresses
  Body: { type, street, city, postalCode, isDefault }
  Response: { address: { id, ... } }

PUT /api/users/addresses/{id}
  Body: { street, city, ... }
  Response: { address: { ... } }

DELETE /api/users/addresses/{id}
  Response: { success: true }
```

### Booking & Report Endpoints

```
POST /api/bookings
  Body: { packageId, familyMemberId, preferredDate, centerId }
  Response: { booking: { id, status, scheduledDate, ... } }

GET /api/users/bookings
  Query: ?status=confirmed&limit=10&offset=0
  Response: { bookings: [...], total: 5 }

PUT /api/users/bookings/{id}/reschedule
  Body: { newDate, newTime }
  Response: { booking: { scheduledDate, ... } }

DELETE /api/users/bookings/{id}
  Body: { reason }
  Response: { booking: { status: "cancelled", refundStatus, ... } }

GET /api/users/reports
  Query: ?status=ready&startDate=...&endDate=...&limit=10
  Response: { reports: [...], total: 25 }

GET /api/users/reports/{id}
  Response: { report: { parameters: [...], summary, ... } }

GET /api/users/reports/{id}/pdf
  Response: File download (PDF)

POST /api/users/reports/{id}/share
  Body: { email, accessType: "view" | "download" }
  Response: { success: true, sharedWith: [...] }
```

### Settings & Health Endpoints

```
GET /api/users/settings
  Response: { settings: { notifications: {...}, privacy: {...}, ... } }

PUT /api/users/settings
  Body: { notifications: {...}, appearance: {...} }
  Response: { settings: { ... } }

POST /api/users/change-password
  Body: { currentPassword, newPassword }
  Response: { success: true }

GET /api/users/health-metrics
  Query: ?startDate=...&endDate=...&metricType=cholesterol
  Response: { metrics: [...] }

GET /api/users/health-metrics/{id}
  Response: { metric: { measurements: [...], trend: "↑", ... } }

GET /api/promotions
  Query: ?category=men&sort=discount
  Response: { promotions: [...] }

POST /api/promotions/apply
  Body: { code, bookingId }
  Response: { promotion: { discountAmount, ... }, newTotal: 1799 }
```

---

## 9. VALIDATION RULES & EDGE CASES

### Field Validation Rules

| Field | Rules |
|-------|-------|
| **email** | `^[^\s@]+@[^\s@]+\.[^\s@]+$` + unique |
| **phone** | `^\+91\d{10}$` (10 digits) + unique |
| **firstName, lastName** | 2-50 chars, letters only, trim |
| **dateOfBirth** | Must be 18+ years, valid date |
| **postalCode** | 6 digits, valid Indian code |
| **bloodType** | O+, O-, A+, A-, B+, B-, AB+, AB- |
| **gender** | M \| F \| Other |
| **relation** | spouse \| child \| parent \| sibling \| other |
| **price** | >= 50000 paise (₹500 min) |
| **discount** | 0-100 |
| **testCount** | > 0, matches includedTests length |
| **turnaround** | 4-120 hours |
| **normalRangeMin** | < normalRangeMax |

### Data Consistency Rules

- ✓ Booking deletion: Only soft-delete if report generated
- ✓ Test deletion: Prevent if in active packages
- ✓ Package deletion: Prevent if bookings exist
- ✓ Family member with account: Cannot delete (only unlink)
- ✓ Default address: At least one must exist
- ✓ Address with booking: Cannot delete

### Common Edge Cases & Solutions

| Case | Scenario | Solution |
|------|----------|----------|
| **Concurrent Booking** | Two users book same package simultaneously | Use database transactions or queue-based booking system |
| **Price Change** | Price changes before checkout | Show confirmation with old vs new price |
| **Test Removed** | Test becomes unavailable before report | Notify user, skip in report, offer refund |
| **Report Failure** | Sample degradation during analysis | Mark as "sample-failed", offer re-collection |
| **Family Member Linking** | Family member creates own account later | Show "Link Account" option to prevent duplicates |
| **Invalid URL** | User navigates to /test/{invalidId} | Show graceful 404, redirect to /screenings |
| **Rapid Clicks** | User clicks card multiple times | Debounce (300ms) to prevent multiple navigations |
| **Missing Address** | User books without default address | Require selection before checkout |

---

## 10. PHASED DELIVERABLES & TIMELINE

### Phase 1: Foundation (Weeks 1-4)

**Week 1:**
- Finalize data schema, get stakeholder approval
- Set up MongoDB collections and indexes
- Create API project structure
- Implement auth endpoints (register, login, logout)
- Set up JWT token management

**Week 2:**
- Implement user profile CRUD endpoints
- Implement package listing endpoints
- Implement test listing endpoints
- Create Postman/Swagger documentation

**Week 3:**
- Implement booking endpoints
- Implement report endpoints
- Add validation layer to all endpoints
- Set up error handling middleware

**Week 4:**
- Integration testing of Phase 1 endpoints
- Load testing (1000 concurrent users)
- Security audit
- Begin frontend component library

### Phase 2: Frontend Core Pages (Weeks 5-8)

**Week 5:**
- Build Expert-Curated Screenings page
- Implement screening card component
- Create filter/category system
- Wire up to API, test navigation

**Week 6:**
- Build package listing pages
- Create package card component
- Implement package details page
- Add comparison functionality

**Week 7:**
- Build test detail pages
- Create parameters table component
- Implement related tests carousel
- Add FAQ accordion

**Week 8:**
- Integration testing: Screenings → Packages → Tests
- Responsive design validation
- Performance optimization (lazy loading, caching)
- Accessibility audit (WCAG 2.1 AA)

### Phase 3: Profile & Secondary Pages (Weeks 9-12)

**Week 9:**
- Build profile page redesign
- Create personal info section
- Implement family details section
- Implement address management

**Week 10:**
- Build My Reports page
- Build My Bookings page
- Implement Health Insights page
- Create Settings page sections

**Week 11:**
- Build Promotions page
- Implement coupon functionality
- Implement secondary page navigation
- Add profile dropdown menu

**Week 12:**
- End-to-end testing of all flows
- Mobile optimization
- Accessibility final audit
- Performance optimization & caching

### Phase 4: QA & Launch (Weeks 13-16)

**Week 13:**
- Comprehensive regression testing
- Load testing (5000 concurrent users)
- Security penetration testing
- Cross-browser testing

**Week 14:**
- Performance monitoring setup
- Data migration dry-run
- Staff training
- Create user documentation

**Week 15:**
- Production deployment (staging first)
- Monitor errors & metrics
- Hotfix critical issues
- Gradual traffic ramp-up (10% → 50% → 100%)

**Week 16:**
- Full production launch
- Post-launch monitoring
- Collect user feedback
- Plan Phase 5 enhancements

### Success Criteria

**Phase 1:** ✓ All endpoints tested, 100% Postman pass rate  
**Phase 2:** ✓ Card click opens correct test, zero filter cross-contamination  
**Phase 3:** ✓ Profile editing works, family CRUD functional  
**Phase 4:** ✓ 99.9% uptime, <2s page load, WCAG 2.1 AA compliance

---

## 11. TECH STACK & ARCHITECTURE

### Frontend Stack
- **Framework:** React 18+
- **State Management:** Redux Toolkit
- **Routing:** React Router v6+
- **UI Components:** Tailwind CSS + custom components
- **HTTP:** Axios + React Query
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Testing:** Jest + React Testing Library
- **Build:** Vite

### Backend Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Database:** MongoDB 6.x + Mongoose
- **Auth:** JWT + bcryptjs
- **Validation:** Zod / Joi
- **Caching:** Redis 6.x
- **Storage:** AWS S3
- **Email:** SendGrid
- **SMS:** Twilio
- **API Docs:** Swagger/OpenAPI 3.0
- **Testing:** Jest + Supertest

### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Code Quality:** SonarQube + ESLint
- **Container:** Docker
- **Orchestration:** Kubernetes
- **Monitoring:** Datadog / New Relic
- **Logging:** ELK Stack
- **CDN:** CloudFlare

### Security Measures
- ✓ HTTPS/TLS 1.3
- ✓ Rate limiting: 100 req/min per user
- ✓ Parameterized queries (Mongoose)
- ✓ Input sanitization
- ✓ Content Security Policy
- ✓ bcrypt (12+ salt rounds)
- ✓ 2FA support (TOTP/SMS)
- ✓ Secrets management (AWS Secrets Manager)
- ✓ AES-256 encryption for PII
- ✓ Audit logs for admin actions

---

## 12. DATABASE MIGRATION STRATEGY

### Versioning Convention

Migration files: `YYYYMMDD_HHmmss_description.js`

Each migration has:
- `exports.up()`: Changes to apply
- `exports.down()`: Rollback logic

### Migration Steps (From Existing System)

**Step 1: Export & Validate**
- Backup current database
- Export tests & packages to JSON
- Validate data quality

**Step 2: Transform Data**
- Map old schema → new schema
- Generate missing fields
- Normalize pricing

**Step 3: Dry Run**
- Run on staging database
- Validate record counts
- Check data integrity

**Step 4: Production Migration**
- Schedule low-traffic window
- Run with transaction support
- Verify 30 minutes post-migration

**Step 5: Rollback Plan**
- Keep old database available 7 days
- Run down() migrations if issues
- Restore from backup if needed

### Indexes

```javascript
db.packages.createIndex({ category: 1, tier: 1 })
db.packages.createIndex({ code: 1 }, { unique: true })
db.tests.createIndex({ organSystem: 1 })
db.tests.createIndex({ code: 1 }, { unique: true })
db.bookings.createIndex({ userId: 1, status: 1 })
db.reports.createIndex({ userId: 1, generatedAt: -1 })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true })
```

---

## CONCLUSION & NEXT STEPS

### Implementation Priority

1. **Weeks 1-2:** Finalize schema, set up MongoDB, implement auth
2. **Weeks 3-4:** Implement core API endpoints
3. **Weeks 5-8:** Build frontend for Problems 1-3
4. **Weeks 9-12:** Build profile and secondary pages
5. **Weeks 13-16:** QA, testing, and production launch

### Key Success Metrics

- ✓ 100% correct test navigation (Problem 1)
- ✓ All 150+ packages filterable and comparable (Problem 2)
- ✓ Parameter details visible on all test pages (Problem 3)
- ✓ Full CRUD profile editing functional (Problem 4)
- ✓ Reports, Bookings, Health Insights working (Problem 5)
- ✓ < 2 seconds page load time
- ✓ 99.9% uptime
- ✓ WCAG 2.1 AA accessibility compliance

### Immediate Actions

1. Schedule stakeholder review of this plan
2. Assign tech lead to finalize data schema
3. Provision MongoDB cluster (staging + prod)
4. Create API project repositories
5. Set up CI/CD pipelines
6. Begin Week 1 implementation

---

**End of Document**  
Healthcare Lab Platform Redesign Plan | April 2026

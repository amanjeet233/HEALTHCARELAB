# Development Plan: Healthcare Lab Test Booking System (Frontend)

## 📌 Project Overview
Healthcare Lab Test Booking System supporting 3 distinct user roles: **Patient**, **Doctor**, and **Technician**. Built with React, Vite, and Tailwind CSS.

---

## 🛠️ Phase 1: Project Setup (Day 1)
**Goal:** Initialize the base architecture.
- **1.1 Initial Setup:**
  - Create React app using Vite `(npm create vite@latest)`.
  - Install core dependencies: `react-router-dom`, `axios`, `react-hook-form`, `yup`, `date-fns`, `react-icons`, `react-hot-toast`.
  - Install and configure `tailwindcss` & `postcss`.
  - Establish standard folder structure (`/components`, `/pages`, `/services`, `/context`, `/assets`).
  - Initialize Git repository.
- **1.2 Configuration:**
  - Tailwind generic config matching specific colors: primary blue `blue-600`, success `green-500`, danger `red-500`, warning `yellow-500`.
  - Global `Axios` instance defining strict `baseURL` and request interceptors.
  - Setup Environment Variables (`.env`).
  - Strict ESLint/Prettier code styling enforcement configurations.

---

## 🔐 Phase 2: Authentication (Day 2)
**Goal:** Implement resilient JWT Authorization handling and Role-Based Protection.
- **2.1 Context & Services:**
  - `AuthContext`: Manage Login (`POST /api/auth/login`), Register (`POST /api/auth/register`), Logout, Token `localStorage` parsing, and Session Refreshing.
- **2.2 Components:**
  - **Login Page:** Input Form (Email, Password, Role). Handle Loading & Error notifications. React Hook Form & Yup Validation.
  - **Register Page:** Compound Form handling dynamic Conditional Fields dictated by Role (Name, Email, Phone, Password, Role, Address, DOB).
  - **Protected Routes (`<RequireAuth />`):** Validate strict RBAC logic preventing unauthorized URL sniffing.

---

## 🎨 Phase 3: Layout & Common Components (Day 3)
**Goal:** Build reusable generic structural presentation elements.
- **3.1 Layout Components:**
  - **Navbar:** System Logo, Role-specific Link rendering, User Avatar interaction, Logout integration.
  - **Sidebar:** Dynamic Collapsible UI injecting navigation `<Link>` arrays filtered by Access Level.
  - **Footer:** Branding & Copyright.
- **3.2 Common Components:**
  - `LoadingSpinner`: Rendered during pending backend HTTP resolution.
  - `Toaster` Container: Invoking `react-hot-toast` notifications.
  - `ConfirmationModal`: Rendered defensively ahead of critical `DELETE` or Update operations.
  - `StatusBadge`:
    - `PENDING` -> Yellow 🟡
    - `CONFIRMED` -> Green 🟢
    - `CANCELLED` -> Red 🔴
    - `COMPLETED` -> Blue 🔵
  - `Card`: Generic reusable shadow wrapper holding dynamic `children`.

---

## 🧑‍⚕️ Phase 4: Patient Module (Day 4-5)
**Goal:** Implement Patient Operations Lifecycle.
- **4.1 Patient Dashboard:** Quick statistics (`Total`, `Upcoming`, `Completed`), "Book New Test" Action Button, Recent Bookings Table.
- **4.2 Lab Tests Page:** `GET /api/lab-tests`. Search debouncing, Filters (Category, Price). Specialized `TestCard` components rendering Price, Methodology, Fasting Reqs, and a Book Action routing.
- **4.3 Book Test Page:** Complex Date Picker configuration (Disallowing Past ranges), Time Slot Validation (9 AM - 5 PM), Enum selection (`LAB` / `HOME`), optional Address parameter parsing. Generates `POST /api/bookings`.
- **4.4 My Bookings Page:** `GET /api/bookings/my`. Advanced Tab filtering displaying dynamic `StatusBadge` cards. Inject Patient conditional Cancel logic if status is pending.
- **4.5 Booking Details Page:** `GET /api/bookings/{id}`. Standalone display sheet with Print/Export.
- **4.6 Patient Profile Page:** `GET /api/users/profile`. Present read-only overview alongside `PUT` editing Modal Form.

---

## 🩺 Phase 5: Doctor Module (Day 6)
**Goal:** Implement Medical Officer Triage operations.
- **5.1 Doctor Dashboard:** `GET /api/mo/pending` analytical counts. Render dynamic stats: `Pending Approvals`, `Today's Workload`, `Total Network Patients`.
- **5.2 Pending Approvals Page:** `GET /api/mo/pending` table matrix. Implement Action columns: Confirm (`PUT /api/bookings/{id}/status?status=CONFIRMED`) vs Reject (`CANCELLED`).
- **5.3 All Bookings Page:** `GET /api/bookings`. Unrestricted system-wide booking feed matching advanced Date/Status search criteria. CSV exporting.
- **5.4 Patient History View:** Historical data parsing and validation across individual ID parameters.

---

## 🔬 Phase 6: Technician Module (Day 7)
**Goal:** Implement field-service logistics platform.
- **6.1 Technician Dashboard:** `GET /api/bookings/technician`. Daily active assignments metric reporting.
- **6.2 Assigned Collections Page:** Render highly specialized Assignment Cards explicitly extracting Address lines, Patient communication Phone Strings, and standard `Test` IDs. Emits `PUT /api/bookings/{id}/status?status=SAMPLE_COLLECTED`.
- **6.3 Collection History:** Aggregate view of implicitly COMPLETED tasks.

---

## ⚡ Phase 7: Integration & Testing (Day 8)
**Goal:** Verify Application resilience.
- **7.1 API Integration:** Definitively wire `src/services/api` to actual Endpoints resolving CORS or formatting bugs. Handle fallback Error interception robustly.
- **7.2 Form Validation:** Fortify edge cases covering `yup` email schemas, password regex constraints, and length truncations dynamically via real-time hooks feedback.
- **7.3 Testing:** Core end-to-end integration manual tests:
  - Patient books test >> Doctor confirms >> Technician Collects.

---

## 🚀 Phase 8: Polish & Deployment (Day 9)
**Goal:** UX Excellence and build generation.
- **8.1 UI Polish:** Flex/Grid responsiveness testing across explicit Viewports (Mobile/Tablet/Desktop). Optional Dark Mode support implementation (Tailwind `dark:` selectors). Map `Framer Motion` simple fade-in layout transition elements. Add Skeleton loaders matching `Card` outlines.
- **8.2 Performance:** Implement explicitly chunked `React.lazy()` rendering for entire distinct `Route` objects mapping User Roles. Minimize final Webpack tree bundle.
- **8.3 Deployment:** Target hosting architectures (Vercel / Netlify platform builds), parameterizing `.env.production` URLs correctly mapping the Java Spring Boot Host endpoints.

---

## 📚 Phase 9: Documentation (Day 10)
**Goal:** Knowledge base preparation.
- **9.1 Code Documentation:** Provide `JSDoc` / Markdown standard documentation mapping distinct Component responsibilities. Update internal `README.md`.
- **9.2 User Guide:** Produce screenshots mappings explicitly proving workflow viability logically isolated per user permission.

---

## ⏱️ Timeline Summary:
- **Total Duration:** 10 Days
- **Phase 1-3:** Days 1-3 (Setup, Auth, Layout)
- **Phase 4:** Days 4-5 (Patient Module)
- **Phase 5:** Day 6 (Doctor Module)
- **Phase 6:** Day 7 (Technician Module)
- **Phase 7-9:** Days 8-10 (Integration, Polish, Docs)

---

## 🎯 Deliverables:
1. Complete React 18+ Application with mapped Roles.
2. Fully responsive Tailwind v3/v4 Styling syntax.
3. Functional Axios HTTP intercepting Context.
4. JWT Contextual Local Storage Persistency.
5. Strict Role-based Routing Gates `<RequireAuth requireRole="PATIENT">`.
6. Verified API testing.
7. Prepared optimized build `/dist`.
8. Developer Documentation.

---

## ⚠️ Risks & Mitigation:
- **API Model Out-Of-Sync:** Ensure strict synchronization with Postman reference models.
- **Scope Creep:** Stick to explicit CRUD requirements strictly without unnecessary over-engineering.
- **Performance Thresholds:** Utilize code splitting extensively alongside Lazy routing.
- **Responsive Degeneration:** Design specifically matching base `<div className="sm:{} md:{}">` mobile-first Tailwind logic exclusively before scaling to Desktop dimensions.

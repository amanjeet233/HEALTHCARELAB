# UI/UX Specification: Healthcare Patient Profile Dashboard

## 1. Visual Language & Style Guide

### Color Palette
- **Primary (Medical Blue)**: `#007BFF` (Used for actions, active states, and focus)
- **Secondary (Soft Teal)**: `#14B8A6` (Used for health-related accents and status indicators)
- **Background**: `#F8FAFC` (Slate-50) for the main body; `#FFFFFF` for cards.
- **Borders**: `#E2E8F0` (Slate-200) for standard borders; `#F1F5F9` (Slate-100) for subtle dividers.
- **Text**: 
  - Neutral Dark: `#1E293B` (Slate-800) for headings.
  - Body Gray: `#475569` (Slate-600) for standard text.
  - Muted: `#94A3B8` (Slate-400) for labels and subtle details.

### Typography
- **Primary Typeface**: Inter / Roboto / Poppins
- **Headings**: Semi-bold to Bold, tracking `-0.02em`.
- **Labels**: All-caps, font-size `10px-12px`, letter-spacing `0.1em`, Bold.
- **Body**: Regular, font-size `14px-16px`, line-height `1.6`.

### UI Components & Depth
- **Corners**: Rounded `16px` (Cards) and `12px` (Inputs/Buttons).
- **Shadows**: 
  - *Standard*: `0 4px 20px -2px rgba(0, 0, 0, 0.05)`
  - *Hover*: `0 10px 30px -4px rgba(0, 123, 255, 0.1)` (accented with Medical Blue)

---

## 2. Component Breakdown

### LeftMenu (Permanent Storage)
- **AvatarHeader**:
  - `size`: 48px radius.
  - `letter`: "P" (Center, White).
  - `bg`: Medical Blue.
- **NavItems**:
  - `icons`: Lucide (User, Users, MapPin, HeartPulse, Shield).
  - `hover`: `bg-blue-50` color shift.
  - `active`: `text-blue-600`, `bg-blue-50`, and a left border indicator.

### Workspace (Dynamic Card)
- **TitleSection**: Dynamic heading based on `selectedMenu` (e.g., "Personal Information").
- **FormField**:
  - `container`: Grid-based layout.
  - `label`: Above input, muted uppercase style.
  - `input`: White background, border `1px solid Slate-200`, rounded `12px`.
  - `editIcon`: Lucide `Pencil` (size 14), positioned absolutely right-aligned within the container.

---

## 3. Interaction & Animation Spec

- **Fade Transition**: When switching tabs, the right Workspace content should perform a `0.3s ease-in-out` fade.
  - *Initial*: `opacity: 0`, `transform: translateY(10px)`
  - *End*: `opacity: 1`, `transform: translateY(0)`
- **Edit Mode**:
  - Clicking a pencil icon or "Edit" button toggles inputs from `readonly` (with grey text) to active (with blue border).
- **Focus States**: 
  - Primary blue focus ring (`ring-2 ring-blue-500/20`) on all inputs and buttons.

---

## 4. Accessibility Check
- **Contrast**: Text ratios minimum `4.5:1` against white/gray backgrounds.
- **Navigation**: Full tab-index support for screen readers.
- **Semantic HTML**: `<aside>` for navigation, `<article>` or `<main>` for the workspace, and proper `<label>` associations.

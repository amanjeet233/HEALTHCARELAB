## UI Pro Max Search Results
**Domain:** ux | **Query:** split-pane layout dashboard UX medical dashboard sidebar workspace
**Source:** ux-guidelines.csv | **Found:** 3 results

### Result 1
- **Category:** Layout
- **Issue:** Content Jumping
- **Platform:** Web
- **Description:** Layout shift when content loads is jarring
- **Do:** Reserve space for async content
- **Don't:** Let images/content push layout around
- **Code Example Good:** aspect-ratio or fixed height
- **Code Example Bad:** No dimensions on images
- **Severity:** High

### Result 2
- **Category:** Layout
- **Issue:** Fixed Positioning
- **Platform:** Web
- **Description:** Fixed elements can overlap or be inaccessible
- **Do:** Account for safe areas and other fixed elements
- **Don't:** Stack multiple fixed elements carelessly
- **Code Example Good:** Fixed nav + fixed bottom with gap
- **Code Example Bad:** Multiple overlapping fixed elements
- **Severity:** Medium

### Result 3
- **Category:** Layout
- **Issue:** Stacking Context
- **Platform:** Web
- **Description:** New stacking contexts reset z-index
- **Do:** Understand what creates new stacking context
- **Don't:** Expect z-index to work across contexts
- **Code Example Good:** Parent with z-index isolates children
- **Code Example Bad:** z-index: 9999 not working
- **Severity:** Medium


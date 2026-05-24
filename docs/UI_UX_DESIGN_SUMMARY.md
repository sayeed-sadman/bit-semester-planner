# BIT Semester Planner -- UI/UX Design Summary

## Overview

This document describes every page, component, interaction, and navigation flow designed for the BIT Semester Planner web application. It covers 21 Figma frames across 11 unique pages and 10 interaction states (modals, confirmations, success banners). This document serves as the definitive reference for building the React frontend.

---

## Design System

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #2563EB | Buttons, links, badges, accent bars |
| Dark Text | #0C1229 | Headings, primary body text |
| Body Text | #616B82 | Secondary text, descriptions |
| Muted Text | #808B9E | Placeholders, hints |
| Page Background | #F8FAFD | All page backgrounds |
| Section Alt Background | #F3F5FB | Page headers, table headers, card section headers |
| Card Background | #FFFFFF | Cards, modals, table rows |
| Card Border | #E4E7ED | Card and input borders |
| Footer Background | #0F172A | Global footer |
| Footer Text | #B2BFD1 | Footer text |
| Success Green | #10B981 | Success banners, elective badges, "Added" indicators |
| Success Green Light | #E6F8F0 | Success banner background, elective badge background |
| Success Green Dark | #0B815A | Success banner text |
| Error Red | #DC2626 | Delete/remove buttons, warning icons |
| Error Red Light | #FEF2F2 | Delete button background, warning circle |
| Orange | #AA6D0D | Calendar events (other calendars) |
| Orange Light | #FEF3E1 | Orange event background |
| Blue Badge BG | #EAEEF C | Compulsory badge background |
| Green Badge BG | #E6F8F0 | Elective badge background |

### Typography
| Style | Font | Weight | Size |
|-------|------|--------|------|
| Page Title | Inter | Bold | 22px |
| Section Title | Inter | Semi Bold | 16px |
| Card Heading | Inter | Bold | 20px |
| Body Text | Inter | Regular | 14px |
| Small Text | Inter | Regular | 13px |
| Button Text | Inter | Semi Bold | 13-15px |
| Badge Text | Inter | Medium | 10-11px |
| Table Header | Inter | Semi Bold | 12px |
| Footer Text | Inter | Regular | 13px |
| Navbar Logo | Inter | Medium | 15px |

### Component Patterns
| Component | Specs |
|-----------|-------|
| Primary Button | Blue fill (#2563EB), white text, 10px radius |
| Secondary Button | White fill, gray border (#E7EAF0), dark text, 10px radius |
| Danger Button | Red fill (#DC2626), white text, 10px radius |
| Danger Outline Button | Light red fill (#FEF2F2), red text, optional red border |
| Success Button | Green fill (#10B981), white text, 10px radius |
| Input Field | White fill, gray border, 8px radius, 40px height |
| Disabled Input | Gray fill (#F3F5F8), muted text |
| Card | White fill, border #E4E7ED, 14px radius, subtle shadow |
| Modal | White fill, 16px radius, deep shadow, blue top accent bar (4px) |
| Badge (Compulsory) | Blue bg (#EAEEFC), blue text (#2563EB) |
| Badge (Elective) | Green bg (#E6F8F0), green text (#0B815A) |
| Success Banner | Full-width, green bg (#E6F8F0), green border (#10B981), green check circle, dismiss X |
| Confirmation Popup | Centered white card, 14px radius, warning circle with "!" icon, title, message, Cancel + action button |

---

## Global Components

### Navbar (Public -- Pages 0, 1, 1b, 2)
| Element | Details |
|---------|---------|
| Height | 68px |
| Background | White with bottom border (#E0E4EB) and subtle shadow |
| Left | Blue icon (26x26 rounded rect with 3 white bars) + "BIT Semester Planner" text |
| Right | "Log in" button (outlined) + "Create account" button (blue filled) |
| Logo Click | Navigates to Page 0 (Landing Page) |

### Navbar (Admin -- Pages 3a, 3b, 3b2, 3b3, 3c, 6b)
| Element | Details |
|---------|---------|
| Same base as Public navbar | |
| Right | "Logged in as: Admin User" (gray) + "Edit Profile" (blue link) + "Logout" (outlined button) |
| Logo Click | Navigates to Page 3a (Admin Module Catalog) |

### Navbar (Student -- Pages 4, 4b-4e, 5a, 5a2-5a3, 5b, 5b2, 6a)
| Element | Details |
|---------|---------|
| Same base as Public navbar | |
| Right | "Logged in as: Jane Doe" (gray) + "Edit Profile" (blue link) + "Logout" (outlined button) |
| Logo Click | Navigates to Page 4 (Student Dashboard) |

### Footer (All Pages)
| Element | Details |
|---------|---------|
| Height | 64px |
| Background | #0F172A (dark) |
| Content | "BIT Semester Planner" + "FHNW University of Applied Sciences and Arts Northwestern Switzerland" |
| Text | #B2BFD1, Inter Regular 13px, positioned at x=80, y=10 |

---

## Page-by-Page Specification

---

### Page 0 -- Landing Page
**Route:** `/`
**Auth Required:** No
**Purpose:** Public marketing page that explains the app and provides entry points for login/registration.

**Sections:**
1. **Hero Section** -- "Plan your BIT semester with clarity." heading, descriptive paragraph, "Create account" button (navigates to Page 2), product mockup preview showing the dashboard.
2. **Features Section** -- "Everything you need to stay organized" with 3 feature cards: Module Planning, Personal Notes, Calendar Overview.
3. **Steps Section** -- "Get started in 3 simple steps" with numbered cards: 01 Create your account, 02 Explore your modules, 03 Build your planner.
4. **Responsive note** -- On mobile: mockup stacks below hero text.

**Interactions:**
| Element | Action |
|---------|--------|
| "Create account" (hero) | Navigate to Page 2 |
| "Log in" (navbar) | Navigate to Page 1 |
| "Create account" (navbar) | Navigate to Page 2 |
| Logo | Navigate to Page 0 (current page) |

---

### Page 1 -- Login
**Route:** `/login`
**Auth Required:** No
**Purpose:** Authenticate existing users (students and admins).

**Content:**
- Centered login card with "Welcome back" heading and "Sign in to your BIT Semester Planner account" subtitle
- Email address input (placeholder: you@students.fhnw.ch)
- Password input (masked)
- "Login" submit button (blue, full width of card)
- "Don't have an account? Create account" link (blue underlined)
- "Forgot your password? Contact your administrator." (muted text, not clickable)

**Interactions:**
| Element | Action |
|---------|--------|
| "Login" button | POST /api/auth/register with HTTP Basic, then GET /api/auth/me to get role. Admin -> Page 3a. Student -> Page 4. |
| "Create account" link | Navigate to Page 2 |
| "Log in" (navbar) | Current page |
| "Create account" (navbar) | Navigate to Page 2 |

---

### Page 1b -- Login (Success after Registration)
**Route:** `/login?registered=true`
**Auth Required:** No
**Purpose:** Same as Page 1 but with a green success banner showing account creation was successful.

**Differences from Page 1:**
- Green success banner inside the login card at the top: green check circle + "Account created! Log in to start planning your semester."
- Login card is slightly taller to accommodate the banner

**When shown:** After successful registration on Page 2, the user is redirected here.

---

### Page 2 -- Sign Up (Student Registration)
**Route:** `/register`
**Auth Required:** No
**Purpose:** Student self-registration. Admin accounts are pre-created by the developer.

**Content:**
- Centered registration card with "Create your account" heading and "Student registration for BIT Semester Planner" subtitle
- First name + Last name inputs (side by side)
- Email address input (placeholder: you@students.fhnw.ch)
- Password input (masked)
- Confirm password input (masked)
- "Create account" submit button (blue, full width of card)
- "Already have an account? Log in" link (blue underlined)

**Interactions:**
| Element | Action |
|---------|--------|
| "Create account" button | POST /api/auth/register with { firstName, lastName, email, password }. On success -> redirect to Page 1b. |
| "Log in" link | Navigate to Page 1 |

**Validation:**
- All fields required
- Password and Confirm password must match
- Email must be valid format

---

### Page 3a -- Admin Module Catalog
**Route:** `/admin/modules`
**Auth Required:** Yes (ADMIN role)
**Purpose:** Admin views and manages the complete BIT module catalog.

**Content:**
- Page header: "Module Catalog" title + "+ Add New Module" button (blue, top right)
- Filter bar: "Semester: All" dropdown + "Type: All" dropdown
- Module table with columns: Module Title, Semester, Type (badge), Actions
- Each row has a "View Details" button

**Interactions:**
| Element | Action |
|---------|--------|
| "+ Add New Module" button | Navigate to Page 3c |
| "View Details" per row | Navigate to Page 3b with that module's data |
| Semester dropdown | Filter table by semester (GET /api/modules?semester=X) |
| Type dropdown | Filter table by type (GET /api/modules?type=Y) |
| Logo | Navigate to Page 3a (current page) |
| "Edit Profile" | Navigate to Page 6b |
| "Logout" | Clear auth, navigate to Page 1 |

**API Calls:**
- On load: GET /api/modules
- On filter: GET /api/modules?semester=X&type=Y

---

### Page 3b -- Admin Module Detail
**Route:** `/admin/modules/:id`
**Auth Required:** Yes (ADMIN role)
**Purpose:** View and edit a single module's details.

**Content:**
- Page header: "Back to Catalog" link (left) + "Module Detail" title (center) + "Delete Module" button (red outlined, right)
- Detail card with fields: Title, Description, Credits, Lecturer Name, Lecturer Email, Semester, Campus, Module Type
- Each field has a read-only value box + "Edit" button on the right
- Clicking "Edit" on a field makes it editable inline

**Interactions:**
| Element | Action |
|---------|--------|
| "Back to Catalog" | Navigate to Page 3a |
| "Edit" per field | Field becomes editable, "Edit" becomes "Save" + "Cancel" |
| "Save" per field | PUT /api/modules/:id with updated data |
| "Delete Module" | Shows Page 3b2 (delete confirmation popup) |

**API Calls:**
- On load: GET /api/modules/:id
- On field save: PUT /api/modules/:id
- On delete confirm: DELETE /api/modules/:id

---

### Page 3b2 -- Delete Module Confirmation
**Overlay on:** Page 3b
**Purpose:** Confirm before permanently deleting a module from the catalog.

**Content:**
- Dimmed Page 3b visible behind overlay
- Centered confirmation card: red warning circle with "!" icon
- Title: "Delete this module?"
- Message: "This will permanently remove [Module Name] from the module catalog. This cannot be undone."
- "Cancel" button (outlined) + "Yes, Delete" button (red filled)

**Interactions:**
| Element | Action |
|---------|--------|
| "Cancel" | Close popup, return to Page 3b |
| "Yes, Delete" | DELETE /api/modules/:id, then navigate to Page 3a |

---

### Page 3b3 -- Module Added Success
**Variant of:** Page 3b
**Purpose:** Show success feedback after admin saves a new module from Page 3c.

**Content:**
- Full-width green success banner at top: green check + "New module has been added successfully!" + dismiss X
- Rest of page is normal Page 3b showing the newly created module's details

**When shown:** After POST /api/modules succeeds on Page 3c, redirect here with the new module's ID.

---

### Page 3c -- Add New Module
**Route:** `/admin/modules/new`
**Auth Required:** Yes (ADMIN role)
**Purpose:** Admin creates a new module in the catalog.

**Content:**
- Page header: "Back to Catalog" link (left) + "Add New Module" title (center) + "Save Module" button (blue, right)
- Form card with empty input fields: Title, Description (textarea), Credits, Lecturer Name, Lecturer Email, Semester, Campus, Module Type (dropdown: Compulsory or Elective)
- "Save Module" button also at bottom of form

**Interactions:**
| Element | Action |
|---------|--------|
| "Back to Catalog" | Navigate to Page 3a (discard unsaved data) |
| "Save Module" | POST /api/modules with form data. On success -> navigate to Page 3b3 with new module ID. |

**Validation:**
- All fields required
- Credits must be a positive number
- Email must be valid format

---

### Page 4 -- Student Dashboard
**Route:** `/dashboard`
**Auth Required:** Yes (STUDENT role)
**Purpose:** The student's main workspace showing their planned modules and connected calendars side by side.

**Layout:** Two-column on desktop, single column (stacked) on mobile.

**Page Header:** "My Semester Planner"

#### Left Column -- My Modules
**Section header:** "My Modules" title + "Browse Modules" button (blue)

**Module rows:** Each row contains:
- Blue left accent bar (compulsory) or green accent bar (elective)
- Module title (bold)
- Semester + ECTS info
- Type badge (Compulsory blue / Elective green)
- Three action buttons: "View" (outlined), "Notes" (blue light bg), "Remove" (red light bg)

**Bottom info bar:** Green dot + "X modules selected, Y of 2 elective slots used"

**Empty state (when no modules):** "No modules added yet. Browse the catalog to start planning your semester."

#### Right Column -- My Calendar
**Section header:** "My Calendar" title + "+ Add Calendar" button (blue)

**Controls bar:**
- "All Calendars" dropdown (filter by specific calendar)
- "W20" badge (blue pill showing current week number)
- Previous/next week arrows + "May 12 - 18, 2026" date label

**Weekly grid:**
- 7 day columns: Mon through Sun
- Time gutter on left: 08:00 to 18:00 (labels every 2 hours)
- Horizontal grid lines per hour
- Event blocks color-coded: blue (compulsory modules), green (elective modules), orange (other calendar events)
- Overlapping events shown side by side (half-width each)

**Empty state (when no calendars):** "No calendar connected yet. Add your calendar URL to see your events here."

**Interactions:**
| Element | Action |
|---------|--------|
| "Browse Modules" | Navigate to Page 5a |
| "View" per module | Navigate to Page 5b2 (module detail from planner) |
| "Notes" per module | Open Page 4b (notes modal) |
| "Remove" per module | Open Page 4e (remove confirmation) |
| "+ Add Calendar" | Open a small popup with ICS URL + display name fields, POST /api/calendars |
| Calendar dropdown | Filter events by calendar |
| Previous/Next arrows | Navigate to prev/next week, re-fetch events |
| Logo | Navigate to Page 4 (current page) |
| "Edit Profile" | Navigate to Page 6a |
| "Logout" | Clear auth, navigate to Page 1 |

**API Calls:**
- On load: GET /api/planner (modules) + GET /api/calendars/events/all (events)
- Add calendar: POST /api/calendars
- Remove module: DELETE /api/planner/:moduleId

---

### Page 4b -- Notes Modal (View State)
**Overlay on:** Page 4
**Purpose:** View an existing note for a module.

**Content:**
- Dimmed Page 4 visible behind
- Centered modal card (520x520) with blue top accent bar
- Close button (X) in top right
- Module title (bold, 20px)
- Lecturer name + lecturer email (blue, clickable)
- Divider
- "My Note" section label
- Note text area (280px tall, light gray bg, scrollbar for long content)
- "Edit Note" button (blue) + "Delete Note" button (red outlined)
- "Click outside to close" hint below modal

**Interactions:**
| Element | Action |
|---------|--------|
| X button | Close modal |
| Click outside modal | Close modal |
| "Edit Note" | Switch to Page 4c (edit state) |
| "Delete Note" | Open Page 4d (delete confirmation) |

**API Calls:**
- On open: GET /api/notes/:moduleId

---

### Page 4c -- Notes Modal (Edit State)
**Overlay on:** Page 4
**Purpose:** Edit an existing note or write a new one.

**Differences from Page 4b:**
- Note text area has blue border (2px, #2563EB) and white background indicating editable state
- Text cursor visible in the note area
- "My Note" label changed to "My Note (Editing)"
- "Edit Note" button replaced with "Save Note" button (green, #10B981)
- "Delete Note" button remains
- Hint text changed to "Click outside to close without saving"

**Interactions:**
| Element | Action |
|---------|--------|
| "Save Note" | POST /api/notes/:moduleId with { content }. Switch back to Page 4b view state. |
| "Delete Note" | Open Page 4d (delete confirmation) |
| Click outside | Close modal without saving |

---

### Page 4d -- Delete Note Confirmation
**Overlay on:** Page 4b (notes modal still visible, further dimmed)
**Purpose:** Confirm before permanently deleting a note.

**Content:**
- Additional dark overlay on top of the notes modal
- Centered confirmation card: red warning circle with "!" icon
- Title: "Delete this note?"
- Message: "This will permanently remove your note for [Module Name]. This cannot be undone."
- "Cancel" button (outlined) + "Yes, Delete" button (red filled)

**Interactions:**
| Element | Action |
|---------|--------|
| "Cancel" | Close popup, return to Page 4b |
| "Yes, Delete" | DELETE /api/notes/:moduleId, close modal, return to Page 4 |

---

### Page 4e -- Remove Module Confirmation
**Overlay on:** Page 4
**Purpose:** Confirm before removing a module from the student's planner.

**Content:**
- Dimmed Page 4 visible behind
- Centered confirmation card: red warning circle with "!" icon
- Title: "Remove this module?"
- Message: "This will remove [Module Name] from your semester planner. Any associated note will also be deleted. You can add it again later."
- "Cancel" button (outlined) + "Yes, Remove" button (red filled)

**Interactions:**
| Element | Action |
|---------|--------|
| "Cancel" | Close popup, return to Page 4 |
| "Yes, Remove" | DELETE /api/planner/:moduleId, refresh module list on Page 4 |

---

### Page 5a -- Student Module Catalog
**Route:** `/modules`
**Auth Required:** Yes (STUDENT role)
**Purpose:** Browse the full BIT module catalog and add/remove modules from the personal planner.

**Content:**
- Page header: "Back to My Planner" link (left) + "Module Catalog" title (center)
- Filter bar: "Semester: All" dropdown + "Type: All" dropdown
- Module table with columns: Module Title, Semester, Type (badge), Actions
- Each row has: "View" button + either "Add" (green) or "Remove" (red) button
- Modules already in planner show: "Remove" button + green checkmark "Added" indicator
- Modules not in planner show: green "Add" button

**Interactions:**
| Element | Action |
|---------|--------|
| "Back to My Planner" | Navigate to Page 4 |
| "View" per row | Navigate to Page 5b |
| "Add" per row | POST /api/planner/:moduleId. On success -> show Page 5a3 (success banner) and update row to show Remove + Added. |
| "Remove" per row | Open Page 5a2 (remove confirmation) |
| Semester dropdown | Filter by semester |
| Type dropdown | Filter by type |

**Business Rule:** If student tries to add a 3rd elective module, show error message: "You have reached the maximum of 2 elective modules for your semester plan."

**API Calls:**
- On load: GET /api/modules + GET /api/planner (to determine which modules are already added)
- On filter: GET /api/modules?semester=X&type=Y
- Check status per module: GET /api/planner/:moduleId/status

---

### Page 5a2 -- Remove from Planner Confirmation
**Overlay on:** Page 5a
**Purpose:** Confirm before removing a module from planner via the catalog view.

**Content:** Same pattern as Page 4e but overlaid on Page 5a.
- Title: "Remove from planner?"
- Message mentions the module name and note deletion warning
- "Cancel" + "Yes, Remove" buttons

**Interactions:**
| Element | Action |
|---------|--------|
| "Cancel" | Close popup |
| "Yes, Remove" | DELETE /api/planner/:moduleId, update row to show "Add" button, remove "Added" indicator |

---

### Page 5a3 -- Module Added Success
**Variant of:** Page 5a
**Purpose:** Show success feedback after adding a module to the planner.

**Content:**
- Full-width green success banner: "[Module Name] has been added to your semester planner!" with dismiss X
- The newly added module's row now shows "Remove" + "Added" instead of "Add"

**When shown:** Immediately after POST /api/planner/:moduleId succeeds.

---

### Page 5b -- Student Module Detail (from Catalog)
**Route:** `/modules/:id`
**Auth Required:** Yes (STUDENT role)
**Purpose:** Read-only view of a module's full details, accessed from the student catalog.

**Content:**
- Page header: "Back to Catalog" link (left) + "Module Detail" title (center)
- Detail card with read-only fields: Title, Description, Credits, Lecturer Name, Lecturer Email, Semester, Campus, Module Type
- No Edit or Delete buttons (student cannot modify modules)

**Interactions:**
| Element | Action |
|---------|--------|
| "Back to Catalog" | Navigate to Page 5a |

**API Calls:**
- On load: GET /api/modules/:id

---

### Page 5b2 -- Student Module Detail (from Planner)
**Route:** `/modules/:id?from=planner`
**Auth Required:** Yes (STUDENT role)
**Purpose:** Same as Page 5b but accessed from the My Modules list on the dashboard.

**Only difference from Page 5b:**
- Back link says "Back to My Planner" instead of "Back to Catalog"

**Interactions:**
| Element | Action |
|---------|--------|
| "Back to My Planner" | Navigate to Page 4 |

---

### Page 6a -- Edit Profile (Student)
**Route:** `/profile`
**Auth Required:** Yes (STUDENT role)
**Purpose:** Student edits their personal information and password.

**Content:**
- Page header: "Back to My Planner" link (left) + "Edit Profile" title (center)
- Centered profile card with two sections:

**Personal Information:**
- First name + Last name (side by side, editable)
- Email address (editable)

**Change Password:**
- Current password (masked)
- New password (masked)
- Confirm new password (masked)

**"Save Changes" button** (blue, full width of card)

**Interactions:**
| Element | Action |
|---------|--------|
| "Back to My Planner" | Navigate to Page 4 |
| "Save Changes" | PUT /api/auth/me with updated fields. Show success feedback. |

**Validation:**
- New password and Confirm must match
- Current password required to change password

**API Calls:**
- On load: GET /api/auth/me (pre-fill fields)
- On save: PUT /api/auth/me

---

### Page 6b -- Edit Profile (Admin)
**Route:** `/profile`
**Auth Required:** Yes (ADMIN role)
**Purpose:** Admin edits their personal information and password.

**Content:** Same layout as Page 6a with these differences:
- Navbar shows "Logged in as: Admin User"
- Back link: "Back to Module Catalog" (navigates to Page 3a)
- Name fields pre-filled with "Admin" / "User"
- Email field is **disabled** (grayed out background, muted text): shows "admin@fhnw.ch"
- Helper text below email: "To change your email address, please contact the system administrator."
- Password section is the same as student

**Interactions:**
| Element | Action |
|---------|--------|
| "Back to Module Catalog" | Navigate to Page 3a |
| "Save Changes" | PUT /api/auth/me (only name + password, not email) |

---

## Navigation Flow Summary

### Public (Not Logged In)
```
Page 0 (Landing) -> Page 1 (Login) or Page 2 (Sign Up)
Page 1 (Login) -> Page 2 (Sign Up) or authenticate
Page 2 (Sign Up) -> Page 1b (Login with success banner)
Page 1b -> authenticate
```

### After Authentication
```
Login with ADMIN role -> Page 3a (Admin Module Catalog)
Login with STUDENT role -> Page 4 (Student Dashboard)
```

### Admin Flow
```
Page 3a (Catalog) -> Page 3b (Module Detail) via "View Details"
Page 3a -> Page 3c (Add New Module) via "+ Add New Module"
Page 3b -> Page 3a via "Back to Catalog"
Page 3b -> Page 3b2 (Delete Confirm) via "Delete Module"
Page 3b2 -> Page 3a via "Yes, Delete" (after deletion)
Page 3c -> Page 3b3 (Detail with success) via "Save Module"
Page 3a/3b/3c -> Page 6b (Edit Profile) via navbar "Edit Profile"
Page 6b -> Page 3a via "Back to Module Catalog"
Any admin page -> Page 1 via "Logout"
```

### Student Flow
```
Page 4 (Dashboard) -> Page 5a (Module Catalog) via "Browse Modules"
Page 4 -> Page 5b2 (Module Detail from Planner) via "View" on a module
Page 4 -> Page 4b (Notes Modal) via "Notes" on a module
Page 4 -> Page 4e (Remove Confirm) via "Remove" on a module
Page 4b -> Page 4c (Edit Note) via "Edit Note"
Page 4b -> Page 4d (Delete Note Confirm) via "Delete Note"
Page 5a -> Page 4 via "Back to My Planner"
Page 5a -> Page 5b (Module Detail from Catalog) via "View"
Page 5a -> Page 5a2 (Remove Confirm) via "Remove"
Page 5a -> Page 5a3 (Added Success) via "Add"
Page 5b -> Page 5a via "Back to Catalog"
Page 5b2 -> Page 4 via "Back to My Planner"
Page 4/5a/5b -> Page 6a (Edit Profile) via navbar "Edit Profile"
Page 6a -> Page 4 via "Back to My Planner"
Any student page -> Page 1 via "Logout"
```

### Logo Click Behavior (All Pages)
| Context | Destination |
|---------|-------------|
| Not logged in | Page 0 (Landing Page) |
| Logged in as Admin | Page 3a (Admin Module Catalog) |
| Logged in as Student | Page 4 (Student Dashboard) |

---

## Responsive Behavior

The app uses a single layout that adapts to both desktop and mobile. No separate mobile layout.

| Breakpoint | Behavior |
|------------|----------|
| Desktop (1024px+) | Full layout as designed in Figma (1440px) |
| Tablet (768-1023px) | Content scales, two-column dashboard may compress |
| Mobile (below 768px) | Single column: On Page 4 calendar stacks below modules. Forms go full width. Tables become scrollable or card-based. Modals stay centered with reduced width. |

---

## API Endpoint Reference

| Endpoint | Method | Auth | Used By |
|----------|--------|------|---------|
| POST /api/auth/register | POST | Public | Page 2 |
| GET /api/auth/me | GET | Any auth | All pages (get user info) |
| PUT /api/auth/me | PUT | Any auth | Page 6a, 6b |
| GET /api/modules | GET | Public | Page 3a, 5a |
| GET /api/modules/:id | GET | Public | Page 3b, 5b, 5b2 |
| POST /api/modules | POST | Admin | Page 3c |
| PUT /api/modules/:id | PUT | Admin | Page 3b |
| DELETE /api/modules/:id | DELETE | Admin | Page 3b2 |
| GET /api/planner | GET | Student | Page 4, 5a |
| POST /api/planner/:moduleId | POST | Student | Page 5a |
| DELETE /api/planner/:moduleId | DELETE | Student | Page 4e, 5a2 |
| GET /api/planner/:moduleId/status | GET | Student | Page 5a |
| GET /api/notes/:moduleId | GET | Student | Page 4b |
| POST /api/notes/:moduleId | POST | Student | Page 4c |
| DELETE /api/notes/:moduleId | DELETE | Student | Page 4d |
| GET /api/calendars | GET | Student | Page 4 |
| POST /api/calendars | POST | Student | Page 4 (Add Calendar popup) |
| DELETE /api/calendars/:id | DELETE | Student | Page 4 |
| GET /api/calendars/:id/events | GET | Student | Page 4 |
| GET /api/calendars/events/all | GET | Student | Page 4 |

---

## Figma Frame Index

| # | Frame Name | Figma Node ID | Type |
|---|-----------|---------------|------|
| 1 | Page 0 - Landing Page | 86:2 | Full page |
| 2 | Page 1 - Login | 37:2 | Full page |
| 3 | Page 1b - Login (Success) | 133:2 | State variant |
| 4 | Page 2 - Sign Up | 42:2 | Full page |
| 5 | Page 3a - Admin Module Catalog | 48:2 | Full page |
| 6 | Page 3b - Admin Module Detail | 57:2 | Full page |
| 7 | Page 3b2 - Delete Module Confirmation | 184:2 | Overlay state |
| 8 | Page 3b3 - Module Added Success | 185:2 | State variant |
| 9 | Page 3c - Add New Module | 61:2 | Full page |
| 10 | Page 4 - Student Dashboard | 141:2 | Full page |
| 11 | Page 4b - Notes Modal | 154:2 | Overlay state |
| 12 | Page 4c - Notes Modal (Edit) | 156:2 | Overlay state |
| 13 | Page 4d - Delete Note Confirmation | 158:2 | Overlay state |
| 14 | Page 4e - Remove Module Confirmation | 187:2 | Overlay state |
| 15 | Page 5a - Student Module Catalog | 190:2 | Full page |
| 16 | Page 5a2 - Remove from Planner Confirm | 194:2 | Overlay state |
| 17 | Page 5a3 - Module Added Success | 195:2 | State variant |
| 18 | Page 5b - Student Module Detail | 191:2 | Full page |
| 19 | Page 5b2 - Module Detail (from Planner) | 199:2 | State variant |
| 20 | Page 6a - Edit Profile (Student) | 201:2 | Full page |
| 21 | Page 6b - Edit Profile (Admin) | 202:2 | Full page |

---

*Document generated from the Figma design file: BIT Semester Planner*
*Figma URL: https://www.figma.com/design/T7aUdDUHdcelNOJ3RdERoh/bit-semester-planner*

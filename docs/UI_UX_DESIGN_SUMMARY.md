# BIT Semester Planner - UI/UX Design Summary

## Overview

This document describes every page, component, interaction, and navigation flow implemented in the BIT Semester Planner React frontend. It reflects the actual codebase as of June 2026 and supersedes any earlier Figma-based specification.

The app has 11 routes across 11 distinct page components, plus shared overlay components (modals, popups) and a persistent floating chatbot. Authentication uses HTTP Basic with credentials stored in `localStorage` under `auth_credentials`.

---

## Design System

### Colors (from `tailwind.config.js`)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | #2563EB | Buttons, links, badges, accents |
| `primary-light` | #EAEEFC | Badge backgrounds, hover states |
| `primary-dark` | #1A45A5 | Hover state for primary buttons |
| `dark` | #0C1229 | Headings, primary body text |
| `dark-secondary` | #333D52 | Secondary body text |
| `dark-muted` | #616B82 | Descriptions, placeholders |
| `dark-subtle` | #808B9E | Hints, disabled text |
| `surface-page` | #F8FAFD | All page backgrounds |
| `surface-section` | #F3F5FB | Card section headers, filter bars |
| `surface-card` | #FFFFFF | Cards, modals |
| `surface-border` | #E4E7ED | Card and input borders |
| `surface-divider` | #EAF0F2 | Internal card dividers |
| `footer-bg` | #0F172A | Global footer |
| `footer-text` | #B2BFD1 | Footer text |
| `success` | #10B981 | Success banners, elective badges, "Add" buttons |
| `success-light` | #E6F8F0 | Success banner background, elective badge background |
| `success-dark` | #0B815A | Success banner text, elective badge text |
| `danger` | #DC2626 | Delete/remove buttons, error text |
| `danger-light` | #FEF2F2 | Delete button background, error banner background |
| `danger-border` | #FEE2E2 | Error banner border |
| `orange` | #AA6D0D | Overlapping calendar event text |
| `orange-light` | #FEF3E1 | Overlapping event background |

### Typography

Inter (system-ui fallback), applied globally via Tailwind's `fontFamily.sans`.

| Context | Weight | Size (approx) |
|---------|--------|---------------|
| Page title (`h1`) | Bold | 22-24px |
| Section title (`h2`) | Semi-bold | 16px |
| Card heading (`h3`) | Semi-bold | 14-16px |
| Body text | Regular | 14px |
| Small / helper text | Regular | 12-13px |
| Button text | Semi-bold | 13-14px |
| Badge text | Medium | 10-12px |
| Table header | Semi-bold | 12px |

### Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-card` | 14px | Cards, containers |
| `rounded-button` | 10px | Primary/secondary buttons |
| `rounded-input` | 8px | Inputs, small buttons, dropdown rows |
| `rounded-badge` | 10px | Type badges |
| `rounded-modal` | 16px | Modals and popups |

### Box Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-card` | 0 4px 16px rgba(12,18,41,0.06) | Standard cards |
| `shadow-navbar` | 0 2px 8px rgba(15,23,42,0.06) | Navbar |
| `shadow-modal` | 0 12px 40px rgba(12,18,41,0.2) | Modals, chatbot panel |

---

## Global Components

### Navbar

A single unified Navbar component (`src/components/layout/Navbar.jsx`) that adapts based on auth state.

| Element | Details |
|---------|---------|
| Height | 68px |
| Background | White, bottom border `#E0E4EB`, shadow `shadow-navbar` |
| Logo | Blue 32x32px rounded square with 4 white squares (2x2 grid icon) + "BIT Semester Planner" in `text-base font-semibold` |
| Logo click | Not authenticated: `/`: Authenticated (student): `/dashboard`: Authenticated (admin): `/admin/modules` |

**Not authenticated (public):**
- Right side: "Log in" (outlined button) + "Create account" (blue filled button)

**Authenticated (any role):**
- Right side: "Logged in as: [firstName] [lastName]" (muted text, hidden on mobile) + "Edit Profile" (blue text link) + "Logout" (outlined button)
- Logout clears `sessionStorage.chatMessages` before calling `logout()`

### Footer

| Element | Details |
|---------|---------|
| Height | 64px |
| Background | `#0F172A` |
| Content | "BIT Semester Planner" + "FHNW | University of Applied Sciences and Arts Northwestern Switzerland" |
| Text color | `#B2BFD1`, 13px, Regular |
| Padding | `px-20` |

### ChatBot (Floating Assistant)

A persistent floating component (`src/components/ChatBot/ChatBot.jsx`) rendered on every page inside `App.jsx`.

**Toggle button:** Fixed `bottom-6 right-6`, 56x56px rounded circle, primary blue background, white chat bubble SVG icon.

**Chat panel:** When open, appears above the toggle button. Desktop (768px+): 400px wide, 500px tall. Mobile: full width stacked.

**Header:** Primary blue bar. Title changes based on active panel:
- Chat mode: "BIT Study Assistant"
- Student note mode: "Save to Module Notes"
- Admin match mode: "Update Module" or "Create New Module"

**Three panel modes:**

1. **Chat mode (default):**
   - Welcome message differs by role: admin, student, or unauthenticated
   - Message list with user bubbles (blue, right-aligned) and assistant bubbles (surface-section, left-aligned)
   - Markdown rendering: bold (`**text**`), bullet lists (`- item`), headers (`## heading`)
   - "Thinking..." placeholder while loading
   - Text input + Send button; Enter key sends (Shift+Enter = newline)
   - Trash icon in header clears chat history
   - Upload section (students and admins): file picker for PDF/DOCX, Upload button
   - Student: "My Documents (N)" toggle reveals the documents panel
   - Responses streamed via SSE (`/api/chat/stream`)

2. **Student note panel (triggered after successful document upload with study info found):**
   - Module dropdown (populated from `/api/planner`)
   - Auto-selects module by matching filename words to module titles
   - Editable textarea pre-filled with AI-extracted note content
   - If an existing note exists: appends with `--- Added from upload on [date] ---` separator
   - Save Note / Cancel buttons
   - After save: closes panel and resets state after 1.5s

3. **Admin module panel (triggered after admin uploads a document):**
   - If module found in catalog (`matched: true`): shows module name + "View Module" link
   - If no match (`matched: false`): shows draft new module form (title, description, credits, semester, campus, type, lecturer, email) pre-filled from AI extraction; "Create Module" button
   - After create: shows success state with "View Module" link

**Documents panel (students only, expandable):**
- Appears to the left of the chat panel on desktop; above on mobile
- 250px wide on desktop
- Lists uploaded files with clickable filename (opens PDF in PdfViewerModal, or downloads DOCX)
- Trash icon per file with inline confirmation (Yes / Cancel)

---

## Shared UI Components

### ConfirmModal

| Element | Details |
|---------|---------|
| Trigger | `isOpen` boolean prop |
| Backdrop | `bg-black/50` fixed overlay |
| Card | White, `rounded-modal`, `shadow-modal`, `max-w-md` centered |
| Icon | Red warning triangle (SVG, `#DC2626`) in a 56x56 circle with `bg-danger-light border-danger-border` |
| Title | `text-lg font-semibold text-dark` |
| Message | `text-sm text-dark-muted` |
| Buttons | Full-width flex: "Cancel" (outlined) + confirm button (danger red or primary blue based on `confirmVariant`) |

### SuccessBanner

| Element | Details |
|---------|---------|
| Appearance | Full-width flex row, `bg-success-light border-success rounded-input` |
| Icon | Green filled circle with white checkmark |
| Text | `text-sm font-medium text-success-dark` |
| Dismiss | X button on right + auto-dismiss after 5 seconds |

### Badge

| Element | Details |
|---------|---------|
| Compulsory | `bg-primary-light text-primary`, text "Compulsory" |
| Elective | `bg-success-light text-success-dark`, text "Elective" |
| Border radius | `rounded-badge` (10px) |
| Font | `text-xs font-medium` |

### PdfViewerModal

Full-screen overlay (90vw × 90vh) that renders a PDF in an `<iframe>`.

| Element | Details |
|---------|---------|
| Backdrop | `rgba(0,0,0,0.75)` fixed overlay; click outside closes |
| Escape key | Closes the modal |
| Header | Filename truncated + X close button |
| Body | `<iframe>` occupying remaining height |

### ProgrammeDocsModal

Modal showing official BIT programme documents grouped in 4 sections: Administrative, Compulsory Modules, Elective Modules, Specializations.

| Element | Details |
|---------|---------|
| Width | `min(680px, 95vw)` |
| Max height | `85vh`, scrollable body |
| Public access | Can view and open files |
| Admin-only | "+ Add file" label per section, trash icon per file with inline Yes/No confirm |
| PDF files | Open in PdfViewerModal overlay |
| DOCX files | Download directly |

---

## Page Specifications

---

### Landing Page

**Route:** `/`
**Auth:** Public (redirects to dashboard or admin catalog if already logged in)
**File:** `src/pages/LandingPage.jsx`

**Sections:**

1. **Hero:** "Plan your BIT semester with an AI study companion." heading. Paragraph describing features. Two CTA buttons: "Create account" (`/register`) and "Browse modules" (`/modules`). Right side: responsive dashboard mockup showing modules, calendar events, and chatbot preview.

2. **Features (6 cards):** Module Catalog, Semester Planner, Personal Notes, Calendar Integration, AI Study Assistant (highlighted with primary blue background), Document Upload & Analysis.

3. **AI Spotlight:** Full-width primary blue card with chatbot icon, headline "Ask questions. Get answers. Grounded in your own documents." and 5 feature bullet points.

4. **Steps (4 steps with arrows):** Create account, Add modules to your plan, Connect your calendar and notes, Ask the AI assistant.

5. **Bottom CTA:** "Start planning your semester today." with "Create account" and "Browse modules" buttons.

**Interactions:**

| Element | Action |
|---------|--------|
| "Create account" (hero or bottom CTA) | Navigate to `/register` |
| "Browse modules" (hero or bottom CTA) | Navigate to `/modules` |
| "Log in" (navbar) | Navigate to `/login` |
| "Create account" (navbar) | Navigate to `/register` |

---

### Login Page

**Route:** `/login`
**Auth:** Public (also handles `/login?registered=true` for post-registration state)
**File:** `src/pages/LoginPage.jsx`

**Layout:** Centered card layout. Title "Welcome back" + subtitle "Sign in to your account to continue" above the card.

**Content:**
- SuccessBanner above card: shown when `?registered=true` query param is present. Message: "Account created! Log in to start planning your semester." Auto-dismisses after 5s.
- Email input (placeholder: "you@example.com")
- Password input (masked)
- Inline error message (red banner) for failed login
- "Sign in" submit button (blue, full-width)
- Below card: "Don't have an account? Create account" link

**Interactions:**

| Element | Action |
|---------|--------|
| "Sign in" button | Calls `login(email, password)` via AuthContext. On success: admin goes to `/admin/modules`, student goes to `/dashboard` |
| "Create account" link | Navigate to `/register` |

**Validation:** Both fields required; error from server shown inline.

---

### Register Page

**Route:** `/register`
**Auth:** Public
**File:** `src/pages/RegisterPage.jsx`

**Layout:** Centered card. Title "Create your account" + subtitle "Join the BIT Semester Planner" above card.

**Content:**
- First name + Last name (side by side on sm+)
- Email address
- Password (min 6 chars)
- Confirm password
- Inline field-level error messages on submit
- API error banner
- "Create account" button (blue, full-width)
- Below card: "Already have an account? Log in" link

**Interactions:**

| Element | Action |
|---------|--------|
| "Create account" button | POST `/api/auth/register`. On success: redirect to `/login?registered=true` |
| "Log in" link | Navigate to `/login` |

**Validation:** All fields required. Email format checked. Password min 6 chars. Passwords must match.

---

### Admin Module Catalog

**Route:** `/admin/modules`
**Auth:** ADMIN role required
**File:** `src/pages/AdminCatalogPage.jsx`

**Header row:** "Module Catalog" title + subtitle "Manage all modules in the BIT programme". "+ Add New Module" button (blue, top right).

**Filter bar (inside white card):**
- Semester dropdown (All Semesters / Semester 1-6)
- Type dropdown (All Types / Compulsory / Elective)
- Module count label ("X modules")
- "Programme Resources" button (outlined, opens ProgrammeDocsModal)

**Module table:** Sorted alphabetically by title. Columns: Module Title, Semester, Type (Badge), Actions.

Each row has a "View Details" button that navigates to `/admin/modules/:id`.

**Loading state:** "Loading modules..." centered text.

**Error state:** Red error banner if server unavailable.

**Interactions:**

| Element | Action |
|---------|--------|
| "+ Add New Module" | Navigate to `/admin/modules/new` |
| "View Details" per row | Navigate to `/admin/modules/:id` |
| Semester / Type filters | Client-side filter (no API call; all modules loaded on mount) |
| "Programme Resources" | Opens ProgrammeDocsModal |

**API Calls:** On mount: `GET /api/modules`

---

### Admin Module Detail

**Route:** `/admin/modules/:id`
**Auth:** ADMIN role required
**File:** `src/pages/AdminModuleDetailPage.jsx`

**Header area:**
- "Back to Catalog" link (left)
- "Official Description" button (blue, left): opens PdfViewerModal for the module PDF
- "Module Detail" title (centered)
- "Delete Module" button (red, right)

**SuccessBanner:** Shown when `?created=true` query param is present (arriving from Add New Module flow). Message: "New module has been added successfully!"

**SavedToast:** Fixed top-right toast ("Changes saved successfully.") that appears for 2.5s after any field save.

**Editable fields (rendered in order):**

| Field Key | Display Label | Input Type |
|-----------|--------------|------------|
| `title` | Module Name | Text input |
| `description` | Description | Textarea (3 rows) |
| `moduleType` | Module Type | Select (COMPULSORY / ELECTIVE) |
| `credits` | Credits (ECTS) | Text input |
| `campus` | Campus | Text input |
| `semester` | Semester | Text input |
| `lecturerName` | Lecturer | Text input |
| `lecturerEmail` | Lecturer Email | Text input |

Each field shows in a white card:
- Read mode: label + value (Badge for moduleType, pre-wrap for description) + "Edit" link (blue text)
- Edit mode: input/textarea/select (primary border) + "Save" button (blue) + "Cancel" button (outlined)

**Official Description PDF section (bottom card):**
- "Choose PDF..." file picker (disabled if PDF already exists)
- "Upload" button
- If PDF exists: filename link (opens PdfViewerModal) + "Remove" button (red)
- Upload/remove status messages inline

**Delete confirmation:** ConfirmModal with title "Delete this module?" and message "This will permanently remove the module from the catalog. This action cannot be undone." On confirm: `DELETE /api/modules/:id`, navigate to `/admin/modules`.

**Interactions:**

| Element | Action |
|---------|--------|
| "Back to Catalog" | Navigate to `/admin/modules` |
| "Official Description" | Open PdfViewerModal (`/api/modules/:id/pdf`) |
| "Edit" per field | Inline edit mode |
| "Save" per field | `PUT /api/modules/:id`, shows SavedToast |
| "Cancel" per field | Restore original value |
| "Delete Module" | Opens ConfirmModal |
| Upload PDF | `POST /api/modules/:id/pdf` (multipart) |
| Remove PDF | `DELETE /api/modules/:id/pdf` |

**API Calls:** On mount: `GET /api/modules/:id` + `HEAD /api/modules/:id/pdf`

---

### Admin Add New Module

**Route:** `/admin/modules/new`
**Auth:** ADMIN role required
**File:** `src/pages/AdminAddModulePage.jsx`

**Header:** PageHeader component: "Back to Catalog" link (left) + "Add New Module" title (center).

**Form (ModuleFormCard component):** Fields: Title, Description, Credits, Lecturer Name, Lecturer Email, Semester, Campus, Module Type (dropdown: COMPULSORY / ELECTIVE). Required fields: title, semester, credits, moduleType, lecturerName, lecturerEmail, campus.

**PDF section (optional):** File picker for PDF upload. If file selected and module created, PDF is uploaded via `POST /api/modules/:id/pdf`.

**Action buttons (bottom right):**
- "Cancel" (outlined): navigate to `/admin/modules`
- "Save Module" (blue, disabled while saving)

**Interactions:**

| Element | Action |
|---------|--------|
| "Back to Catalog" link | Navigate to `/admin/modules` |
| "Cancel" button | Navigate to `/admin/modules` |
| "Save Module" | `POST /api/modules`. On success: navigate to `/admin/modules/:newId?created=true` |

**Validation:** All required fields checked client-side. Credits must be at least 1.

---

### Student Dashboard

**Route:** `/dashboard`
**Auth:** STUDENT role required
**File:** `src/pages/StudentDashboardPage.jsx`

**Page title:** "My Semester Planner" (`h1`)

**Layout:** Two-column flex on md+ (`flex flex-col md:flex-row gap-6 h-[520px]`). Each column is a white card that fills the 520px height.

#### Left Column: My Modules

**Header (two rows):**
- Row 1: "My Modules" title + "Browse Modules" button (blue, navigates to `/modules`)
- Row 2: Status bar pill: "X modules selected • Y of 2 elective slots used" (green dot between counts)

**Module list (scrollable):**
Each module row (`ModuleRowPlanner`) shows:
- Module title (truncated), "Semester X · Y ECTS" + Badge
- Action buttons: "View Detail" (outlined, navigates to `/modules/:id?from=planner`), "My Notes" (`bg-indigo-50 text-indigo-600`, opens NotesModal overlay), "Remove" (`bg-red-50 text-red-600`, opens ConfirmModal)

Modules sorted: compulsory first, then by semester (ascending).

**Empty state:** "No modules added yet." + "Browse the catalog to add modules" link.

#### Right Column: My Calendar

**Header (two rows):**
- Row 1: "My Calendar" title + custom calendar filter dropdown + "Add Calendar" button (blue)
- Row 2: View mode toggle: Events | Day | Week | Month (segmented button group)

**Calendar filter dropdown:**
- "All Calendars" option
- Per connected calendar: colored dot + name, trash icon for deletion (inline confirm: "Remove this calendar? Yes / Cancel")
- Click outside closes dropdown

**Calendar views:**

| View | Behavior |
|------|---------|
| Events (default) | Agenda list from today onwards, grouped by date. All-day events first per day. Click event: opens event detail modal |
| Day | Single-day time grid (24 hours, 56px/hour). Nav arrows + date label |
| Week | 7-column time grid (Mon-Sun). ISO week number badge. Nav arrows + date range |
| Month | Month grid (Mon-Sun rows). Up to 3 timed events per cell, "+N more" overflow |

All time-grid views: current-time red line indicator, auto-scroll to 07:00 on view open.

**Event coloring:** Each calendar assigned a color from a 6-color palette (`#1a73e8`, `#e67c73`, `#33b679`, `#f6bf26`, `#8e24aa`, `#039be5`). Overlapping events flagged with amber left border + "overlap" badge.

**Event detail modal:** Click any event opens a centered white card (full-screen backdrop) showing: title, date, time (or "All day"), calendar name (colored). Overlap warning if applicable. Click outside or X to close.

**Empty state (no calendars):** "No upcoming events." (in Events view).

**Add Calendar popup (AddCalendarPopup):** Modal overlay with ICS URL field, Display Name field, Cancel + "Add Calendar" buttons. POST `/api/calendars`.

**Overlays on dashboard:**
- NotesModal (see below)
- ConfirmModal for remove module

**API Calls:**
- On mount: `GET /api/planner` + (calendar section: `GET /api/calendars` + `GET /api/calendars/events/all`)
- Add calendar: `POST /api/calendars`
- Delete calendar: `DELETE /api/calendars/:id`
- Remove module: `DELETE /api/planner/:moduleId`

---

### Notes Modal

**Trigger:** "My Notes" button on a module row in the dashboard
**Component:** `src/components/dashboard/NotesModal.jsx`
**Overlay:** Fixed full-screen backdrop (`bg-black/50`); click outside closes

**Modal card:** White, `rounded-modal`, `max-w-lg`, `shadow-modal`

**Header:**
- Module title + "lecturerName · lecturerEmail"
- Expand icon (navigates to `/notes/:moduleId` full-page view)
- X close button

**Three internal states:**

| State | Trigger | Note area | Footer buttons |
|-------|---------|-----------|----------------|
| `empty` | No note exists | Editable textarea (empty), blue border on focus | "Save Note" (primary, disabled if blank) |
| `view` | Note exists, just loaded or after save | Read-only pre-wrap div, gray bg, 192px height | "Delete Note" (danger outlined) + "Edit Note" (primary) |
| `edit` | After clicking "Edit Note" | Editable textarea, primary border, 192px height | "Delete Note" (danger outlined) + "Save Note" (success green) |

**Delete Note:** Opens ConfirmModal (separate from the notes modal DOM). On confirm: `DELETE /api/notes/:moduleId`, resets to empty state.

**API Calls:**
- On open: `GET /api/notes/:moduleId`
- Save: `POST /api/notes/:moduleId` with `{ content }`
- Delete: `DELETE /api/notes/:moduleId`

---

### Note Detail Page (Full-Page Editor)

**Route:** `/notes/:moduleId`
**Auth:** STUDENT role required
**File:** `src/pages/NoteDetailPage.jsx`

**Header:** PageHeader: "Back to My Planner" link + "[Module Title]: My Note" title.

**Subtitle:** "lecturerName · lecturerEmail"

**Content card (white, shadow-card):**
- View mode: `<pre>` with `whitespace-pre-wrap`, min-height 24rem. Italic "No note written yet." if empty.
- Edit mode: `<textarea>` with 24rem height (h-96), primary border, resize disabled.

**Footer (inside card):**
- Left: "Delete Note" (danger outlined button)
- Right (view mode): "Edit Note" (primary)
- Right (edit mode): "Cancel" (outlined) + "Save Note" (success green)

**Delete:** Opens ConfirmModal. On confirm: `DELETE /api/notes/:moduleId`, navigate to `/dashboard`.

**API Calls:**
- On mount: `GET /api/modules/:moduleId` + `GET /api/notes/:moduleId`
- Save: `POST /api/notes/:moduleId`
- Delete: `DELETE /api/notes/:moduleId`

---

### Student Module Catalog

**Route:** `/modules`
**Auth:** Public (unauthenticated users can browse; auth required to add modules)
**File:** `src/pages/StudentCatalogPage.jsx`

**Header:**
- "Back to My Planner" link (only shown when authenticated)
- "Module Catalog" title (`h1`)

**SuccessBanner:** Shown when a module is successfully added. Message: `"[Module Title]" added to your semester plan.`

**Error banners:** Red inline banners for server errors or elective limit violations.

**Filter bar (inside white card):**
- Semester dropdown (All Semesters / Semester 1-6)
- Type dropdown (All Types / Compulsory / Elective)
- Module count label
- "Programme Resources" button (opens ProgrammeDocsModal)

**Module table:** Sorted alphabetically by title.

**Per row actions:**
- "View Detail" button (navigates to `/modules/:id`)
- If not authenticated: "Login to add" (green, navigates to `/login`)
- If authenticated and in planner: "Remove" (red bg) + "Added" badge (green)
- If authenticated and not in planner: "Add" (green)

**Business rule:** If student tries to add a 3rd elective: client-side check shows error message before calling API. Server also returns 409 which is caught and shown.

**Remove confirmation:** ConfirmModal with "Remove from Planner" title and message about note deletion. On confirm: `DELETE /api/planner/:moduleId`.

**API Calls:**
- On mount: `GET /api/modules` + (if authenticated) `GET /api/planner`
- Add module: `POST /api/planner/:moduleId`
- Remove module: `DELETE /api/planner/:moduleId`

---

### Student Module Detail

**Route:** `/modules/:id` (also used with `?from=planner` for planner origin)
**Auth:** Public for viewing; authenticated for add/remove actions
**File:** `src/pages/StudentModuleDetailPage.jsx`

**Back link:** "Back to Catalog" (`/modules`) or "Back to My Planner" (`/dashboard`) depending on `?from=planner` param.

**Header area:**
- "Official Description" button (blue, left): opens PdfViewerModal
- "Module Detail" title (centered)
- Right button (depends on auth/planner state):
  - Not authenticated: "Login to add" (blue, link to `/login`)
  - In planner: "Remove Module" (red)
  - Not in planner: "Add Module" (blue)

**Fields (read-only):** Same 8 fields as admin detail: Module Name, Description, Module Type (Badge), Credits (ECTS), Campus, Semester, Lecturer, Lecturer Email.

**After Add or Remove:** Navigate to back destination (`/modules` or `/dashboard`).

**API Calls:**
- On mount: `GET /api/modules/:id` + (if authenticated) `GET /api/planner/:id/status`
- Add: `POST /api/planner/:id`, then navigate
- Remove: `DELETE /api/planner/:id`, then navigate

---

### Edit Profile

**Route:** `/profile`
**Auth:** Any authenticated role
**File:** `src/pages/EditProfilePage.jsx`

**Back link:**
- Admin: "Back to Module Catalog" (`/admin/modules`)
- Student: "Back to My Planner" (`/dashboard`)

**SuccessBanner:** "Your profile has been updated successfully." (shown after successful save).

**Form sections (in one white card):**

**Personal Information:**
- First name + Last name (side by side on sm+), both editable
- Email: editable for students; **disabled (grayed)** for admins
- Admin-only helper text: "To change your email address, please contact the system administrator."

**Change Password:**
- Helper text: "Leave blank to keep your current password."
- Current password (required only when changing password)
- New password + Confirm new password (side by side on sm+)

**Buttons (bottom of card):**
- Students only: "Delete Account" (danger outlined, left side): opens ConfirmModal
- "Save Changes" (blue, right side)

**Delete Account:** ConfirmModal. On confirm: `DELETE /api/auth/me`, clear auth, navigate to `/`.

**Credential update on password change:** After saving new password, `updateStoredCredentials(email, newPassword)` is called to keep localStorage in sync.

**API Calls:**
- On mount: `GET /api/auth/me`
- Save: `PUT /api/auth/me` with `{ firstName, lastName, email (student only), password (if changing), currentPassword (if changing) }`
- Delete account: `DELETE /api/auth/me`

---

## Navigation Flow Summary

### Public (not logged in)

```
/ (Landing)    ->  /login
               ->  /register
               ->  /modules (browse catalog)
/login         ->  /register
               ->  authenticate -> /admin/modules or /dashboard
/register      ->  /login?registered=true
/modules       ->  /modules/:id (read-only detail, "Login to add" button)
/modules/:id   ->  /login (if clicking "Login to add")
```

### After Authentication

```
Login as ADMIN   ->  /admin/modules
Login as STUDENT ->  /dashboard
```

### Admin Flow

```
/admin/modules         -> /admin/modules/new       (Add New Module)
                       -> /admin/modules/:id       (View Details)
                       -> /profile                 (Edit Profile, navbar)
/admin/modules/new     -> /admin/modules/:id?created=true  (after save)
                       -> /admin/modules           (Cancel or Back)
/admin/modules/:id     -> /admin/modules           (Back to Catalog)
                       -> ConfirmModal (delete)    -> /admin/modules (after delete)
                       -> PdfViewerModal (Official Description)
/profile               -> /admin/modules           (Back to Module Catalog)
Any admin page         -> /login                   (Logout)
```

### Student Flow

```
/dashboard          -> /modules                     (Browse Modules button)
                    -> /modules/:id?from=planner    (View Detail on module row)
                    -> NotesModal overlay           (My Notes on module row)
                    -> ConfirmModal overlay         (Remove on module row)
                    -> /profile                    (Edit Profile, navbar)
NotesModal          -> /notes/:moduleId            (Expand icon)
                    -> ConfirmModal overlay        (Delete Note)
/modules            -> /modules/:id               (View Detail)
                    -> /dashboard                 (Back to My Planner, if auth)
                    -> ConfirmModal overlay        (Remove)
/modules/:id        -> /modules                   (Back to Catalog)
                    -> /dashboard                 (Back to My Planner, if ?from=planner)
/notes/:moduleId    -> /dashboard                 (Back to My Planner)
                    -> /dashboard                 (after note delete)
/profile            -> /dashboard                 (Back to My Planner)
                    -> /                          (after account delete)
Any student page    -> /login                     (Logout)
```

### Logo Click Behavior

| Auth State | Destination |
|------------|-------------|
| Not logged in | `/` (Landing Page) |
| Logged in as Admin | `/admin/modules` |
| Logged in as Student | `/dashboard` |

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|---------|
| Desktop (md+, 768px+) | Two-column dashboard (modules + calendar side by side). ChatBot panel is 400px wide. |
| Mobile (below 768px) | Dashboard stacks to single column. ChatBot panel spans full width. Navbar hides "Logged in as" text. |

Module tables remain scrollable at all widths. Modals remain centered with `max-w-md` or `max-w-lg` constraints.

---

## API Endpoint Reference

### Authentication

| Endpoint | Method | Auth | Used By |
|----------|--------|------|---------|
| `/api/auth/register` | POST | Public | Register Page |
| `/api/auth/me` | GET | Any auth | All pages (get user info on load) |
| `/api/auth/me` | PUT | Any auth | Edit Profile |
| `/api/auth/me` | DELETE | Any auth | Edit Profile (student delete account) |

### Modules

| Endpoint | Method | Auth | Used By |
|----------|--------|------|---------|
| `/api/modules` | GET | Public | Admin Catalog, Student Catalog |
| `/api/modules/:id` | GET | Public | Admin Detail, Student Detail, Note pages |
| `/api/modules` | POST | Admin | Admin Add Module |
| `/api/modules/:id` | PUT | Admin | Admin Module Detail (field edit) |
| `/api/modules/:id` | DELETE | Admin | Admin Module Detail (delete) |
| `/api/modules/:id/pdf` | GET | Public | Admin Detail, Student Detail (PdfViewerModal) |
| `/api/modules/:id/pdf` | POST | Admin | Admin Detail (upload PDF), Admin Add Module |
| `/api/modules/:id/pdf` | DELETE | Admin | Admin Module Detail |
| `/api/modules/:id/pdf/from-upload/:uploadId` | POST | Admin | ChatBot (link uploaded doc as module PDF) |

### Planner

| Endpoint | Method | Auth | Used By |
|----------|--------|------|---------|
| `/api/planner` | GET | Student | Dashboard, Student Catalog |
| `/api/planner/:moduleId` | POST | Student | Student Catalog, Student Module Detail |
| `/api/planner/:moduleId` | DELETE | Student | Dashboard, Student Catalog, Student Module Detail |
| `/api/planner/:moduleId/status` | GET | Student | Student Module Detail |

### Notes

| Endpoint | Method | Auth | Used By |
|----------|--------|------|---------|
| `/api/notes/:moduleId` | GET | Student | NotesModal, Note Detail Page |
| `/api/notes/:moduleId` | POST | Student | NotesModal, Note Detail Page, ChatBot note save |
| `/api/notes/:moduleId` | DELETE | Student | NotesModal, Note Detail Page |

### Calendars

| Endpoint | Method | Auth | Used By |
|----------|--------|------|---------|
| `/api/calendars` | GET | Student | My Calendar Section |
| `/api/calendars` | POST | Student | Add Calendar Popup |
| `/api/calendars/:id` | DELETE | Student | Calendar filter dropdown |
| `/api/calendars/:id/events` | GET | Student | (available, not directly used in UI) |
| `/api/calendars/events/all` | GET | Student | My Calendar Section (loads all events) |

### Chat and RAG

| Endpoint | Method | Auth | Used By |
|----------|--------|------|---------|
| `/api/chat` | POST | Optional | ChatBot (non-streaming fallback) |
| `/api/chat/stream` | POST | Optional | ChatBot (SSE streaming, primary) |
| `/api/rag/upload` | POST | Any auth | ChatBot file upload |
| `/api/rag/uploads` | GET | Any auth | ChatBot documents panel |
| `/api/rag/uploads/:id` | DELETE | Any auth | ChatBot documents panel |
| `/api/rag/uploads/:id/file` | GET | Any auth | ChatBot (view/download file) |
| `/api/rag/uploads/unlinked` | DELETE | Any auth | (cleanup on logout) |
| `/api/rag/match-module` | GET | Admin | ChatBot (admin upload flow) |

### Programme Documents

| Endpoint | Method | Auth | Used By |
|----------|--------|------|---------|
| `/api/programme-docs` | GET | Public | ProgrammeDocsModal |
| `/api/programme-docs/:section/:filename` | GET | Public | ProgrammeDocsModal (view/download) |
| `/api/programme-docs/:section` | POST | Admin | ProgrammeDocsModal (upload) |
| `/api/programme-docs/:section/:filename` | DELETE | Admin | ProgrammeDocsModal (delete) |

---

## Key Implementation Notes

**Auth:** HTTP Basic Authentication. Credentials stored base64-encoded in `localStorage` under `auth_credentials`. The Axios instance in `api.js` injects the Authorization header on every request. On 401 (excluding `/api/auth/me`), credentials are cleared and the user is redirected to `/login`.

**Student Module Catalog is public:** Unauthenticated users can browse and view module details. The "Add" button becomes "Login to add" for unauthenticated visitors.

**Notes flow has two entry points:**
1. NotesModal overlay (from dashboard "My Notes" button): quick inline edit
2. NoteDetailPage (`/notes/:moduleId`): full-page editor, reachable via expand icon in NotesModal

**ChatBot panels share priority:** If `showNotePanel` is true, the note panel is shown. If `moduleMatchResult` is set (admin upload), the admin panel shows. Otherwise the chat UI shows.

**Calendar data loaded once:** All events loaded on mount via `GET /api/calendars/events/all`. Client-side filtering applies per view. Re-fetches only when a calendar is added or deleted (`refreshKey` increment).

**Module sorting in dashboard:** Compulsory modules first, then electives; within each group sorted by semester number ascending.

**Module sorting in catalogs (admin and student):** Alphabetical by title.

**Elective limit enforcement:** Both client-side (before API call, in StudentCatalogPage) and server-side (returns 409 if limit exceeded). The frontend catches 409 and shows the same message.

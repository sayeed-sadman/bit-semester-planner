# BIT Semester Planner

A web application for students of the Bachelor of Science in Business
Information Technology (BIT) at FHNW University of Applied Sciences
and Arts Northwestern Switzerland.

## Table of Contents

- [Group Members](#group-members)
- [Links](#links)
- [1. Project Description](#1-project-description)
  - [1.1 Motivation](#11-motivation)
  - [1.2 What the Application Does](#12-what-the-application-does)
  - [1.3 Key Features](#13-key-features)
- [2. Analysis](#2-analysis)
  - [2.1 Use Case Diagram](#21-use-case-diagram)
  - [2.2 User Stories](#22-user-stories)
  - [2.3 Business Rules](#23-business-rules)
  - [2.4 Functional Requirements](#24-functional-requirements)
  - [2.5 Non-Functional Requirements](#25-non-functional-requirements)
- [3. Domain Design](#3-domain-design)
  - [3.1 Domain Model Overview](#31-domain-model-overview)
  - [3.2 Domain Entities](#32-domain-entities)
  - [3.3 Entity Relationships](#33-entity-relationships)
  - [3.4 Domain Model Diagram](#34-domain-model-diagram)
- [4. Frontend Design](#4-frontend-design)
  - [4.1 Technology Choice & Justification](#41-technology-choice--justification)
  - [4.2 Figma Design Reference](#42-figma-design-reference)
  - [4.3 Design System](#43-design-system)
  - [4.4 Application Pages](#44-application-pages)
  - [4.5 Key Components](#45-key-components)
  - [4.6 Responsive Layout](#46-responsive-layout)
- [5. Backend Architecture](#5-backend-architecture)
  - [5.1 Package Structure](#51-package-structure)
  - [5.2 Technology Stack](#52-technology-stack)
  - [5.3 Three-Layer Architecture](#53-three-layer-architecture)
  - [5.4 Architectural Patterns](#54-architectural-patterns)
- [6. Database & Data Model](#6-database--data-model)
  - [6.1 Database Configuration](#61-database-configuration)
  - [6.2 Entity Definitions](#62-entity-definitions)
  - [6.3 Seed Data](#63-seed-data)
- [7. REST API](#7-rest-api)
  - [7.1 API Design Principles](#71-api-design-principles)
  - [7.2 Authentication Endpoints](#72-authentication-endpoints)
  - [7.3 Module Endpoints](#73-module-endpoints)
  - [7.4 Semester Planner Endpoints](#74-semester-planner-endpoints)
  - [7.5 Notes Endpoints](#75-notes-endpoints)
  - [7.6 Calendar Endpoints](#76-calendar-endpoints)
  - [7.7 Chat & RAG Endpoints](#77-chat--rag-endpoints)
  - [7.8 Error Response Format](#78-error-response-format)
  - [7.9 OpenAPI / Swagger](#79-openapi--swagger)
- [8. Business Logic](#8-business-logic)
  - [8.1 Business Rules](#81-business-rules)
  - [8.2 Service Layer Overview](#82-service-layer-overview)
- [9. Security](#9-security)
  - [9.1 Authentication Mechanism](#91-authentication-mechanism)
  - [9.2 Role-Based Access Control](#92-role-based-access-control)
  - [9.3 Password Storage](#93-password-storage)
  - [9.4 CORS Configuration](#94-cors-configuration)
  - [9.5 Frontend Session Handling](#95-frontend-session-handling)
- [10. AI Study Assistant & RAG](#10-ai-study-assistant--rag)
  - [10.1 Feature Overview](#101-feature-overview)
  - [10.2 RAG Pipeline](#102-rag-pipeline)
  - [10.3 Document Upload Workflow — Student](#103-document-upload-workflow--student)
  - [10.4 Document Upload Workflow — Admin](#104-document-upload-workflow--admin)
  - [10.5 Knowledge Base Seeding](#105-knowledge-base-seeding)
  - [10.6 ChatBot UI & Capabilities](#106-chatbot-ui--capabilities)
  - [10.7 AI Model & External Integration](#107-ai-model--external-integration)
- [11. Calendar Integration](#11-calendar-integration)
  - [11.1 How It Works](#111-how-it-works)
  - [11.2 ICS Parsing](#112-ics-parsing)
  - [11.3 Overlap Detection](#113-overlap-detection)
  - [11.4 Calendar-Aware ChatBot](#114-calendar-aware-chatbot)
- [12. Deployment](#12-deployment)
  - [12.1 Prerequisites & Environment Variables](#121-prerequisites--environment-variables)
  - [12.2 Running on GitHub Codespaces](#122-running-on-github-codespaces)
  - [12.3 Manual Start Commands](#123-manual-start-commands)
  - [12.4 Application URLs](#124-application-urls)
  - [12.5 Demo Credentials](#125-demo-credentials)
- [13. End-to-End Demo Walkthrough](#13-end-to-end-demo-walkthrough)

---

## Group Members

| Name | GitHub Username | Contribution |
|------|----------------|--------------|
| Sayeed Sadman | @sayeed-sadman | to be confirmed |
| Eva Siegenthaler | @evasiegenthaler | to be confirmed |
| Kesanet Girmay | @Kesanet | to be confirmed |
| Renjita Byju Resmi | @RenjitaBR | to be confirmed |

## Links
- **Video Presentation:** *to be added*
- **Web Application:** Runs on GitHub Codespaces — see [Section 12](#12-deployment) for instructions
- **OpenAPI Documentation:** `https://{codespace-name}-8080.app.github.dev/swagger-ui.html` — replace `{codespace-name}` with your Codespace name, visible in the browser address bar

---

## 1. Project Description

### 1.1 Motivation

Students in the BIT program at FHNW rely on multiple digital platforms
to manage their academic activities. Module information is scattered
across Moodle, the university website, and verbal announcements during
lectures. Personal notes end up in separate documents, and academic
commitments are tracked in external calendars — making it difficult to
maintain a clear overview of semester responsibilities. Beyond
organisation, students also lack a contextual study aid that understands
their specific modules, deadlines, and schedule.

### 1.2 What the Application Does

BIT Semester Planner is a web application that serves as both a semester
planning platform and an AI-assisted study companion. It centralizes
official BIT module information, personal module notes, and calendar
events in one place, while providing an intelligent assistant that can
answer study-related questions, analyse uploaded documents, and reason
about a student's schedule. This combination enables students to plan
and prepare for their semester with fewer system switches and less risk
of missing important information.

### 1.3 Key Features

- **Semester Planner** — Add compulsory and elective BIT modules to a
  personal semester plan; the system enforces the 2-elective limit.
- **Personal Notes** — One note per module, with an inline editor on the
  dashboard and a full-page editor at `/notes/:moduleId`.
- **Calendar Integration** — Connect any ICS calendar feed; events are
  visualised in a weekly grid with overlap detection.
- **AI Study Assistant** — RAG-powered chatbot available on every page; unauthenticated visitors can ask general FHNW/BIT questions, while logged-in students and admins receive personalised assistance grounded in their own documents, notes, and calendar events, streamed via SSE.
- **Document Upload & Analysis** — Upload a PDF or DOCX; the AI extracts
  exam dates, grading, deadlines, credits, and lecturer information;
  students can save the results directly to module notes, and admins can
  apply them to the module catalogue.
- **Account Management** — Profile editing and password change (requiring
  the current password); students can permanently delete their own
  account.

---

## 2. Analysis

### 2.1 Use Case Diagram

![Use Case Diagram](docs/use-case-diagram.svg)

The diagram above illustrates the functional scope of the BIT Semester
Planner from the perspective of its two user roles. The **Admin** role
is responsible for managing the official BIT module catalogue — creating,
editing, and deleting module entries. The **Student** role covers
self-registration, semester planning, personal note management, calendar
integration, and profile management.

Use cases shared by both roles include login, profile editing, and
read access to the module catalogue. The diagram covers user stories
US-01 through US-29. The AI Study Assistant and document upload
functionality (US-31 through US-38) were introduced during development
and are not reflected in this diagram.

### 2.2 User Stories

#### Authentication

| # | Role | User Story |
|---|------|------------|
| US-01 | Admin | As an admin, I want to log into the system so that I can manage the official BIT module catalog. |
| US-02 | Student | As a student, I want to register for the system so that I can access my personal semester planner features. |
| US-03 | Student | As a student, I want to log into the system so that I can access my saved planner entries, module notes, and calendar overview. |

#### General

| # | Role | User Story |
|---|------|------------|
| US-04 | Both | As a user, I want to access a public landing page so that I can learn about the application before registering. |
| US-05 | Both | As a user, I want to use the application on different mobile devices and desktop computers so that I can access it from anywhere. |
| US-06 | Both | As a user, I want to see a consistent visual appearance across all pages so that I can navigate easily. |
| US-07 | Both | As a user, I want to edit my profile information so that I can keep my personal details up to date. |

#### BIT Module Catalog

| # | Role | User Story |
|---|------|------------|
| US-08 | Admin | As an admin, I want to see a list of all BIT modules so that I can manage the official module catalog. |
| US-09 | Admin | As an admin, I want to filter modules by semester and elective status so that I can quickly find specific modules to maintain. |
| US-10 | Admin | As an admin, I want to open a module detail page so that I can review the official module information before making changes. |
| US-11 | Admin | As an admin, I want to create a new module entry so that newly offered modules can be added to the official catalog. |
| US-12 | Admin | As an admin, I want to edit an existing module so that incorrect or outdated information can be updated. |
| US-13 | Admin | As an admin, I want to delete a module so that obsolete or no longer relevant modules can be removed from the catalog. |
| US-14 | Student | As a student, I want to see a list of all BIT modules so that I can explore available courses. |
| US-15 | Student | As a student, I want to filter modules by semester and elective status so that I can quickly find relevant modules. |
| US-16 | Student | As a student, I want to open a module detail page so that I can view the official module information. |
| US-17 | Student | As a student, I want to add a module to my semester planner so that I can organize my semester plan. |
| US-18 | Student | As a student, I want to remove a module from my semester planner so that I can update my plan if my course selection changes. |
| US-19 | Public | As an unauthenticated visitor, I want to browse the module catalog and view module details without logging in so that I can explore available BIT modules before deciding to register. |

#### Semester Planner

| # | Role | User Story |
|---|------|------------|
| US-20 | Student | As a student, I want to see my selected modules in a structured semester planner so that I can keep track of my planned courses. |
| US-21 | Student | As a student, I want to view key module details such as title, lecturer, and contact information in the planner so that I can quickly understand each planned module. |
| US-22 | Student | As a student, I want to open the full details of a planned module so that I can access the complete official module information when needed. |
| US-23 | Student | As a student, I want to add personal notes to a module so that I can store important information such as exam rules, bonus points, assignment reminders, and preparation tips. |
| US-24 | Student | As a student, I want to edit or remove my notes so that I can keep my personal module information up to date. |
| US-25 | Student | As a student, I want my notes to remain linked to the corresponding module so that I can easily retrieve them later. |

#### Calendar Overview

| # | Role | User Story |
|---|------|------------|
| US-26 | Student | As a student, I want to connect one or more ICS-compatible calendars via a URL so that I can access my existing events inside the application. |
| US-27 | Student | As a student, I want the application to display events from all connected calendars in one weekly view so that I have a consolidated overview of my commitments. |
| US-28 | Student | As a student, I want to see overlapping events across my connected calendars so that I can detect conflicts and plan my time better. |
| US-29 | Student | As a student, I want the calendar view to be read-only so that event creation, updates, and deletions remain managed in my external calendar applications. |
| US-30 | Student | As a student, I want to click on a calendar event to see its full details in a popup so that I can view the event title, date, time, and calendar name without leaving the dashboard. |

#### Study Assistant & Document Upload

| # | Role | User Story |
|---|------|------------|
| US-31 | Both | As a student or admin, I want to upload a PDF or DOCX so that the AI can analyse its content. |
| US-32 | Student | As a student, I want the AI to extract exam dates, deadlines, and grading from my upload so that I can quickly capture key information from lecture documents. |
| US-33 | Student | As a student, I want to save the extracted information directly to my module notes so that I do not have to copy it manually. |
| US-34 | Admin | As an admin, I want the system to match an uploaded PDF to an existing module so that I can update the module catalogue with accurate information. |
| US-35 | Both | As a student or admin, I want to ask the AI study assistant questions about my modules and receive streamed answers so that I get immediate, contextual responses. |
| US-36 | Student | As a student, I want the chatbot to be aware of my calendar events when answering scheduling questions so that its responses reflect my actual commitments. |
| US-37 | Public | As an unauthenticated visitor, I want to ask the AI study assistant general questions about FHNW and the BIT programme so that I can learn about the programme before registering. |
| US-38 | Student | As a student, I want the AI assistant to reference my saved module notes when answering questions so that I can ask about note content even after deleting the uploaded document. |

### 2.3 Business Rules

The following business rules define the constraints and policies that govern the behaviour of the BIT Semester Planner.

| ID | Business Rule | Purpose |
|----|---------------|---------|
| BR-01 | A student may add a maximum of 2 elective modules to their semester plan. | Reflects the official BIT programme constraint on elective module selection. |
| BR-02 | The same module cannot be added to a student's plan more than once. | Prevents duplicate entries and ensures plan integrity. |
| BR-03 | Each student has at most one note per module. Submitting a note when one already exists updates it rather than creating a duplicate. | Keeps notes organised and avoids redundant records per module. |
| BR-04 | An admin's email address cannot be changed after account creation. | Protects the integrity of the fixed admin identity used for system access. |
| BR-05 | Changing a password requires the user's current password to be provided. | Prevents unauthorised password changes if a session is left open. |
| BR-06 | Removing a module from the semester plan automatically deletes the associated note. | Keeps personal data consistent and avoids orphaned notes for modules no longer in the plan. |
| BR-07 | A student may only view, modify, or delete their own calendar entries. | Enforces data privacy between student accounts. |
| BR-08 | A student may only delete documents they have uploaded themselves. | Prevents students from modifying or removing another user's uploaded content. |
| BR-09 | Self-registration always creates a Student account. Admin accounts cannot be created through the registration flow. | Ensures admin privileges are assigned only through controlled account provisioning. |
| BR-10 | Email addresses must be unique across all user accounts. | Guarantees that each email identifies exactly one account and prevents login ambiguity. |

### 2.4 Functional Requirements

| ID | Functional Requirement |
|----|------------------------|
| **Authentication & Account Management** | |
| FR-01 | The system shall support two user roles: Admin and Student. |
| FR-02 | Students shall be able to self-register using a first name, last name, email address, and password. Access is granted immediately upon registration. |
| FR-03 | Admin accounts shall be provisioned by the system and cannot be created through the self-registration flow. |
| FR-04 | All users shall authenticate using their email address and password. |
| FR-05 | All users shall be able to update their name and password. Students may additionally update their email address; the admin email address is fixed. |
| FR-06 | Password changes shall require the user's current password to be provided. |
| FR-07 | Students shall be able to permanently delete their own account. |
| FR-08 | After login, the system shall redirect users to the appropriate view based on their role. |
| **Module Catalog** | |
| FR-09 | The module catalogue shall be publicly accessible without requiring login. |
| FR-10 | All users shall be able to view module details including title, description, credits, semester, campus, and module type. |
| FR-11 | Both roles shall be able to filter modules by semester and by module type (elective or compulsory). |
| FR-12 | Admins shall be able to create, edit, and delete modules in the catalogue. |
| **Semester Planner** | |
| FR-13 | Students shall be able to add modules from the catalogue to their personal semester plan. |
| FR-14 | Students shall be able to remove modules from their semester plan. |
| FR-15 | The system shall enforce a maximum of 2 elective modules per semester plan and reject any attempt to exceed this limit with a clear message. |
| FR-16 | The planner shall display each planned module with its title, semester, and module type. |
| **Notes Management** | |
| FR-17 | Students shall be able to create and edit a personal text note for each module in their semester plan. |
| FR-18 | Each student shall have at most one note per module. Saving a note when one already exists shall update it rather than create a duplicate. |
| FR-19 | Removing a module from the semester plan shall automatically delete its associated note. |
| FR-20 | Notes shall be accessible from both an inline dashboard editor and a dedicated full-page editor. |
| **Calendar Integration** | |
| FR-21 | Students shall be able to connect one or more ICS-compatible calendar feeds by providing a URL and a display name. |
| FR-22 | The system shall fetch and display events from connected calendars in a read-only weekly view. |
| FR-23 | Students shall be able to navigate between weeks to view past and future calendar events. |
| FR-24 | The system shall detect and visually highlight overlapping events across connected calendars. |
| FR-25 | Calendar events shall be read-only within the application; creation, editing, and deletion remain in the external calendar tool. |
| **AI Study Assistant** | |
| FR-26 | An AI-powered study assistant shall be available on every page of the application, including public pages. Unauthenticated visitors may ask general questions about FHNW and the BIT programme; authenticated users additionally receive personalised assistance based on their data. |
| FR-27 | The assistant shall answer questions related to FHNW studies, BIT modules, uploaded documents, and academic deadlines. |
| FR-28 | When responding to scheduling questions, the assistant shall take the student's connected calendar events into account. |
| FR-29 | Chat history shall be retained for the duration of the browser session and cleared when the browser is closed. |
| **Document Upload & Analysis** | |
| FR-30 | Students and admins shall be able to upload PDF and DOCX files for AI-assisted analysis. |
| FR-31 | The system shall extract key information from uploaded documents, including exam dates, deadlines, grading criteria, credits, and lecturer details. |
| FR-32 | Students shall be able to save extracted information directly to the notes of a selected module. |
| FR-33 | Admins shall be able to match the content of an uploaded document to an existing module and apply the extracted information to update it. |
| FR-34 | Admins shall be able to use extracted document content to pre-fill a new module creation form. |
| FR-35 | Students and admins shall be able to view and delete documents they have previously uploaded. |

### 2.5 Non-Functional Requirements

| ID | Non-Functional Requirement |
|----|---------------------------|
| **Architecture** | |
| NFR-01 | The application shall implement a three-layer architecture across two tiers: a React single-page application as the frontend tier, and a backend providing presentation, business logic, and persistence layers. |
| NFR-02 | The frontend and backend shall communicate exclusively via a RESTful HTTP API. |
| NFR-03 | The application shall provide distinct views for all major user tasks and exceed the minimum assessment requirement of four views. |
| **Usability** | |
| NFR-04 | The application shall be usable on both desktop and mobile devices through a responsive layout. |
| NFR-05 | The application shall maintain a consistent visual identity — including typography, colour scheme, and component style — across all pages. |
| NFR-06 | All destructive actions, such as module removal, note deletion, and account deletion, shall require explicit user confirmation before execution. |
| **Performance** | |
| NFR-07 | The system shall provide responsive user feedback during AI-assisted interactions to minimise perceived waiting time. |
| **Reliability** | |
| NFR-08 | All business rules shall be enforced on the server side and cannot be bypassed through the user interface or direct API access. |
| NFR-09 | Application data shall persist between application restarts using durable database storage. |
| **Security** | |
| NFR-10 | All protected API endpoints shall require authentication. Requests without valid credentials shall be rejected with an appropriate error response. |
| NFR-11 | Access to sensitive operations shall be restricted by user role. Admin-only operations shall not be accessible to Student accounts, and vice versa. |
| NFR-12 | User passwords shall be stored using a one-way cryptographic hash. Plain-text passwords shall never be stored, logged, or transmitted. |
| NFR-13 | The system shall support secure communication between frontend and backend components across deployment environments. |
| **Maintainability** | |
| NFR-14 | The application shall apply established software design principles, including separation of concerns, the DRY principle, and the CRUD paradigm. |
| **Data Integrity** | |
| NFR-15 | The database schema shall comprise 7 entities. Referential integrity shall be enforced through foreign key relationships and cascading deletion rules. |
| NFR-16 | Unique constraints shall prevent duplicate email addresses across user accounts and duplicate module entries within a single student's semester plan. |
| **Documentation** | |
| NFR-17 | All API endpoints shall be documented using OpenAPI 3.0 and accessible via Swagger UI from the running application without requiring access to the source code. |
| **Portability** | |
| NFR-18 | The application shall be deployable on GitHub Codespaces without requiring local installation. All services shall start automatically when the development environment is initialised. |
| NFR-19 | The application shall be fully reproducible by any team member or evaluator directly from the repository, with no additional configuration required. |
| **Version Control** | |
| NFR-20 | All source code and project artefacts shall be maintained in a Git-based version control repository with traceable change history. |

---

## 3. Domain Design

### 3.1 Domain Model Overview

The domain model of the BIT Semester Planner reflects the core entities
and relationships that underpin the application's functionality. It
comprises seven domain entities, each representing a distinct concept
within the academic planning and study support domain. The model was
designed to support both the original semester planning features and the
AI-assisted functionality introduced during development.

At the centre of the model is the **User** entity, which represents both
Admin and Student accounts within a single type differentiated by role.
The **Module** entity captures the official BIT module catalogue managed
by admins. The **StudentModule** entity links students to modules they
have added to their personal semester plan, while the **Note** entity
stores the personal text notes a student maintains per planned module.

Calendar integration is supported by the **StudentCalendar** entity,
which stores the ICS feed connections a student has configured. Document
management and AI-assisted workflows are supported by two closely related
entities: **DocumentUpload**, which records files uploaded by students or
admins for AI analysis, and **DocumentChunk**, which stores extracted
text segments used to support contextual document retrieval during
AI-assisted interactions.

Together, these seven entities cover all major functional domains of the
application: module management, semester planning, personal notes,
calendar integration, and AI-assisted document analysis.

### 3.2 Domain Entities

| Entity | Purpose | Key Responsibilities |
|--------|---------|----------------------|
| User | Represents all system accounts, covering both Admin and Student roles within a single unified type. | Holds identity and authentication credentials. The role attribute determines which features and views the account may access after login. |
| Module | Represents an official BIT module and acts as the authoritative source of module information throughout the application. | Stores all module information including title, description, credits, semester, campus, and module type (compulsory or elective). Admin accounts are the only role that may create, update, or delete modules. |
| StudentModule | Represents the relationship between a student and a module they have added to their personal semester plan. | Records which modules a student has selected and when each was added. Enforces the constraint that the same module cannot appear more than once in a student's plan. Removing this record also removes the associated note. |
| Note | Represents a personal text note written by a student for a specific planned module. | Stores free-form note content linked to both a student and a module. Each student may hold at most one note per module; saving a note when one exists replaces it. |
| StudentCalendar | Represents an ICS-compatible calendar feed connected by a student. | Provides access to external calendar events within the application while keeping calendar management in the student's preferred calendar platform. |
| DocumentUpload | Represents a file uploaded by a student or admin for AI-assisted analysis. | Records uploaded documents and serves as the entry point for AI-assisted document analysis and knowledge retrieval. |
| DocumentChunk | Represents a single extracted text segment from an uploaded document. | Stores extracted document content that can be used to provide contextual information during AI-assisted interactions. |

### 3.3 Entity Relationships

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| User → StudentModule | One-to-Many | One student may have many semester plan entries. Each plan entry belongs to exactly one student. Removing a student removes all their plan entries. |
| Module → StudentModule | One-to-Many | One module may appear in many students' semester plans. Each plan entry references exactly one module. |
| Student ↔ Module | Many-to-Many (via StudentModule) | Students may add multiple modules to their semester plan, and each module may be planned by multiple students. The StudentModule entity represents this relationship. |
| User → Note | One-to-Many | One student may have many notes, each linked to a different module. Each note belongs to exactly one student. Removing a student removes all their notes. |
| Module → Note | One-to-Many | One module may have notes from many different students. Each note is associated with exactly one module. |
| User → StudentCalendar | One-to-Many | One student may connect many calendar feeds. Each connected calendar belongs to exactly one student. Removing a student removes all their calendar connections. |
| User → DocumentUpload | One-to-Many | One student or admin may have many uploaded documents. Shared knowledge documents may exist independently of a specific user, distinguished by a null student reference. |
| DocumentUpload → DocumentChunk | One-to-Many | One uploaded document produces many text chunks during analysis. Each chunk belongs to exactly one document and is removed if the document is deleted. |

### 3.4 Domain Model Diagram

The following diagram illustrates the final domain model of the BIT Semester Planner and the relationships between its seven core entities.

![Domain Model Diagram](docs/domain-model-diagram.svg)

---

## 4. Frontend Design

### 4.1 Technology Choice & Justification
The frontend is implemented as a full-code React application using Vite as the build tool and Tailwind CSS for styling. This full-code approach is justified by the complexity of the calendar integration (ICS parsing, weekly view rendering, conflict detection across multiple calendars) and the custom UI requirements that cannot be adequately achieved with a low-code tool such as Budibase.

### 4.2 Figma Design Reference
All 11 pages were first designed in Figma before implementation. The Figma file defines the layout, visual identity, component structure, and navigation flow for every page and interaction state.

**Figma:** https://www.figma.com/design/T7aUdDUHdcelNOJ3RdERoh/bit-semester-planner?node-id=0-1&t=upyX9Mh2vjAW33jt-1

### 4.3 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary Blue | #2563EB | Buttons, links, active states |
| Page Background | #F8FAFD | All page backgrounds |
| Card Background | #FFFFFF | Panel and card surfaces |
| Success Green | #10B981 | Success states, confirmations |
| Error Red | #DC2626 | Validation errors, destructive actions |
| Font | Inter | All text across all pages |

### 4.4 Application Pages

| Route | Component | Role | Description |
|-------|-----------|------|-------------|
| `/` | `LandingPage` | Any | Landing page with application overview and entry points for login and registration. |
| `/login` | `LoginPage` | Unauthenticated | Email and password login form. |
| `/register` | `RegisterPage` | Unauthenticated | Student self-registration form. |
| `/admin/modules` | `AdminCatalogPage` | Admin | Browse and manage all BIT modules; filter by semester and module type. |
| `/admin/modules/new` | `AdminAddModulePage` | Admin | Create a new module entry in the catalogue. |
| `/admin/modules/:id` | `AdminModuleDetailPage` | Admin | View, edit, or delete an existing module. Includes a button to open the official module description PDF in a floating viewer. |
| `/dashboard` | `StudentDashboardPage` | Student | Personal workspace combining semester planning, module notes, calendar integration, and AI-assisted study support. |
| `/modules` | `StudentCatalogPage` | Student | Browse the full BIT module catalogue with filter options. |
| `/modules/:id` | `StudentModuleDetailPage` | Student | View module details; add or remove the module from the semester plan. Includes a button to open the official module description PDF in a floating viewer. |
| `/notes/:moduleId` | `NoteDetailPage` | Student | Full-page note editor for a specific planned module. |
| `/profile` | `EditProfilePage` | Admin + Student | Edit name and password; students may also update their email address or permanently delete their account. |

### 4.5 Key Components

| Component | File | Description |
|-----------|------|-------------|
| `Navbar` | layout/Navbar.jsx | Top navigation bar with role-conditional links and logout. Adapts its content based on whether the user is unauthenticated, a student, or an admin. |
| `ProtectedRoute` | layout/ProtectedRoute.jsx | Route wrapper that enforces authentication and optional role checks. Redirects unauthenticated or unauthorised users to the appropriate page. |
| `PageHeader` | layout/PageHeader.jsx | Consistent back-navigation header used across all detail and editor pages. |
| `WeeklyCalendar` | dashboard/WeeklyCalendar.jsx | Read-only hourly 7-day calendar grid. Renders events from connected ICS feeds, supports week navigation, and visually highlights overlapping events. |
| `NotesModal` | dashboard/NotesModal.jsx | Inline slide-over note editor on the student dashboard. Supports creating, editing, and deleting a module note without leaving the dashboard. |
| `AddCalendarPopup` | dashboard/AddCalendarPopup.jsx | Form for connecting a new ICS calendar feed by entering a URL and display name. |
| `NoteDetailPage` | pages/NoteDetailPage.jsx | Full-page note editor for a specific planned module, accessible at `/notes/:moduleId`. |
| `ConfirmModal` | common/ConfirmModal.jsx | Reusable confirmation dialog used before all destructive actions such as deletion and account removal. |
| `PdfViewerModal` | common/PdfViewerModal.jsx | Full-screen overlay that renders an official module description PDF inside an iframe. Triggered from module detail pages for both admin and student roles. Closes on button click, backdrop click, or Escape key. |
| `ChatBot` | ChatBot/ChatBot.jsx | Floating AI study assistant rendered in the bottom-right corner of every page. Provides contextual study assistance through streaming responses, supports document upload (PDF and DOCX) for AI-assisted analysis, and includes a document management panel for viewing and deleting uploaded files. Displays role-specific panels after upload: note-save for students, module update or creation for admins. |
| `useChatBot` | ChatBot/useChatBot.js | Custom hook that serves as the state-management layer for the ChatBot component. Manages message history, SSE stream handling, file upload and deletion, and session-scoped chat persistence. |

### 4.6 Responsive Layout
The application is fully responsive. The student dashboard uses a two-column layout on desktop (modules left, calendar right) that stacks to a single column on mobile. All tables become scrollable on small screens. Modals remain centred with reduced width on mobile.

---

## 5. Backend Architecture

### 5.1 Package Structure

The backend is organised under the root package `ch.fhnw.bitsemesterplanner` and follows a three-layer architecture that separates presentation, business logic, and persistence concerns. Supporting packages provide configuration, exception handling, startup initialisation, and AI-assisted document processing functionality.

```
ch.fhnw.bitsemesterplanner/
│
├── BitsemesterplannerApplication.java   — application entry point; sets Europe/Zurich timezone
│
├── business/
│   ├── exception/                       — custom business exceptions
│   │   ├── BusinessRuleException.java
│   │   ├── DuplicateEntryException.java
│   │   └── EntityNotFoundException.java
│   └── service/                         — business logic layer (@Service)
│       ├── CalendarService.java
│       ├── CalendarEventDTO.java
│       ├── ModuleService.java
│       ├── NoteService.java
│       ├── StudentModuleService.java
│       ├── UserService.java
│       └── rag/                         — AI / RAG services
│           ├── ChatService.java
│           ├── RagService.java
│           ├── ExtractionService.java
│           └── ExtractionSuggestion.java
│
├── config/                              — application configuration
│   ├── SecurityConfig.java
│   ├── GlobalExceptionHandler.java      — @ControllerAdvice; maps exceptions to HTTP responses
│   ├── ErrorResponse.java               — standard error response DTO
│   ├── DataInitializer.java             — seeds users and modules on startup
│   └── KnowledgeSeeder.java             — seeds shared RAG knowledge documents on startup
│
├── controller/                          — presentation layer (@RestController)
│   ├── AuthController.java
│   ├── ModuleController.java
│   ├── StudentModuleController.java
│   ├── NoteController.java
│   ├── CalendarController.java
│   ├── ChatController.java
│   ├── DocumentController.java
│   └── dto/                             — request / response DTOs
│       ├── ChatRequest.java
│       └── ChatResponse.java
│
└── data/
    ├── domain/                          — JPA entities (@Entity)
    │   ├── User.java
    │   ├── Module.java
    │   ├── ModuleType.java              — enum: ELECTIVE / COMPULSORY
    │   ├── Role.java                    — enum: ADMIN / STUDENT
    │   ├── StudentModule.java
    │   ├── Note.java
    │   ├── StudentCalendar.java
    │   ├── DocumentUpload.java
    │   └── DocumentChunk.java
    └── repository/                      — persistence layer (@Repository)
        ├── UserRepository.java
        ├── ModuleRepository.java
        ├── StudentModuleRepository.java
        ├── NoteRepository.java
        ├── StudentCalendarRepository.java
        ├── DocumentUploadRepository.java
        └── DocumentChunkRepository.java
```

### 5.2 Technology Stack

| Technology | Purpose | Used For |
|------------|---------|----------|
| **Frontend** | | |
| React | Component-based JavaScript UI library | Building the single-page application; managing UI state and rendering across all 11 pages |
| Vite | Frontend build tool and development server | Bundling the React application; proxying `/api/*` requests to the Spring Boot backend during development |
| React Router DOM | Client-side routing library | Declaring and navigating between all application routes; integrating protected and role-restricted views. |
| Axios | Promise-based HTTP client | Making all REST API calls from the frontend; injecting Basic Auth credentials and handling 401 redirects via interceptors |
| Tailwind CSS | Utility-first CSS framework | Applying the design system (colours, typography, spacing, responsive breakpoints) consistently across all pages |
| react-markdown | Markdown rendering component | Rendering formatted AI assistant responses in the ChatBot panel |
| **Backend** | | |
| Spring Boot | Java application framework | Providing the runtime, auto-configuration, and embedded server for the REST API |
| Spring Security | Authentication and authorisation framework | Enforcing HTTP Basic Authentication, role-based access control, and CORS configuration across all API endpoints |
| Spring Data JPA / Hibernate | Object-relational mapping and data access layer | Mapping the 7 domain entities to database tables; providing repository interfaces for all CRUD operations |
| **Database** | | |
| H2 (file-based) | Embedded relational database | Persisting all application data between restarts using a local file; accessible via H2 Console for development inspection |
| **API Documentation** | | |
| springdoc-openapi / Swagger UI | OpenAPI 3.0 documentation generator | Auto-generating interactive API documentation for all 30 endpoints from controller annotations; accessible at `/swagger-ui.html` |
| **Calendar Integration** | | |
| ical4j | Java iCalendar parsing library | Fetching and parsing ICS calendar feeds from external URLs; extracting event data including all-day and datetime formats |
| **AI & RAG** | | |
| Anthropic Claude API | Large language model API | Generating contextual chat responses, producing vector embeddings for RAG retrieval, and extracting structured information from uploaded documents |
| **Document Processing** | | |
| Apache PDFBox | PDF processing library | Extracting plain text from uploaded PDF files for AI-assisted analysis and knowledge base indexing |
| Apache POI | Microsoft Office document processing library | Extracting plain text from uploaded DOCX files for AI-assisted analysis and knowledge base indexing |
| **Development Environment** | | |
| GitHub Codespaces | Cloud-based development environment | Hosting the fully reproducible development and demonstration environment; auto-starting both backend and frontend services on container launch |

### 5.3 Three-Layer Architecture

The BIT Semester Planner backend follows a three-layer architecture that separates HTTP handling, business logic, and data access into distinct, independently testable layers. All inter-layer communication follows a top-down dependency direction: the presentation layer depends on the business layer, and the business layer depends on the persistence layer. No layer bypasses this hierarchy.

**Presentation Layer — Controllers**

The presentation layer consists of seven `@RestController` classes:
`AuthController`, `ModuleController`, `StudentModuleController`,
`NoteController`, `CalendarController`, `ChatController`, and
`DocumentController`. Each controller is responsible for accepting
incoming HTTP requests, validating request parameters, delegating
processing to the appropriate service, and returning a `ResponseEntity`
with the correct HTTP status code. Controllers contain no business logic
and no direct data access. A `@ControllerAdvice` class,
`GlobalExceptionHandler`, intercepts exceptions thrown by any layer and
maps them to structured `ErrorResponse` objects with appropriate HTTP
status codes.

**Business Logic Layer — Services**

The business logic layer comprises eight `@Service` classes. The core
domain services — `UserService`, `ModuleService`,
`StudentModuleService`, `NoteService`, and `CalendarService` — enforce
all business rules and coordinate data access through repositories. The
AI-related services form a dedicated sub-group: `RagService` handles
document chunking, embedding generation, and cosine similarity
retrieval; `ChatService` constructs prompts and manages streaming
responses to the client via `SseEmitter`; and `ExtractionService`
extracts structured fields from document text using pattern matching.
All service classes use constructor injection exclusively, ensuring
dependencies are declared explicitly and the classes remain testable
without a Spring context.

**Persistence Layer — Repositories and Entities**

The persistence layer consists of seven JPA entities in the
`data.domain` package and seven corresponding Spring Data JPA
repository interfaces in `data.repository`. Each repository extends
`JpaRepository` and provides CRUD operations without requiring manual
query implementation. Custom queries are expressed using Spring Data's
derived query method conventions where needed. The H2 file-based
database is configured with `hibernate.ddl-auto=update`, allowing the
schema to evolve automatically as entities are modified.

**Request Flow**

An incoming HTTP request is received by the appropriate controller,
which delegates to a service. The service applies business rules and
interacts with one or more repositories to read or persist data. The
repository communicates with the H2 database via Hibernate. The
response travels back up through the same layers and is returned to
the client as a `ResponseEntity`.

**Frontend Integration**

During development, the React frontend communicates with the backend
via a Vite reverse proxy configured in `vite.config.js`. All requests
matching `/api/*` are forwarded to `http://localhost:8080`, eliminating
cross-origin issues during local development and allowing the frontend
to treat all API calls as same-origin requests.

### 5.4 Architectural Patterns

The following architectural patterns are applied consistently throughout
the BIT Semester Planner backend to ensure separation of concerns,
maintainability, and alignment with Spring Boot conventions.

| Pattern | Purpose | Implementation |
|---------|---------|----------------|
| **MVC** | Separates HTTP handling, business logic, and data access into distinct, independently testable layers | `@RestController` classes handle request parsing and response formatting; `@Service` classes own all business logic; `@Repository` interfaces abstract data access. No layer bypasses this hierarchy. |
| **Repository Pattern** | Decouples the business layer from persistence technology behind a stable interface | Seven Spring Data JPA repository interfaces extend `JpaRepository`, providing full CRUD and derived-query support without manual SQL or `EntityManager` calls. |
| **DTO Pattern** | Prevents domain entities from leaking persistence details into the API contract | Dedicated transfer objects — `ChatRequest`, `ChatResponse`, `CalendarEventDTO`, `ExtractionSuggestion`, and `ErrorResponse` — are used exclusively at controller boundaries. |
| **Constructor Injection** | Makes dependencies explicit and keeps classes testable without a Spring context | All controllers and services declare every dependency as a constructor parameter. No `@Autowired` field injection is used anywhere in the codebase. |
| **Global Exception Handling** | Centralises error mapping so individual controllers need not handle exceptions directly | `GlobalExceptionHandler` (`@ControllerAdvice`) intercepts application exceptions from any layer and maps them to structured `ErrorResponse` objects with appropriate HTTP status codes. |
| **Entity Lifecycle Callbacks** | Automates audit timestamp management without duplicating logic across service methods | `@PrePersist` and `@PreUpdate` annotations on `StudentModule`, `Note`, and `DocumentUpload` automatically populate `createdAt` and `updatedAt` fields on every persist and update operation. |
| **Startup Initialisation** | Ensures the application starts in a consistent, usable state by seeding required data before the first request is served | `DataInitializer` uses `@PostConstruct` to seed module catalogue and default user data; `KnowledgeSeeder` uses `@PostConstruct` to load the shared RAG knowledge base and prepare it for document retrieval. |

## 6. Database & Data Model

### 6.1 Database Configuration

The application uses an H2 embedded relational database in file-backed
mode, ensuring that all data persists across application restarts
without requiring an external database server.

| Setting | Value | Purpose |
|---------|-------|---------|
| **Database engine** | H2 (embedded, file-based) | Provides a self-contained relational database with no external dependency |
| **Database location** | `./data/bitsemesterplanner` | Stores the database file relative to the working directory; data survives container restarts |
| **DDL management** | `hibernate.ddl-auto=update` | Automatically applies schema changes when entities are modified; preserves existing data |
| **H2 Console** | Enabled at `/h2-console` | Provides a browser-accessible SQL interface for development inspection and debugging |
| **Timezone** | `Europe/Zurich` | Ensures all serialised `LocalDateTime` values are formatted consistently for Swiss users |
| **File upload limit** | 20 MB per file / 20 MB per request | Accommodates PDF and DOCX uploads for the AI document processing pipeline |

### 6.2 Entity Definitions

The following table describes the seven persisted JPA entities, their
database tables, and their most significant stored attributes. Foreign
key relationships are noted where they define the entity's primary
persistence role.

| Entity | Table | Key Attributes |
|--------|-------|----------------|
| **User** | `app_user` | `userID` (PK), `firstName`, `lastName`, `email` (unique), `password` (BCrypt hash), `role` (`STUDENT` \| `ADMIN`) |
| **Module** | `module` | `moduleID` (PK), `title`, `description`, `credits`, `semester`, `campus`, `moduleType` (`COMPULSORY` \| `ELECTIVE`), `lecturerName`, `lecturerEmail` |
| **StudentModule** | `student_module` | `entryID` (PK), FK `student_id`, FK `module_id`, `addedAt` (set automatically via `@PrePersist`); unique constraint on `(student_id, module_id)` |
| **Note** | `note` | `noteID` (PK), FK `student_id`, FK `module_id`, `content` (TEXT), `createdAt`, `updatedAt` (managed via `@PrePersist` / `@PreUpdate`); unique constraint on `(student_id, module_id)` |
| **StudentCalendar** | `student_calendar` | `calendarID` (PK), FK `student_id`, `displayName`, `icsURL` (stores the external ICS feed URL) |
| **DocumentUpload** | `document_upload` | `id` (PK), FK `student_id` (nullable, supports shared knowledge documents), `fileName`, `fileType`, `uploadedAt` (auto via `@PrePersist`), `rawText` (full extracted plain text, TEXT column) |
| **DocumentChunk** | `document_chunk` | `id` (PK), FK `document_upload_id`, `chunkIndex`, `chunkText` (TEXT), `embeddingJson` (TEXT — serialised 64-element float array used for cosine similarity retrieval) |

### 6.3 Seed Data

Two `@Component` classes execute `@PostConstruct` methods on startup to
ensure the application starts in a consistent, usable state.
Both initialisation routines are idempotent: they check for existing
data before inserting and skip any records that are already present.

**DataInitializer — Users and Modules**

`DataInitializer` seeds two default user accounts and eight BIT modules
if they are not already present in the database.

| Email | Password | Role |
|-------|----------|------|
| `admin@fhnw.ch` | `admin123` | `ADMIN` |
| `student@fhnw.ch` | `student123` | `STUDENT` |

| Module | Semester | Credits | Type | Campus |
|--------|----------|---------|------|--------|
| Algorithms and Data Structures | 4 | 3 | ELECTIVE | Basel |
| Business Intelligence | 4 | 5 | COMPULSORY | Basel |
| Internet Technology | 4 | 5 | COMPULSORY | Basel |
| Logistics and Supply Chain Management | 4 | 5 | COMPULSORY | Basel |
| Quantum Disruption | 4 | 3 | ELECTIVE | Basel |
| Social Engineering with Africa | 4 | 3 | ELECTIVE | Basel |
| Statistics and Probability | 4 | 5 | COMPULSORY | Basel |
| Topics in Business Information Technology | 4 | 5 | COMPULSORY | Basel |

User accounts are seeded individually by email check. Modules are
seeded as a batch only when the module table is empty.

**KnowledgeSeeder — Shared RAG Documents**

`KnowledgeSeeder` scans the `docs/knowledge/` directory at startup and
processes any PDF or DOCX files found there. Each file is extracted,
chunked, and embedded via the Anthropic API, then persisted as a
`DocumentUpload` (with `student = null`, marking it as shared
knowledge) along with its associated `DocumentChunk` records.
Files already present in the database are skipped. The `docs/knowledge/` directory currently contains 8 official BIT module description PDFs which are processed automatically on first startup, providing the assistant with accurate module content from day one.

---

## 7. REST API

### 7.1 API Design Principles

The BIT Semester Planner exposes a RESTful HTTP API under the `/api/`
path prefix. The following principles are applied consistently across
all 30 endpoints.

**Resource-Oriented Endpoint Design**

Endpoints are named after resources, not actions. Plural nouns identify
collections (`/api/modules`, `/api/calendars`, `/api/planner`) and path
parameters identify individual members (`/api/modules/{id}`,
`/api/notes/{moduleId}`). No verb-based or RPC-style paths are used.

**HTTP Method Semantics**

HTTP methods are used according to their standard semantics: `GET` for
read-only retrieval, `POST` for resource creation, `PUT` for full
replacement of an existing resource, and `DELETE` for removal. All
`GET` operations are idempotent and produce no side effects.

**Stateless Authentication**

Every request is authenticated independently using HTTP Basic
Authentication. Credentials are validated on each request against the
database; the server maintains no session state. This makes the API
stateless and simplifies horizontal scalability.

**Structured JSON Responses**

All request and response bodies are JSON-encoded. Controllers return
`ResponseEntity<>` on every endpoint, giving explicit control over both
the response body and the HTTP status code. Error responses follow a
uniform structure via the `ErrorResponse` DTO, produced by
`GlobalExceptionHandler` for all exception types.

**HTTP Status Codes**

Status codes are selected to accurately reflect the outcome of each
operation: `200 OK` for successful reads and updates, `201 Created` for
successful resource creation, `204 No Content` for successful
deletions, `400 Bad Request` for validation failures, `401 Unauthorized`
for missing or invalid credentials, `403 Forbidden` for insufficient
role privileges, `404 Not Found` for missing resources, and
`409 Conflict` for constraint violations such as duplicate enrolments.

### 7.2 Authentication Endpoints

The application does not expose a dedicated login endpoint. Authentication
is handled via HTTP Basic Authentication on every request: the frontend
sends Base64-encoded credentials in the `Authorization` header, and the
server validates them against the database on each call. `GET /api/auth/me`
is used by the frontend to verify credentials and retrieve the current
user's profile on sign-in.

| Method | Endpoint | Purpose | Authentication Required |
|--------|----------|---------|------------------------|
| `POST` | `/api/auth/register` | Register a new student account. Returns `201 Created` on success; `409 Conflict` if the email is already in use. | No — public endpoint |
| `GET` | `/api/auth/me` | Return the currently authenticated user's profile. Used by the frontend to verify credentials and load user state on login. | Yes — any authenticated user |
| `PUT` | `/api/auth/me` | Update the current user's profile fields (`firstName`, `lastName`, `email`, `password`). Requires the current password for verification. Returns `409 Conflict` if the new email is already taken. | Yes — any authenticated user |
| `DELETE` | `/api/auth/me` | Permanently delete the current user's account and all associated data. | Yes — `STUDENT` role only |

### 7.3 Module Endpoints

| Method | Endpoint | Purpose | Authentication Required |
|--------|----------|---------|------------------------|
| `GET` | `/api/modules` | Return all modules in the BIT catalogue. Supports optional query parameters `semester` (integer) and `type` (`COMPULSORY` \| `ELECTIVE`) for filtering. | No — public endpoint |
| `GET` | `/api/modules/{id}` | Return a single module by its ID. Returns `404 Not Found` if the module does not exist. | No — public endpoint |
| `GET` | `/api/modules/{id}/pdf` | Stream the official module description PDF from `docs/knowledge/`. Returns `404 Not Found` if no PDF exists for the module title. | No — public endpoint |
| `POST` | `/api/modules/{id}/pdf` | Upload or replace the official description PDF for a module. The file is saved to `docs/knowledge/{title}.pdf` and immediately indexed into the RAG knowledge base. Returns `200 OK` on success. | Yes — `ADMIN` role only |
| `POST` | `/api/modules/{id}/pdf/from-upload/{uploadId}` | Promote a previously uploaded RAG temp file to the module's official description PDF. Copies the file from `docs/knowledge/.temp/{uploadId}.pdf` to `docs/knowledge/{title}.pdf` and immediately indexes it. Returns `200 OK` on success; `404 Not Found` if the temp file does not exist. | Yes — `ADMIN` role only |
| `POST` | `/api/modules` | Create a new module. Returns `201 Created` on success; `403 Forbidden` if the caller does not hold the `ADMIN` role. | Yes — `ADMIN` role only |
| `PUT` | `/api/modules/{id}` | Replace all fields of an existing module. Returns `404 Not Found` if the module does not exist; `403 Forbidden` if the caller is not an admin. | Yes — `ADMIN` role only |
| `DELETE` | `/api/modules/{id}` | Delete a module by ID. Returns `204 No Content` on success; `404 Not Found` if the module does not exist; `403 Forbidden` if the caller is not an admin. | Yes — `ADMIN` role only |

### 7.4 Semester Planner Endpoints

| Method | Endpoint | Purpose | Authentication Required |
|--------|----------|---------|------------------------|
| `GET` | `/api/planner` | Return all modules currently in the authenticated student's semester plan. | Yes — `STUDENT` role only |
| `POST` | `/api/planner/{moduleId}` | Add a module to the student's plan. Returns `201 Created` on success; `409 Conflict` if the module is already in the plan; `404 Not Found` if the module does not exist; `400 Bad Request` if adding the module would violate the two-elective limit. | Yes — `STUDENT` role only |
| `DELETE` | `/api/planner/{moduleId}` | Remove a module from the student's plan. Returns `204 No Content` on success; `404 Not Found` if the module is not in the plan. | Yes — `STUDENT` role only |
| `GET` | `/api/planner/{moduleId}/status` | Check whether a specific module is already in the student's plan. Returns a JSON object `{ "inPlanner": true/false }`. | Yes — `STUDENT` role only |

### 7.5 Notes Endpoints

Each student may hold at most one note per module. The `POST` endpoint
behaves as an upsert: it creates the note if none exists, or replaces
the existing content if one does. Notes are scoped to the authenticated
student; no student can read or modify another student's notes.

| Method | Endpoint | Purpose | Authentication Required |
|--------|----------|---------|------------------------|
| `GET` | `/api/notes/{moduleId}` | Return the authenticated student's note for the specified module. Returns `null` in the response body if no note exists; `404 Not Found` if the module does not exist. | Yes — `STUDENT` role only |
| `POST` | `/api/notes/{moduleId}` | Create or replace the student's note for the specified module (upsert). Returns `200 OK` with the saved note. | Yes — `STUDENT` role only |
| `DELETE` | `/api/notes/{moduleId}` | Delete the student's note for the specified module. Returns `204 No Content` on success; `404 Not Found` if no note exists. | Yes — `STUDENT` role only |

### 7.6 Calendar Endpoints

Calendar connections store an ICS feed URL and a display name. Event
data is fetched live from the external ICS source on each request and
is never persisted. The `/events/all` endpoint merges events across all
connected calendars and includes overlap detection.

| Method | Endpoint | Purpose | Authentication Required |
|--------|----------|---------|------------------------|
| `GET` | `/api/calendars` | Return all calendar connections registered by the authenticated student. | Yes — `STUDENT` role only |
| `POST` | `/api/calendars` | Add a new ICS calendar connection (`displayName`, `icsURL`). Returns `201 Created`. | Yes — `STUDENT` role only |
| `DELETE` | `/api/calendars/{id}` | Remove a calendar connection by ID. Returns `204 No Content` on success; `404 Not Found` if the calendar does not belong to the student. | Yes — `STUDENT` role only |
| `GET` | `/api/calendars/{id}/events` | Fetch and return all events from a single connected calendar. The ICS feed is fetched live and no server-side date filter is applied; date-range filtering is performed by the frontend. Events are read-only and sourced directly from the ICS feed. | Yes — `STUDENT` role only |
| `GET` | `/api/calendars/events/all` | Fetch and merge events from all connected calendars. Returns events with overlap flags where scheduling conflicts are detected. | Yes — `STUDENT` role only |

### 7.7 Chat & RAG Endpoints

| Method | Endpoint | Purpose | Authentication Required |
|--------|----------|---------|------------------------|
| `POST` | `/api/chat` | Submit a question to the AI study assistant. Knowledge base chunks (from `docs/knowledge/`) are always included as context for all users. If a `userId` is provided, the top five most relevant chunks from that student's uploads and the knowledge base combined — plus their connected calendar events — are added as context. Returns a `ChatResponse` containing the answer and the number of RAG chunks used. | No — public endpoint |
| `POST` | `/api/chat/stream` | Submit a question and receive the response as a Server-Sent Events (SSE) stream, delivered chunk by chunk. Applies the same RAG and calendar context logic as the non-streaming endpoint, including knowledge base retrieval for all roles. | No — public endpoint |
| `POST` | `/api/rag/upload` | Upload a PDF or DOCX file (up to 20 MB). The server extracts the full text, splits it into overlapping chunks, generates an embedding for each chunk via the Anthropic API, and persists them as `DocumentChunk` records. Returns `201 Created` with the upload ID, chunk count, and extracted study suggestions. Returns `400 Bad Request` for unsupported file types. | Yes — `STUDENT` or `ADMIN` |
| `GET` | `/api/rag/uploads` | Return a list of all documents uploaded by the authenticated user. Embedding data is not included in the response. | Yes — `STUDENT` or `ADMIN` |
| `DELETE` | `/api/rag/uploads/{id}` | Delete an uploaded document and all its associated chunks. Returns `204 No Content` on success; `403 Forbidden` if the upload belongs to a different student; `404 Not Found` if the upload does not exist. | Yes — `STUDENT` or `ADMIN` |
| `GET` | `/api/rag/match-module` | Find the best-matching module for a given document title using keyword scoring against the module catalogue. Accepts a `title` query parameter. Returns a `ModuleMatchResponse` with the matched module and score. | Yes — `ADMIN` role only |

### 7.8 Error Response Format

All API errors are returned as a uniform JSON object produced by
`GlobalExceptionHandler` (`@ControllerAdvice`). This handler intercepts
exceptions thrown by any layer and maps them to an `ErrorResponse` DTO
with an appropriate HTTP status code, ensuring clients receive a
consistent error structure regardless of where the failure occurred.

The following exception-to-status mappings are applied:

| Exception | HTTP Status |
|-----------|-------------|
| `EntityNotFoundException` | `404 Not Found` |
| `BusinessRuleException` | `400 Bad Request` |
| `DuplicateEntryException` | `409 Conflict` |
| `AccessDeniedException` | `403 Forbidden` |
| `IllegalArgumentException` | `400 Bad Request` |
| `Exception` (catch-all) | `500 Internal Server Error` |

**ErrorResponse structure**

| Field | Type | Purpose |
|-------|------|---------|
| `timestamp` | `LocalDateTime` | Date and time at which the error occurred |
| `status` | `int` | HTTP status code as an integer |
| `error` | `String` | HTTP status reason phrase (e.g. `"Not Found"`) |
| `message` | `String` | Human-readable description of the specific error |
| `path` | `String` | Request URI that triggered the error |

**Example response — 404 Not Found**

```json
{
  "timestamp": "2026-05-30T10:15:42",
  "status": 404,
  "error": "Not Found",
  "message": "Module not found with ID: 99",
  "path": "/api/modules/99"
}
```

### 7.9 OpenAPI / Swagger

The application integrates `springdoc-openapi` (version 2.8.0) to
generate interactive API documentation automatically from controller
annotations at application startup. No manual specification files are
maintained.

| Property | Value |
|----------|-------|
| **OpenAPI version** | OpenAPI 3.0 |
| **Swagger UI** | `/swagger-ui.html` |
| **Raw API specification** | `/api-docs` |
| **Access control** | Both endpoints are publicly accessible (`permitAll()`) |

Documentation is derived entirely from annotations applied to the
controller layer:

- `@Tag` — groups related endpoints under a named section
- `@Operation` — provides a human-readable summary for each endpoint
- `@ApiResponse` — documents possible HTTP response codes and descriptions
- `@Parameter` — describes path variables and query parameters

All seven controllers are annotated in this manner, resulting in a
fully navigable Swagger UI that covers all 30 endpoints. The UI also
serves as a lightweight manual testing interface during development.

## 8. Business Logic

### 8.1 Business Rules

The following business rules are enforced by the application and reflect
the constraints defined in [Section 2.3](#23-business-rules). Rules are categorised as either
*active* (returning an error response to the client) or *behavioural*
(enforced silently without an error).

| Rule | Business Rule | Enforcement Mechanism | Client Response |
|------|--------------|----------------------|-----------------|
| **BR-01** | A student may add a maximum of 2 elective modules to their semester plan. | `StudentModuleService.addModuleToPlanner()` checks the current elective count before persisting. Throws `BusinessRuleException` if the limit is reached. | `400 Bad Request` — `"You have reached the maximum of 2 elective modules for your semester plan."` |
| **BR-02** | The same module cannot be added to a student's plan more than once. | `StudentModuleService.addModuleToPlanner()` checks for an existing entry before persisting. Throws `DuplicateEntryException`. Also backed by a database unique constraint on `(student_id, module_id)`. | `409 Conflict` — `"This module is already in your semester plan."` |
| **BR-03** | Each student has at most one note per module. Submitting a note when one already exists replaces it. | `NoteService.saveNote()` performs an upsert: it retrieves the existing note or creates a new one before saving. Also backed by a database unique constraint on `(student_id, module_id)`. | No error returned — the existing note is silently updated. |
| **BR-04** | An admin's email address cannot be changed after account creation. | `UserService.updateProfile()` skips the email update when `role == ADMIN`. No exception is raised. | No error returned — the email field is silently ignored for admin accounts. |
| **BR-05** | Changing a password requires the user's current password to be provided. | `UserService.updateProfile()` verifies the current password using `BCryptPasswordEncoder.matches()` before encoding and saving the new one. Throws `BusinessRuleException` if verification fails. | `400 Bad Request` — `"Current password is incorrect."` |
| **BR-06** | Removing a module from the semester plan automatically deletes the associated note. | `StudentModuleService.removeModuleFromPlanner()` queries `NoteRepository` for the student–module pair and deletes the note before removing the planner entry. | No error returned — the cascade deletion occurs transparently. |
| **BR-07** | A student may only view, modify, or delete their own calendar entries. | `CalendarService.deleteCalendar()` verifies ownership by comparing the stored `student_id` against the authenticated user's ID. Non-owner access is treated as not found. Throws `EntityNotFoundException`. | `404 Not Found` — `"Calendar not found with ID: {id}"` (ownership is not disclosed to the caller). |
| **BR-08** | A student may only delete documents they have uploaded themselves. | `DocumentController.deleteUpload()` compares the upload's `student_id` against the authenticated user's ID and returns a `403` response directly, bypassing the `GlobalExceptionHandler`. | `403 Forbidden` |
| **BR-09** | Self-registration always creates a Student account. Admin accounts cannot be created through the registration flow. | `UserService.registerStudent()` unconditionally sets `role = STUDENT`. There is no parameter or flag to override this. | No error returned — behavioural enforcement through hardcoded role assignment. |
| **BR-10** | Email addresses must be unique across all user accounts. | `UserService.registerStudent()` and `UserService.updateProfile()` both check for an existing email before persisting. Throws `DuplicateEntryException`. Also backed by a database `UNIQUE` constraint on `app_user.email`. | `409 Conflict` — `"A user with this email already exists."` |

### 8.2 Service Layer Overview

The business logic layer comprises eight `@Service` classes.
Each service encapsulates a distinct functional area and is the primary
location where business rules are enforced.

| Service | Responsibility |
|---------|----------------|
| `UserService` | Student registration (BR-09: hardcodes `STUDENT` role); credential loading for Spring Security; profile update with admin email lock (BR-04) and password verification (BR-05); account deletion; unique email enforcement (BR-10) |
| `ModuleService` | CRUD operations for the BIT module catalogue; filtering by semester and module type with results returned alphabetically by title; admin-scoped write operations |
| `StudentModuleService` | Semester plan management; enforces the two-elective limit (BR-01) and duplicate-module constraint (BR-02) before persisting; cascades note deletion on module removal (BR-06) |
| `NoteService` | Upsert-based note management (BR-03): creates a new note or updates the existing one for a given student–module pair; note retrieval and deletion |
| `CalendarService` | Registration and deletion of ICS calendar connections with ownership enforcement (BR-07); live fetching and parsing of ICS feeds via ical4j; overlap detection across all connected calendars |
| `RagService` | Document text chunking with sliding-window overlap; pseudo-embedding generation via the Anthropic chat API; cosine similarity computation; retrieval of the top-k most relevant chunks for a given query |
| `ChatService` | Role-aware system prompt construction incorporating RAG context chunks and calendar events; synchronous and streaming chat requests to the Anthropic API; SSE response relay to the client |
| `ExtractionService` | Regex-based extraction of 15 structured fields from raw document text, including exam style, exam date, duration, grading breakdown, deadlines, group-work indicators, lecturer details, credits, and campus |

## 9. Security

### 9.1 Authentication Mechanism

The application uses **HTTP Basic Authentication** implemented through
Spring Security 6. On every request, the client sends a
Base64-encoded `email:password` credential in the `Authorization`
header. The backend validates credentials via
`UserService.loadUserByUsername()`, which looks up the user by email
in the H2 database and compares the provided password against the
stored BCrypt hash.

Additional security configuration applied in `SecurityConfig.java`:

- **CSRF protection is disabled** — appropriate for a stateless REST
  API where the client manages credentials explicitly rather than
  relying on server-side session cookies (`SecurityConfig.java:29`).
- **SameOrigin frame options enabled** — permits the H2 Console to
  render in an iframe within the same origin during development
  (`SecurityConfig.java:31`).

### 9.2 Role-Based Access Control

Access to each endpoint group is governed by Spring Security
`authorizeHttpRequests` rules, evaluated in declaration order.

| Endpoint Group | Auth Required | Role(s) |
|----------------|--------------|---------|
| `GET /api/modules`, `GET /api/modules/{id}` | No | Public |
| `POST /api/auth/register` | No | Public |
| `POST /api/chat`, `POST /api/chat/stream` | No | Public |
| `/swagger-ui.html`, `/swagger-ui/**`, `/api-docs/**` | No | Public (development) |
| `/h2-console/**` | No | Public (development) |
| `POST /api/modules` | Yes | `ADMIN` only |
| `PUT /api/modules/**` | Yes | `ADMIN` only |
| `DELETE /api/modules/**` | Yes | `ADMIN` only |
| `GET /api/rag/match-module` | Yes | `ADMIN` only |
| `/api/planner/**` | Yes | `STUDENT` only |
| `/api/notes/**` | Yes | `STUDENT` only |
| `/api/calendars/**` | Yes | `STUDENT` only |
| `DELETE /api/auth/me` | Yes | `STUDENT` only |
| `POST /api/rag/upload` | Yes | `STUDENT` or `ADMIN` |
| `GET /api/rag/uploads` | Yes | `STUDENT` or `ADMIN` |
| `DELETE /api/rag/uploads/{id}` | Yes | `STUDENT` or `ADMIN` |
| `GET /api/auth/me`, `PUT /api/auth/me` | Yes | Any authenticated user |
| Any other `/api/**` | Yes | Any authenticated user (fallback) |

### 9.3 Password Storage

All passwords are hashed using **BCrypt** via Spring Security's
`BCryptPasswordEncoder`, configured as a bean in `SecurityConfig.java`.
Plain-text passwords are never stored or logged by the application.
During authentication, passwords are transmitted over HTTP and compared
against the stored BCrypt hash.

### 9.4 CORS Configuration

CORS is configured in `SecurityConfig.java` using a
`CorsConfigurationSource` bean:

- `allowedOriginPatterns`: `["*"]` — permits any origin, supporting
  Codespace-generated URLs without hardcoding.
- `allowedMethods`: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- `allowCredentials`: `true` — required for Basic Auth headers to be
  forwarded in cross-origin requests from the React frontend.

### 9.5 Frontend Session Handling

The React frontend manages the user session through `AuthContext.jsx`
and a shared Axios instance in `services/api.js`.

**Credential storage**
On successful login, credentials are stored in `localStorage` under
the key `auth_credentials` as `btoa(JSON.stringify({ email, password }))` —
a Base64-encoded JSON object (`AuthContext.jsx:41`). This is encoding,
not encryption; the value can be decoded trivially.

**Session restoration on page load**
On mount, `AuthContext` reads `auth_credentials` from `localStorage`,
decodes the value, calls `setAuthCredentials(email, password)` to
register the credentials with the Axios module, and then calls
`GET /api/auth/me` to verify the credentials are still valid. A
successful response populates the user state; a failed response removes
the stored key and leaves the user unauthenticated.

**Axios request interceptor**
Every outgoing API request has an `Authorization: Basic <base64>` header
injected automatically if credentials are held in memory
(`api.js:18–24`). Unauthenticated requests carry no `Authorization` header.

**Axios response interceptor**
Any `401 Unauthorized` response clears the in-memory credentials and
redirects the user to `/login` (`api.js:26–36`). Requests to
`GET /api/auth/me` are exempt from this redirect to prevent a redirect
loop during the initial session-restore probe.

**Logout**
Logout nulls the in-memory credentials, removes `auth_credentials`
from `localStorage`, clears React user state, and performs a hard
redirect to `/login` via `window.location.href`, ensuring all cached
application state is discarded (`AuthContext.jsx:49–54`).

---

## 10. AI Study Assistant & RAG

### 10.1 Feature Overview

The BIT Study Assistant is a conversational AI assistant embedded as a floating panel in the bottom-right corner of every page. It is powered by Anthropic Claude (`claude-haiku-4-5-20251001`) and responds exclusively to questions related to FHNW, the BIT programme, the semester planner application, uploaded documents, module notes, and the student calendar. Off-topic queries are declined with a standardised message. Responses are streamed to the client via Server-Sent Events, and chat history is persisted in `sessionStorage` for the duration of the browser session.

The assistant is role-aware and operates in three distinct modes. Unauthenticated visitors receive general assistance covering FHNW and BIT programme information, and can ask how to register or log in, but have no access to personal data. Students receive personalised assistance grounded in their own uploaded documents, module notes, and connected calendar events. Admins receive assistance scoped to the module catalog and shared system knowledge. This role separation is enforced through distinct system prompt contexts (`PUBLIC_CONTEXT`, `STUDENT_CONTEXT`, `ADMIN_CONTEXT`) injected at request time.

Document upload is a central capability. Students may upload PDF or DOCX files; the system extracts text, splits it into chunks, generates pseudo-embeddings, and indexes the content for retrieval. After upload, the assistant analyses the document and surfaces a pre-populated note draft that the student can review and save directly to a module in their semester plan. Admins uploading module documents are instead presented with a module match workflow: the system attempts to match the document to an existing module in the catalog and proposes targeted field updates, or pre-fills a new module creation form if no match is found.

Calendar-aware assistance is provided to students whose ICS calendars are connected. Upcoming events are fetched at query time and injected into the prompt context, enabling the assistant to answer questions such as upcoming exam dates or scheduling conflicts without requiring the student to provide that information explicitly.

### 10.2 RAG Pipeline

The RAG pipeline covers two distinct phases: an **ingestion phase** that processes uploaded documents and stores searchable representations, and a **retrieval phase** that augments each chat request with relevant context before generating a response.

#### Ingestion Phase

```
┌─────────────────┐
│  File Upload    │  PDF or DOCX via POST /api/rag/upload
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Text Extraction │  Apache PDFBox (PDF → plain text via PDFTextStripper)
│                 │  Apache POI poi-ooxml (DOCX → plain text via XWPFDocument)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Chunking                                       │
│  chunk_size = 400 words  overlap = 50 words     │
│  Sliding window over extracted text             │
└────────┬────────────────────────────────────────┘
         │  (one chunk at a time)
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Pseudo-Embedding Generation                                 │
│  POST https://api.anthropic.com/v1/messages                  │
│  Model: claude-haiku-4-5-20251001                            │
│  Prompt: "Return a JSON array of exactly 64 floats…"         │
│  → Parses 64-element float array from model response         │
│  (Not a dedicated embedding API; embeddings are LLM-derived) │
└────────┬─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Storage                                                │
│  DocumentChunk { chunkText, embeddingJson, student_id } │
│  embeddingJson: JSON-serialised float[64] in TEXT column │
│  H2 file-based database (jdbc:h2:file:./data/…)         │
└─────────────────────────────────────────────────────────┘
```

#### Retrieval Phase

```
┌──────────────────────┐
│  User Chat Message   │
└──────────┬───────────┘
           │
           ▼
┌───────────────────────────────────────────────────────┐
│  Query Embedding                                      │
│  Same pseudo-embedding process:                       │
│  POST /v1/messages → parse float[64] from response    │
└──────────┬────────────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────────────────────┐
│  Candidate Retrieval                                  │
│  Always: knowledge base chunks (student = null)       │
│  + user's own upload chunks (if userId provided)      │
│  Deserialise embeddingJson → float[64] per chunk      │
└──────────┬────────────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────────────────────┐
│  Cosine Similarity Ranking                            │
│  score(q, c) = (q · c) / (‖q‖ × ‖c‖)                │
│  Computed in Java for every candidate chunk           │
│  Top-K = 5 chunks selected by descending score        │
└──────────┬────────────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────────────────────┐
│  Prompt Construction  (ChatService.buildSystemPrompt) │
│  Base system prompt                                   │
│  + Role context (PUBLIC_CONTEXT, STUDENT_CONTEXT, or ADMIN_CONTEXT) │
│  + [CONTEXT] … top-5 chunk texts … [/CONTEXT]         │
│  + [CALENDAR] … upcoming events … [/CALENDAR]         │
│  + Current date header                                │
└──────────┬────────────────────────────────────────────┘
           │
           ▼
┌───────────────────────────────────────────────────────┐
│  Response Generation                                  │
│  POST https://api.anthropic.com/v1/messages           │
│  Model: claude-haiku-4-5-20251001  max_tokens: 1024   │
│  Streaming: content_block_delta SSE events            │
│  Non-streaming: single synchronous response           │
└───────────────────────────────────────────────────────┘
```

#### Design Notes

**Pseudo-embeddings.** The system does not call a dedicated vector embedding API. Instead, `RagService` sends each chunk to the Anthropic Messages API with an instruction to return exactly 64 float values representing the semantic content. The model response is parsed and stored. This approach reuses the same API key and model for both embedding and generation, at the cost of higher latency during ingestion and lower embedding dimensionality compared to purpose-built embedding models.

**Chunking strategy.** A sliding-window splitter divides each document into 400-word chunks with a 50-word overlap. The overlap ensures that information spanning a chunk boundary is represented in at least one complete chunk rather than being split across two partial contexts.

**Shared knowledge seeding.** `KnowledgeSeeder` processes PDF and DOCX files from the `docs/knowledge/` directory at application startup and stores chunks with `student = null`, distinguishing them from per-user uploads. The `docs/knowledge/` directory currently contains 8 official BIT module description PDFs, giving the assistant accurate module knowledge from first startup.

**Knowledge base retrieval.** The retrieval pool always includes knowledge base chunks (`student = null`) for every request, regardless of whether the user is authenticated. For authenticated users, their own upload chunks are merged into the candidate pool before ranking. This means public visitors and unauthenticated chatbot interactions can still receive contextually grounded answers about the 8 seeded BIT module descriptions.

**Context window budget.** With top-K set to 5 and `max_tokens` at 1024, the system limits the amount of retrieved context injected per request. Five chunk texts — each up to 400 words — are concatenated into the `[CONTEXT]` block alongside the role-specific system prompt and any calendar events, keeping the total request size well within the model's context capacity while prioritising the most semantically similar passages.

### 10.3 Document Upload Workflow — Student

The student document upload workflow allows a student to supply a module-related PDF or DOCX file and convert its study-relevant content directly into a module note, without manual copy-and-paste.

**Steps:**

1. **File selection.** The student opens the ChatBot panel and clicks the file upload button. An `<input type="file">` restricted to `.pdf`, `.docx`, and `.doc` opens the OS file picker. Files up to 20 MB are accepted; the size limit is enforced server-side.

2. **Upload.** The selected file is submitted as a multipart `FormData` payload via a native `fetch` call to `POST /api/rag/upload`. Authentication credentials are read directly from `localStorage` and attached as an `Authorization: Basic` header.

3. **Text extraction.** The backend extracts plain text from the file using Apache PDFBox (`PDFTextStripper`) for PDF files and Apache POI (`XWPFDocument`) for DOCX files.

4. **Chunking and indexing.** `RagService` splits the extracted text into 400-word chunks with a 50-word sliding overlap. For each chunk, a 64-float pseudo-embedding is generated by querying the Anthropic Messages API and stored alongside the chunk text in the `document_chunk` table, scoped to the uploading student.

5. **Structured information extraction.** `ExtractionService` applies 15 regular-expression patterns to the full extracted text to identify fields including assessment details, deadlines, module metadata, lecturer information, credits, campus information, and other study-relevant attributes. These results are assembled into a `suggestedNoteText` string and returned in the upload response.

6. **Note-save panel.** The frontend receives the upload response with `userRole = "STUDENT"`. The ChatBot panel switches to the note-save view, which presents a module selector (populated from the student's semester plan via `GET /api/planner`) and an editable textarea pre-filled with the `suggestedNoteText`.

7. **Existing note handling.** When the student selects a module, the frontend immediately fetches any existing note for that module (`GET /api/notes/{moduleId}`). If a note exists, the extracted text is appended below the existing content using a dated separator in the format `\n\n---\nAdded from upload on {date}\n---\n`, and an advisory message is displayed. If no note exists, the extracted text is set as the sole content. In both cases the textarea remains fully editable before saving.

8. **Save.** The student reviews the note text and clicks Save. The complete textarea content is submitted to `POST /api/notes/{moduleId}`. The service layer performs an upsert: if a note already exists for that student–module combination it is updated; otherwise a new record is created.

### 10.4 Document Upload Workflow — Admin

The admin document upload workflow shares the same extraction and indexing pipeline as the student workflow but diverges after upload: rather than suggesting a note, the system attempts to match the document to an existing module in the catalog and presents either an update or a creation path.

**Steps:**

1. **File selection and upload.** The admin opens the ChatBot panel and selects a PDF or DOCX file (up to 20 MB). The file is submitted via `POST /api/rag/upload` using the same multipart `FormData` mechanism as the student workflow.

2. **Text extraction, chunking, and indexing.** The backend performs identical processing: Apache PDFBox or Apache POI extracts plain text, `RagService` splits it into 400-word chunks with a 50-word overlap, and a 64-float pseudo-embedding is generated and stored for each chunk in the `document_chunk` table.

3. **Structured information extraction.** `ExtractionService` applies 15 regular-expression patterns to the extracted text and returns structured module-related information as an `ExtractionSuggestion`. The upload response includes these suggestions alongside `userRole = "ADMIN"`, which causes the frontend to display the admin panel rather than the student note-save panel.

4. **Module matching.** Immediately after upload, the frontend derives a candidate title from the uploaded filename by stripping the file extension and replacing hyphens and underscores with spaces. This derived title — not the AI-extracted module title — is submitted to `GET /api/rag/match-module?title={derivedTitle}`. The backend tokenises the title into words longer than two characters and counts how many of those words appear in each module title in the catalog. The module with the highest count is returned as the best match; a score of zero indicates no match.

5. **Match-found path.** If the match score is two or greater, the admin panel displays a confirmation that the module already exists in the catalog, showing the matched module title and confirming that the PDF has been saved. The admin may navigate directly to the module page via the **View Module** button or dismiss the panel to return to the chat interface.

6. **No-match path.** If the match score is below two, the admin panel switches to a module creation form pre-filled with data derived from the extraction: the extracted module title, short description, credits, lecturer name, and lecturer email. The campus field is hardcoded to `"Brugg-Windisch"`, the semester defaults to `1`, and the module type defaults to `"COMPULSORY"`. The admin may edit all fields before submission.

7. **Create Module.** The admin reviews the pre-filled form and submits it via `POST /api/modules`, creating a new module record in the catalog. On success, a confirmation appears pinned to the panel footer with a **View Module** button that navigates directly to the new module's detail page. The uploaded PDF is simultaneously promoted as the module's official description and indexed into the RAG knowledge base.

### 10.5 Knowledge Base Seeding

`KnowledgeSeeder` is a Spring `@Component` that executes once at application startup via a `@PostConstruct` method. Its purpose is to process and persist shared knowledge documents separately from user-uploaded content. Documents seeded through this mechanism are stored with `student = null`, allowing them to be distinguished from per-user uploads.

On startup, the seeder scans the `docs/knowledge/` directory relative to the working directory. If the directory does not exist or contains no eligible files, the method returns immediately without error. Files with a `.pdf` or `.docx` extension are processed; all other files are ignored. For each eligible file, text is extracted using Apache PDFBox or Apache POI, then passed through the same `RagService` chunking and embedding pipeline used for student uploads: the text is split into 400-word chunks with a 50-word overlap, and a 64-float pseudo-embedding is generated and stored for each chunk. The resulting `DocumentUpload` record is saved with `student = null`, distinguishing these entries from per-user uploads.

The seeding process is idempotent. Before processing each file, the seeder queries the `document_upload` table for an existing record where `student` is `null` and the filename matches. If such a record is found, the file is skipped. This ensures that restarting the application does not duplicate knowledge base entries. Individual file failures are caught and logged, allowing the seeder to continue processing remaining files without aborting the startup sequence.

The `docs/knowledge/` directory currently contains 8 official BIT module description PDFs bundled with the project. These are processed automatically on first startup. Additional shared content can be introduced by placing further PDF or DOCX files in this directory before application startup.

**Live indexing.** `KnowledgeSeeder` also exposes a public `indexIfNeeded(Path)` method called by `ModuleController` whenever an admin saves a PDF to `docs/knowledge/` at runtime — either via the module detail page upload (`POST /api/modules/{id}/pdf`) or via the ChatBot admin flow (`POST /api/modules/{id}/pdf/from-upload/{uploadId}`). The indexing runs in a background thread so the HTTP response is not delayed. This ensures that a PDF uploaded during the session is immediately available to the assistant without requiring an application restart.

### 10.6 ChatBot UI & Capabilities

#### Placement and Availability

The BIT Study Assistant is rendered as a circular toggle button (56 × 56 px) fixed to the bottom-right corner of every page, including public pages. It is mounted outside the application's route tree, ensuring it is present regardless of which page the user is viewing. Clicking the button opens a panel (400 px wide on desktop, full-width on mobile, 500 px tall) that can be dismissed by clicking the button again.

#### Conversation Interface

The chat panel provides a text input field at the bottom of the panel. Pressing **Enter** sends the current message; **Shift+Enter** inserts a line break. A **Clear Chat** button (trash icon), visible only in the chat view, discards the current conversation and resets the message list. Chat history is persisted in `sessionStorage` under the key `chatMessages`, so it survives page navigation within the same browser tab and is automatically cleared when the browser session ends.

The assistant's responses are streamed incrementally to the panel as partial response fragments are received from the backend, providing continuous visual feedback rather than a single delayed reply. The assistant is restricted to questions related to FHNW, the BIT programme, the semester planner application, uploaded documents, module notes, and the student calendar; off-topic questions receive a standardised refusal.

#### File Upload

Students and admins have access to a file upload button within the chat panel. The button accepts PDF, DOCX, and DOC files. After upload, the panel automatically transitions to a role-specific workflow panel rather than returning to the conversation view.

#### Student: Note-Save Panel

After a student uploads a document, the panel switches to a **Save to Module Notes** view. A dropdown menu, populated from the student's current semester plan, allows the student to select the target module. The main content area displays an editable text field pre-filled with study-relevant information extracted from the uploaded document, including assessment details, deadlines, and other module-related information.

If the selected module already has an existing note, the extracted content is appended below the existing text with a dated separator, and an advisory message is displayed to inform the student. The full note content remains editable before saving. Clicking **Save** writes the note to the selected module; clicking away dismisses the panel without saving.

#### Admin: Module Match Panel

After an admin uploads a document, the panel switches to a module-matching view. The application searches the module catalog for the best matching module and presents one of two outcomes:

- **Match found:** The panel displays a confirmation that the module is already in the catalog, shows the matched module title, and confirms that the PDF has been saved and indexed. The admin can navigate to the module's detail page via **View Module →** or dismiss the panel and continue using the chat interface.
- **No match found:** The panel presents a **Create New Module** form pre-filled with extracted data including the module title, description, credits, lecturer name, and email. The campus defaults to `Brugg-Windisch`, the semester to `1`, and the module type to `COMPULSORY`. All fields are editable before submission. On success, a confirmation with a **View Module →** link is pinned to the panel footer; clicking it navigates directly to the newly created module's detail page.

#### Document Management

The **My Documents** section within the panel provides an expandable list of all documents the user has previously uploaded. Each entry shows the filename. To delete an upload, the user clicks the delete icon; a confirmation prompt replaces the entry, requiring a second click to confirm. Confirmed deletions remove the document and all its associated chunks from the system.

#### Responsive Behaviour

On smaller viewports the panel expands to occupy the available screen width, making the assistant usable on mobile devices without horizontal scrolling.

### 10.7 AI Model & External Integration

The BIT Semester Planner integrates with a single external AI provider: the Anthropic Messages API (`https://api.anthropic.com/v1/messages`). All AI operations — chat response generation, streaming, and pseudo-embedding generation — are routed through this single endpoint using the `claude-haiku-4-5-20251001` model. No secondary AI services or dedicated vector embedding APIs are used.

**Chat response generation** is handled by `ChatService`, which constructs a request body containing a structured system prompt, the user's question, and optional context blocks (RAG chunks and calendar events), then submits it to the Anthropic Messages API. The service supports two modes: a blocking call that waits for the complete response, and a streaming call that sets `stream: true` and reads the response body as a sequence of SSE lines. The streaming path filters for `content_block_delta` events and yields text fragments incrementally, which are forwarded to the client via Spring `SseEmitter`. The model is configured with a `max_tokens` limit of 1024 for all chat responses.

**Pseudo-embedding generation** is handled by `RagService`. Rather than calling a dedicated embedding API, the service reuses the same Messages endpoint with a specialised system prompt instructing the model to respond with exactly 64 floating-point values between -1 and 1 that semantically represent the input text. The response text is parsed as a JSON array and stored as a serialised string. This approach eliminates the need for a separate embedding provider but has inherent limitations: the model is not optimised for embedding generation, the 64-dimensional representation has considerably lower capacity than purpose-built embedding models, and the model may occasionally format its response in a way that requires additional parsing steps before the array can be extracted. These constraints mean that the semantic similarity scores produced by cosine comparison are less precise than those achievable with a dedicated embedding service.

**API key configuration.** Both `RagService` and `ChatService` read the Anthropic API key from the `anthropic.api.key` application property, which is set directly in `application.properties`. No environment variable or external secret configuration is required.

---

## 11. Calendar Integration

### 11.1 How It Works

Students connect external calendars by providing a display name and a publicly accessible ICS feed URL (compatible with Outlook, Google Calendar, Apple Calendar, and the FHNW timetable export). Each connection is stored as a `StudentCalendar` record containing only the display name and the URL; event data is never persisted in the application database.

Once connected, a student's calendars are listed in the dashboard calendar section. Events are fetched live from the external ICS feed on demand — there is no server-side cache. The backend returns all events present in the feed without any date filter applied. Date-range filtering (week, day, and month views) is performed entirely by the `WeeklyCalendar.jsx` frontend component, which accepts a navigable current date and limits the displayed events to the relevant range.

For students with multiple connected calendars, `GET /api/calendars/events/all` retrieves and merges events from every registered feed into a single response. This merged view also includes overlap detection: any two events whose time ranges intersect are flagged, and the calendar component renders them in adjacent columns to make scheduling conflicts immediately visible.

Students may remove a calendar connection at any time. Deletion removes only the stored URL record; because events are not persisted, no additional cleanup is required.

### 11.2 ICS Parsing

ICS feed parsing is implemented using ical4j 3.2.14. When events are requested for a calendar, `CalendarService` issues an HTTP GET to the stored ICS URL using Java's built-in `HttpClient` and passes the response body as an `InputStream` to `CalendarBuilder.build()`. The resulting `Calendar` object is queried for all `VEVENT` components via `calendar.getComponents(Component.VEVENT)`. For each event, the `SUMMARY` property is read as the event title (defaulting to `"(No Title)"` if absent), and the `DTSTART` and `DTEND` properties are extracted and passed to a custom date parser. Events whose `DTSTART` cannot be parsed are silently skipped. If `DTEND` is absent, the end time defaults to one hour after the start.

The custom `parseIcsDate()` method handles two ICS date representations. For timed events, the expected format is `YYYYMMDDTHHmmss`, optionally followed by a `Z` UTC suffix (e.g. `20260521T171500Z`). The method strips the suffix with a string replacement, then reads year, month, day, hour, minute, and second as integer substrings. For all-day events, the format is date-only (`YYYYMMDD`, e.g. `20260501`), which is parsed into a `LocalDateTime` at midnight. Both formats produce a `LocalDateTime` value with no attached timezone offset.

The JVM timezone is set to `Europe/Zurich` at application startup via `TimeZone.setDefault(TimeZone.getTimeZone("Europe/Zurich"))`. This means all `LocalDateTime` values are interpreted in the Central European timezone context at display time. However, the parser does not perform explicit UTC-to-local conversion: the `Z` suffix is stripped rather than converted, so events whose source feed publishes times in UTC will be displayed as if those times were already in `Europe/Zurich`. Feeds that embed IANA timezone identifiers via the `TZID` parameter are not handled by the custom parser. Additionally, `RRULE`-based recurring events are not expanded — only individual `VEVENT` components are processed, so recurring entries appear only if the ICS feed pre-expands them.

### 11.3 Overlap Detection

Overlap detection is applied by `CalendarService.fetchAllEvents()` after all events from every connected calendar have been collected into a single list. The method performs an O(n²) pairwise comparison across the merged event list: for each unique pair of events (A, B), the standard interval-overlap condition is evaluated — `A.start < B.end && B.start < A.end`. If the condition holds, both events in the pair are marked with `isOverlapping = true` in their `CalendarEventDTO`. The flag is set symmetrically, so any event involved in at least one overlap will carry the flag regardless of how many other events it conflicts with.

On the frontend, `WeeklyCalendar.jsx` performs its own overlap-aware layout calculation when rendering week and day views. Overlapping timed events are arranged into side-by-side columns within the same time slot, allowing the student to see all conflicting events simultaneously. The backend `isOverlapping` flag remains available as metadata indicating that a scheduling conflict exists.

Overlap detection applies only to the merged view returned by `GET /api/calendars/events/all`. Events fetched per-calendar via `GET /api/calendars/{id}/events` are returned without cross-calendar overlap analysis, since the comparison requires the complete set of events across all of a student's feeds.

### 11.4 Calendar-Aware ChatBot

When a student sends a chat message, `ChatController` automatically enriches the request with the student's calendar data. If a `userId` is present in the request, `CalendarService.fetchAllEvents(userId)` is called to retrieve all events from every connected calendar. Each event is serialised into a plain-text string in the format `EVENT: {title} | Date: yyyy-MM-dd | Time: HH:mm - HH:mm | Calendar: {name}` and the resulting list is injected into the system prompt as a `[CALENDAR] … [/CALENDAR]` block. This block is appended after the role-specific context and before the user's question, making the calendar data available as grounding information for the model's response.

This mechanism applies to both the blocking (`POST /api/chat`) and streaming (`POST /api/chat/stream`) endpoints without any additional configuration from the client. If the calendar fetch fails — for example, because an external ICS feed is unreachable — the error is silently suppressed and the chat request proceeds with an empty calendar context. The assistant's response is never blocked by a calendar retrieval failure.

With calendar context present, the assistant can answer queries such as "Do I have anything scheduled on Thursday?", "When is my next exam?", or "Do I have any overlapping events this week?" by incorporating the injected event data into its response generation process. The system prompt instructs the assistant to attribute calendar-derived answers explicitly, for example: "Based on your calendar, you have an exam on Thursday."

---

## 12. Deployment

### 12.1 Prerequisites & Environment Variables

#### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Java | 17 or higher | Project targets Java 17. The devcontainer uses `mcr.microsoft.com/devcontainers/java:21`, which is fully compatible. |
| Node.js | 20 | Installed via devcontainer feature |
| Maven | Wrapper included | Run via `./mvnw`; no separate installation required |
| npm | Bundled with Node.js | Dependencies pre-installed by `postCreateCommand` |
| GitHub account | — | Required for GitHub Codespaces |

When running on GitHub Codespaces, all runtime dependencies are provisioned automatically by the devcontainer configuration. For local development, Java 21 and Node.js 20 must be installed independently.

### 12.2 Running on GitHub Codespaces

GitHub Codespaces provides a fully pre-configured development environment. The devcontainer automatically installs all dependencies and starts both services on every Codespace launch.

**Steps:**

1. **Open the repository** on GitHub. Fork or clone it to your own GitHub account if you do not already have write access.

2. **Create a Codespace.** Click **Code** → **Codespaces** → **Create codespace on main**. GitHub will build the devcontainer using the `mcr.microsoft.com/devcontainers/java:21` image with Node.js 20 installed, then run the `postCreateCommand` to resolve Maven dependencies and install frontend packages.

3. **Wait for both services to start.** On every Codespace start, `start.sh` is executed by `postStartCommand`. It creates a `tmux` session named `bitsemesterplanner` with two windows: **Backend** starts `./mvnw spring-boot:run -DskipTests` immediately, and **Frontend** starts `npm run dev` after a 30-second delay. The terminal automatically attaches to the tmux session so both logs are visible live. Switch between windows with `Ctrl+B` then `0` (Backend) or `1` (Frontend). Allow approximately 60 seconds from Codespace launch for both services to become available.

4. **Set port visibility.** In the **Ports** tab, verify that ports **8080** (Backend API) and **5173** (Frontend) are listed. If either port shows as **Private**, change its visibility to **Public**. This step is required for the forwarded URLs to be accessible in the browser.

5. **Open the application.** Click the forwarded URL for port **5173** in the Ports tab, or wait for the browser to open automatically. The application will load at the landing page. Click **Login** to sign in or **Create account** to register.

### 12.3 Manual Start Commands

If the services do not start automatically, or when running the application outside of GitHub Codespaces, both the backend and frontend can be started manually. The backend must be started first and allowed to initialise before the frontend is launched.

**Backend** (run from the repository root):

```bash
./mvnw spring-boot:run -DskipTests
```

**Frontend** (run from the repository root):

```bash
cd frontend && npm run dev
```

Once both services are running, the application is accessible at the URLs listed in [§12.4](#124-application-urls).

### 12.4 Application URLs

GitHub Codespaces generates a unique URL for each Codespace instance. The URL pattern follows the format below, where `{codespace-name}` is replaced by the name assigned to the specific Codespace.

| Service | URL Pattern |
|---|---|
| Frontend Application | `https://{codespace-name}-5173.app.github.dev` |
| Backend API | `https://{codespace-name}-8080.app.github.dev/api` |
| Swagger UI | `https://{codespace-name}-8080.app.github.dev/swagger-ui.html` |
| H2 Console | `https://{codespace-name}-8080.app.github.dev/h2-console` |

The Codespace name is visible in the browser address bar and in the GitHub Codespaces dashboard. Both ports must be set to **Public** in the Ports tab for these URLs to be accessible.

### 12.5 Demo Credentials

The following accounts are seeded automatically at application startup by `DataInitializer` and are available immediately without any additional setup.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fhnw.ch` | `admin123` |
| Student | `student@fhnw.ch` | `student123` |

---

## 13. End-to-End Demo Walkthrough

The following sequence demonstrates all major application features using the seeded demo accounts. Steps are designed to be executed in order on a running Codespaces instance.

1. **Open the application.** Navigate to the frontend URL (port 5173). The application loads at the landing page. Explore the page to see the feature overview, then click **Login** and sign in using the demo student account: email `student@fhnw.ch`, password `student123`.

2. **Browse the module catalog as a visitor.** Before logging in, navigate to `/modules`. The catalog is publicly accessible without an account. Observe the 8 available BIT modules: 5 COMPULSORY (Business Intelligence, Internet Technology, Logistics and Supply Chain Management, Statistics and Probability, Topics in Business Information Technology) and 3 ELECTIVE (Algorithms and Data Structures, Quantum Disruption, Social Engineering with Africa). Modules are listed alphabetically. A **Login to add** button is shown in place of the Add button for unauthenticated visitors.

3. **View the official module description.** Click **View Detail** on any module (e.g. **Internet Technology**). On the module detail page, click **Official Description** to open the PDF viewer overlay. The page dims and the official FHNW module description PDF opens in a floating panel. Close it with the X button, the Escape key, or clicking outside the panel.

4. **Add a compulsory module.** Log in as the demo student. From the catalog, click **Add** on **Internet Technology**. Confirm it appears in the Semester Planner.

5. **Add the first elective module.** Return to the catalog. Click **Add** on **Algorithms and Data Structures**. The planner now contains one elective module.

6. **Add the second elective module.** Click **Add** on **Quantum Disruption**. The planner now contains two elective modules — the maximum permitted.

7. **Trigger the elective cap rule (BR-01).** Attempt to add **Social Engineering with Africa** to the planner. Observe the error response: `You have reached the maximum of 2 elective modules for your semester plan.`

8. **Create a module note.** On the Student Dashboard, locate **Internet Technology** in the planner. Click the note icon to open the inline note editor. Enter a note and save it.

9. **Open the full-page notes editor.** Click the expand icon on the same module to navigate to the dedicated notes page for that module. Edit and save the note from the full-page view.

10. **Connect a calendar.** On the dashboard, open the calendar section and click **Add Calendar**. Paste a publicly accessible ICS feed URL (e.g. an Outlook or Google Calendar export). Confirm that events appear in the calendar view.

11. **Inspect a calendar event.** Click on any event in the calendar. A popup appears showing the full event title, date, time range, and calendar name. If the event overlaps with another, an overlap warning is displayed. Click outside the popup or the X to close it.

12. **Query the ChatBot with calendar context.** Open the ChatBot panel (bottom-right corner). Ask: *"Do I have anything scheduled this week?"* The assistant incorporates the connected calendar events into its response, referencing only upcoming events.

13. **Upload a document as a student.** Click the file upload button in the ChatBot. Select a PDF or DOCX file containing exam info, bonus points, or deadlines. If the document contains study-relevant information, the note-save panel opens automatically with the content pre-filled and the most likely module pre-selected based on the filename. Review the note, confirm the module selection, and click **Save**. If the document contains no study-relevant information (e.g. a lecture theory slide), the panel does not open; instead the assistant sends a message in the chat confirming the document was indexed and inviting questions.

14. **Ask the assistant about saved notes.** After saving the note, delete the uploaded document from the My Documents panel. Then ask the ChatBot: *"What bonus points are available for Internet Technology?"* The assistant answers using the saved note content, demonstrating that note context persists independently of the uploaded document.

15. **Switch to the admin account.** Log out. Log in as `admin@fhnw.ch` with password `admin123`. Open the ChatBot and upload an official module description PDF (e.g. one of the 8 bundled PDFs from `docs/knowledge/`). If the filename matches an existing module, the panel confirms the module is already in the catalog and that the document has been uploaded and indexed, with a **View Module →** link. Dismiss the panel — the assistant sends a message in chat confirming the module and inviting questions. If no match is found, the panel pre-fills a Create New Module form with extracted data; after clicking **Create Module**, a success confirmation with a **View Module →** button appears at the bottom of the panel.

16. **Ask the assistant about any module.** With the admin account, ask the ChatBot: *"Give me detailed information from the official description of Algorithms and Data Structures."* The assistant retrieves content from the indexed knowledge base and responds with accurate module information — no upload required.

17. **Explore the API documentation.** Navigate to `/swagger-ui.html`. Review all 30 documented REST endpoints across the Auth, Modules, Planner, Notes, Calendars, Chat, and Document RAG groups.


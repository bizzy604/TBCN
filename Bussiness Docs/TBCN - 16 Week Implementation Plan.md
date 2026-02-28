# **TBCN - 16-Week MVP Implementation Plan**

**Document Version:** 1.0  
**Target:** MVP Launch (Month 4)  
**Methodology:** Agile Sprints (4-Week Cycles)  
**Focus:** "Functional Web Application with Core Membership, Coaching, and Community Features" (PRD Phase 1)

---

## **Overview Strategy**

| Phase | Timeline | Primary Focus | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Weeks 1-4 | **Foundation & Identity** | Project Setup, Auth, User Profiles, DB Design |
| **Sprint 2** | Weeks 5-8 | **Learning Core** | Programs, Lessons, Enrollments, Progress Tracking |
| **Sprint 3** | Weeks 9-12 | **Engagement Layer** | Coaching, Community, Messaging, Events |
| **Sprint 4** | Weeks 13-16 | **Commerce & Launch** | Payments, Admin Dashboard, Testing, Deployment |

---

## **Sprint 1: Foundation & Identity (Weeks 1-4)**
**Goal:** A secure, deployable platform where users can register, manage profiles, and navigate the shell.

### **Week 1: Scaffolding & Infrastructure**
*   [x] **DevOps:** Setup Monorepo (Turborepo), Docker, CI/CD pipelines.
*   [x] **DB:** Provision PostgreSQL & Redis. Run initial migrations.
*   [x] **Frontend:** Setup Next.js App Router layout, design system integration (Tailwind), and global state (Zustand).
*   [x] **Backend:** Setup NestJS modules structure, global filters/interceptors (logging, error handling).

### **Week 2: Authentication & Authorization**
*   [x] **API:** Implement `AuthModule` (JWT, Refresh Tokens).
*   [x] **API:** Implement `UsersModule` (Create, Update, Find).
*   [x] **Web:** User Registration Flow (Email/Password + Social Login UI).
*   [x] **Web:** Login Flow & Protected Route Guards.

### **Week 3: User Profiles & Roles**
*   [x] **DB:** Implement `user_profiles` and `user_roles` schemas.
*   [x] **API:** Profile management endpoints (Avatar upload via S3).
*   [x] **Web:** Build "My Profile" dashboard and edit settings pages.
*   [x] **Admin:** Simple user list view for Admins.

### **Week 4: Homepage & Marketing Pages**
*   [x] **Web:** Implement Landing Page (Hero, Value Prop).
*   [x] **Web:** About Us, Partners, and Contact pages.
*   [x] **QA:** End-to-end testing of Auth flow.
*   [ ] **Milestone:** **Alpha Deployment (Internal Testing).**

---

## **Sprint 2: Learning Core (Weeks 5-8)**
**Goal:** The LMS engine—users can browse courses, enroll, and consume content.

### **Week 5: Course Catalog & Management**
*   [ ] **API:** `ProgramsModule` (CRUD for Courses, Modules, Lessons).
*   [ ] **DB:** Seed initial course data.
*   [ ] **Web:** Course Catalog/Discovery page with filtering.
*   [ ] **Web:** Course Detail Page (Landing Page for a specific course).

### **Week 6: Curriculum Builder (Admin/Coach)**
*   [ ] **API:** Endpoints to structure modules and upload lesson content.
*   [ ] **Admin:** "Program Builder" UI (Drag-and-drop modules).
*   [ ] **Integration:** Video upload handling (S3 + Signed URLs).

### **Week 7: Enrollment & Learning Interface**
*   [ ] **API:** `EnrollmentsModule` (Join course logic).
*   [ ] **Web:** "My Learning" Dashboard.
*   [ ] **Web:** Lesson Player Interface (Video player, text content, sidebar navigation).

### **Week 8: Progress & Assessments**
*   [ ] **API:** Track lesson completion status.
*   [ ] **API:** Simple Quiz/Assessment logic.
*   [ ] **Web:** Progress bars and completion indicators.
*   [ ] **UNIT TEST and Integration tests.**
*   [ ] **Milestone:** **LMS Feature Complete (Beta).**

---

## **Sprint 3: Engagement Layer (Weeks 9-12)**
**Goal:** Connecting users with coaches and each other.

### **Week 9: Coaching Marketplace**
*   [ ] **API:** `CoachingModule` (Coach profiles, availability slots).
*   [ ] **Web:** Coach Directory with search/filter.
*   [ ] **Web:** Booking UI (Select slot, confirm booking).

### **Week 10: Community & Messaging**
*   [ ] **API:** `CommunityModule` (Posts, Comments, Likes).
*   [ ] **API:** `MessagingModule` (Basic 1-on-1 text messaging).
*   [ ] **Web:** Community Feed interactions.
*   [ ] **Web:** Chat Interface.

### **Week 11: Events & Masterclasses**
*   [ ] **API:** `EventsModule` (Create event, register attendee).
*   [ ] **Web:** Events Calendar/List view.
*   [ ] **Web:** Event Registration flow.

### **Week 12: Notifications & Polish**
*   [ ] **API:** `NotificationsModule` (Email triggers via SendGrid/SES, In-app alerts).
*   [ ] **Web:** Notification Center dropdown.
*   [ ] **QA:** Integration testing of Booking and Community flows.

---

## **Sprint 4: Commerce & Launch (Weeks 13-16)**
**Goal:** Monetization, security hardening, and public release.

### **Week 13: Payments & Subscriptions**
*   [ ] **API:** `PaymentsModule` (Stripe/Flutterwave integration).
*   [ ] **API:** Webhook handlers for payment success/failure.
*   [ ] **Web:** Checkout Page and Payment Confirmation.
*   [ ] **Web:** Subscription management in User Settings.

### **Week 14: Admin Dashboard & Analytics**
*   [ ] **Admin:** Dashboard Overview (User growth, Revenue charts).
*   [ ] **Admin:** Content Moderation tools.
*   [ ] **API:** Aggregated analytics endpoints.

### **Week 15: Security, Performance & QA**
*   [ ] **Ops:** Rate limiting setup, Security headers (Helmet).
*   [ ] **QA:** Load testing (k6) and penetration testing.
*   [ ] **Bug Fixes:** "Bug Bash" week to clear backlog.

### **Week 16: Launch Prep**
*   [ ] **Ops:** Production environment setup (Domain DNS, SSL).
*   [ ] **Ops:** Database backup schedules.
*   [ ] **Docs:** Handover documentation and User Guides.
*   [ ] **Milestone:** **MVP Public Launch (Go Live).**

---

## **Resource Allocation**

*   **Weeks 1-8:** Heavy Backend/Frontend focus (2 Devs).
*   **Weeks 9-12:** Frontend heavy (UI/UX) + Coach coordination.
*   **Weeks 13-16:** Full stack + DevOps/QA focus.

## **Risk Management**

*   **Risk:** Payment Gateway approval delays.
    *   *Mitigation:* Apply for merchant accounts in Week 2.
*   **Risk:** Video hosting costs.
    *   *Mitigation:* Implement caching policies and compression early.
*   **Risk:** Feature creep.
    *   *Mitigation:* Strict adherence to PRD "Phase 1" scope only.

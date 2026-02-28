# Sprint Delivery Task List (Sprints 2-4)

**Last Updated:** 2026-02-28  
**Owner:** Product + Engineering  
**Baseline Reference:** `docs/architecture/sprint-1-implementation-report.md`

---

## 1. Current Baseline (As Of 2026-02-28)

- Sprint 1: complete in implementation (see Sprint 1 report).
- Sprint 2: implementation complete; report publication pending.
- Implemented in Sprint 2 scope:
- Programs CRUD/module/lesson APIs.
- Enrollments and progress APIs.
- Assessment API and learner flow.
- Program catalog, program detail, lesson player, and "My Learning" pages.
- Certificates module implementation.
- Program builder/admin curriculum tooling.
- Sprint 2 automated test completion (programs/enrollments/assessments/certificates).
- Sprint 3 and 4 features remain mostly scaffolded.

---

## 2. Sprint 2 Closeout Task List (Learning Core)

### 2.1 Backend Completion

- [x] Implement `certificates` module end-to-end:
- Entity schema and persistence.
- Service logic to generate and issue certificates on qualifying completion.
- Controller endpoints for retrieval/verification/download.
- Enrollment-certificate linkage.
- [x] Replace service-internal repository access patterns that break module boundaries (for example direct bracket access to another service internals).
- [x] Add/verify role and ownership guards for program/module/lesson write operations.
- [x] Wire media upload flow to lesson/program authoring where needed.

### 2.2 Web Completion

- [x] Build Admin/Coach program builder UI (program/module/lesson authoring).
- [x] Add certificate viewing/downloading UX for completed enrollments.
- [x] Validate lesson-to-assessment navigation and retake constraints in UI.
- [x] Remove Sprint 2 related placeholder experiences in LMS flow.

### 2.3 Data and Quality

- [x] Validate and document program seed process for local/dev.
- [x] Add unit tests for `programs`, `enrollments`, `assessments`, `certificates`.
- [x] Replace Sprint 2 TODO e2e specs with implemented tests:
- `apps/api/test/programs.e2e-spec.ts`
- `apps/api/test/enrollments.e2e-spec.ts`
- Add `assessments.e2e-spec.ts` if absent.
- [x] Run and record verification:
- API unit tests.
- API e2e tests.
- Web lint/type-check.

### 2.4 Sprint 2 Exit Criteria

- [x] Learning core is fully usable by Member and Coach roles without placeholder blockers.
- [x] All Sprint 2 critical paths have automated test coverage.
- [x] Sprint 2 report is published:
- `docs/architecture/sprint-2-implementation-report.md`

---

## 3. Sprint 3 Task List (Engagement Layer)

### 3.1 Week 9: Coaching Marketplace

- [ ] Implement `coaching` backend module (profiles, availability, booking, session lifecycle).
- [ ] Replace `coaches` and `sessions` "Coming Soon" pages with functional UI.
- [ ] Add booking validations and conflict handling.

### 3.2 Week 10: Community and Messaging

- [ ] Implement `community` module (posts, comments, reactions, moderation baseline).
- [ ] Implement `messaging` module (basic 1:1 messaging).
- [ ] Replace dashboard community/messages placeholders with working screens.

### 3.3 Week 11: Events and Masterclasses

- [ ] Implement `events` module (create/list/register/attendance baseline).
- [ ] Replace events placeholder pages with working event list/detail/registration flow.

### 3.4 Week 12: Notifications and Integration QA

- [ ] Implement `notifications` module (email/in-app baseline).
- [ ] Add notification center UX.
- [ ] Add integration tests for coaching/community/events critical paths.

### 3.5 Sprint 3 Exit Criteria

- [ ] All Sprint 3 APIs implemented and wired to UI.
- [ ] No Sprint 3 dashboard routes show "Coming Soon".
- [ ] Sprint 3 report is published:
- `docs/architecture/sprint-3-implementation-report.md`

---

## 4. Sprint 4 Task List (Commerce and Launch)

### 4.1 Week 13: Payments and Subscriptions

- [ ] Implement `payments` module and processors used in MVP scope.
- [ ] Implement webhook handlers and idempotency protections.
- [ ] Deliver checkout and payment confirmation UX.
- [ ] Deliver subscription management UX in settings.

### 4.2 Week 14: Admin Dashboard and Analytics

- [ ] Replace admin mock stats with real aggregated API data.
- [ ] Implement `analytics` endpoints required by admin dashboards.
- [ ] Add moderation tooling required for launch.

### 4.3 Week 15: Security, Performance, QA

- [ ] Verify/complete rate limits, headers, and security controls.
- [ ] Run load and basic penetration testing.
- [ ] Execute bug bash and clear launch blockers.

### 4.4 Week 16: Launch Preparation

- [ ] Production readiness checklist completion (DNS, SSL, backups, monitoring).
- [ ] Handover docs and user guides update.
- [ ] Go-live rehearsal and rollback validation.

### 4.5 Sprint 4 Exit Criteria

- [ ] Commerce flows are production-ready and tested.
- [ ] Admin analytics/moderation are operational.
- [ ] MVP launch readiness checklist is complete.
- [ ] Sprint 4 report is published:
- `docs/architecture/sprint-4-implementation-report.md`

---

## 5. Reporting Rule (Mandatory)

Before starting the next sprint, publish the current sprint report in `docs/architecture/` using:

- `docs/architecture/sprint-report-template.md`

Required naming convention:

- `sprint-<number>-implementation-report.md`

Minimum sections required in each report:

- Sprint overview and status.
- Week-by-week delivery summary.
- Module/API/frontend status matrices.
- Test and quality metrics with command evidence.
- Known issues, risks, and carry-over items.
- Prerequisites and recommendations for the next sprint.

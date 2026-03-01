# TBCN Role Access And Portal Separation

## Purpose
This document defines how each PRD role accesses the platform, which app they should use, and the exact authority boundaries.

PRD references:
- `FR-1.2` roles and permission matrix in [TBCN PRD - Final Draft.md](../../Bussiness%20Docs/TBCN%20PRD%20-%20Final%20Draft.md)
- LMS requirements in `FR-3.1`
- Content approval workflow in `FR-8.1`

## Canonical Roles
Current code roles are in [roles.constants.ts](../../packages/shared/src/constants/roles.constants.ts).

- `guest` (unauthenticated)
- `member`
- `partner`
- `coach`
- `admin`
- `super_admin`

Note on "Mentor": PRD language can treat mentor as coach functionally. In code today, mentor behavior should use role `coach`.

## Portal Separation (Implemented Model)
Use two admin experiences intentionally:

1. `apps/web` (member platform + moderation admin)
2. `apps/admin` (LMS operations app for program delivery)

### Why this split
- `apps/web /admin/*` should remain platform governance and moderation.
- `apps/admin/*` should be operational LMS tooling (programs, lessons, assessments, enrollments).
- This keeps governance authority separate from day-to-day learning operations.

## Role To Portal Mapping

### Guest
- App: `apps/web`
- Entry: public pages
- Access: browse public content only

### Member
- App: `apps/web`
- Entry: `/dashboard`
- Access: learning consumption, enrollments, community, profile, payments

### Partner
- App: `apps/web`
- Entry: `/dashboard`
- Access: partner/member capabilities and partner reporting features

### Coach (Mentor)
- App: `apps/web` and `apps/admin`
- Entry: `/dashboard` in web, `/login` in admin app
- Access in web: coaching sessions, own coaching profile, community participation
- Access in admin app: create/edit own programs, modules, lessons, assessments, view own program enrollments
- Restriction: no platform-wide moderation approvals, no global user/role administration, no global finance controls

### Admin
- App: `apps/web` and `apps/admin`
- Entry: `/admin` in web, `/login` in admin app
- Access in web: moderation, user governance, analytics, payments oversight
- Access in admin app: all LMS operational capabilities, cross-coach supervision

### Super Admin
- App: `apps/web` and `apps/admin`
- Entry: `/admin` in web, `/login` in admin app
- Access: full system authority including admin governance, role assignment, critical settings

## Authority Boundaries

### LMS Operations Authority (apps/admin)
- `coach`: own content lifecycle and own program learner operations
- `admin` and `super_admin`: all LMS content and operational oversight

### Governance Authority (apps/web /admin)
- `admin` and `super_admin` only
- Includes moderation approval, user role changes, platform-wide reports, platform policy control

## Route Guarding Rules

### apps/web
- `/dashboard/**`: authenticated roles (`member`, `partner`, `coach`, `admin`, `super_admin`)
- `/admin/**`: `admin`, `super_admin` only
- `/sessions/**`: authenticated roles; management actions are `coach`, `admin`, `super_admin`
- `/coach/**`: `coach`, `admin`, `super_admin`
- `/partner/**`: `partner`, `admin`, `super_admin`

### apps/admin
- `/login`: unauthenticated only
- all dashboard routes: `coach`, `admin`, `super_admin`
- sensitive routes (`/users`, platform settings): `admin`, `super_admin` only

## Current Code Alignment

Aligned:
- API already allows `coach` for many LMS endpoints (programs and assessments).
- Web middleware restricts `/admin` to `admin` and `super_admin`.
- LMS admin app middleware now allows `coach`, `admin`, and `super_admin`.
- LMS admin app now blocks governance routes for coaches (`/users`, `/partners`, `/transactions`, `/settings`, `/content-moderation`).
- LMS admin UI hides governance navigation/actions for coaches and keeps destructive program actions admin-only.
- API controllers now include explicit `@Roles(...)` annotations for key modules (coaching/events/community/messaging/notifications/media) so route-level authorization is visible and auditable.

## Implementation Checklist (Status)

1. Introduce portal role constants - complete
- `LMS_PORTAL_ROLES = ['coach', 'admin', 'super_admin']`
- `MODERATION_PORTAL_ROLES = ['admin', 'super_admin']`

2. Update `apps/admin` auth gate - complete
- middleware and login role checks should accept coach
- keep backend as source of truth for endpoint authorization

3. Add route-level restrictions inside `apps/admin` - complete
- hide or block user-management/governance pages for coach
- keep coach on LMS authoring and enrollment views only

4. Keep `apps/web /admin` governance-only - complete
- no LMS authoring duplication unless explicitly needed for super admins

5. Add QA scenarios per role - in progress
- login redirect checks
- positive and negative authorization tests
- UI menu visibility tests by role

## Operational Recommendation
- Keep one identity and one JWT role model across both apps.
- Enforce permissions in backend first, then mirror in frontend navigation.
- Treat mentor as a coaching capability label, not a separate RBAC role unless business later requires distinct policy.

# Sprint 1 — Architecture Decision Records (ADRs)

**Sprint:** 1 — Foundation & Identity (Weeks 1–4)
**Document Version:** 1.0
**Last Updated:** 2026-02-07

---

## Table of Contents

1. [ADR-001: Turborepo Monorepo](#adr-001-turborepo-monorepo)
2. [ADR-002: NestJS for Backend API](#adr-002-nestjs-for-backend-api)
3. [ADR-003: Next.js App Router for Web](#adr-003-nextjs-app-router-for-web)
4. [ADR-004: TypeORM with PostgreSQL](#adr-004-typeorm-with-postgresql)
5. [ADR-005: JWT + Passport Authentication](#adr-005-jwt--passport-authentication)
6. [ADR-006: OAuth Social Login via Server-Side Redirect](#adr-006-oauth-social-login-via-server-side-redirect)
7. [ADR-007: Zustand for Client State](#adr-007-zustand-for-client-state)
8. [ADR-008: React Query for Server State](#adr-008-react-query-for-server-state)
9. [ADR-009: Route Groups for Page Organization](#adr-009-route-groups-for-page-organization)
10. [ADR-010: Shared Packages Architecture](#adr-010-shared-packages-architecture)
11. [ADR-011: Domain Event System](#adr-011-domain-event-system)
12. [ADR-012: Global Response Envelope](#adr-012-global-response-envelope)
13. [ADR-013: Infrastructure as Code](#adr-013-infrastructure-as-code)
14. [ADR-014: Email Service Integration (Nodemailer SMTP)](#adr-014-email-service-integration-nodemailer-smtp)
15. [ADR-015: Comprehensive Unit & Integration Testing](#adr-015-comprehensive-unit--integration-testing)

---

## ADR-001: Turborepo Monorepo

**Status:** Accepted
**Date:** Sprint 1, Week 1

### Context

The platform has three applications (web, api, admin) that share types, utilities, and UI components. We need a build system that handles cross-app dependencies efficiently.

### Decision

Use **Turborepo** as the monorepo build orchestrator with **npm workspaces** for package management.

### Structure

```
TBCN/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # Next.js public frontend
│   └── admin/        # Next.js admin dashboard
├── packages/
│   ├── shared/       # Types, constants, utilities
│   ├── config/       # Shared configuration
│   └── ui/           # Shared UI component library
├── turbo.json        # Pipeline configuration
└── package.json      # Workspace root
```

### Consequences

- **Positive:** Single repository, atomic commits across apps, shared dependencies, consistent tooling.
- **Positive:** Turborepo caching reduces build times via `outputs` declarations and `dependsOn` graphs.
- **Negative:** Larger repository size; requires discipline in package boundaries.

### Pipeline Configuration

```json
{
  "build":  { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
  "dev":    { "cache": false, "persistent": true },
  "test":   { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
  "lint":   { "outputs": [] }
}
```

---

## ADR-002: NestJS for Backend API

**Status:** Accepted
**Date:** Sprint 1, Week 1

### Context

We need a structured, scalable backend framework for a platform with 12+ feature domains (Auth, Users, Programs, Coaching, Payments, etc.).

### Decision

Use **NestJS** with TypeScript for the API application.

### Rationale

- **Modular architecture** — each domain (Auth, Users, Programs) maps to a NestJS module with its own controller, service, and entities.
- **Dependency injection** — managed by the NestJS IoC container; simplifies testing and decoupling.
- **First-class TypeScript** — decorators for validation, Swagger docs, and guards.
- **Ecosystem** — native integrations with Passport, TypeORM, Bull, Swagger, Throttler.

### Module Registry (Sprint 1)

| Module | Status | Purpose |
|--------|--------|---------|
| `AuthModule` | ✅ Implemented | JWT auth, OAuth social login, token lifecycle, email verification |
| `UsersModule` | ✅ Implemented | User CRUD, profiles, role management |
| `EmailModule` | ✅ Implemented | SMTP email delivery, event-driven templates, console fallback |
| `ProgramsModule` | 🔲 Scaffold | Course management (Sprint 2) |
| `EnrollmentsModule` | 🔲 Scaffold | Enrollment logic (Sprint 2) |
| `CoachingModule` | 🔲 Scaffold | Coaching marketplace (Sprint 3) |
| `CommunityModule` | 🔲 Scaffold | Forums and posts (Sprint 3) |
| `PaymentsModule` | 🔲 Scaffold | Stripe integration (Sprint 4) |
| Plus 5 more... | 🔲 Scaffold | Events, Messaging, Notifications, Analytics, Partners |

### Consequences

- **Positive:** Consistent patterns across all 12+ modules. New developers follow the same controller → service → repository flow.
- **Negative:** Heavier boilerplate per module than Express.js.

---

## ADR-003: Next.js App Router for Web

**Status:** Accepted
**Date:** Sprint 1, Week 1

### Context

The web frontend serves both public marketing pages and authenticated application pages. We need server-side rendering for SEO on marketing pages and client-side interactivity for the app.

### Decision

Use **Next.js 16+** with the **App Router** (`app/` directory) for the web and admin applications.

### Rationale

- **Route groups** — `(marketing)`, `(auth)`, `(dashboard)`, `(admin)` allow separate layouts without affecting URL structure.
- **Server Components** — marketing pages are server-rendered for SEO; auth/dashboard pages use `'use client'`.
- **Metadata API** — structured SEO metadata with `generateMetadata` and template-based titles.
- **Built-in optimizations** — Image, Font (Inter + Poppins via `next/font`), and Link components.

### Consequences

- **Positive:** SEO-friendly marketing pages coexist with rich client-side dashboard in one app.
- **Negative:** Complexity in understanding server vs. client component boundaries.

---

## ADR-004: TypeORM with PostgreSQL

**Status:** Accepted
**Date:** Sprint 1, Week 1

### Context

The data model requires relational integrity (users → enrollments → programs), complex queries, and schema migrations.

### Decision

Use **TypeORM** as the ORM with **PostgreSQL** as the primary database.

### Key Design Decisions

1. **UUID primary keys** — all entities use `uuid` via `PrimaryGeneratedColumn('uuid')` in the `BaseEntity`.
2. **Timestamptz columns** — `created_at` and `updated_at` use `timestamptz` for timezone-aware timestamps.
3. **Soft deletes** — entities have a `deleted_at` column; queries filter by `deletedAt: IsNull()`.
4. **snake_case DB columns** — TypeORM `@Column({ name: 'first_name' })` maps to `camelCase` TypeScript properties.
5. **Lifecycle hooks** — `@BeforeInsert` and `@BeforeUpdate` for automatic password hashing.

### Base Entity Pattern

```typescript
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
```

### Consequences

- **Positive:** Strong relational model, migration support, TypeScript entity definitions.
- **Negative:** TypeORM has known performance limitations for very complex queries; may need raw SQL in future.

---

## ADR-005: JWT + Passport Authentication

**Status:** Accepted
**Date:** Sprint 1, Week 2

### Context

We need stateless authentication for the API supporting both email/password and OAuth social login flows.

### Decision

Use **Passport.js** strategies managed by `@nestjs/passport` with **JWT** (access + refresh tokens).

### Token Architecture

| Token | Lifetime | Storage (Client) | Purpose |
|-------|----------|------------------|---------|
| Access Token | 15 minutes | Zustand (memory + localStorage) | API request authorization |
| Refresh Token | 7 days | Zustand (memory + localStorage) | Silent token renewal |

### JWT Payload

```typescript
interface JwtPayload {
  sub: string;   // User ID (UUID)
  email: string;
  role: string;  // UserRole enum value
}
```

### Passport Strategies Registered

| Strategy | Guard | Purpose |
|----------|-------|---------|
| `jwt` | `JwtAuthGuard` | Validates Bearer tokens on protected routes |
| `google` | `GoogleAuthGuard` | Initiates/handles Google OAuth2 flow |
| `facebook` | `FacebookAuthGuard` | Initiates/handles Facebook OAuth flow |
| `linkedin` | `LinkedInAuthGuard` | Initiates/handles LinkedIn OAuth2 flow |

### Consequences

- **Positive:** Stateless, scalable, no server-side session store required.
- **Positive:** Passport strategies provide a uniform interface across auth methods.
- **Negative:** Token revocation requires a blacklist mechanism (planned for Sprint 2).

---

## ADR-006: OAuth Social Login via Server-Side Redirect

**Status:** Accepted
**Date:** Sprint 1, Week 4

### Context

Social login buttons on the frontend need to authenticate users via Google, LinkedIn, and Facebook. Two patterns exist: (a) client-side SDK flow, (b) server-side redirect flow.

### Decision

Use **server-side OAuth redirect** via Passport strategies.

### Flow

```
1. User clicks "Sign in with Google" on frontend
2. Browser navigates to:  GET /api/v1/auth/google
3. Passport GoogleAuthGuard redirects to Google consent screen
4. User grants consent → Google redirects to: GET /api/v1/auth/google/callback
5. Passport validates profile → AuthService.socialLogin() is called
6. API generates JWT tokens
7. API redirects to: {FRONTEND_URL}/auth/callback?accessToken=...&refreshToken=...
8. Frontend callback page extracts tokens, stores in Zustand, fetches /auth/me, redirects to /dashboard
```

### User Resolution Strategy (findOrCreateFromSocial)

```
Priority 1: Find by (oauthProvider + oauthProviderId)  → return existing user
Priority 2: Find by email                               → link OAuth to existing account
Priority 3: Create new user                             → auto-verified, active status, no password
```

### Consequences

- **Positive:** Single auth flow implementation serves both login and signup.
- **Positive:** OAuth secrets never touch the frontend; secure by design.
- **Positive:** Existing email/password users can seamlessly link social accounts.
- **Negative:** Token exposure in redirect URL — mitigated by short-lived tokens and immediate consumption on the callback page.

---

## ADR-007: Zustand for Client State

**Status:** Accepted
**Date:** Sprint 1, Week 1

### Context

The frontend needs to manage global client state: authentication status, user profile, UI preferences, and shopping cart.

### Decision

Use **Zustand** with the `persist` middleware for client-side state management.

### Store Architecture

| Store | Persistence | Purpose |
|-------|-------------|---------|
| `auth-store` | localStorage (partial) | User, tokens, isAuthenticated |
| `ui-store` | localStorage | Theme, sidebar state, preferences |
| `cart-store` | localStorage | Program enrollment cart |
| `user-store` | None | Transient user data |

### Auth Store Design

```typescript
// Persists only: user, accessToken, refreshToken, isAuthenticated
// Does NOT persist: isLoading, isHydrated (transient state)
partialize: (state) => ({
  user: state.user,
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  isAuthenticated: state.isAuthenticated,
})
```

### Consequences

- **Positive:** Minimal boilerplate vs. Redux; direct state mutations; excellent TypeScript support.
- **Positive:** `persist` middleware handles SSR hydration concerns with `isHydrated` flag.
- **Negative:** No built-in devtools (mitigated by zustand/devtools middleware in dev).

---

## ADR-008: React Query for Server State

**Status:** Accepted
**Date:** Sprint 1, Week 2

### Context

API data (user profiles, programs, enrollments) needs caching, background refresh, and synchronization between browser tabs.

### Decision

Use **React Query (TanStack Query)** for all server-state management, wrapped in a `QueryProvider`.

### Pattern

```typescript
// Custom hooks wrap React Query mutations/queries
export function useAuth() {
  const loginMutation = useMutation({ mutationFn: authApi.login });
  const registerMutation = useMutation({ mutationFn: authApi.register });
  // ...
}
```

### Consequences

- **Positive:** Automatic caching, deduplication, background refetching, retry logic.
- **Positive:** Clean separation: Zustand = client state, React Query = server state.
- **Negative:** Two state systems to reason about.

---

## ADR-009: Route Groups for Page Organization

**Status:** Accepted
**Date:** Sprint 1, Week 1

### Context

The web app has four distinct sections with different layouts: marketing (header/footer), auth (split-screen), dashboard (sidebar), admin (sidebar).

### Decision

Use Next.js **route groups** (`(groupName)`) to define separate layouts per section.

### Route Map

```
app/
├── page.tsx                   # Landing page (root, uses Header/Footer directly)
├── layout.tsx                 # Root layout (fonts, metadata, providers)
├── (marketing)/
│   ├── layout.tsx             # Marketing layout (Header, Footer)
│   ├── about/page.tsx         # /about
│   ├── partners/page.tsx      # /partners
│   └── contact/page.tsx       # /contact
├── (auth)/
│   ├── layout.tsx             # Auth layout (split-screen branding)
│   ├── login/page.tsx         # /login
│   ├── register/page.tsx      # /register
│   └── forgot-password/page.tsx
├── auth/
│   └── callback/page.tsx      # /auth/callback (OAuth — no layout group)
├── (dashboard)/               # /dashboard/* (sidebar layout)
└── (admin)/                   # /admin/* (admin sidebar layout)
```

### Consequences

- **Positive:** Each section has independent layout without URL path pollution.
- **Positive:** Marketing pages get full-width Header/Footer; dashboard gets sidebar navigation.
- **Negative:** Naming can confuse new developers (`(auth)` group vs `auth/` real route).

---

## ADR-010: Shared Packages Architecture

**Status:** Accepted
**Date:** Sprint 1, Week 1

### Context

Types, constants, and utility functions are shared between the web, admin, and API applications.

### Decision

Use workspace packages under `packages/` for shared code.

### Package Structure

| Package | Purpose | Consumers |
|---------|---------|-----------|
| `@tbcn/shared` | TypeScript types, constants, validation utils | All apps |
| `@tbcn/config` | Shared configuration schemas | api, web, admin |
| `@tbcn/ui` | Shared React component library | web, admin |

### Consequences

- **Positive:** Single source of truth for types (e.g., `UserRole`, `OAuthProvider`).
- **Positive:** UI components shared between web and admin without duplication.
- **Negative:** Requires careful dependency management between packages.

---

## ADR-011: Domain Event System

**Status:** Accepted
**Date:** Sprint 1, Week 2

### Context

Business actions (user registered, login successful, password changed) may trigger side effects (send emails, update analytics, log audit entries).

### Decision

Use **NestJS EventEmitter2** for synchronous in-process domain events with a structured event naming convention.

### Event Naming Convention

```typescript
export const AUTH_EVENTS = {
  USER_REGISTERED:     'auth.user.registered',
  USER_LOGGED_IN:      'auth.user.loggedIn',
  USER_SOCIAL_LOGIN:   'auth.user.socialLogin',
  PASSWORD_RESET_REQUESTED: 'auth.password.resetRequested',
  PASSWORD_CHANGED:    'auth.password.changed',
};

export const USER_EVENTS = {
  CREATED:        'user.created',
  UPDATED:        'user.updated',
  DELETED:        'user.deleted',
  ROLE_CHANGED:   'user.role.changed',
  STATUS_CHANGED: 'user.status.changed',
};
```

### Consequences

- **Positive:** Decouples core business logic from side effects.
- **Positive:** Easy to add event listeners (email, analytics, audit) without modifying service classes.
- **Negative:** Synchronous execution; long-running side effects should use Bull job queues instead.

---

## ADR-012: Global Response Envelope

**Status:** Accepted
**Date:** Sprint 1, Week 1

### Context

All API consumers need a predictable response format for both success and error cases.

### Decision

Use a **TransformInterceptor** to wrap all responses in a standard envelope.

### Response Format

```json
// Success
{
  "data": { ... },
  "timestamp": "2026-02-07T12:00:00.000Z"
}

// Success (paginated)
{
  "data": [ ... ],
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 },
  "timestamp": "2026-02-07T12:00:00.000Z"
}

// Error (via HttpExceptionFilter)
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "timestamp": "2026-02-07T12:00:00.000Z"
}
```

### Consequences

- **Positive:** Frontend API client can consistently unwrap responses via `response.data.data`.
- **Positive:** Pagination metadata is always in `meta`, never mixed with data.
- **Negative:** Extra nesting on the client side; requires `ApiResponse<T>` wrapper type.

---

## ADR-013: Infrastructure as Code

**Status:** Accepted
**Date:** Sprint 1, Week 1

### Context

The platform targets AWS deployment with EKS, RDS, and S3.

### Decision

Use **Terraform** for infrastructure provisioning, **Kubernetes manifests** for orchestration, and **Docker** for containerization.

### Infrastructure Layout

```
infrastructure/
├── docker/           # Dockerfile configurations
├── k8s/
│   ├── api-deployment.yaml
│   ├── web-deployment.yaml
│   └── ingress.yaml
└── terraform/
    ├── main.tf       # Provider, backend config
    ├── vpc.tf        # VPC, subnets, security groups
    ├── eks.tf        # EKS cluster
    ├── rds.tf        # PostgreSQL RDS instance
    └── s3.tf         # S3 buckets for uploads
```

### Consequences

- **Positive:** Reproducible, version-controlled infrastructure.
- **Positive:** Multi-environment support (dev/staging/prod) via Terraform workspaces.
- **Negative:** Additional learning curve for team members unfamiliar with IaC.

---

## ADR-014: Email Service Integration (Nodemailer SMTP)

**Status:** Accepted
**Date:** Sprint 1, Week 4 (late addition)

### Context

The authentication system emits domain events (user registered, password reset requested, password changed) but had no email delivery mechanism. Verification emails and password reset emails are critical for Sprint 2 readiness — users cannot complete registration without email verification.

### Options Evaluated

| Option | Pros | Cons |
|--------|------|------|
| **SendGrid** | Managed service, high deliverability, analytics | SaaS dependency, cost at scale |
| **AWS SES** | Low cost, AWS-native | Sandbox mode requires verification, AWS lock-in |
| **Nodemailer (SMTP)** | Provider-agnostic, works with any SMTP server, zero vendor lock-in | Self-managed, no built-in analytics |

### Decision

Use **Nodemailer** with configurable SMTP transport. This allows connecting to any SMTP provider (Gmail, Mailtrap, Resend, AWS SES SMTP, etc.) via environment variables without code changes.

### Architecture

```
AuthService                    EmailEventListener              EmailService
  │                                │                               │
  │── emit(USER_REGISTERED) ──────►│                               │
  │                                │── sendVerificationEmail() ───►│
  │                                │                               │── SMTP transporter.sendMail()
  │── emit(PASSWORD_RESET) ──────►│                               │   OR
  │                                │── sendPasswordResetEmail() ──►│── console.log() (fallback)
  │── emit(PASSWORD_CHANGED) ────►│                               │
  │                                │── sendPasswordChangedEmail()─►│
```

### Email Module Design

```
modules/email/
├── email.module.ts              # Global module (available to all modules)
├── email.service.ts             # SMTP transport + fallback + template methods
├── email-event.listener.ts      # @OnEvent() handlers for auth events
└── templates/
    └── index.ts                 # 4 branded HTML email templates
```

**Key design decisions:**

1. **Global module** — `@Global()` so any module can inject `EmailService` without importing `EmailModule`.
2. **Console fallback** — When `SMTP_HOST` is not configured, emails are logged to console. This allows development without an SMTP server.
3. **Event-driven** — Email sending is triggered by domain events, not called directly from `AuthService`. This keeps auth logic decoupled from email delivery.
4. **OnModuleInit** — SMTP transporter is created and verified on application startup. If verification fails, the service gracefully degrades to console logging.
5. **Branded HTML templates** — Four pre-built templates with consistent brand styling: verification, password reset, welcome, password changed.

### Email Templates

| Template | Trigger Event | Purpose |
|----------|---------------|----------|
| `getEmailVerificationTemplate` | `auth.user.registered` | Email with verification link |
| `getPasswordResetTemplate` | `auth.password.resetRequested` | Password reset link (1hr expiry) |
| `getWelcomeTemplate` | Manual (post-verification) | Welcome message after email verified |
| `getPasswordChangedTemplate` | `auth.password.changed` | Security confirmation |

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|----------|
| `SMTP_HOST` | No | — | SMTP server hostname (empty = console fallback) |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | No | — | SMTP authentication username |
| `SMTP_PASS` | No | — | SMTP authentication password |
| `SMTP_SECURE` | No | `false` | Use TLS (`true` for port 465) |
| `SMTP_FROM_EMAIL` | No | `noreply@brandcoachnetwork.com` | Sender email address |
| `SMTP_FROM_NAME` | No | `The Brand Coach Network` | Sender display name |

### Consequences

- **Positive:** Zero vendor lock-in — swap SMTP providers by changing environment variables.
- **Positive:** Console fallback enables development without external dependencies.
- **Positive:** Event-driven architecture keeps email sending decoupled from business logic.
- **Positive:** Auth service fully implemented — `register`, `forgotPassword`, `resetPassword`, `changePassword`, `verifyEmail`, `resendVerificationEmail` all production-ready.
- **Negative:** No built-in analytics/tracking (open rates, click rates). Can be added later via webhook-capable providers.
- **Negative:** Synchronous event processing — for high-volume scenarios, should migrate to Bull queue.

---

## ADR-015: Comprehensive Unit & Integration Testing

**Status:** Accepted
**Date:** Sprint 1, Week 4 (late addition)

### Context

Sprint 1 delivered auth (email + social OAuth), email service, and user management. Before closing the sprint, comprehensive test coverage was needed to validate all flows and prevent regressions in Sprint 2.

### Decision

Use **Jest** with **ts-jest** for unit tests and **Jest + Supertest** for E2E integration tests. All new modules (email, social login, email verification) receive dedicated test suites.

### Test Architecture

```
apps/api/
├── src/modules/
│   ├── auth/
│   │   ├── auth.service.spec.ts          # 30 unit tests
│   │   ├── auth.controller.spec.ts       # 17 unit tests
│   │   └── strategies/
│   │       ├── google.strategy.spec.ts   # 4 unit tests
│   │       ├── facebook.strategy.spec.ts # 4 unit tests
│   │       └── linkedin.strategy.spec.ts # 4 unit tests
│   ├── email/
│   │   ├── email.service.spec.ts         # 16 unit tests
│   │   └── email-event.listener.spec.ts  # 8 unit tests
│   └── users/
│       ├── users.service.spec.ts         # 15 unit tests
│       └── users.controller.spec.ts      # 11 unit tests
└── test/
    └── auth.e2e-spec.ts                  # E2E: verify-email, resend, OAuth redirects
```

### Testing Patterns

| Pattern | Implementation |
|---------|----------------|
| **DI Mock Injection** | `{ provide: UsersService, useValue: mockUsersService }` via NestJS Testing Module |
| **Direct Instantiation** | OAuth strategies instantiated directly to avoid PassportStrategy circular-dep in DI |
| **Module-level jest.mock()** | `jest.mock('nodemailer')` to mock SMTP transport |
| **Event-driven listener testing** | Mock `EmailService`, call handler methods directly, assert correct method calls |
| **E2E OAuth redirect tests** | Assert `302` status and `Location` header contains provider URL |

### Test Coverage Summary

| Suite | Tests | Coverage Focus |
|-------|-------|----------------|
| `auth.service.spec.ts` | 30 | register, login, refresh, forgotPassword, resetPassword, changePassword, verifyEmail, resendVerification, socialLogin (Google/FB/LinkedIn), logout |
| `auth.controller.spec.ts` | 17 | All endpoints + OAuth callbacks (redirect with tokens, error handling) |
| `email.service.spec.ts` | 16 | Console fallback, SMTP transport, all 4 email methods, connection failure graceful degradation |
| `email-event.listener.spec.ts` | 8 | All 3 event handlers (success/failure logging) |
| OAuth strategy specs | 12 | Profile extraction, missing fields handling for all 3 providers |
| `auth.e2e-spec.ts` | 25+ | Full HTTP flow: register → login → refresh → me → passwords → verify-email → resend → OAuth redirects |
| **Total** | **109** | — |

### Consequences

- **Positive:** 109 passing tests across 9 suites provide confidence for Sprint 2 development.
- **Positive:** Every auth flow (email, social, verification) has dedicated test coverage.
- **Positive:** Email service tested in both SMTP and console-fallback modes.
- **Negative:** E2E tests require a running database; CI must provision PostgreSQL.

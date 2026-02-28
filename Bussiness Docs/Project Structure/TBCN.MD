# PROJECT STRUCTURE DOCUMENT
## The Brand Coach Network - Modular Monolith Architecture

**Document Version:** 1.0  
**Prepared By:** Senior Software Architect  
**Date:** December 13, 2025  
**Technology Stack:** Next.js 14+ (Frontend), NestJS (Backend), PostgreSQL, Redis

## 1. REPOSITORY STRUCTURE OVERVIEW

```
brand-coach-network/
├── apps/
│   ├── web/                    # Next.js web application
│   ├── admin/                  # Next.js admin portal
│   └── api/                    # NestJS backend API
├── packages/
│   ├── shared/                 # Shared utilities and types
│   ├── ui/                     # Shared UI components
│   └── config/                 # Shared configuration
├── infrastructure/
│   ├── terraform/              # Infrastructure as Code
│   ├── docker/                 # Docker configurations
│   └── k8s/                    # Kubernetes manifests (future)
├── scripts/
│   ├── seed/                   # Database seeding scripts
│   ├── migration/              # Data migration scripts
│   └── deploy/                 # Deployment scripts
├── docs/
│   ├── api/                    # API documentation
│   ├── architecture/           # Architecture decisions
│   └── runbooks/               # Operational runbooks
├── .github/
│   └── workflows/              # CI/CD pipelines
├── docker-compose.yml          # Local development stack
├── package.json                # Root package.json (monorepo)
├── turbo.json                  # Turborepo configuration
└── README.md
```

---

## 2. FRONTEND STRUCTURE (Next.js Web App)

```
apps/web/
├── public/
│   ├── images/
│   │   ├── brand/              # Logos, brand assets
│   │   ├── placeholders/       # Placeholder images
│   │   └── icons/              # Favicon, PWA icons
│   ├── fonts/                  # Custom fonts
│   └── manifest.json           # PWA manifest
│
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth layout group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/       # Authenticated layout group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── programs/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── lessons/
│   │   │   │   │       └── [lessonId]/
│   │   │   │   │           └── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── enrollments/
│   │   │   │   └── page.tsx
│   │   │   ├── coaches/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── sessions/
│   │   │   │   └── page.tsx
│   │   │   ├── community/
│   │   │   │   ├── page.tsx
│   │   │   │   └── posts/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── subscription/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── security/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (marketing)/       # Public layout group
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── programs/
│   │   │   │   └── page.tsx
│   │   │   ├── coaches/
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   └── page.tsx
│   │   │   ├── partners/
│   │   │   │   └── page.tsx
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/               # API routes (Next.js API)
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/
│   │   │   │   │   └── route.ts
│   │   │   │   └── flutterwave/
│   │   │   │       └── route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx         # Root layout
│   │   ├── loading.tsx        # Global loading
│   │   ├── error.tsx          # Global error
│   │   ├── not-found.tsx      # 404 page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── SocialLoginButtons.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── programs/
│   │   │   ├── ProgramCard.tsx
│   │   │   ├── ProgramList.tsx
│   │   │   ├── ProgramDetail.tsx
│   │   │   ├── EnrollmentButton.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   ├── lessons/
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── LessonContent.tsx
│   │   │   ├── LessonNavigation.tsx
│   │   │   └── ProgressTracker.tsx
│   │   │
│   │   ├── coaching/
│   │   │   ├── CoachCard.tsx
│   │   │   ├── CoachList.tsx
│   │   │   ├── AvailabilityCalendar.tsx
│   │   │   ├── SessionBookingForm.tsx
│   │   │   └── SessionCard.tsx
│   │   │
│   │   ├── community/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── PostForm.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   └── ReactionButtons.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventList.tsx
│   │   │   ├── EventDetail.tsx
│   │   │   ├── RegistrationForm.tsx
│   │   │   └── TicketSelector.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── PaymentMethodSelector.tsx
│   │   │   ├── MPesaPayment.tsx
│   │   │   └── TransactionHistory.tsx
│   │   │
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   └── shared/
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingState.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Pagination.tsx
│   │       └── SearchBar.tsx
│   │
│   ├── lib/
│   │   ├── api/               # API client
│   │   │   ├── client.ts      # Axios instance with interceptors
│   │   │   ├── auth.ts        # Auth API calls
│   │   │   ├── programs.ts    # Programs API calls
│   │   │   ├── enrollments.ts # Enrollments API calls
│   │   │   ├── coaches.ts     # Coaches API calls
│   │   │   ├── sessions.ts    # Sessions API calls
│   │   │   ├── community.ts   # Community API calls
│   │   │   ├── payments.ts    # Payments API calls
│   │   │   └── events.ts      # Events API calls
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useUser.ts
│   │   │   ├── usePrograms.ts
│   │   │   ├── useEnrollments.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useMediaQuery.ts
│   │   │
│   │   ├── store/             # State management (Zustand/Redux)
│   │   │   ├── auth.store.ts
│   │   │   ├── user.store.ts
│   │   │   ├── cart.store.ts
│   │   │   └── ui.store.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── format.ts      # Date, currency, etc.
│   │   │   ├── validation.ts  # Form validation helpers
│   │   │   ├── errors.ts      # Error handling utilities
│   │   │   ├── storage.ts     # LocalStorage wrapper
│   │   │   └── constants.ts   # App constants
│   │   │
│   │   └── services/
│   │       ├── analytics.ts   # Analytics service
│   │       ├── logger.ts      # Logging service
│   │       └── sentry.ts      # Error tracking
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   │
│   └── types/
│       ├── api.ts             # API response types
│       ├── auth.ts            # Auth types
│       ├── user.ts            # User types
│       ├── program.ts         # Program types
│       ├── enrollment.ts      # Enrollment types
│       └── index.ts           # Export all types
│
├── .env.local                 # Local environment variables
├── .env.development           # Development environment
├── .env.production            # Production environment
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

---

## 3. BACKEND STRUCTURE (NestJS Modular Monolith)

```
apps/api/
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root application module
│   │
│   ├── common/                # Shared infrastructure
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   ├── aws.config.ts
│   │   │   └── config.module.ts
│   │   │
│   │   ├── database/
│   │   │   ├── database.module.ts
│   │   │   ├── database.providers.ts
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   │
│   │   ├── cache/
│   │   │   ├── cache.module.ts
│   │   │   ├── cache.service.ts
│   │   │   └── cache.interceptor.ts
│   │   │
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── api-paginated-response.decorator.ts
│   │   │
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   ├── validation-exception.filter.ts
│   │   │   └── all-exceptions.filter.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── rate-limit.guard.ts
│   │   │   └── api-key.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── timeout.interceptor.ts
│   │   │   └── cache.interceptor.ts
│   │   │
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   ├── parse-uuid.pipe.ts
│   │   │   └── transform.pipe.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── logger.middleware.ts
│   │   │   ├── correlation-id.middleware.ts
│   │   │   └── request-context.middleware.ts
│   │   │
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   ├── response.dto.ts
│   │   │   └── error.dto.ts
│   │   │
│   │   ├── entities/
│   │   │   └── base.entity.ts  # Base entity with timestamps
│   │   │
│   │   ├── exceptions/
│   │   │   ├── business.exception.ts
│   │   │   ├── not-found.exception.ts
│   │   │   └── validation.exception.ts
│   │   │
│   │   ├── interfaces/
│   │   │   ├── paginated-response.interface.ts
│   │   │   ├── jwt-payload.interface.ts
│   │   │   └── request-context.interface.ts
│   │   │
│   │   └── utils/
│   │       ├── pagination.util.ts
│   │       ├── crypto.util.ts
│   │       ├── date.util.ts
│   │       └── slug.util.ts
│   │
│   ├── modules/               # Business domain modules
│   │   │
│   │   ├── auth/              # Authentication & Authorization
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── local.strategy.ts
│   │   │   │   ├── google.strategy.ts
│   │   │   │   ├── linkedin.strategy.ts
│   │   │   │   └── facebook.strategy.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   └── reset-password.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── session.entity.ts
│   │   │   │   └── refresh-token.entity.ts
│   │   │   └── interfaces/
│   │   │       └── jwt-payload.interface.ts
│   │   │
│   │   ├── users/             # User Management
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   ├── user-profile.dto.ts
│   │   │   │   └── user-settings.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── user-profile.entity.ts
│   │   │   │   ├── user-role.entity.ts
│   │   │   │   └── user-settings.entity.ts
│   │   │   └── enums/
│   │   │       ├── user-status.enum.ts
│   │   │       └── user-role.enum.ts
│   │   │
│   │   ├── programs/          # Learning Programs
│   │   │   ├── programs.module.ts
│   │   │   ├── programs.controller.ts
│   │   │   ├── programs.service.ts
│   │   │   ├── programs.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-program.dto.ts
│   │   │   │   ├── update-program.dto.ts
│   │   │   │   ├── program-query.dto.ts
│   │   │   │   └── program-response.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── program.entity.ts
│   │   │   │   ├── module.entity.ts
│   │   │   │   └── lesson.entity.ts
│   │   │   └── enums/
│   │   │       ├── program-status.enum.ts
│   │   │       ├── content-type.enum.ts
│   │   │       └── difficulty-level.enum.ts
│   │   │
│   │   ├── enrollments/       # Course Enrollments
│   │   │   ├── enrollments.module.ts
│   │   │   ├── enrollments.controller.ts
│   │   │   ├── enrollments.service.ts
│   │   │   ├── enrollments.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-enrollment.dto.ts
│   │   │   │   ├── update-progress.dto.ts
│   │   │   │   └── enrollment-response.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── enrollment.entity.ts
│   │   │   │   └── lesson-progress.entity.ts
│   │   │   └── enums/
│   │   │       └── enrollment-status.enum.ts
│   │   │
│   │   ├── assessments/       # Quizzes & Assignments
│   │   │   ├── assessments.module.ts
│   │   │   ├── assessments.controller.ts
│   │   │   ├── assessments.service.ts
│   │   │   ├── assessments.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-assessment.dto.ts
│   │   │   │   ├── submit-assessment.dto.ts
│   │   │   │   └── assessment-result.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── assessment.entity.ts
│   │   │   │   └── assessment-submission.entity.ts
│   │   │   └── enums/
│   │   │       └── assessment-type.enum.ts
│   │   │
│   │   ├── certificates/      # Certifications
│   │   │   ├── certificates.module.ts
│   │   │   ├── certificates.controller.ts
│   │   │   ├── certificates.service.ts
│   │   │   ├── certificates.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── generate-certificate.dto.ts
│   │   │   │   └── certificate-response.dto.ts
│   │   │   └── entities/
│   │   │       └── certificate.entity.ts
│   │   │
│   │   ├── coaching/          # Coaching & Mentorship
│   │   │   ├── coaching.module.ts
│   │   │   ├── coaches.controller.ts
│   │   │   ├── sessions.controller.ts
│   │   │   ├── coaching.service.ts
│   │   │   ├── sessions.service.ts
│   │   │   ├── availability.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── coach-profile.dto.ts
│   │   │   │   ├── create-session.dto.ts
│   │   │   │   ├── update-session.dto.ts
│   │   │   │   ├── session-feedback.dto.ts
│   │   │   │   └── availability.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── coaching-session.entity.ts
│   │   │   │   ├── coach-availability.entity.ts
│   │   │   │   ├── coach-blocked-time.entity.ts
│   │   │   │   └── session-feedback.entity.ts
│   │   │   └── enums/
│   │   │       └── session-status.enum.ts
│   │   │
│   │   ├── community/         # Community Features
│   │   │   ├── community.module.ts
│   │   │   ├── posts.controller.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── posts.service.ts
│   │   │   ├── comments.service.ts
│   │   │   ├── reactions.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-post.dto.ts
│   │   │   │   ├── update-post.dto.ts
│   │   │   │   ├── create-comment.dto.ts
│   │   │   │   └── post-query.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── post.entity.ts
│   │   │   │   ├── comment.entity.ts
│   │   │   │   └── reaction.entity.ts
│   │   │   └── enums/
│   │   │       ├── post-category.enum.ts
│   │   │       └── reaction-type.enum.ts
│   │   │
│   │   ├── messaging/         # Direct Messaging
│   │   │   ├── messaging.module.ts
│   │   │   ├── messaging.controller.ts
│   │   │   ├── messaging.service.ts
│   │   │   ├── messaging.gateway.ts  # WebSocket gateway
│   │   │   ├── dto/
│   │   │   │   ├── send-message.dto.ts
│   │   │   │   └── conversation.dto.ts
│   │   │   └── entities/
│   │   │       └── message.entity.ts
│   │   │
│   │   ├── projects/          # Innovation Hub
│   │   │   ├── projects.module.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-project.dto.ts
│   │   │   │   ├── update-project.dto.ts
│   │   │   │   └── project-query.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── project.entity.ts
│   │   │   │   └── project-collaborator.entity.ts
│   │   │   └── enums/
│   │   │       └── project-stage.enum.ts
│   │   │
│   │   ├── events/            # Events & Masterclasses
│   │   │   ├── events.module.ts
│   │   │   ├── events.controller.ts
│   │   │   ├── events.service.ts
│   │   │   ├── registrations.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-event.dto.ts
│   │   │   │   ├── update-event.dto.ts
│   │   │   │   ├── register-event.dto.ts
│   │   │   │   └── event-query.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── event.entity.ts
│   │   │   │   ├── event-ticket.entity.ts
│   │   │   │   └── event-registration.entity.ts
│   │   │   └── enums/
│   │   │       ├── event-status.enum.ts
│   │   │       └── location-type.enum.ts
│   │   │
│   │   ├── payments/          # Payment Processing
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── webhooks.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── processors/
│   │   │   │   ├── stripe.processor.ts
│   │   │   │   ├── flutterwave.processor.ts
│   │   │   │   ├── mpesa.processor.ts
│   │   │   │   └── paypal.processor.ts
│   │   │   ├── dto/
│   │   │   │   ├── initiate-payment.dto.ts
│   │   │   │   ├── payment-callback.dto.ts
│   │   │   │   └── transaction-query.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── transaction.entity.ts
│   │   │   └── enums/
│   │   │       ├── payment-status.enum.ts
│   │   │       └── payment-method.enum.ts
│   │   │
│   │   ├── subscriptions/     # Membership Subscriptions
│   │   │   ├── subscriptions.module.ts
│   │   │   ├── subscriptions.controller.ts
│   │   │   ├── subscriptions.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-subscription.dto.ts
│   │   │   │   ├── upgrade-subscription.dto.ts
│   │   │   │   └── cancel-subscription.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── subscription.entity.ts
│   │   │   └── enums/
│   │   │       ├── subscription-tier.enum.ts
│   │   │       └── subscription-status.enum.ts
│   │   │
│   │   ├── products/          # Merchandise & Products
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── create-order.dto.ts
│   │   │   │   └── order-query.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── product.entity.ts
│   │   │   │   ├── order.entity.ts
│   │   │   │   └── order-item.entity.ts
│   │   │   └── enums/
│   │   │       ├── product-type.enum.ts
│   │   │       └── order-status.enum.ts
│   │   │
│   │   ├── partners/          # Partner Management
│   │   │   ├── partners.module.ts
│   │   │   ├── partners.controller.ts
│   │   │   ├── cohorts.controller.ts
│   │   │   ├── partners.service.ts
│   │   │   ├── cohorts.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-partner.dto.ts
│   │   │   │   ├── create-cohort.dto.ts
│   │   │   │   ├── bulk-enrollment.dto.ts
│   │   │   │   └── cohort-analytics.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── partner.entity.ts
│   │   │   │   ├── cohort.entity.ts
│   │   │   │   └── cohort-member.entity.ts
│   │   │   └── enums/
│   │   │       └── partner-type.enum.ts
│   │   │
│   │   ├── notifications/     # Notification System
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── channels/
│   │   │   │   ├── email.channel.ts
│   │   │   │   ├── sms.channel.ts
│   │   │   │   ├── push.channel.ts
│   │   │   │   └── in-app.channel.ts
│   │   │   ├── dto/
│   │   │   │   ├── send-notification.dto.ts
│   │   │   │   └── notification-preferences.dto.ts
│   │   │   └── entities/
│   │   │       └── notification.entity.ts
│   │   │
│   │   ├── media/             # Media Management
│   │   │   ├── media.module.ts
│   │   │   ├── media.controller.ts
│   │   │   ├── media.service.ts
│   │   │   ├── upload.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── upload-file.dto.ts
│   │   │   │   └── presigned-url.dto.ts
│   │   │   └── entities/
│   │   │       └── media-asset.entity.ts
│   │   │
│   │   ├── analytics/         # Analytics & Reporting
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── analytics-query.dto.ts
│   │   │   │   └── dashboard-metrics.dto.ts
│   │   │   └── entities/
│   │   │       └── analytics-event.entity.ts
│   │   │
│   │   └── audit/             # Audit Logging
│   │       ├── audit.module.ts
│   │       ├── audit.service.ts
│   │       ├── audit.interceptor.ts
│   │       └── entities/
│   │           └── audit-log.entity.ts
│   │
│   ├── jobs/                  # Background Jobs (Workers)
│   │   ├── jobs.module.ts
│   │   ├── processors/
│   │   │   ├── email.processor.ts
│   │   │   ├── certificate.processor.ts
│   │   │   ├── analytics.processor.ts
│   │   │   ├── notification.processor.ts
│   │   │   └── cleanup.processor.ts
│   │   └── queues/
│   │       ├── email.queue.ts
│   │       ├── certificate.queue.ts
│   │       └── notification.queue.ts
│   │
│   └── integrations/          # External Service Integrations
│       ├── aws/
│       │   ├── s3.service.ts
│       │   ├── ses.service.ts
│       │   └── cloudfront.service.ts
│       ├── zoom/
│       │   └── zoom.service.ts
│       ├── sendgrid/
│       │   └── sendgrid.service.ts
│       └── twilio/
│           └── twilio.service.ts
│
├── test/                      # E2E and integration tests
│   ├── auth.e2e-spec.ts
│   ├── programs.e2e-spec.ts
│   ├── enrollments.e2e-spec.ts
│   └── payments.e2e-spec.ts
│
├── .env                       # Environment variables
├── .env.example               # Example environment file
├── .env.test                  # Test environment
├── nest-cli.json              # NestJS CLI configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.build.json        # Build configuration
└── package.json
```

---

## 4. ADMIN PORTAL STRUCTURE

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx               # Admin dashboard
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── programs/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── content-moderation/
│   │   │   │   └── page.tsx
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── partners/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── ChartWidget.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── users/
│   │   │   ├── UserTable.tsx
│   │   │   └── UserActions.tsx
│   │   ├── content/
│   │   │   ├── ProgramForm.tsx
│   │   │   ├── ModuleBuilder.tsx
│   │   │   └── LessonEditor.tsx
│   │   └── moderation/
│   │       ├── ModerationQueue.tsx
│   │       └── ContentActions.tsx
│   │
│   └── lib/
│       └── api/
│           └── admin-api.ts
│
└── package.json
```

---

## 5. SHARED PACKAGES

### 5.1 Shared Package

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── program.types.ts
│   │   ├── enrollment.types.ts
│   │   ├── payment.types.ts
│   │   └── index.ts
│   │
│   ├── constants/
│   │   ├── errors.constants.ts
│   │   ├── roles.constants.ts
│   │   ├── status.constants.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── validation.utils.ts
│   │   ├── format.utils.ts
│   │   ├── date.utils.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── tsconfig.json
└── package.json
```

### 5.2 UI Package (Shared Components)

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── Button.test.tsx
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   └── Input.stories.tsx
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useToast.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 6. CONFIGURATION FILES

### 6.1 Root Package.json (Turborepo)

```json
{
  "name": "brand-coach-network",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=web",
    "dev:api": "turbo run dev --filter=api",
    "dev:admin": "turbo run dev --filter=admin",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "db:migrate": "cd apps/api && npm run migration:run",
    "db:seed": "cd apps/api && npm run seed:run",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  },
  "devDependencies": {
    "turbo": "^1.11.0",
    "prettier": "^3.1.1",
    "typescript": "^5.3.3"
  }
}
```

### 6.2 Turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

### 6.3 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: brandcoach-db
    environment:
      POSTGRES_DB: brandcoach
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: brandcoach-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  localstack:
    image: localstack/localstack
    container_name: brandcoach-localstack
    environment:
      SERVICES: s3,sqs
      AWS_DEFAULT_REGION: us-east-1
    ports:
      - "4566:4566"
    volumes:
      - localstack_data:/tmp/localstack

  mailhog:
    image: mailhog/mailhog
    container_name: brandcoach-mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  postgres_data:
  redis_data:
  localstack_data:
```

---

## 7. MODULE COMMUNICATION PATTERNS

### 7.1 Internal Events (Event-Driven Architecture)

```typescript
// apps/api/src/common/events/event.types.ts

export enum DomainEvent {
  USER_REGISTERED = 'user.registered',
  ENROLLMENT_CREATED = 'enrollment.created',
  PAYMENT_COMPLETED = 'payment.completed',
  CERTIFICATE_ISSUED = 'certificate.issued',
  SESSION_BOOKED = 'session.booked',
}

export interface EventPayload {
  eventId: string;
  eventType: DomainEvent;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}
```

```typescript
// apps/api/src/common/events/event-emitter.service.ts

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventEmitterService {
  constructor(private eventEmitter: EventEmitter2) {}

  emit(event: DomainEvent, payload: any) {
    this.eventEmitter.emit(event, {
      eventId: uuid(),
      eventType: event,
      timestamp: new Date(),
      data: payload,
    });
  }
}
```

### 7.2 Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                        DEPENDENCY GRAPH                      │
└─────────────────────────────────────────────────────────────┘

Auth ──────────► Users
                   │
                   │
Enrollments ───────┼─────► Programs
   │               │          │
   │               │          ▼
   │               │       Lessons
   │               │
   ▼               ▼
Payments ──────► Subscriptions
   │
   │
   ▼
Notifications ◄─── All Modules (via Events)


Rules:
1. No circular dependencies
2. Core modules (Users, Auth) at the bottom
3. Feature modules depend on core, not each other
4. Cross-module communication via events
```

---

## 8. KEY ARCHITECTURAL PATTERNS

### 8.1 Repository Pattern

```typescript
// apps/api/src/modules/users/users.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}
```

### 8.2 Service Layer Pattern

```typescript
// apps/api/src/modules/enrollments/enrollments.service.ts

import { Injectable } from '@nestjs/common';
import { EnrollmentsRepository } from './enrollments.repository';
import { ProgramsService } from '../programs/programs.service';
import { PaymentsService } from '../payments/payments.service';
import { EventEmitterService } from '@/common/events';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly repository: EnrollmentsRepository,
    private readonly programsService: ProgramsService,
    private readonly paymentsService: PaymentsService,
    private readonly events: EventEmitterService,
  ) {}

  async enroll(userId: string, programId: string, paymentData: any) {
    // 1. Verify program exists
    const program = await this.programsService.findById(programId);
    
    // 2. Process payment
    const payment = await this.paymentsService.processPayment(paymentData);
    
    // 3. Create enrollment
    const enrollment = await this.repository.create({
      userId,
      programId,
      transactionId: payment.id,
      status: 'active',
    });
    
    // 4. Emit event for other modules
    this.events.emit(DomainEvent.ENROLLMENT_CREATED, {
      enrollmentId: enrollment.id,
      userId,
      programId,
    });
    
    return enrollment;
  }
}
```

### 8.3 Controller Pattern

```typescript
// apps/api/src/modules/enrollments/enrollments.controller.ts

import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.service.enroll(userId, dto.programId, dto.payment);
  }

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.service.findByUserId(userId);
  }
}
```

---

## 9. DEVELOPMENT WORKFLOW

### 9.1 Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/brand-coach/brand-coach-network.git
cd brand-coach-network

# 2. Install dependencies
npm install

# 3. Start infrastructure (PostgreSQL, Redis, etc.)
npm run docker:up

# 4. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# 5. Run database migrations
npm run db:migrate

# 6. Seed database (optional)
npm run db:seed

# 7. Start all apps in development mode
npm run dev

# OR start individual apps
npm run dev:web    # Frontend (http://localhost:3000)
npm run dev:api    # Backend (http://localhost:4000)
npm run dev:admin  # Admin (http://localhost:3001)
```